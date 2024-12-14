import type { RotationConfig, ScrapingError } from '../types';

export const ROTATION_CONFIG: RotationConfig = {
  minAvailable: 10,
  maxFailures: 3,
  rotationInterval: 60000,
  responseTimeout: 10000,
  healthCheckInterval: 300000,
  retryAttempts: 3,
  backoffFactor: 1.5,
};

export const SCRAPING_CONFIG = {
  maxConcurrentRequests: 5,
  minRequestInterval: 2000,
  maxRetries: 3,
  timeout: {
    connect: 10000,
    read: 30000,
    write: 30000,
  },
  headers: {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    acceptLanguage: 'en-US,en;q=0.5',
    acceptEncoding: 'gzip, deflate, br',
    connection: 'keep-alive',
    pragma: 'no-cache',
    cacheControl: 'no-cache',
    secFetchDest: 'document',
    secFetchMode: 'navigate',
    secFetchSite: 'none',
    secFetchUser: '?1',
    upgradedInsecureRequests: '1',
  },
  userAgentConfig: {
    rotationInterval: 30000,
    minRotationDelay: 1000,
    maxFailuresBeforeRefresh: 5,
    refreshInterval: 3600000,
  },
  proxyConfig: {
    checkInterval: 300000,
    testUrl: 'https://www.amazon.com/robots.txt',
    testTimeout: 5000,
    maxResponseTime: 15000,
    minSuccessRate: 0.7,
    ipRotationInterval: 600000,
  },
  retryConfig: {
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'EPROTO', 'ERR_SOCKET_CLOSED'],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },
};

export const CACHE_CONFIG = {
  product: {
    ttl: 3600,
    maxSize: 1000,
    strategy: 'lru' as const,
  },
  search: {
    ttl: 1800,
    maxSize: 500,
    strategy: 'lru' as const,
  },
  price: {
    ttl: 7200,
    maxSize: 2000,
    strategy: 'lru' as const,
  },
};

export const ERROR_CODES = {
  PROXY_ERROR: 'PROXY_ERROR',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  BLOCKED: 'BLOCKED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PARSER_ERROR: 'PARSER_ERROR',
} as const;

export const createScrapingError = (
  code: keyof typeof ERROR_CODES,
  message: string,
  status?: number,
  retryable = true
): ScrapingError => ({
  name: 'ScrapingError',
  code,
  message,
  status: status || 500,
  retryable,
  stack: new Error().stack,
});

export const MONITORING_CONFIG = {
  errorThresholds: {
    proxy: {
      failures: 5,
      timeWindow: 300000,
    },
    userAgent: {
      failures: 3,
      timeWindow: 300000,
    },
    global: {
      errorRate: 0.3,
      timeWindow: 900000,
    },
  },
  metrics: {
    collectInterval: 60000,
    retentionPeriod: 86400000,
    aggregationIntervals: [300000, 900000, 3600000],
  },
  alerts: {
    errorRateThreshold: 0.2,
    responseTimeThreshold: 10000,
    successRateThreshold: 0.8,
  },
};

export const RESOURCE_LIMITS = {
  maxProxiesPerSession: 50,
  maxUserAgentsPerSession: 20,
  maxSessionDuration: 3600000,
  maxRequestsPerSession: 1000,
  maxConcurrentSessions: 10,
};
