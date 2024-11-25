import { ChatMessage } from '@/types/chat'

type GenerateSantaResponseOptions = {
  sessionId: string
  previousMessages: ChatMessage[]
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
      reply: data.reply,
      gifts: data.gifts || [],
    }
  } catch (error) {
    console.error('Error generating Santa response:', error)
    throw error
  }
}
