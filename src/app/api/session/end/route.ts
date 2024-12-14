// src/api/session/end/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { generateWishlistEmail } from '@/lib/email-templates';

const resend = new Resend(process.env.RESEND_API_KEY);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function sendEmail(
  to: string,
  gifts: any[],
  lastMessage?: string,
  attempt = 1
): Promise<boolean> {
  try {
    await resend.emails.send({
      from: `Santa Claus <${process.env.SENDER_EMAIL}>`,
      to: to,
      subject: "Your Child's Christmas Wishlist 🎄",
      html: generateWishlistEmail(gifts, lastMessage),
      tags: [{ name: 'type', value: 'wishlist' }],
    });
    return true;
  } catch (error) {
    console.error(`Email attempt ${attempt} failed:`, error);
    if (attempt < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      return sendEmail(to, gifts, lastMessage, attempt + 1);
    }
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        conversations: {
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

    if (session.status === 'ended') {
      return NextResponse.json({
        success: false,
        message: 'Session already ended',
      });
    }

    const allGifts = session.conversations.flatMap(conv => conv.gifts);
    const lastMessage = session.conversations
      .flatMap(conv => conv.messages)
      .filter(m => m.role === 'assistant')
      .pop()?.content;

    let emailSent = false;
    if (session.parentEmail && session.parentEmail !== 'anonymous@example.com') {
      emailSent = await sendEmail(session.parentEmail, allGifts, lastMessage);
    }

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'ended',
        endTime: new Date(),
        emailSent, // Track if email was sent successfully
      },
    });

    if (!emailSent && session.parentEmail !== 'anonymous@example.com') {
      return NextResponse.json({
        success: true,
        warning: 'Session ended but email delivery failed. Will retry automatically.',
        message: 'Session ended',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Session ended and email sent',
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
  }
}

// Add a new retry endpoint
export async function PUT(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        conversations: {
          include: {
            messages: true,
            gifts: true,
          },
        },
      },
    });

    if (!session || session.parentEmail === 'anonymous@example.com') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    const allGifts = session.conversations.flatMap(conv => conv.gifts);
    const lastMessage = session.conversations
      .flatMap(conv => conv.messages)
      .filter(m => m.role === 'assistant')
      .pop()?.content;

    const emailSent = await sendEmail(session.parentEmail, allGifts, lastMessage);

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { emailSent },
    });

    return NextResponse.json({
      success: emailSent,
      message: emailSent ? 'Email resent successfully' : 'Failed to resend email',
    });
  } catch (error) {
    console.error('Error retrying email:', error);
    return NextResponse.json({ error: 'Failed to retry email send' }, { status: 500 });
  }
}
