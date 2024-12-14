'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ChatState, ChatAction, ChatContextType, Gift } from '@/types/chat';

const initialState: ChatState = {
  status: 'initializing',
  messages: [],
  gifts: [],
  isTyping: false,
};

const santaGreetings = [
  'Ho ho ho! Welcome to the North Pole! 🎅',
  "Ho ho ho! I'm so happy you're here! What's your name? 🎄",
  "Ho ho ho! Merry Christmas! I've been waiting to chat with you! 🎅",
  'Ho ho ho! Welcome to my workshop! Have you been good this year? 🎄',
];

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        status: 'ready',
        session: action.payload,
        messages: [
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: santaGreetings[Math.floor(Math.random() * santaGreetings.length)],
            timestamp: Date.now(),
            status: 'sent',
          },
        ],
      };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id ? { ...message, ...action.payload } : message
        ),
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        gifts: [],
      };
    case 'ADD_GIFT':
      return { ...state, gifts: [...state.gifts, action.payload] };
    case 'UPDATE_GIFT':
      return {
        ...state,
        gifts: state.gifts.map(gift =>
          gift.id === action.payload.id ? { ...gift, ...action.payload } : gift
        ),
      };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, status: 'ready', error: undefined };
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.session?.id) {
        throw new Error('No active session');
      }

      const messageId = crypto.randomUUID();

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: messageId,
          role: 'user',
          content,
          timestamp: Date.now(),
          status: 'sending',
        },
      });

      dispatch({ type: 'SET_TYPING', payload: true });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            messages: state.messages,
            sessionId: state.session.id,
            conversationId: state.session.id,
            parentEmail: state.session.parentEmail,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { id: messageId, status: 'sent' },
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let aiMessageId = crypto.randomUUID();
          let aiMessageContent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            aiMessageContent += chunk;

            dispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: aiMessageId,
                role: 'assistant',
                content: aiMessageContent,
                timestamp: Date.now(),
                status: 'sent',
              },
            });
          }
        }
      } catch (error) {
        console.error('Error in sendMessage:', error);
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { id: messageId, status: 'error' },
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_TYPING', payload: false });
      }
    },
    [state.session, state.messages]
  );

  const endSession = useCallback(async () => {
    if (!state.session?.id) return;
    try {
      await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: state.session.id }),
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [state.session]);

  const updateGift = useCallback((id: string, updates: Partial<Gift>) => {
    dispatch({
      type: 'UPDATE_GIFT',
      payload: { id, ...updates },
    });
  }, []);

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = state.messages.find(m => m.id === messageId);
      if (!message) return;

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'sending' },
      });

      try {
        await sendMessage(message.content);
      } catch (error) {
        console.error('Error retrying message:', error);
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: { id: messageId, status: 'error' },
        });
      }
    },
    [state.messages, sendMessage]
  );

  const value: ChatContextType = {
    state,
    dispatch,
    sendMessage,
    endSession,
    updateGift,
    retryMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
