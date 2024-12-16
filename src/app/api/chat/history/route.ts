import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSessionValid } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (sessionId === 'preview') {
      return NextResponse.json({
        session: {
          id: 'preview',
          startTime: new Date(),
          endTime: null,
          status: 'active',
          lastActive: new Date(),
        },
        messages: [],
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
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const allMessages = session.conversations.flatMap((conv) => conv.messages);
    const lastMessage = allMessages[allMessages.length - 1];

    return NextResponse.json({
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        lastActive: lastMessage?.timestamp || session.startTime,
      },
      messages: allMessages,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
