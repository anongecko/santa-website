import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rate limit configuration
const RATE_LIMIT_MAX = 20; // Max requests per window
const RATE_LIMIT_WINDOW = 60; // Window in seconds
const BLOCK_DURATION = 300; // Block duration in seconds if limit exceeded

async function getRateLimit(identifier: string) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW * 1000;

  try {
    // Get and clean existing records
    const records = await redis.zrangebyscore(key, windowStart, '+inf');
    if (!records.length) {
      await redis.zadd(key, { score: now, member: now.toString() });
      await redis.expire(key, RATE_LIMIT_WINDOW);
      return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
    }

    // Check if blocked
    const blockKey = `ratelimit:blocked:${identifier}`;
    const isBlocked = await redis.get(blockKey);
    if (isBlocked) {
      return { limited: true, remaining: 0, reset: parseInt(isBlocked) };
    }

    // Clean old records
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = records.length;

    if (count >= RATE_LIMIT_MAX) {
      // Block if significantly over limit
      if (count >= RATE_LIMIT_MAX * 1.5) {
        const blockUntil = now + BLOCK_DURATION * 1000;
        await redis.set(blockKey, blockUntil.toString(), {
          ex: BLOCK_DURATION,
        });
        return { limited: true, remaining: 0, reset: blockUntil };
      }
      return {
        limited: true,
        remaining: 0,
        reset: parseInt(records[0]) + RATE_LIMIT_WINDOW * 1000,
      };
    }

    // Add new request record
    await redis.zadd(key, { score: now, member: now.toString() });
    return { limited: false, remaining: RATE_LIMIT_MAX - (count + 1) };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open if Redis is down
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
  }
}

export async function middleware(request: NextRequest) {
  // Basic security headers
  const headers = new Headers({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });

  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');

    // API key check
    if (!apiKey || apiKey !== process.env.API_SECRET) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers,
      });
    }

    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      '127.0.0.1';

    const rateLimit = await getRateLimit(ip);

    if (rateLimit.limited) {
      headers.set('Retry-After', Math.ceil((rateLimit.reset - Date.now()) / 1000).toString());
      headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers,
      });
    }

    // Add rate limit headers
    headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    if (rateLimit.reset) {
      headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
    }
  }

  const response = NextResponse.next();

  // Apply security headers to all responses
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
