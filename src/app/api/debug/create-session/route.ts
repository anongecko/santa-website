// src/app/api/debug/create-session/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  console.log('Starting create-session request');

  try {
    console.log('Parsing request body');
    const body = await req.json();
    console.log('Request body:', body);

    const parentEmail = body.parentEmail || 'test@example.com';
    console.log('Creating session for:', parentEmail);

    // Add timeout to prisma operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database operation timed out')), 5000);
    });

    const dbOperation = prisma.chatSession.create({
      data: {
        parentEmail,
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

    // Race between timeout and db operation
    const session = await Promise.race([dbOperation, timeoutPromise]);

    console.log('Session created:', session);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        conversationId: session.conversations[0].id,
      },
    });
  } catch (error) {
    console.error('Create session error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create session',
      },
      {
        status: 500,
      }
    );
  }
}
