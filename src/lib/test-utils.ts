// src/lib/test-utils.ts
import { render } from '@testing-library/react'
import { userEvent as createUserEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import React from 'react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn()
  })
}))

const mockApiResponses = {
  success: {
    messages: [{ 
      id: '1', 
      role: 'assistant', 
      content: 'Ho ho ho! 🎅', 
      timestamp: Date.now() 
    }],
    gifts: [],
    status: 'success'
  },
  error: {
    error: 'Something went wrong',
    status: 'error'
  },
  rateLimit: {
    error: 'Too many requests',
    status: 429
  }
}

const mockStreamResponse = async (text: string) => {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      const chunks = text.split(' ')
      chunks.forEach(chunk => {
        controller.enqueue(encoder.encode(chunk + ' '))
      })
      controller.close()
    }
  })
}

const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  })
}

// Instead of setting up userEvent once, expose the creation function
const setupUserEvent = () => createUserEvent.setup()

export {
  customRender as render,
  mockApiResponses,
  mockStreamResponse,
  setupUserEvent,
  React
}
