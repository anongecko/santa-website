// src/types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'error';
}

export interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  className?: string;
}

export interface ChatSession {
  id: string;
  status: 'active' | 'ended';
  startTime: number;
  lastActive: number;
}

export interface ChatState {
  status: 'initializing' | 'ready' | 'error';
  session?: ChatSession;
  messages: Message[];
  isTyping: boolean;
  error?: string;
}

export interface ChatUIProps {
  sessionId: string;
}

export interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  endSession: () => Promise<void>;  // Add this line
}

export type ChatAction =
  | { type: 'INITIALIZE_SESSION'; payload: { id: string; status: 'active'; startTime: number; lastActive: number } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Partial<Message> & { id: string } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_SESSION'; payload: { id: string; status: 'active'; startTime: number; lastActive: number } };
