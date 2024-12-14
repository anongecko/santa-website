// src/app/api/debug/session/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Checking sessions...');

    // Get all sessions
    const sessions = await prisma.chatSession.findMany({
      include: {
        conversations: {
          include: {
            messages: true,
            gifts: true,
          },
        },
      },
    });

    return NextResponse.json({
      sessionCount: sessions.length,
      sessions: sessions.map(session => ({
        id: session.id,
        status: session.status,
        startTime: session.startTime,
        parentEmail: session.parentEmail,
        conversationCount: session.conversations.length,
        conversations: session.conversations.map(conv => ({
          id: conv.id,
          messageCount: conv.messages.length,
          giftCount: conv.gifts.length,
        })),
      })),
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({ error: 'Failed to check sessions' }, { status: 500 });
  }
}
