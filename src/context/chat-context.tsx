'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'
import type { ChatState, ChatAction, ChatContextType, Gift } from '@/types/chat'
import { generateSantaResponse } from '@/lib/ai-service'

const initialState: ChatState = {
  status: 'initializing',
  messages: [],
  gifts: [],
  isTyping: false
}

const santaGreetings = [
  "Ho ho ho! Welcome to the North Pole! 🎅",
  "Ho ho ho! I'm so happy you're here! What's your name? 🎄",
  "Ho ho ho! Merry Christmas! I've been waiting to chat with you! 🎅",
  "Ho ho ho! Welcome to my workshop! Have you been good this year? 🎄"
]

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        status: 'ready',
        session: action.payload,
        messages: [{
          id: crypto.randomUUID(),
          role: 'assistant',
          content: santaGreetings[Math.floor(Math.random() * santaGreetings.length)],
          timestamp: Date.now(),
          status: 'sent'
        }]
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      }

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id
            ? { ...message, ...action.payload }
            : message
        )
      }

    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      }

    case 'ADD_GIFT':
      return {
        ...state,
        gifts: [...state.gifts, action.payload]
      }

    case 'UPDATE_GIFT':
      return {
        ...state,
        gifts: state.gifts.map(gift =>
          gift.id === action.payload.id
            ? { ...gift, ...action.payload }
            : gift
        )
      }

    case 'SET_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        status: 'ready',
        error: undefined
      }

    default:
      return state
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  const sendMessage = useCallback(async (content: string) => {
    if (!state.session) return

    const messageId = crypto.randomUUID()

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: messageId,
        role: 'user',
        content,
        timestamp: Date.now(),
        status: 'sending'
      }
    })

    dispatch({ type: 'SET_TYPING', payload: true })

    try {
      const response = await generateSantaResponse(content, {
        messages: state.messages,
        sessionId: state.session.id,
        childEmail: state.session.parentEmail
      })

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'sent' }
      })

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.text,
          timestamp: Date.now(),
          status: 'sent'
        }
      })

      if (response.gifts?.length) {
        response.gifts.forEach(gift => {
          const existingGift = state.gifts.find(g => g.name.toLowerCase() === gift.toLowerCase())
          
          if (existingGift) {
            dispatch({
              type: 'UPDATE_GIFT',
              payload: {
                id: existingGift.id,
                mentionCount: existingGift.mentionCount + 1
              }
            })
          } else {
            dispatch({
              type: 'ADD_GIFT',
              payload: {
                id: crypto.randomUUID(),
                name: gift,
                priority: 'medium',
                firstMentioned: Date.now(),
                mentionCount: 1
              }
            })
          }
        })
      }

    } catch (error) {
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'error' }
      })
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Failed to get response from Santa. Please try again.' 
      })
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false })
    }
  }, [state.session, state.messages, state.gifts])

  const endSession = useCallback(async () => {
    if (!state.session) return

    try {
      await fetch('/api/chat/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.session.id,
          parentEmail: state.session.parentEmail
        })
      })
    } catch (error) {
      console.error('Failed to end session:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to end chat session properly.'
      })
    }
  }, [state.session])

  const updateGift = useCallback((id: string, updates: Partial<Gift>) => {
    dispatch({
      type: 'UPDATE_GIFT',
      payload: { id, ...updates }
    })
  }, [])

  return (
    <ChatContext.Provider value={{ 
      state, 
      dispatch, 
      sendMessage, 
      endSession,
      updateGift 
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
