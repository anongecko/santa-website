interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string
    }
    finish_reason: string | null
  }>
}

export async function* streamReader(response: Response) {
  if (!response.body) throw new Error('No response body')
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        
        if (trimmed.startsWith('data: ')) {
          try {
            const chunk: StreamChunk = JSON.parse(trimmed.slice(6))
            if (chunk.choices[0]?.delta?.content) {
              yield chunk.choices[0].delta.content
            }
            if (chunk.choices[0]?.finish_reason) {
              return
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createReadableStream(asyncIterator: AsyncIterator<string>) {
  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await asyncIterator.next()
        if (done) {
          controller.close()
        } else {
          controller.enqueue(value)
        }
      } catch (error) {
        controller.error(error)
      }
    }
  })
}

export async function streamToString(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader()
  let result = ''
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      result += value
    }
  } finally {
    reader.releaseLock()
  }
  
  return result
}

export function isStreamAvailable(): boolean {
  return typeof ReadableStream !== 'undefined' && 
         typeof TextEncoder !== 'undefined' && 
         typeof TextDecoder !== 'undefined'
}
