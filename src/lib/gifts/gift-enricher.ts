import { OpenAI } from 'openai';
import { Redis } from 'ioredis';
import type { Gift } from '@prisma/client';
import type {
  EnrichedGift,
  GiftSuggestion,
  GiftProcessingResult,
  GiftEnrichmentOptions,
  GiftAnalysis,
  GiftCategory,
  GiftProcessingError,
} from './types';
import { backupProductService } from '../scraping/backup-product-service';
import { categoryQualityAnalyzer } from '../analysis/category-quality-indicators';
import { PriceTracker } from '../analysis/price-tracker';
import type { ScrapedProduct } from '../scraping/types';

export class GiftEnrichmentService {
  private openai: OpenAI;
  private redis: Redis;
  private priceTracker: PriceTracker;
  private readonly cachePrefix = 'gift:enrichment:';
  private readonly cacheTTL = 24 * 60 * 60; // 24 hours

  constructor(redis: Redis) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.redis = redis;
    this.priceTracker = new PriceTracker(redis);
  }

  async enrichGift(
    gift: Gift,
    conversationContext: string,
    options: GiftEnrichmentOptions = { includeSuggestions: true }
  ): Promise<GiftProcessingResult> {
    try {
      const cacheKey = `${this.cachePrefix}${gift.id}`;
      const cached = await this.redis.get(cacheKey);

      if (cached && !options.includeSuggestions) {
        return { success: true, gift: JSON.parse(cached) };
      }

      const [details, suggestions, categoryInfo, analysis] = await Promise.all([
        this.generateGiftDetails(gift, conversationContext),
        this.generateSuggestions(gift.name, options.maxSuggestions || 3),
        this.categorizeGift(gift.name),
        this.analyzeGift(gift, conversationContext),
      ]);

      const enrichedGift: EnrichedGift = {
        ...gift,
        details,
        suggestions,
        category: categoryInfo.name,
        ageRange: categoryInfo.ageRanges[0],
        analysis,
      };

      await this.redis.set(cacheKey, JSON.stringify(enrichedGift), 'EX', this.cacheTTL);

      return {
        success: true,
        gift: enrichedGift,
        metadata: {
          cached: false,
          processingTime: Date.now(),
          suggestionCount: suggestions.length,
        },
      };
    } catch (err) {
      const error = err as Error;
      console.error('Gift enrichment failed:', error);
      return {
        success: false,
        error: {
          name: 'GiftProcessingError',
          message: error.message,
          code: 'ENRICHMENT_FAILED',
          recoverable: true,
          context: error.stack,
        } as GiftProcessingError,
      };
    }
  }

  private async generateSuggestions(giftName: string, count: number): Promise<GiftSuggestion[]> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Generate ${count} specific product suggestions for this gift at different price points.
                   Consider age appropriateness, safety, and educational value.
                   Format as JSON array with fields: name, priceRange, description, tier (budget/midRange/premium), confidence`,
        },
        {
          role: 'user',
          content: giftName,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const suggestions = response.suggestions || [];

    return Promise.all(
      suggestions.map(async (suggestion: any) => {
        const searchUrl = this.generateSearchUrl(suggestion.name);
        const products = await backupProductService.getBackupProducts(suggestion.name);

        return {
          ...suggestion,
          searchUrl,
          priceAnalysis: products.priceAnalysis,
          confidence: suggestion.confidence || 0.7,
        };
      })
    );
  }

  private async generateGiftDetails(gift: Gift, context: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Analyze the gift and conversation context to generate a brief,
                   insightful description of why this gift is meaningful.
                   Consider age appropriateness, educational value, and safety.`,
        },
        {
          role: 'user',
          content: `Gift: ${gift.name}\nContext: ${context}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async categorizeGift(giftName: string): Promise<GiftCategory> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Analyze the gift to determine category, appropriate age ranges, and keywords.
                   Format: {
                     "name": "Main Category",
                     "ageRanges": ["X-Y years"],
                     "keywords": ["keyword1", "keyword2"],
                     "safetyConsiderations": ["consideration1", "consideration2"]
                   }`,
        },
        {
          role: 'user',
          content: giftName,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(completion.choices[0]?.message?.content || '{}');
  }

  private async analyzeGift(gift: Gift, context: string): Promise<GiftAnalysis> {
    const mockProduct: ScrapedProduct = {
      title: gift.name,
      url: this.generateSearchUrl(gift.name),
      price: 0,
      priceString: '',
      rating: 0,
      reviewCount: 0,
      prime: false,
      features: [],
      availability: true,
      bestSeller: false,
      sponsored: false,
      score: 0,
    };

    const categoryAnalysis = await categoryQualityAnalyzer.analyzeProductCategory(
      mockProduct,
      gift.category || 'General'
    );

    const priceTracking = await this.priceTracker.trackPrice(mockProduct);

    return {
      sentiment: this.calculateSentiment(context),
      popularity: categoryAnalysis.categoryScore / 100,
      seasonality: this.calculateSeasonality(),
      availability: priceTracking.confidence,
      priceVolatility: priceTracking.currentPrice / priceTracking.averagePrice || 0.5,
      recommendationStrength: gift.confidence,
    };
  }

  private calculateSentiment(context: string): number {
    const enthusiasmMarkers = [
      'love',
      'really want',
      'favorite',
      'dream',
      'please',
      'excited',
      'amazing',
    ];

    const contextLower = context.toLowerCase();
    const markerCount = enthusiasmMarkers.filter(marker => contextLower.includes(marker)).length;

    return Math.min(markerCount / enthusiasmMarkers.length, 1);
  }

  private calculateSeasonality(): number {
    const currentMonth = new Date().getMonth();
    const isHolidaySeason = currentMonth >= 9 && currentMonth <= 11; // Oct-Dec
    return isHolidaySeason ? 1 : 0.7;
  }

  private generateSearchUrl(query: string): string {
    const formattedQuery = encodeURIComponent(query.trim());
    return `https://www.amazon.com/s?k=${formattedQuery}`;
  }

  async refreshCache(giftId: string): Promise<void> {
    const cacheKey = `${this.cachePrefix}${giftId}`;
    await this.redis.del(cacheKey);
  }

  async clearAllCache(): Promise<void> {
    const keys = await this.redis.keys(`${this.cachePrefix}*`);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}

export const createGiftEnricher = (redis: Redis) => new GiftEnrichmentService(redis);
