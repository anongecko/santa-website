import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiService } from '@/lib/ai-service';
import { validateSession } from '@/lib/session';
import type { Message } from '@/types/chat';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, sessionId, parentEmail } = body;

    if (!content?.trim() || !sessionId || !parentEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sessionValidation = await validateSession(sessionId);
    if (!sessionValidation.isValid) {
      return NextResponse.json({ error: sessionValidation.error }, { status: 401 });
    }

    // Get or create active conversation
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

    // Save the user message
    await prisma.message.create({
      data: {
        content: content.trim(),
        role: 'user',
        conversationId: conversation.id,
      },
    });

    // Get the complete conversation history
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

    // Generate AI response
    const response = await aiService.generateSantaResponse(content, {
      messages: formattedMessages,
      sessionId,
      childEmail: parentEmail,
    });

    // Handle streaming response
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
              // Update the message in the database
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

          // Forward the chunk to the client
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

    // Handle non-streaming response
    if ('text' in response) {
      const aiMessage = await prisma.message.create({
        data: {
          content: response.text,
          role: 'assistant',
          conversationId: conversation.id,
        },
      });

      if (response.gifts?.length) {
        await Promise.all(
          response.gifts.map(gift =>
            prisma.gift.upsert({
              where: {
                name_conversationId: {
                  name: gift.name,
                  conversationId: conversation.id,
                },
              },
              update: {
                mentionCount: { increment: 1 },
                priority: gift.priority || 'medium',
                confidence: gift.confidence || 0.5,
              },
              create: {
                name: gift.name,
                priority: gift.priority || 'medium',
                confidence: gift.confidence || 0.5,
                mentionCount: 1,
                conversationId: conversation.id,
              },
            })
          )
        );
      }

      return NextResponse.json({
        message: aiMessage,
        gifts: response.gifts,
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
