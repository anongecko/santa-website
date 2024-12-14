import { OpenAI } from 'openai';
import { Redis } from 'ioredis';
import { ScrapedProduct } from '../scraping/types';
import type {
  GiftPriceAnalysis,
  GiftPriceHistory,
  GiftPriceTiers,
  GiftPriceDistribution,
  PriceRange,
  GiftPriceConfig,
  GiftProcessingResult,
  GiftProcessingError,
} from './types';

const DEFAULT_PRICE_CONFIG: GiftPriceConfig = {
  historyDays: 30,
  minSampleSize: 5,
  confidenceThreshold: 0.7,
  volatilityThreshold: 0.2,
  cacheExpiry: 7 * 24 * 60 * 60,
  outlierIQRMultiplier: 1.5,
};

const CATEGORY_ADJUSTMENTS = {
  electronics: { budget: 1.2, midRange: 1.1, premium: 1.3, confidence: 0.9 },
  toys: { budget: 0.9, midRange: 1.0, premium: 1.1, confidence: 0.85 },
  books: { budget: 0.8, midRange: 0.9, premium: 1.0, confidence: 0.95 },
  clothing: { budget: 0.9, midRange: 1.0, premium: 1.2, confidence: 0.8 },
  default: { budget: 1.0, midRange: 1.0, premium: 1.0, confidence: 0.7 },
};

export class PriceAnalyzer {
  private redis: Redis;
  private openai: OpenAI;
  private config: GiftPriceConfig;

  constructor(redis: Redis, config: Partial<GiftPriceConfig> = {}) {
    this.redis = redis;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.config = { ...DEFAULT_PRICE_CONFIG, ...config };
  }

  async analyzePrices(products: ScrapedProduct[], category: string): Promise<GiftProcessingResult> {
    try {
      const startTime = Date.now();
      const validProducts = products.filter(p => p.price > 0);

      if (validProducts.length < this.config.minSampleSize) {
        const fallbackAnalysis = await this.getFallbackAnalysis(category);
        return {
          success: true,
          analysis: fallbackAnalysis,
          metadata: {
            processingTime: Date.now() - startTime,
            cacheHit: false,
            sampleSize: 0,
          },
        };
      }

      const categoryAdjustments = this.getCategoryAdjustments(category);
      const prices = validProducts.map(p => p.price * categoryAdjustments.midRange);
      const priceHistory = await this.getPriceHistory(category);

      const analysis: GiftPriceAnalysis = {
        range: this.calculatePriceRange(prices),
        tiers: this.calculatePriceTiers(prices, categoryAdjustments),
        distribution: this.calculatePriceDistribution(prices),
        volatility: this.calculatePriceVolatility(priceHistory),
        confidence: this.calculateConfidence(validProducts.length, category),
        lastUpdated: Date.now(),
        sampleSize: validProducts.length,
        category,
      };

      await this.storePriceHistory(category, prices);
      await this.updateCategoryBaseline(category, analysis);

      return {
        success: true,
        analysis,
        metadata: {
          processingTime: Date.now() - startTime,
          cacheHit: false,
          sampleSize: validProducts.length,
        },
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        error: {
          name: 'GiftProcessingError',
          message: error.message,
          code: 'PRICE_ANALYSIS_FAILED',
          recoverable: true,
          stack: error.stack,
        } as GiftProcessingError,
      };
    }
  }

  private getCategoryAdjustments(category: string) {
    const normalizedCategory = category.toLowerCase();
    return (
      CATEGORY_ADJUSTMENTS[normalizedCategory as keyof typeof CATEGORY_ADJUSTMENTS] ||
      CATEGORY_ADJUSTMENTS.default
    );
  }

  private calculatePriceRange(prices: number[]): PriceRange {
    const sorted = [...prices].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: prices.reduce((a, b) => a + b) / prices.length,
      median: sorted[Math.floor(sorted.length / 2)],
    };
  }

  private calculatePriceTiers(
    prices: number[],
    adjustments: typeof CATEGORY_ADJUSTMENTS.default
  ): GiftPriceTiers {
    const sorted = [...prices].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const validPrices = sorted.filter(
      p =>
        p >= q1 - this.config.outlierIQRMultiplier * iqr &&
        p <= q3 + this.config.outlierIQRMultiplier * iqr
    );

    const median = validPrices[Math.floor(validPrices.length / 2)];

    return {
      budget: {
        min: validPrices[0] * adjustments.budget,
        max: median * 0.8 * adjustments.budget,
        typical: ((validPrices[0] + median * 0.8) / 2) * adjustments.budget,
      },
      midRange: {
        min: median * 0.8 * adjustments.midRange,
        max: median * 1.2 * adjustments.midRange,
        typical: median * adjustments.midRange,
      },
      premium: {
        min: median * 1.2 * adjustments.premium,
        max: validPrices[validPrices.length - 1] * adjustments.premium,
        typical: ((median * 1.2 + validPrices[validPrices.length - 1]) / 2) * adjustments.premium,
      },
    };
  }

  private calculatePriceDistribution(prices: number[]): GiftPriceDistribution {
    const sorted = [...prices].sort((a, b) => a - b);
    const getPercentile = (p: number) => sorted[Math.floor(sorted.length * p)];

    return {
      percentile10: getPercentile(0.1),
      percentile25: getPercentile(0.25),
      percentile50: getPercentile(0.5),
      percentile75: getPercentile(0.75),
      percentile90: getPercentile(0.9),
    };
  }

  private calculatePriceVolatility(history: GiftPriceHistory[]): number {
    if (history.length < 2) return 0;

    const prices = history.map(h => h.price);
    const changes = prices.slice(1).map((price, i) => Math.abs(price - prices[i]) / prices[i]);

    return changes.reduce((a, b) => a + b) / changes.length;
  }

  private calculateConfidence(sampleSize: number, category: string): number {
    const adjustments = this.getCategoryAdjustments(category);
    let confidence = adjustments.confidence;

    confidence += Math.min(sampleSize / 50, 1) * 0.3;

    return Math.min(confidence, 1);
  }

  private async getFallbackAnalysis(category: string): Promise<GiftPriceAnalysis> {
    try {
      const cached = await this.getCategoryBaseline(category);
      if (cached) return cached;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Estimate price ranges for ${category} gifts.
                     Consider typical market prices and seasonal variations.
                     Format as JSON with min, max, and typical prices for each tier.`,
          },
          {
            role: 'user',
            content: category,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const aiEstimate = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const adjustments = this.getCategoryAdjustments(category);

      return {
        range: {
          min: aiEstimate.budget.min * adjustments.budget,
          max: aiEstimate.premium.max * adjustments.premium,
          mean: ((aiEstimate.midRange.min + aiEstimate.midRange.max) / 2) * adjustments.midRange,
          median: aiEstimate.midRange.typical * adjustments.midRange,
        },
        tiers: {
          budget: {
            min: aiEstimate.budget.min * adjustments.budget,
            max: aiEstimate.budget.max * adjustments.budget,
            typical: aiEstimate.budget.typical * adjustments.budget,
          },
          midRange: {
            min: aiEstimate.midRange.min * adjustments.midRange,
            max: aiEstimate.midRange.max * adjustments.midRange,
            typical: aiEstimate.midRange.typical * adjustments.midRange,
          },
          premium: {
            min: aiEstimate.premium.min * adjustments.premium,
            max: aiEstimate.premium.max * adjustments.premium,
            typical: aiEstimate.premium.typical * adjustments.premium,
          },
        },
        distribution: {
          percentile10: aiEstimate.budget.min * adjustments.budget,
          percentile25: aiEstimate.budget.typical * adjustments.budget,
          percentile50: aiEstimate.midRange.typical * adjustments.midRange,
          percentile75: aiEstimate.premium.typical * adjustments.premium,
          percentile90: aiEstimate.premium.max * adjustments.premium,
        },
        volatility: 0,
        confidence: adjustments.confidence * 0.7,
        lastUpdated: Date.now(),
        sampleSize: 0,
        category,
      };
    } catch (error) {
      console.error('Error getting fallback analysis:', error);
      return this.getDefaultAnalysis(category);
    }
  }

  private async getPriceHistory(category: string): Promise<GiftPriceHistory[]> {
    const key = `gift:price:history:${category}`;
    const history = await this.redis.lrange(key, 0, -1);
    return history.map(h => JSON.parse(h));
  }

  private async storePriceHistory(category: string, prices: number[]): Promise<void> {
    const key = `gift:price:history:${category}`;
    const entry: GiftPriceHistory = {
      timestamp: Date.now(),
      price: prices.reduce((a, b) => a + b) / prices.length,
    };

    await this.redis.lpush(key, JSON.stringify(entry));
    await this.redis.ltrim(key, 0, this.config.historyDays - 1);
  }

  private async getCategoryBaseline(category: string): Promise<GiftPriceAnalysis | null> {
    const key = `gift:price:baseline:${category}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  private async updateCategoryBaseline(
    category: string,
    analysis: GiftPriceAnalysis
  ): Promise<void> {
    const key = `gift:price:baseline:${category}`;
    await this.redis.set(key, JSON.stringify(analysis), 'EX', this.config.cacheExpiry);
  }

  private getDefaultAnalysis(category: string): GiftPriceAnalysis {
    const adjustments = this.getCategoryAdjustments(category);
    return {
      range: {
        min: 10 * adjustments.budget,
        max: 100 * adjustments.premium,
        mean: 55 * adjustments.midRange,
        median: 50 * adjustments.midRange,
      },
      tiers: {
        budget: {
          min: 10 * adjustments.budget,
          max: 30 * adjustments.budget,
          typical: 20 * adjustments.budget,
        },
        midRange: {
          min: 30 * adjustments.midRange,
          max: 70 * adjustments.midRange,
          typical: 50 * adjustments.midRange,
        },
        premium: {
          min: 70 * adjustments.premium,
          max: 100 * adjustments.premium,
          typical: 85 * adjustments.premium,
        },
      },
      distribution: {
        percentile10: 15 * adjustments.budget,
        percentile25: 25 * adjustments.budget,
        percentile50: 50 * adjustments.midRange,
        percentile75: 75 * adjustments.premium,
        percentile90: 85 * adjustments.premium,
      },
      volatility: 0,
      confidence: adjustments.confidence * 0.5,
      lastUpdated: Date.now(),
      sampleSize: 0,
      category,
    };
  }
}

export const createPriceAnalyzer = (redis: Redis, config?: Partial<GiftPriceConfig>) =>
  new PriceAnalyzer(redis, config);
