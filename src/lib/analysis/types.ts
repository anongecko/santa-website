// src/lib/analysis/types.ts

export interface ScrapedProduct {
  url: string;
  title: string;
  price: number;
  priceString: string;
  rating: number;
  reviewCount: number;
  prime: boolean;
  sponsored: boolean;
  bestSeller: boolean;
  features: string[];
  brand?: string;
  availability: boolean;
  score: number;
  reviews: ProductReview[];
  category?: string;
}

export interface ProductReview {
  text: string;
  rating: number;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface MarketData {
  averagePrice: number;
  priceRange: PriceRange;
  competitorCount: number;
  marketShare: number;
  trendData: TrendData;
}

export interface TrendData {
  priceHistory: PricePoint[];
  demandTrend: 'rising' | 'falling' | 'stable';
  seasonality: SeasonalityData;
}

export interface PricePoint {
  date: string;
  price: number;
  source: 'amazon' | 'competitor' | 'historical';
}

export interface SeasonalityData {
  peakMonths: number[];
  lowMonths: number[];
  seasonalityScore: number;
  historicalLows: { month: number; price: number }[];
  historicalHighs: { month: number; price: number }[];
  bestTimeToBuy: string;
}

export interface CategoryMetrics {
  keyFeatures: string[];
  importantSpecs: string[];
  qualityIndicators: string[];
  commonConcerns: string[];
  priceFactors: string[];
  categoryBenchmarks: CategoryBenchmarks;
}

export interface CategoryBenchmarks {
  expectedPrice: PriceRange;
  minimumRating: number;
  minimumReviews: number;
  expectedFeatures: string[];
  qualityThresholds: QualityThresholds;
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation?: number;
}

export interface QualityThresholds {
  minRating: number;
  minReviewCount: number;
  minVerifiedPercentage: number;
  maxPriceVolatility: number;
  minQualityScore: number;
}

export interface FrequentPhrase {
  text: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  category: PhraseCategory;
  confidence: number;
  context?: string[];
  aiRelevance?: number;
  trendingStatus?: 'rising' | 'stable' | 'declining';
}

export interface CompetitorInfo {
  productUrl: string;
  relativePricing: number;
  featureOverlap: number;
  marketShare: number;
  competitiveAdvantages: string[];
}

export interface PriceComparisonMetrics {
  percentileRank: number;
  priceAdvantage: number;
  valueScore: number;
  priceElasticity: number;
}

export interface FeatureComparisonMetrics {
  featureScore: number;
  uniqueFeatures: string[];
  missingFeatures: string[];
  overallCompetitiveness: number;
}

export type PhraseCategory =
  | 'feature'
  | 'quality'
  | 'issue'
  | 'comparison'
  | 'usage'
  | 'durability'
  | 'value';

export interface AspectAnalysis {
  score: number;
  mentions: number;
  confidence: number;
  examples: string[];
  trending?: 'improving' | 'declining' | 'stable';
  aiInsights?: {
    importance: number;
    competitivePosition: string;
    improvement: string[];
  };
}

export interface CategoryAnalysis {
  categorySpecific: {
    strengths: string[];
    weaknesses: string[];
    keySpecs: Record<string, string>;
    competitiveAdvantages: string[];
  };
  frequentPhrases: FrequentPhrase[];
  categoryScore: number;
  recommendations: string[];
  marketPosition: MarketPosition;
  aspects?: Record<string, AspectAnalysis>;
  priceHistory?: TrendData;
  confidence: number;
  aiEnhancements?: {
    insights: string[];
    predictions: string[];
    suggestions: string[];
  };
}

export type PriceStatus =
  | 'LOWEST_PRICE'
  | 'GOOD_PRICE'
  | 'REGULAR_PRICE'
  | 'INFLATED_PRICE'
  | 'HIGHLY_INFLATED'
  | 'HISTORICAL_LOW'
  | 'SEASONAL_DEAL'
  | 'FLASH_SALE';

export type BadgeType =
  | 'CATEGORY_LEADER'
  | 'BEST_VALUE'
  | 'TOP_RATED'
  | 'RISING_STAR'
  | 'PREMIUM_CHOICE'
  | 'BEST_SELLER'
  | 'QUALITY_PICK'
  | 'TRENDING_UP'
  | 'MOST_RELIABLE'
  | 'CUSTOMER_FAVORITE'
  | 'BEST_IN_CATEGORY'
  | 'PRICE_LEADER'
  | 'HIGHEST_RATED'
  | 'EXPERT_CHOICE';

export type FlagType =
  | 'PRICE_CONCERN'
  | 'QUALITY_ISSUE'
  | 'RELIABILITY_CONCERN'
  | 'AVAILABILITY_ISSUE'
  | 'REVIEW_CONCERN'
  | 'COMPETITOR_WARNING'
  | 'SPECIFICATION_MISMATCH'
  | 'PRICE_VOLATILITY'
  | 'CUSTOMER_CONCERNS'
  | 'SHIPPING_ISSUES'
  | 'AUTHENTICITY_CHECK'
  | 'WARRANTY_CONCERN';

export interface MarketPosition {
  priceSegment: 'budget' | 'midRange' | 'premium';
  competitiveness: number;
  marketShare?: number;
  relativePricing: 'below' | 'at' | 'above' | 'significantly_above';
  aiMarketAnalysis?: {
    trend: string;
    forecast: string;
    competitorAnalysis: string[];
  };
}

export interface Badge {
  type: BadgeType;
  text: string;
  confidence: number;
  criteria: string[];
  color?: string;
  icon?: string;
  priority: number;
  aiGenerated: boolean;
  context?: {
    category: string;
    comparison?: string;
    timeFrame?: string;
  };
}

export interface Flag {
  type: FlagType;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations?: string[];
  aiConfidence: number;
  evidence: string[];
  impactAreas: string[];
  resolutionSteps?: string[];
}

export interface PriceAnalysis {
  currentPrice: number;
  priceHistory: PriceHistory[];
  priceRange: PriceRange;
  priceStatus: PriceStatus;
  volatility: number;
  confidence: number;
  lastUpdated: string;
  predictedTrend?: 'rising' | 'falling' | 'stable';
  seasonalityData?: SeasonalityData;
  aiSuggestions?: {
    bestTimeToBuy: string;
    priceAlerts: PriceAlert[];
    valuePrediction: string;
  };
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  source: 'amazon' | 'scraper' | 'api' | 'historical';
  currency: string;
}

export interface PriceAlert {
  type: 'target_price' | 'price_drop' | 'historical_low' | 'seasonal_deal';
  threshold: number;
  condition: string;
  message: string;
}

export interface ConfidenceMetrics {
  dataPoints: number;
  timespan: number;
  verifiedPurchases: number;
  reviewQuality: number;
  overallConfidence: number;
  aiConfidence?: number;
  dataReliability?: number;
}

export interface AIAnalysisResult extends CategoryAnalysis {
  confidenceMetrics: ConfidenceMetrics;
  badges: Badge[];
  flags: Flag[];
  priceAnalysis: PriceAnalysis;
  marketInsights: {
    positionStrength: number;
    competitivePressure: number;
    growthPotential: number;
    marketTrends: string[];
  };
  customerSentiment: {
    overall: number;
    breakdown: Record<string, number>;
    keyPhrases: string[];
    emergingIssues: string[];
    improvements: string[];
  };
  qualityAssessment: {
    overallScore: number;
    strengthFactors: string[];
    weaknessFactors: string[];
    reliabilityScore: number;
    longevityPrediction: string;
  };
  smartRecommendations: {
    purchasing: string[];
    timing: string[];
    alternatives: string[];
    valueMaximization: string[];
  };
}

export interface AnalyticsData {
  analysisCount: number;
  categoryHits: Record<string, number>;
  averageConfidence: number;
  lastUpdated: string;
  aiMetrics: {
    accuracyScore: number;
    enhancementRate: number;
    insightQuality: number;
  };
  cacheStats: CacheStats;
}

export interface CacheStats {
  hits: number;
  misses: number;
  efficiency: number;
  lastUpdated: Date;
}

export interface TrendAnalysis {
  shortTerm: TrendMetrics;
  mediumTerm: TrendMetrics;
  longTerm: TrendMetrics;
  seasonalPatterns: SeasonalPattern[];
  confidenceLevel: number;
}

export interface TrendMetrics {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  volatility: number;
  reliability: number;
  supportingData: string[];
}

export interface SeasonalPattern {
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'holiday';
  impact: number;
  priceEffect: number;
  demandEffect: number;
  historicalReliability: number;
}

// Add to types.ts
export interface SeasonalityData {
  peakMonths: number[];
  lowMonths: number[];
  seasonalityScore: number;
  historicalLows: { month: number; price: number }[];
  historicalHighs: { month: number; price: number }[];
  bestTimeToBuy: string;
}

export interface TrendMetrics {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  volatility: number;
  reliability: number;
  supportingData: string[];
}

// Update AnalyticsData to include required cacheStats
export interface AnalyticsData {
  analysisCount: number;
  categoryHits: Record<string, number>;
  averageConfidence: number;
  lastUpdated: string;
  aiMetrics: {
    accuracyScore: number;
    enhancementRate: number;
    insightQuality: number;
  };
  cacheStats: CacheStats;
}

// Add these comparison types
export interface CompetitiveAnalysis {
  directCompetitors: CompetitorInfo[];
  priceComparison: PriceComparisonMetrics;
  featureComparison: FeatureComparisonMetrics;
  marketAdvantages: string[];
  marketDisadvantages: string[];
}

export interface CompetitorInfo {
  productUrl: string;
  relativePricing: number;
  featureOverlap: number;
  marketShare: number;
  competitiveAdvantages: string[];
}

export interface PriceComparisonMetrics {
  percentileRank: number;
  priceAdvantage: number;
  valueScore: number;
  priceElasticity: number;
}

export interface FeatureComparisonMetrics {
  featureScore: number;
  uniqueFeatures: string[];
  missingFeatures: string[];
  overallCompetitiveness: number;
}

// Add these quality assessment types
export interface QualityAssessmentMetrics {
  reliabilityScore: number;
  durabilityPrediction: number;
  customerSatisfactionTrend: TrendMetrics;
  qualityIssues: QualityIssue[];
  improvementSuggestions: string[];
}

export interface QualityIssue {
  issue: string;
  severity: 'low' | 'medium' | 'high';
  frequency: number;
  impact: number;
  resolutionStatus?: string;
}

// Add these AI enhancement types
export interface AIEnhancementMetrics {
  confidenceScores: Record<string, number>;
  analysisQuality: number;
  dataCompleteness: number;
  insightReliability: number;
  enhancementSuggestions: Enhancement[];
}

export interface Enhancement {
  type: 'data' | 'analysis' | 'prediction' | 'recommendation';
  description: string;
  impact: number;
  implementationComplexity: 'low' | 'medium' | 'high';
  priority: number;
}

// Add utility type helpers
export type AnalysisDepth = 'basic' | 'standard' | 'deep' | 'comprehensive';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high';
export type TimeFrame = 'short' | 'medium' | 'long' | 'seasonal';
export type DataQuality = 'sparse' | 'adequate' | 'rich' | 'comprehensive';
