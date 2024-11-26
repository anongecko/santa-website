interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string
    }
    finish_reason: string | null
  }>
}

export type StreamResponse = AsyncGenerator<string, void, unknown>

class StreamError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'StreamError'
  }
}

export async function* streamReader(response: Response): StreamResponse {
  if (!response.body) throw new StreamError('No response body')
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
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
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              yield content
            }
            if (chunk.choices[0]?.finish_reason) {
              return
            }
          } catch (e) {
            console.warn('Error parsing chunk:', e)
            throw new StreamError('Failed to parse stream chunk', e)
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        const chunk: StreamChunk = JSON.parse(buffer.trim().slice(6))
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      } catch (e) {
        // Ignore parsing errors for final buffer
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export function createReadableStream(asyncIterator: AsyncIterator<string> | AsyncGenerator<string, void, unknown>): ReadableStream<string> {
  let isClosed = false

  return new ReadableStream({
    async pull(controller) {
      if (isClosed) return

      try {
        const { value, done } = await asyncIterator.next()
        if (done) {
          isClosed = true
          controller.close()
        } else {
          controller.enqueue(value)
        }
      } catch (error) {
        isClosed = true
        controller.error(new StreamError('Stream processing failed', error))
      }
    },
    
    async cancel() {
      isClosed = true
      try {
        if (asyncIterator && typeof (asyncIterator as AsyncGenerator<string>).return === 'function') {
          await (asyncIterator as AsyncGenerator<string>).return(undefined)
        }
      } catch (error) {
        console.warn('Error closing iterator:', error)
      }
    }
  })
}

export async function streamToString(stream: ReadableStream<string>): Promise<string> {
  const reader = stream.getReader()
  const chunks: string[] = []
  
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
  } catch (error) {
    throw new StreamError('Failed to read stream', error)
  } finally {
    try {
      reader.releaseLock()
    } catch (error) {
      console.warn('Error releasing reader lock:', error)
    }
  }
  
  return chunks.join('')
}

export function isStreamAvailable(): boolean {
  return typeof ReadableStream !== 'undefined' && 
         typeof TextEncoder !== 'undefined' && 
         typeof TextDecoder !== 'undefined'
}

export async function ensureStringStream(
  value: AsyncGenerator<string, void, unknown> | ReadableStream<string>
): Promise<ReadableStream<string>> {
  if (value instanceof ReadableStream) {
    return value
  }
  return createReadableStream(value)
}

export function createStreamController() {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null
  
  const stream = new ReadableStream({
    start(c) {
      controller = c
    },
    cancel() {
      if (controller) {
        try {
          controller.close()
        } catch (error) {
          console.warn('Error closing controller:', error)
        }
        controller = null
      }
    }
  })

  return {
    stream,
    write(chunk: string) {
      if (controller) {
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch (error) {
          console.warn('Error writing to stream:', error)
        }
      }
    },
    close() {
      if (controller) {
        try {
          controller.close()
        } catch (error) {
          console.warn('Error closing stream:', error)
        }
        controller = null
      }
    },
    error(err: Error) {
      if (controller) {
        try {
          controller.error(err)
        } catch (error) {
          console.warn('Error signaling stream error:', error)
        }
        controller = null
      }
    }
  }
}

// Helper types
export type StringStream = ReadableStream<string>
export type StringAsyncGenerator = AsyncGenerator<string, void, unknown>
export type StringAsyncIterator = AsyncIterator<string>

// Type guards
export function isReadableStream(value: unknown): value is ReadableStream<string> {
  return value instanceof ReadableStream
}

export function isAsyncGenerator(value: unknown): value is AsyncGenerator<string, void, unknown> {
  return value !== null && 
         typeof value === 'object' && 
         'next' in value && 
         'throw' in value && 
         'return' in value && 
         typeof (value as any).next === 'function' && 
         typeof (value as any).throw === 'function' && 
         typeof (value as any).return === 'function'
}
