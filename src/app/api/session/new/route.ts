// src/app/api/session/new/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request) {
  // Added underscore to indicate intentionally unused
  try {
    const session = await prisma.chatSession.create({
      data: {
        status: 'active',
        startTime: new Date(),
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        sessionId: session.id,
        status: 'active',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      conversationId: conversation.id,
      startTime: session.startTime,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
