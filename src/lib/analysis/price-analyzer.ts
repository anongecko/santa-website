import { Redis } from 'ioredis';
import type { ScrapedProduct, PriceTier, PriceRange } from './types';

interface PriceThresholds {
  budget: { min: number; max: number };
  midRange: { min: number; max: number };
  premium: { min: number; max: number };
}

export class PriceAnalyzer {
  private categoryThresholds: Record<string, PriceThresholds> = {
    Electronics: {
      budget: { min: 1, max: 200 },
      midRange: { min: 200, max: 500 },
      premium: { min: 500, max: 1500 },
    },
    Toys: {
      budget: { min: 1, max: 20 },
      midRange: { min: 20, max: 50 },
      premium: { min: 50, max: 150 },
    },
    Books: {
      budget: { min: 1, max: 15 },
      midRange: { min: 15, max: 30 },
      premium: { min: 30, max: 100 },
    },
    default: {
      budget: { min: 1, max: 30 },
      midRange: { min: 30, max: 80 },
      premium: { min: 80, max: 250 },
    },
  };

  constructor(private redis: Redis) {}

  async analyzePrices(products: ScrapedProduct[], category: string): Promise<PriceRange> {
    const prices = products.map(p => p.price).filter(p => p > 0);
    if (!prices.length) {
      return this.getDefaultPriceRange();
    }

    const sorted = [...prices].sort((a, b) => a - b);
    const thresholds = this.categoryThresholds[category] || this.categoryThresholds.default;

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: prices.reduce((a, b) => a + b) / prices.length,
      median: sorted[Math.floor(sorted.length / 2)],
      standardDeviation: this.calculateStandardDeviation(prices),
      pricesByTier: {
        budget: prices.filter(p => p >= thresholds.budget.min && p <= thresholds.budget.max),
        midRange: prices.filter(p => p > thresholds.midRange.min && p <= thresholds.midRange.max),
        premium: prices.filter(p => p > thresholds.premium.min && p <= thresholds.premium.max),
      },
      timestamp: Date.now(),
    };
  }

  getPriceTierForProduct(price: number, category: string): PriceTier {
    const thresholds = this.categoryThresholds[category] || this.categoryThresholds.default;

    if (price <= thresholds.budget.max) return 'budget';
    if (price <= thresholds.midRange.max) return 'midRange';
    return 'premium';
  }

  private calculateStandardDeviation(prices: number[]): number {
    const mean = prices.reduce((a, b) => a + b) / prices.length;
    const squareDiffs = prices.map(p => Math.pow(p - mean, 2));
    const variance = squareDiffs.reduce((a, b) => a + b) / prices.length;
    return Math.sqrt(variance);
  }

  private getDefaultPriceRange(): PriceRange {
    return {
      min: 0,
      max: 0,
      average: 0,
      median: 0,
      standardDeviation: 0,
      pricesByTier: {
        budget: [],
        midRange: [],
        premium: [],
      },
      timestamp: Date.now(),
    };
  }

  async getCategoryPriceStats(category: string): Promise<PriceRange | null> {
    const cacheKey = `price:stats:${category}`;
    const cached = await this.redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  }
}
