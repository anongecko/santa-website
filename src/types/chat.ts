export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
}

export interface Gift {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  mentionCount: number;
  firstMentioned: number;
  confidence: number;
  category?: string;
  sessionId: string;
}

export interface ExtractedGift {
  name: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface ChatSession {
  id: string;
  parentEmail: string;
  status: 'active' | 'ended';
  startTime: number;
  lastActive: number;
}

export interface SessionListItem {
  id: string;
  date: string; // ISO string
  preview: string;
  isActive: boolean;
}

export interface ChatState {
  status: 'initializing' | 'ready' | 'error';
  session?: ChatSession;
  messages: Message[];
  gifts: Gift[];
  isTyping: boolean;
  error?: string;
}

export type ChatAction =
  | { type: 'INITIALIZE_SESSION'; payload: ChatSession }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: Partial<Message> & { id: string } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_GIFT'; payload: Gift }
  | { type: 'UPDATE_GIFT'; payload: Partial<Gift> & { id: string } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => Promise<void>;
  endSession: () => Promise<void>;
  updateGift: (id: string, updates: Partial<Gift>) => void;
  retryMessage: (messageId: string) => Promise<void>;
}

export interface EmailGateState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  email: string;
  error?: string;
}

export interface EmailGateProps {
  onSubmit: (email: string) => void; // Remove Promise for serialization warning
  isLoading?: boolean;
  onSkip?: () => void;
}

export interface ChatUIProps {
  sessionId: string;
  parentEmail: string;
  onSessionEnd?: () => void;
  isPreview?: boolean;
  availableSessions?: Array<{
    id: string;
    date: Date;
    preview: string;
    gifts: number;
  }>;
  onSessionSelect?: (sessionId: string) => void;
}

export interface ChatMessageProps {
  message: Message;
  onRetry?: () => void;
  className?: string;
}

export interface GiftListProps {
  gifts: Gift[];
  className?: string;
}

export interface GiftUpdateOptions {
  id: string;
  priority?: 'high' | 'medium' | 'low';
  details?: string;
  category?: string;
  mentionCount?: number;
}

export type MessageStatus = 'sending' | 'sent' | 'error';
export type Priority = 'high' | 'medium' | 'low';
export type ChatStatus = 'initializing' | 'ready' | 'error';
