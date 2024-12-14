import { Redis } from 'ioredis';
import { CategoryQualityAnalyzer } from './category-quality-indicators';
import { PriceTracker } from './price-tracker';
import { QualityAnalyzer } from './quality-indicators';
import { SentimentAnalyzer } from './sentiment-analyzer';
import type {
  ScrapedProduct,
  CategoryAnalysis,
  PriceAnalysis,
  AIAnalysisResult,
  QualityAssessmentMetrics,
  AnalysisDepth,
  ConfidenceMetrics,
} from './types';

export class ProductAnalyzer {
  private categoryAnalyzer: CategoryQualityAnalyzer;
  private priceTracker: PriceTracker;
  private qualityAnalyzer: QualityAnalyzer;
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor(redis: Redis) {
    this.categoryAnalyzer = new CategoryQualityAnalyzer(redis);
    this.priceTracker = new PriceTracker(redis);
    this.qualityAnalyzer = new QualityAnalyzer(redis);
    this.sentimentAnalyzer = new SentimentAnalyzer(redis);
  }

  async analyzeProduct(
    product: ScrapedProduct,
    options: {
      depth?: AnalysisDepth;
      includePrice?: boolean;
      includeSentiment?: boolean;
      forceRefresh?: boolean;
    } = {}
  ): Promise<AIAnalysisResult> {
    try {
      const [categoryAnalysis, priceAnalysis, qualityMetrics, sentimentAnalysis] =
        await Promise.all([
          this.categoryAnalyzer.analyzeProductCategory(product, product.category || 'General', {
            forceRefresh: options.forceRefresh,
            depth: options.depth,
          }),
          options.includePrice ? this.priceTracker.trackPrice(product) : null,
          this.qualityAnalyzer.analyzeProduct(product),
          options.includeSentiment
            ? this.sentimentAnalyzer.analyzeProductSentiment(product.url)
            : null,
        ]);

      const confidence = this.calculateCombinedConfidence({
        category: categoryAnalysis.confidence,
        price: priceAnalysis?.confidence || 0,
        quality: qualityMetrics.overallScore / 100,
        sentiment: sentimentAnalysis?.overall || 0,
      });

      return {
        ...categoryAnalysis,
        priceAnalysis: priceAnalysis || categoryAnalysis.priceAnalysis,
        confidenceMetrics: this.generateConfidenceMetrics(
          product,
          confidence,
          options.depth || 'standard'
        ),
        qualityAssessment: {
          overallScore: qualityMetrics.overallScore,
          strengthFactors: qualityMetrics.reliability.factors,
          weaknessFactors: this.extractWeaknesses(qualityMetrics),
          reliabilityScore: qualityMetrics.reliability.score,
          longevityPrediction: this.generateLongevityPrediction(qualityMetrics),
        },
        customerSentiment: sentimentAnalysis
          ? {
              overall: sentimentAnalysis.overall,
              breakdown: sentimentAnalysis.aspects,
              keyPhrases: sentimentAnalysis.keywords.positive,
              emergingIssues: sentimentAnalysis.keywords.negative,
              improvements: sentimentAnalysis.summaryPoints,
            }
          : this.generateDefaultSentiment(),
      };
    } catch (error) {
      console.error('Product analysis failed:', error);
      throw new Error(
        `Failed to analyze product: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private calculateCombinedConfidence(scores: Record<string, number>): number {
    const weights = {
      category: 0.4,
      price: 0.2,
      quality: 0.2,
      sentiment: 0.2,
    };

    return Object.entries(scores).reduce(
      (acc, [key, score]) => acc + score * weights[key as keyof typeof weights],
      0
    );
  }

  private generateConfidenceMetrics(
    product: ScrapedProduct,
    overallConfidence: number,
    depth: AnalysisDepth
  ): ConfidenceMetrics {
    const depthMultiplier = {
      basic: 0.7,
      standard: 0.85,
      deep: 0.95,
      comprehensive: 1,
    };

    return {
      dataPoints: product.reviews.length,
      timespan: this.calculateTimespan(product.reviews),
      verifiedPurchases: product.reviews.filter(r => r.verified).length,
      reviewQuality: this.calculateReviewQuality(product.reviews),
      overallConfidence: overallConfidence * depthMultiplier[depth],
      aiConfidence: 0.85,
      dataReliability: this.calculateDataReliability(product, depth),
    };
  }

  private calculateTimespan(reviews: Array<{ date: string }>): number {
    if (!reviews.length) return 0;
    const dates = reviews.map(r => new Date(r.date).getTime());
    return Math.max(...dates) - Math.min(...dates);
  }

  private calculateReviewQuality(
    reviews: Array<{
      helpful: number;
      verified: boolean;
    }>
  ): number {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((acc, review) => acc + review.helpful * (review.verified ? 1.5 : 1), 0) /
      reviews.length
    );
  }

  private calculateDataReliability(product: ScrapedProduct, depth: AnalysisDepth): number {
    const factors = {
      reviewCount: Math.min(product.reviews.length / 100, 1),
      verifiedRatio: product.reviews.filter(r => r.verified).length / product.reviews.length,
      depthMultiplier: depth === 'comprehensive' ? 1 : 0.8,
    };

    return Object.values(factors).reduce((acc, val) => acc * val, 1);
  }

  private extractWeaknesses(metrics: QualityAssessmentMetrics): string[] {
    return metrics.qualityIssues
      .filter(issue => issue.severity !== 'low')
      .map(issue => issue.issue);
  }

  private generateLongevityPrediction(metrics: QualityAssessmentMetrics): string {
    const years = metrics.durabilityPrediction;
    return `Expected to last ${years.toFixed(1)} years under normal use`;
  }

  private generateDefaultSentiment() {
    return {
      overall: 0.5,
      breakdown: {},
      keyPhrases: [],
      emergingIssues: [],
      improvements: [],
    };
  }
}

export const createProductAnalyzer = (redis: Redis) => new ProductAnalyzer(redis);
