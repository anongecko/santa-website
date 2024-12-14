// src/lib/scraping/rate-limiter.ts

import { Redis } from 'ioredis';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
}

export class ScrapingRateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = config;
  }

  async isAllowed(identifier: string): Promise<boolean> {
    const now = Date.now();
    const key = `ratelimit:scraping:${identifier}`;
    const blockKey = `ratelimit:scraping:blocked:${identifier}`;

    // Check if blocked
    const blocked = await this.redis.get(blockKey);
    if (blocked) {
      return false;
    }

    // Get current window data
    const window = await this.redis.get(key);
    const windowData = window ? JSON.parse(window) : { count: 0, start: now };

    // Reset window if expired
    if (now - windowData.start >= this.config.windowMs) {
      windowData.count = 0;
      windowData.start = now;
    }

    // Check rate limit
    if (windowData.count >= this.config.maxRequests) {
      // Block if limit exceeded severely
      if (windowData.count >= this.config.maxRequests * 2) {
        await this.redis.set(
          blockKey,
          'blocked',
          'EX',
          Math.ceil(this.config.blockDurationMs / 1000)
        );
      }
      return false;
    }

    // Increment counter
    windowData.count++;
    await this.redis.set(
      key,
      JSON.stringify(windowData),
      'EX',
      Math.ceil(this.config.windowMs / 1000)
    );

    return true;
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    const key = `ratelimit:scraping:${identifier}`;
    const window = await this.redis.get(key);
    if (!window) return this.config.maxRequests;

    const windowData = JSON.parse(window);
    return Math.max(0, this.config.maxRequests - windowData.count);
  }

  async resetLimits(identifier: string): Promise<void> {
    const key = `ratelimit:scraping:${identifier}`;
    const blockKey = `ratelimit:scraping:blocked:${identifier}`;
    await Promise.all([this.redis.del(key), this.redis.del(blockKey)]);
  }
}
