import { NextResponse } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const remaining = await rateLimiter.getRemainingRequests(`ip:${ip}`);

    return NextResponse.json({
      ip,
      remaining_requests: remaining,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Rate limit check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
