import { Message } from '@/types/chat'

type GenerateSantaResponseOptions = {
  sessionId: string
  previousMessages: Message[]
}

export async function generateSantaResponse(
  message: string, 
  options: GenerateSantaResponseOptions
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: options.sessionId,
        previousMessages: options.previousMessages,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate response')
    }

    const data = await response.json()
    return {
      text: data.reply,
      gifts: data.gifts || [],
      usage: data.usage,
      metadata: {
        sessionId: options.sessionId,
        timestamp: Date.now()
      }
    }
  } catch (error) {
    console.error('Error generating Santa response:', error)
    throw error
  }
}

export type SantaResponse = {
  text: string
  gifts?: string[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  metadata: {
    sessionId: string
    timestamp: number
  }
}
