import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        status: 'active',
        conversations: {
          some: {
            messages: {
              some: {},
            },
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        conversations: {
          where: {
            status: 'active',
          },
          include: {
            messages: {
              orderBy: {
                timestamp: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });

    const formattedSessions = sessions
      .filter(
        session => session.conversations.length > 0 && session.conversations[0].messages.length > 0
      )
      .map(session => ({
        id: session.id,
        date: session.startTime.toISOString(),
        preview: session.conversations[0].messages[0].content || 'New chat',
      }));

    return NextResponse.json({ sessions: formattedSessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
