import { Redis } from 'ioredis';
import { FileLoader } from './utils/file-loader';
import type { UserAgent } from './types';

export class UserAgentManager {
  private redis: Redis;
  private userAgents: UserAgent[] = [];
  private readonly userAgentKey = 'scraper:user-agents';
  private readonly syncInterval = 60000;
  private initialized = false;

  constructor(redis: Redis) {
    this.redis = redis;
    this.initialize();
  }

  private async initialize() {
    if (this.initialized) return;
    await this.loadAndSyncUserAgents();
    this.startSyncInterval();
    this.initialized = true;
  }

  private async loadAndSyncUserAgents() {
    try {
      const cached = await this.redis.get(this.userAgentKey);
      if (cached) {
        this.userAgents = JSON.parse(cached);
        return;
      }

      this.userAgents = await FileLoader.loadUserAgents();
      if (this.userAgents.length === 0) {
        throw new Error('No user agents loaded');
      }

      await this.redis.set(this.userAgentKey, JSON.stringify(this.userAgents));
    } catch (error) {
      console.error('Failed to load/sync user agents:', error);
      throw error;
    }
  }

  private startSyncInterval() {
    setInterval(async () => {
      try {
        const cached = await this.redis.get(this.userAgentKey);
        if (cached) {
          this.userAgents = JSON.parse(cached);
        }
      } catch (error) {
        console.error('User agent sync failed:', error);
      }
    }, this.syncInterval);
  }

  async getNext(): Promise<string> {
    if (!this.initialized) await this.initialize();

    const now = Date.now();
    const selectedAgent = this.userAgents.reduce((prev, curr) =>
      curr.lastUsed < prev.lastUsed ? curr : prev
    );

    selectedAgent.lastUsed = now;
    await this.redis.set(this.userAgentKey, JSON.stringify(this.userAgents));

    return selectedAgent.string;
  }

  async refresh(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }

  async getStats(): Promise<{
    total: number;
    lastUsed: Date;
    averageRotation: number;
  }> {
    if (!this.initialized) await this.initialize();

    const lastUsedTime = Math.max(...this.userAgents.map(ua => ua.lastUsed));
    const rotations = this.userAgents.filter(ua => ua.lastUsed > 0).length;

    return {
      total: this.userAgents.length,
      lastUsed: new Date(lastUsedTime),
      averageRotation: rotations / this.userAgents.length,
    };
  }
}

export const createUserAgentManager = (redis: Redis) => new UserAgentManager(redis);
