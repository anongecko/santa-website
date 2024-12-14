import { Redis } from 'ioredis';
import { FileLoader } from '../scraping/utils/file-loader';
import type { Proxy } from '../scraping/types';
import { ScrapingRateLimiter } from './rate-limiter';
import type { RotationConfig } from './types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import nodeFetch, { RequestInit, Response } from 'node-fetch';

const DEFAULT_ROTATION_CONFIG: RotationConfig = {
  minAvailable: 10,
  maxFailures: 3,
  rotationInterval: 60000,
  responseTimeout: 10000,
  healthCheckInterval: 300000,
  retryAttempts: 3,
  backoffFactor: 1.5,
};

interface ProxyStats {
  successes: number;
  failures: number;
  totalTime: number;
  requests: number;
  averageTime: number;
}

export class ProxyManager {
  private redis: Redis;
  private proxies: Proxy[] = [];
  private rateLimiter: ScrapingRateLimiter;
  private config: RotationConfig;
  private readonly proxyKey = 'scraper:proxies';
  private readonly statsKey = 'scraper:proxy:stats';
  private initialized = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(
    redis: Redis,
    rateLimiter: ScrapingRateLimiter,
    config: Partial<RotationConfig> = {}
  ) {
    this.redis = redis;
    this.rateLimiter = rateLimiter;
    this.config = { ...DEFAULT_ROTATION_CONFIG, ...config };
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    await this.loadAndSyncProxies();
    this.startHealthChecks();
    this.initialized = true;
  }

  private async loadAndSyncProxies() {
    try {
      const cached = await this.redis.get(this.proxyKey);
      if (cached) {
        this.proxies = JSON.parse(cached);
        return;
      }

      this.proxies = await FileLoader.loadProxies();
      if (this.proxies.length < this.config.minAvailable) {
        throw new Error(
          `Insufficient proxies loaded. Minimum required: ${this.config.minAvailable}`
        );
      }

      await this.redis.set(this.proxyKey, JSON.stringify(this.proxies));
    } catch (error) {
      console.error('Failed to load/sync proxies:', error);
      throw error;
    }
  }

  private startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const proxy of this.proxies) {
        if (proxy.failCount >= this.config.maxFailures) {
          continue;
        }

        try {
          const isAllowed = await this.rateLimiter.isAllowed(`proxy:${proxy.host}`);
          if (!isAllowed) continue;

          const startTime = Date.now();
          const isHealthy = await this.checkProxyHealth(proxy);
          const responseTime = Date.now() - startTime;

          if (isHealthy) {
            await this.updateProxyStats(proxy, true, responseTime);
          } else {
            await this.registerProxyFailure(proxy);
          }
        } catch (error) {
          await this.registerProxyFailure(proxy);
        }
      }

      await this.syncToRedis();
    }, this.config.healthCheckInterval) as unknown as NodeJS.Timeout;
  }

  private createProxyAgent(proxy: Proxy) {
    const auth =
      proxy.username && proxy.password ? `${proxy.username}:${proxy.password}` : undefined;

    const proxyUrl = `${proxy.protocol}://${auth ? `${auth}@` : ''}${proxy.host}:${proxy.port}`;

    return proxy.protocol === 'https'
      ? new HttpsProxyAgent(proxyUrl)
      : new HttpProxyAgent(proxyUrl);
  }

  private async checkProxyHealth(proxy: Proxy): Promise<boolean> {
    return new Promise(resolve => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, this.config.responseTimeout);

      const proxyAgent = this.createProxyAgent(proxy);

      const fetchOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ProxyHealthCheck/1.0)',
        },
      } as RequestInit;

      if (proxyAgent) {
        (fetchOptions as any).agent = proxyAgent;
      }

      nodeFetch('https://www.amazon.com/robots.txt', fetchOptions)
        .then((response: Response) => {
          clearTimeout(timeout);
          resolve(response.ok);
        })
        .catch(() => {
          clearTimeout(timeout);
          resolve(false);
        });
    });
  }

  private async registerProxyFailure(proxy: Proxy) {
    proxy.failCount = (proxy.failCount || 0) + 1;
    proxy.lastUsed = Date.now();
    await this.updateProxyStats(proxy, false);

    if (proxy.failCount >= this.config.maxFailures) {
      console.warn(`Proxy ${proxy.host}:${proxy.port} disabled due to failures`);
    }
  }

  private async updateProxyStats(proxy: Proxy, success: boolean, responseTime?: number) {
    const statsKey = `${this.statsKey}:${proxy.host}:${proxy.port}`;
    const stats = await this.redis.hgetall(statsKey);

    const currentStats: ProxyStats = {
      successes: parseInt(stats?.successes || '0'),
      failures: parseInt(stats?.failures || '0'),
      totalTime: parseInt(stats?.totalTime || '0'),
      requests: parseInt(stats?.requests || '0'),
      averageTime: parseInt(stats?.averageTime || '0'),
    };

    const multi = this.redis.multi();

    multi.hincrby(statsKey, success ? 'successes' : 'failures', 1);
    multi.hincrby(statsKey, 'requests', 1);

    if (responseTime) {
      multi.hincrby(statsKey, 'totalTime', responseTime);
      const newAverage = (currentStats.totalTime + responseTime) / (currentStats.requests + 1);
      multi.hset(statsKey, 'averageTime', Math.round(newAverage).toString());
      proxy.responseTime = responseTime;
    }

    await multi.exec();
  }

  private async syncToRedis() {
    await this.redis.set(this.proxyKey, JSON.stringify(this.proxies));
  }

  async getNext(): Promise<Proxy> {
    if (!this.initialized) await this.initialize();

    const remainingRequests = await Promise.all(
      this.proxies.map(p => this.rateLimiter.getRemainingRequests(`proxy:${p.host}`))
    );

    const availableProxies = this.proxies.filter(
      (p, index) =>
        p.failCount < this.config.maxFailures &&
        Date.now() - (p.lastUsed || 0) >= this.config.rotationInterval &&
        remainingRequests[index] > 0
    );

    if (availableProxies.length === 0) {
      throw new Error('No available proxies');
    }

    const selectedProxy = availableProxies.reduce((prev, curr) => {
      const prevScore = this.calculateProxyScore(prev);
      const currScore = this.calculateProxyScore(curr);
      return currScore > prevScore ? curr : prev;
    });

    selectedProxy.lastUsed = Date.now();
    await this.syncToRedis();

    return selectedProxy;
  }

  private calculateProxyScore(proxy: Proxy): number {
    const timeSinceLastUse = Date.now() - (proxy.lastUsed || 0);
    const failurePenalty = (proxy.failCount || 0) * 0.2;
    const responseTimeScore = proxy.responseTime ? 1000 / proxy.responseTime : 0;

    return timeSinceLastUse / this.config.rotationInterval + responseTimeScore - failurePenalty;
  }

  async reportSuccess(proxy: Proxy, responseTime: number) {
    proxy.failCount = 0;
    proxy.responseTime = responseTime;
    await this.updateProxyStats(proxy, true, responseTime);
    await this.syncToRedis();
  }

  async reportFailure(proxy: Proxy) {
    await this.registerProxyFailure(proxy);
    await this.syncToRedis();
  }

  async getStats(): Promise<{
    total: number;
    available: number;
    averageResponseTime: number;
    failureRate: number;
  }> {
    const available = this.proxies.filter(p => p.failCount < this.config.maxFailures).length;
    const responseTimes = this.proxies.filter(p => p.responseTime).map(p => p.responseTime!);
    const totalFailures = this.proxies.reduce((sum, p) => sum + (p.failCount || 0), 0);
    const totalRequests = this.proxies.length * 100;

    return {
      total: this.proxies.length,
      available,
      averageResponseTime: responseTimes.length
        ? responseTimes.reduce((a, b) => a + b) / responseTimes.length
        : 0,
      failureRate: (totalFailures / totalRequests) * 100,
    };
  }

  async refresh(): Promise<void> {
    this.initialized = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    await this.initialize();
  }

  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.initialized = false;
  }
}

export const createProxyManager = (
  redis: Redis,
  rateLimiter: ScrapingRateLimiter,
  config?: Partial<RotationConfig>
) => new ProxyManager(redis, rateLimiter, config);
