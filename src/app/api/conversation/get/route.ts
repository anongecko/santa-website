// src/app/api/conversation/get/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Find existing active conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        sessionId,
        status: 'active',
      },
    });

    // Create new conversation if none exists
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          sessionId,
          status: 'active',
        },
      });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Conversation error:', error);
    return NextResponse.json({ error: 'Failed to get/create conversation' }, { status: 500 });
  }
}
