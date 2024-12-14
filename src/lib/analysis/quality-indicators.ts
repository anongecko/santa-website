// src/lib/analysis/quality-indicators.ts

import { ScrapedProduct } from '../scraping/types';
import { PriceTracker } from './price-tracker';
import { SentimentAnalyzer } from './sentiment-analyzer';
import { Redis } from '@upstash/redis';

interface QualityIndicators {
  overallScore: number;
  priceValue: {
    status: string;
    confidence: number;
    savings?: number;
  };
  reliability: {
    score: number;
    factors: string[];
  };
  sentiment: {
    score: number;
    highlights: string[];
    concerns: string[];
  };
  badges: string[];
  flags: string[];
}

interface QualityConfig {
  minReviewCount: number;
  minRating: number;
  minSentimentScore: number;
  preferVerified: boolean;
}

export class QualityAnalyzer {
  private priceTracker: PriceTracker;
  private sentimentAnalyzer: SentimentAnalyzer;
  private config: QualityConfig;

  constructor(
    priceTracker: PriceTracker,
    sentimentAnalyzer: SentimentAnalyzer,
    config: Partial<QualityConfig> = {}
  ) {
    this.priceTracker = priceTracker;
    this.sentimentAnalyzer = sentimentAnalyzer;
    this.config = {
      minReviewCount: 100,
      minRating: 4.5,
      minSentimentScore: 0.7,
      preferVerified: true,
      ...config,
    };
  }

  async analyzeProduct(product: ScrapedProduct): Promise<QualityIndicators> {
    const [priceAnalysis, sentimentAnalysis] = await Promise.all([
      this.priceTracker.trackPrice(product),
      this.sentimentAnalyzer.analyzeProductSentiment(product.url),
    ]);

    const reliability = this.calculateReliability(product);
    const badges = this.determineBadges(product, priceAnalysis, sentimentAnalysis);
    const flags = this.determineFlags(product, priceAnalysis, sentimentAnalysis);

    return {
      overallScore: this.calculateOverallScore({
        product,
        priceAnalysis,
        sentimentAnalysis,
        reliability,
      }),
      priceValue: {
        status: priceAnalysis.priceStatus,
        confidence: priceAnalysis.confidence,
        savings: priceAnalysis.highestPrice - product.price,
      },
      reliability,
      sentiment: {
        score: sentimentAnalysis.overall,
        highlights: sentimentAnalysis.summaryPoints.filter(p => p.includes('+')),
        concerns: sentimentAnalysis.summaryPoints.filter(p => p.includes('-')),
      },
      badges,
      flags,
    };
  }

  private calculateOverallScore({
    product,
    priceAnalysis,
    sentimentAnalysis,
    reliability,
  }: any): number {
    let score = 0;

    // Rating component (0-40 points)
    score += (product.rating - 4) * 10;

    // Price value component (0-20 points)
    const priceScore = {
      LOWEST_PRICE: 20,
      GOOD_PRICE: 15,
      REGULAR_PRICE: 10,
      INFLATED_PRICE: 5,
      HIGHLY_INFLATED: 0,
    }[priceAnalysis.priceStatus];
    score += priceScore * priceAnalysis.confidence;

    // Sentiment component (0-20 points)
    score += (sentimentAnalysis.overall + 1) * 10;

    // Reliability component (0-20 points)
    score += reliability.score * 20;

    // Additional factors
    if (product.prime) score += 5;
    if (product.bestSeller) score += 5;
    if (product.reviewCount > 1000) score += 5;
    if (product.sponsored) score -= 5;

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateReliability(product: ScrapedProduct) {
    const factors: string[] = [];
    let score = 0.5; // Base score

    // Review quantity factor (0-0.2)
    const reviewScore = Math.min(product.reviewCount / 1000, 1) * 0.2;
    score += reviewScore;
    if (product.reviewCount > 500) {
      factors.push('High review count');
    }

    // Rating consistency (0-0.1)
    if (product.rating >= 4.8) {
      score += 0.1;
      factors.push('Consistently high ratings');
    } else if (product.rating >= 4.5) {
      score += 0.05;
      factors.push('Very good ratings');
    }

    // Product age/maturity (0-0.1)
    if (product.reviewCount > 1000) {
      score += 0.1;
      factors.push('Well-established product');
    }

    // Brand reputation (if available)
    if (product.brand) {
      score += 0.1;
      factors.push('Known brand');
    }

    // Prime eligibility
    if (product.prime) {
      score += 0.05;
      factors.push('Prime eligible');
    }

    return {
      score: Math.min(score, 1),
      factors,
    };
  }

  private determineBadges(
    product: ScrapedProduct,
    priceAnalysis: any,
    sentimentAnalysis: any
  ): string[] {
    const badges: string[] = [];

    // Price-related badges
    switch (priceAnalysis.priceStatus) {
      case 'LOWEST_PRICE':
        badges.push('🏷️ All-Time Low Price');
        break;
      case 'GOOD_PRICE':
        badges.push('👍 Great Value');
        break;
    }

    // Quality badges
    if (product.rating >= 4.8 && product.reviewCount > 1000) {
      badges.push('⭐ Top Rated');
    }
    if (product.bestSeller) {
      badges.push('🏆 Bestseller');
    }
    if (product.prime) {
      badges.push('🚚 Prime Shipping');
    }

    // Sentiment badges
    if (sentimentAnalysis.overall > 0.8) {
      badges.push('❤️ Highly Recommended');
    }
    if (sentimentAnalysis.aspects['durability']?.score > 0.8) {
      badges.push('🛡️ Proven Durability');
    }
    if (sentimentAnalysis.aspects['value']?.score > 0.8) {
      badges.push('💰 Great Value for Money');
    }

    return badges;
  }

  private determineFlags(
    product: ScrapedProduct,
    priceAnalysis: any,
    sentimentAnalysis: any
  ): string[] {
    const flags: string[] = [];

    // Price flags
    if (priceAnalysis.priceStatus === 'HIGHLY_INFLATED') {
      flags.push('⚠️ Price Currently Inflated');
    }
    if (priceAnalysis.volatility > 0.3) {
      flags.push('📊 Frequent Price Changes');
    }

    // Quality concerns
    if (sentimentAnalysis.overall < 0) {
      flags.push('⚠️ Mixed Reviews');
    }
    if (product.sponsored) {
      flags.push('🔍 Sponsored Listing');
    }

    // Recent issues
    if (sentimentAnalysis.aspects['reliability']?.score < 0) {
      flags.push('⚠️ Recent Quality Concerns');
    }

    return flags;
  }

  getDisplayTags(product: ScrapedProduct, analysis: any): string[] {
    const tags: string[] = [];

    // Price status tag
    const priceTag = {
      LOWEST_PRICE: '🏷️ Lowest Price Ever',
      GOOD_PRICE: '👍 Good Deal',
      REGULAR_PRICE: '💲 Regular Price',
      INFLATED_PRICE: '📈 Price Inflated',
      HIGHLY_INFLATED: '⚠️ Highly Inflated',
    }[analysis.priceValue.status];
    tags.push(priceTag);

    // Quality tags
    if (product.rating >= 4.8 && product.reviewCount > 1000) {
      tags.push('⭐ Top Rated Product');
    }

    // Value tags
    if (analysis.sentiment.score > 0.8) {
      tags.push('💎 High Value');
    }

    // Deal tags
    if (analysis.priceValue.savings > 20) {
      const savingsPercent = Math.round((analysis.priceValue.savings / product.price) * 100);
      tags.push(`💰 Save ${savingsPercent}%`);
    }

    return tags;
  }

  async getDetailedQualityReport(product: ScrapedProduct): Promise<string> {
    const analysis = await this.analyzeProduct(product);

    return `
Product Quality Report for ${product.title}

Overall Score: ${analysis.overallScore}/100

Price Analysis:
- Status: ${analysis.priceValue.status}
- Confidence: ${Math.round(analysis.priceValue.confidence * 100)}%
${analysis.priceValue.savings ? `- Potential Savings: $${analysis.priceValue.savings.toFixed(2)}` : ''}

Reliability:
${analysis.reliability.factors.map(f => `- ${f}`).join('\n')}

Sentiment Highlights:
${analysis.sentiment.highlights.map(h => `✓ ${h}`).join('\n')}

${
  analysis.sentiment.concerns.length
    ? `Concerns:
${analysis.sentiment.concerns.map(c => `! ${c}`).join('\n')}`
    : ''
}

Badges:
${analysis.badges.join('\n')}

${
  analysis.flags.length
    ? `Flags:
${analysis.flags.join('\n')}`
    : ''
}
    `.trim();
  }
}

export const createQualityAnalyzer = (redis: Redis) => {
  const priceTracker = new PriceTracker(redis);
  const sentimentAnalyzer = new SentimentAnalyzer(redis);
  return new QualityAnalyzer(priceTracker, sentimentAnalyzer);
};
