// src/lib/scraping/cache-manager.ts

import { Redis } from 'ioredis';
import { CacheConfig, ProductSearchResult, ScrapedProduct } from './types';

export class CacheManager {
  private redis: Redis;
  private config: CacheConfig;

  constructor(redis: Redis, config: CacheConfig) {
    this.redis = redis;
    this.config = config;
  }

  private generateKey(type: 'product' | 'search' | 'price', identifier: string): string {
    return `scraper:${type}:${identifier}`;
  }

  async getSearchResults(query: string): Promise<ProductSearchResult | null> {
    const key = this.generateKey('search', query);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setSearchResults(query: string, results: ProductSearchResult): Promise<void> {
    const key = this.generateKey('search', query);
    await this.redis.set(key, JSON.stringify(results), 'EX', this.config.searchTTL);
  }

  async getProduct(url: string): Promise<ScrapedProduct | null> {
    const key = this.generateKey('product', url);
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setProduct(url: string, product: ScrapedProduct): Promise<void> {
    const key = this.generateKey('product', url);
    await this.redis.set(key, JSON.stringify(product), 'EX', this.config.productTTL);
  }

  async clearCache(): Promise<void> {
    const keys = await this.redis.keys('scraper:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async getStats(): Promise<{ cacheSize: number; hitRate: number }> {
    const keys = await this.redis.keys('scraper:*');
    const hitCount = parseInt((await this.redis.get('scraper:stats:hits')) || '0');
    const missCount = parseInt((await this.redis.get('scraper:stats:misses')) || '0');
    const total = hitCount + missCount;

    return {
      cacheSize: keys.length,
      hitRate: total > 0 ? hitCount / total : 0,
    };
  }

  async incrementStats(hit: boolean): Promise<void> {
    const key = `scraper:stats:${hit ? 'hits' : 'misses'}`;
    await this.redis.incr(key);
  }
}
