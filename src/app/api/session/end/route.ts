import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status === 'ended') {
      return NextResponse.json({
        success: false,
        message: 'Session already ended',
      });
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        endTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Session ended',
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}
