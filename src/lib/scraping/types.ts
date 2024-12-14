export interface ScrapedProduct {
  title: string;
  url: string;
  price: number;
  originalPrice?: number;
  priceString: string;
  rating: number;
  reviewCount: number;
  prime: boolean;
  imageUrl?: string;
  features: string[];
  brand?: string;
  availability: boolean;
  category?: string;
  bestSeller: boolean;
  sponsored: boolean;
  score: number;
  lastUpdated?: number;
  scrapedWith?: {
    proxy: string;
    userAgent: string;
    timestamp: number;
  };
  salesRank?: number;
  verifiedPurchases?: number;
  variantCount?: number;
  qualityMetrics?: ProductQualityMetrics;
  enrichmentData?: ProductEnrichmentData;
}

export interface ProductQualityMetrics {
  reliabilityScore: number;
  priceCompetitiveness: number;
  reviewQuality: number;
  brandReputation?: number;
  overallQuality: number;
  confidenceScore: number;
}

export interface ProductEnrichmentData {
  seasonality?: number;
  giftSuitability?: number;
  ageRecommendation?: string[];
  occasionTags?: string[];
  alternatives?: string[];
  priceHistory?: PriceHistoryPoint[];
  competitiveAnalysis?: CompetitiveAnalysis;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  source: string;
}

export interface CompetitiveAnalysis {
  priceRank: number;
  marketShare?: number;
  competitorCount: number;
  pricePercentile: number;
  valueScore: number;
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation?: number;
  volatility?: number;
  lastUpdated: number;
  pricesByTier: {
    budget: number[];
    midRange: number[];
    premium: number[];
  };
  seasonalAdjustment?: number;
  timestamp: number;
}

export interface GiftCategory {
  name: string;
  keywords: string[];
  ageRanges: string[];
  priceRanges: {
    budget: { min: number; max: number };
    midRange: { min: number; max: number };
    premium: { min: number; max: number };
  };
  priorityScore?: number;
  seasonality?: number[];
}

export interface Proxy {
  host: string;
  port: number;
  protocol: 'http' | 'https';
  username?: string;
  password?: string;
  country?: string;
  lastUsed: number;
  failCount: number;
  responseTime: number;
  successCount?: number;
  enabled: boolean;
  weight?: number;
  healthCheck?: {
    lastCheck: number;
    status: ProxyStatus;
    consecutiveFailures: number;
    averageResponseTime: number;
    successRate: number;
    lastError?: string;
  };
  metadata?: {
    provider?: string;
    location?: string;
    type?: 'residential' | 'datacenter';
    expiresAt?: number;
  };
}

export interface UserAgent {
  string: string;
  browser: string;
  device: string;
  osVersion: string;
  lastUsed: number;
  successCount?: number;
  failCount?: number;
  performance?: {
    averageResponseTime: number;
    successRate: number;
    blockRate: number;
  };
  category?: 'mobile' | 'desktop' | 'tablet';
  priority?: number;
}

export interface ScrapingStats {
  successCount: number;
  failureCount: number;
  lastSuccess?: Date;
  lastFailure?: Date;
  averageResponseTime: number;
  proxyRotations: number;
  userAgentRotations: number;
  byProxy: Record<string, ProxyStats>;
  byUserAgent: Record<string, UserAgentStats>;
  byCategory: Record<string, CategoryStats>;
  errorRates: ErrorRateStats;
}

export interface ProxyStats {
  success: number;
  failure: number;
  avgResponse: number;
  lastUsed: number;
  blockCount: number;
  timeouts: number;
}

export interface UserAgentStats {
  success: number;
  failure: number;
  avgResponse: number;
  blockRate: number;
  lastUsed: number;
}

export interface CategoryStats {
  requestCount: number;
  successRate: number;
  averageProducts: number;
  averagePrice: number;
  commonErrors: string[];
}

export interface ErrorRateStats {
  network: number;
  timeout: number;
  blocked: number;
  parsing: number;
  validation: number;
}

export interface CacheConfig {
  productTTL: number;
  searchTTL: number;
  priceTTL: number;
  maxSize?: number;
  strategy: 'lru' | 'fifo';
  compressionEnabled?: boolean;
  validateOnRead?: boolean;
  errorTTL?: number;
  refreshThreshold?: number;
}

export interface ProductSearchResult {
  products: ScrapedProduct[];
  priceAnalysis: PriceRange;
  timestamp: number;
  source: ScrapingSource;
  meta?: {
    totalResults?: number;
    pageCount?: number;
    filters?: Record<string, string[]>;
    qualityScore?: number;
    categoryRelevance?: number;
    searchRefinements?: string[];
    executionTime?: number;
    cacheHit?: boolean;
  };
  recommendations?: {
    alternative: ScrapedProduct[];
    similar: ScrapedProduct[];
    complementary: ScrapedProduct[];
  };
}

export interface ScrapingError extends Error {
  code: string;
  status: number;
  retryable: boolean;
  proxy?: string;
  userAgent?: string;
  context?: {
    url?: string;
    timestamp: number;
    attemptNumber: number;
    response?: {
      status: number;
      headers?: Record<string, string>;
    };
  };
  metadata?: Record<string, unknown>;
}

export interface RotationConfig {
  minAvailable: number;
  maxFailures: number;
  rotationInterval: number;
  responseTimeout: number;
  healthCheckInterval: number;
  retryAttempts: number;
  backoffFactor: number;
  warmupPeriod?: number;
  cooldownPeriod?: number;
  loadBalancing?: 'roundRobin' | 'weighted' | 'performance';
  failureThresholds?: {
    consecutive: number;
    timeWindow: number;
    maxBlockedRate: number;
  };
}

export interface ScrapingSession {
  id: string;
  startTime: number;
  endTime?: number;
  proxy: Proxy;
  userAgent: UserAgent;
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  status: SessionStatus;
  metadata?: {
    category?: string;
    priority?: number;
    targetCount?: number;
  };
  performance?: {
    cacheHits: number;
    cacheMisses: number;
    retryCount: number;
    totalBytes: number;
  };
}

export type PriceTier = 'budget' | 'midRange' | 'premium';
export type ScrapingSource = 'amazon' | 'cache' | 'fresh' | 'fallback' | 'backup';
export type ProxyStatus = 'active' | 'failing' | 'disabled' | 'blocked' | 'cooling';
export type SessionStatus = 'initializing' | 'active' | 'paused' | 'completed' | 'failed';
export type CacheStrategy = 'lru' | 'fifo' | 'lfu' | 'ttl';

export const CACHE_STRATEGIES: Record<CacheStrategy, string> = {
  lru: 'Least Recently Used',
  fifo: 'First In First Out',
  lfu: 'Least Frequently Used',
  ttl: 'Time To Live',
};
