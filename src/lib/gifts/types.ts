import type { Gift } from '@prisma/client';

export interface GiftSuggestion {
  name: string;
  priceRange: string;
  searchUrl: string;
  description: string;
  tier: 'budget' | 'midRange' | 'premium';
  confidence: number;
}

export interface EnrichedGift extends Gift {
  details: string;
  suggestions: GiftSuggestion[];
  category: string;
  ageRange?: string;
  analysis?: GiftAnalysis;
}

export interface GiftAnalysis {
  sentiment: number;
  popularity: number;
  seasonality: number;
  availability: number;
  priceVolatility: number;
  recommendationStrength: number;
  priceAnalysis?: GiftPriceAnalysis;
}

export interface PriceRange {
  min: number;
  max: number;
  mean: number;
  median: number;
}

export interface GiftPriceAnalysis {
  range: PriceRange;
  tiers: GiftPriceTiers;
  distribution: GiftPriceDistribution;
  volatility: number;
  confidence: number;
  lastUpdated: number;
  sampleSize: number;
  category: string;
}

export interface GiftPriceTiers {
  budget: TierPriceRange;
  midRange: TierPriceRange;
  premium: TierPriceRange;
}

export interface TierPriceRange {
  min: number;
  max: number;
  typical: number;
}

export interface GiftPriceDistribution {
  percentile10: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
}

export interface GiftPriceHistory {
  timestamp: number;
  price: number;
}

export interface GiftPriceConfig {
  historyDays: number;
  minSampleSize: number;
  confidenceThreshold: number;
  volatilityThreshold: number;
  cacheExpiry: number;
  outlierIQRMultiplier: number;
}

export interface GiftValidationResult {
  isValid: boolean;
  confidence: number;
  issues?: string[];
  suggestions?: string[];
}

export interface GiftEnrichmentOptions {
  includeSuggestions?: boolean;
  includeAnalysis?: boolean;
  maxSuggestions?: number;
  priceRanges?: boolean;
  searchUrls?: boolean;
  skipCache?: boolean;
}

export interface GiftUpdateResult {
  gift: EnrichedGift;
  changes: Partial<Gift>;
  previousVersion?: Gift;
  timestamp: number;
}

export interface GiftProcessingResult {
  success: boolean;
  error?: GiftProcessingError;
  analysis?: GiftPriceAnalysis;
  metadata?: {
    processingTime: number;
    cacheHit: boolean;
    sampleSize: number;
  };
}

export interface GiftCategory {
  name: string;
  ageRanges: string[];
  priceRanges: {
    budget: TierPriceRange;
    midRange: TierPriceRange;
    premium: TierPriceRange;
  };
  seasonality: number;
  keywords: string[];
}

export type GiftPriority = 'high' | 'medium' | 'low';
export type GiftConfidence = number;
export type GiftMentionType = 'direct' | 'indirect' | 'implied';

export interface GiftContextAnalysis {
  sentiment: number;
  enthusiasm: number;
  specificity: number;
  consistency: number;
  requestStrength: number;
}

export interface GiftProcessingError extends Error {
  code: string;
  gift?: Partial<Gift>;
  recoverable: boolean;
  context?: string;
}
