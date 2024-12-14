import { OpenAI } from 'openai';
import { prisma } from '@/lib/prisma';
import type { Message } from '@/types/chat';

interface DetectedGift {
  name: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  category?: string;
}

export class AIGiftDetector {
  private static readonly GIFT_SYSTEM_PROMPT = `You are a gift detection system analyzing conversations with Santa. Analyze the conversation to identify gifts that children want for Christmas.

When a gift is mentioned, consider:
- The specific name/details of the gift
- How much they want it based on their enthusiasm and way of asking
- The certainty that this is a genuine gift request
- Context from the entire conversation
- The category of the gift (e.g., "Electronics", "Toys", "Books", etc.)
- Any specific variants or details mentioned

Consider both direct requests:
- "I want..."
- "Can I have..."
- "I'm hoping for..."

And indirect mentions:
- "My friend has one and it's amazing!"
- "I saw this really cool..."
- "I've been saving up for..."

Respond with only a JSON object containing your analysis. Don't include this in the chat - it's for internal processing only.

Example output for "I really want a PS4 and maybe some legos":
{
  "gifts": [
    {
      "name": "PlayStation 4",
      "priority": "high",
      "confidence": 0.95,
      "category": "Electronics"
    },
    {
      "name": "LEGO Sets",
      "priority": "low",
      "confidence": 0.7,
      "category": "Toys"
    }
  ]
}`;

  static async processMessage(
    message: string,
    conversationId: string,
    context: Message[],
    openai: OpenAI
  ): Promise<void> {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        temperature: 0.3,
        messages: [
          { role: 'system', content: this.GIFT_SYSTEM_PROMPT },
          ...context.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) return;

      try {
        const parsed = JSON.parse(content);
        const gifts = Array.isArray(parsed.gifts) ? parsed.gifts : [];

        // Get existing gifts for confidence comparison
        const existingGifts = await prisma.gift.findMany({
          where: { conversationId },
        });

        // Store detected gifts in database with improved logic
        await Promise.all(
          gifts.map(async gift => {
            const existingGift = existingGifts.find(
              eg => eg.name.toLowerCase() === gift.name.toLowerCase()
            );

            return prisma.gift.upsert({
              where: {
                name_conversationId: {
                  name: gift.name,
                  conversationId,
                },
              },
              update: {
                mentionCount: { increment: 1 },
                priority:
                  gift.priority === 'high'
                    ? 'high'
                    : existingGift?.priority === 'high'
                      ? 'high'
                      : gift.priority,
                confidence: Math.max(gift.confidence, existingGift?.confidence ?? 0),
                category: gift.category || existingGift?.category,
              },
              create: {
                name: gift.name,
                priority: gift.priority,
                confidence: gift.confidence,
                category: gift.category,
                mentionCount: 1,
                conversationId,
                firstMentioned: new Date(),
              },
            });
          })
        );
      } catch (error) {
        console.error('Failed to process gifts:', error);
      }
    } catch (error) {
      console.error('Gift detection error:', error);
    }
  }
}
