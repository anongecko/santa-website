'use client';

import { createContext, useContext, useReducer, useCallback } from 'react';
import type { ChatState, ChatAction, ChatContextType } from '@/types/chat';

const initialState: ChatState = {
  status: 'initializing',
  messages: [],
  isTyping: false,
};

const santaGreetings = [
  "Ho ho ho! Welcome to my magical workshop at the North Pole! I'm so delighted you're here! ✨",
  "Ho ho ho! What a wonderful surprise to see you! The elves just told me you were coming! 🎄",
  "Ho ho ho! Merry Christmas, my dear friend! I've taken a break from checking my list to chat with you! 🎅",
  "Ho ho ho! Welcome! I was just having cookies with Mrs. Claus when I heard you wanted to talk! 🍪",
  "Ho ho ho! The reindeer told me someone special wanted to chat - they were right! ⭐",
  "Ho ho ho! I've been hoping you'd visit! Rudolph's nose lit up when he saw you coming! 🦌",
  "Ho ho ho! The North Pole is extra magical today now that you're here! Let's share some Christmas joy! 🎄",
  "Ho ho ho! What perfect timing - I just finished wrapping some presents! Would you like to chat? 🎁",
  "Ho ho ho! The elves are busy making toys, and I'm here to spread some Christmas cheer with you! ✨",
  "Ho ho ho! My magical snow globe told me you were coming! I'm so happy you're here! ❄️"
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
