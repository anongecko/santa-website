// src/lib/analysis/price-tracker.ts

import { Redis } from 'ioredis';
import { ScrapedProduct } from '../scraping/types';

interface PricePoint {
  price: number;
  date: string;
  source: 'amazon' | 'camel' | 'keepa';
}

interface PriceAnalysis {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  priceStatus:
    | 'LOWEST_PRICE'
    | 'GOOD_PRICE'
    | 'REGULAR_PRICE'
    | 'INFLATED_PRICE'
    | 'HIGHLY_INFLATED';
  priceHistory: PricePoint[];
  confidence: number;
  lastUpdated: string;
}

export class PriceTracker {
  private redis: Redis;
  private readonly PRICE_HISTORY_KEY = 'price_history:';
  private readonly HISTORY_DAYS = 90; // Track 90 days of history

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async trackPrice(product: ScrapedProduct): Promise<PriceAnalysis> {
    const productKey = this.PRICE_HISTORY_KEY + this.normalizeUrl(product.url);
    const today = new Date().toISOString().split('T')[0];

    // Store current price
    await this.storePricePoint(productKey, {
      price: product.price,
      date: today,
      source: 'amazon',
    });

    // Get third-party price data
    const [camelData, keepaData] = await Promise.all([
      this.fetchCamelCamelCamelData(product.url),
      this.fetchKeepaData(product.url),
    ]);

    // Merge all price sources
    const allPricePoints = await this.getAllPricePoints(productKey);
    const mergedPrices = this.mergePriceData(allPricePoints, camelData, keepaData);

    return this.analyzePrices(product.price, mergedPrices);
  }

  private async storePricePoint(key: string, point: PricePoint): Promise<void> {
    await this.redis.zadd(key, new Date(point.date).getTime(), JSON.stringify(point));
    // Keep only last 90 days
    const cutoffTime = new Date().getTime() - this.HISTORY_DAYS * 24 * 60 * 60 * 1000;
    await this.redis.zremrangebyscore(key, 0, cutoffTime);
  }

  private async getAllPricePoints(key: string): Promise<PricePoint[]> {
    const data = await this.redis.zrange(key, 0, -1);
    return data.map(item => JSON.parse(item));
  }

  private async fetchCamelCamelCamelData(url: string): Promise<PricePoint[]> {
    // Implement CamelCamelCamel API integration
    // This would require an API key or web scraping
    return [];
  }

  private async fetchKeepaData(url: string): Promise<PricePoint[]> {
    // Implement Keepa API integration
    // This would require an API key
    return [];
  }

  private mergePriceData(...sources: PricePoint[][]): PricePoint[] {
    const merged = sources.flat();
    // Remove duplicates by date
    const uniqueDates = new Map<string, PricePoint>();
    merged.forEach(point => {
      const existing = uniqueDates.get(point.date);
      if (!existing || existing.source === 'amazon') {
        uniqueDates.set(point.date, point);
      }
    });
    return Array.from(uniqueDates.values());
  }

  private analyzePrices(currentPrice: number, history: PricePoint[]): PriceAnalysis {
    const prices = history.map(p => p.price);
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = prices.reduce((a, b) => a + b) / prices.length;

    // Calculate price status
    const priceStatus = this.calculatePriceStatus(currentPrice, {
      lowest: lowestPrice,
      average: averagePrice,
      highest: highestPrice,
    });

    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(history);

    return {
      currentPrice,
      lowestPrice,
      highestPrice,
      averagePrice,
      priceStatus,
      priceHistory: history,
      confidence,
      lastUpdated: new Date().toISOString(),
    };
  }

  private calculatePriceStatus(
    currentPrice: number,
    { lowest, average, highest }: { lowest: number; average: number; highest: number }
  ): PriceAnalysis['priceStatus'] {
    const percentAboveLowest = ((currentPrice - lowest) / lowest) * 100;
    const percentAboveAverage = ((currentPrice - average) / average) * 100;

    if (currentPrice <= lowest + lowest * 0.02) {
      // Within 2% of lowest
      return 'LOWEST_PRICE';
    } else if (percentAboveLowest <= 10) {
      return 'GOOD_PRICE';
    } else if (percentAboveAverage <= 5) {
      return 'REGULAR_PRICE';
    } else if (percentAboveAverage <= 20) {
      return 'INFLATED_PRICE';
    } else {
      return 'HIGHLY_INFLATED';
    }
  }

  private calculateConfidence(history: PricePoint[]): number {
    let confidence = 0.5; // Base confidence

    // More data points increase confidence
    confidence += Math.min(history.length / this.HISTORY_DAYS, 1) * 0.3;

    // Multiple sources increase confidence
    const uniqueSources = new Set(history.map(p => p.source)).size;
    confidence += (uniqueSources / 3) * 0.2;

    return Math.min(confidence, 1);
  }

  private normalizeUrl(url: string): string {
    // Remove query parameters and fragments
    return url.split('?')[0].split('#')[0];
  }
}
