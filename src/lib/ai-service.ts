import type { Message } from '@/types'
import { Configuration, OpenAIApi } from 'openai-edge'

const config = new Configuration({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
})

const openai = new OpenAIApi(config)

interface SantaResponseOptions {
  messages: Message[]
  sessionId: string
  childEmail: string
}

interface SantaResponse {
  text: string
  gifts?: string[]
}

const SYSTEM_PROMPT = `You are Santa Claus, speaking with a child. Maintain a warm, jolly personality.
Key behaviors:
- Keep responses short (2-3 sentences max)
- Use simple, child-friendly language
- Frequently use Christmas-themed emojis
- Start messages with "Ho ho ho!" occasionally
- Ask about good behaviors and kind acts
- Express interest in their Christmas wishes
- Never break character
- Keep conversation positive and encouraging`

export async function generateSantaResponse(
  message: string,
  options: SantaResponseOptions
): Promise<SantaResponse> {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...options.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 150,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    })

    const data = await response.json()
    const text = data.choices[0].message.content

    // Extract gift mentions using a basic regex
    const giftRegex = /(?:want|wish|like|love|hoping for|asking for)\s+(?:a|an|the)?\s*([^,.!?]+)(?=[,.!?]|$)/gi
    const matches = text.matchAll(giftRegex)
    const gifts = Array.from(matches, m => m[1].trim())

    return {
      text,
      gifts: gifts.length ? gifts : undefined
    }

  } catch (error) {
    console.error('Error generating Santa response:', error)
    throw error
  }
}
