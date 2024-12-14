// src/app/api/debug/simple-session/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  console.log('Simple session creation started');

  try {
    const session = await prisma.chatSession.create({
      data: {
        parentEmail: 'test@example.com',
        status: 'active',
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

    console.log('Session created:', {
      sessionId: session.id,
      conversationId: session.conversations[0].id,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      conversationId: session.conversations[0].id,
    });
  } catch (error) {
    console.error('Session creation failed:', error);
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
