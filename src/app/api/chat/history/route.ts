// src/app/api/chat/history/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSessionValid } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Handle preview session
    if (sessionId === 'preview') {
      return NextResponse.json({
        session: {
          id: 'preview',
          startTime: new Date(),
          endTime: null,
          status: 'active',
          parentEmail: 'preview@example.com',
          lastActive: new Date(),
        },
        messages: [],
        gifts: [],
      });
    }

    const isValid = await isSessionValid(sessionId);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        conversations: {
          where: { status: 'active' },
          include: {
            messages: {
              orderBy: { timestamp: 'asc' },
            },
            gifts: {
              orderBy: [{ priority: 'desc' }, { mentionCount: 'desc' }],
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const allMessages = session.conversations.flatMap(conv => conv.messages);
    const allGifts = session.conversations.flatMap(conv => conv.gifts);
    const lastMessage = allMessages[allMessages.length - 1];

    return NextResponse.json({
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        parentEmail: session.parentEmail,
        lastActive: lastMessage?.timestamp || session.startTime,
      },
      messages: allMessages,
      gifts: allGifts,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
