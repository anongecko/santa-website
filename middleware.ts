import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60;
const BLOCK_DURATION = 300;

interface RateLimit {
  limited: boolean;
  remaining: number;
  reset?: number;
}

interface RedisZRecord {
  member: string;
  score: number;
}

async function getRateLimit(identifier: string): Promise<RateLimit> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW * 1000;

  try {
    const blockKey = `ratelimit:blocked:${identifier}`;
    const isBlocked = await redis.get<string>(blockKey);

    if (isBlocked) {
      return { limited: true, remaining: 0, reset: parseInt(isBlocked) };
    }

    const records = await redis.zrange<RedisZRecord[]>(key, 0, -1, { withScores: true });
    const validRecords = records.filter((record) => record.score > windowStart);

    if (validRecords.length === 0) {
      await redis.zadd(key, { score: now, member: now.toString() });
      await redis.expire(key, RATE_LIMIT_WINDOW);
      return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (validRecords.length >= RATE_LIMIT_MAX) {
      if (validRecords.length >= RATE_LIMIT_MAX * 1.5) {
        const blockUntil = now + BLOCK_DURATION * 1000;
        await redis.set(blockKey, blockUntil.toString(), { ex: BLOCK_DURATION });
        return { limited: true, remaining: 0, reset: blockUntil };
      }
      const oldestValidRequest = validRecords[0].score;
      return {
        limited: true,
        remaining: 0,
        reset: oldestValidRequest + RATE_LIMIT_WINDOW * 1000,
      };
    }

    await redis.zadd(key, { score: now, member: now.toString() });
    return { limited: false, remaining: RATE_LIMIT_MAX - (validRecords.length + 1) };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { limited: false, remaining: RATE_LIMIT_MAX - 1 };
  }
}

export async function middleware(request: NextRequest) {
  const headers = new Headers({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  });

  if (request.nextUrl.pathname.startsWith('/api/')) {
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey || apiKey !== process.env.API_SECRET) {
      return new NextResponse('Unauthorized', { status: 401, headers });
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      '127.0.0.1';

    const rateLimit = await getRateLimit(ip);

    if (rateLimit.limited && rateLimit.reset) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());
      headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
      return new NextResponse('Too Many Requests', { status: 429, headers });
    }

    headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
    headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    if (rateLimit.reset) {
      headers.set('X-RateLimit-Reset', rateLimit.reset.toString());
    }
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
