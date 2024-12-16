import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';
import { validateSession } from '@/lib/session';
import type { Message } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, sessionId } = body;

    if (!content?.trim() || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionValidation = await validateSession(sessionId);
    if (!sessionValidation.isValid) {
      return NextResponse.json({ error: sessionValidation.error }, { status: 401 });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        sessionId,
        status: 'active',
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          sessionId,
          status: 'active',
        },
      });
    }

    await prisma.message.create({
      data: {
        content: content.trim(),
        role: 'user',
        conversationId: conversation.id,
      },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' },
    });

    const formattedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.timestamp.getTime(),
      status: 'sent',
    }));

    const response = await aiService.generateSantaResponse(content, {
      messages: formattedMessages,
      sessionId,
    });

    if (response instanceof ReadableStream) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let fullContent = '';
      const aiMessageId = crypto.randomUUID();

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk);
          fullContent += text;

          if (fullContent.trim()) {
            try {
              await prisma.message.upsert({
                where: { id: aiMessageId },
                create: {
                  id: aiMessageId,
                  content: fullContent,
                  role: 'assistant',
                  conversationId: conversation.id,
                },
                update: {
                  content: fullContent,
                },
              });
            } catch (error) {
              console.error('Error saving streamed message:', error);
            }
          }

          controller.enqueue(encoder.encode(text));
        },
      });

      return new Response(response.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    if ('text' in response) {
      const aiMessage = await prisma.message.create({
        data: {
          content: response.text,
          role: 'assistant',
          conversationId: conversation.id,
        },
      });

      return NextResponse.json({
        message: aiMessage,
      });
    }

    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error processing request',
      },
      { status: 500 }
    );
  }
}
