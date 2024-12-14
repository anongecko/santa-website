import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { parentEmail } = await req.json();

    if (!parentEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const session = await prisma.chatSession.create({
      data: {
        parentEmail,
        status: 'active',
        startTime: new Date(),
        conversations: {
          create: {
            status: 'active',
          },
        },
      },
      include: {
        conversations: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      conversationId: session.conversations[0].id,
      startTime: session.startTime,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
