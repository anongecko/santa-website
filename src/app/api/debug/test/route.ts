// src/app/api/debug/test/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('Test endpoint called');

  try {
    const count = await prisma.chatSession.count();

    return NextResponse.json({
      success: true,
      sessionCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
