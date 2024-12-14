import { NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'

export async function POST(req: Request) {
  console.log('Starting AI test...')
  try {
    const { message = "Hi Santa!" } = await req.json()
    console.log('Input message:', message)

    console.log('AI Config:', aiService.getConfig())
    
    const startTime = Date.now()
    const response = await aiService.generateSantaResponse(message, {
      messages: [],
      sessionId: 'test-session',
      childEmail: 'test@example.com'
    })
    const duration = Date.now() - startTime
    
    console.log(`Response received in ${duration}ms`)

    if (response instanceof ReadableStream) {
      const reader = response.getReader()
      const decoder = new TextDecoder()
      let text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value)
      }

      console.log('Stream response:', text)
      return NextResponse.json({ success: true, response: text, duration })
    }

    console.log('Complete response:', response)
    return NextResponse.json({ success: true, response, duration })

  } catch (error: any) {
    console.error('AI test error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      success: false,
      error: error.message
    }, { 
      status: error.statusCode || 500 
    })
  }
}
