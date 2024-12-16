// Message Types
export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  animation?: 'bounce' | 'fade' | 'slide'
  status?: 'sending' | 'sent' | 'error'
}

// Session Types
export interface ChatSession {
  id: string
  startTime: number
  lastActive: number
  messages: ChatMessage[]
  childName?: string
  ended?: boolean
}

// Animation Types
export interface SnowflakeProps {
  size?: 'small' | 'medium' | 'large'
  speed?: 'slow' | 'medium' | 'fast'
  style?: React.CSSProperties
  className?: string
}

export interface FloatingElementProps {
  element: 'candy-cane' | 'ornament' | 'star' | 'gift'
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export interface SparkleProps {
  color?: string
  size?: number
  duration?: number
  delay?: number
}

// Theme Types
export interface ChristmasTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  snow: string
  santa: string
  gift: string
  ornament: string
}

export interface ChatInterfaceProps {
  sessionId: string
  onEnd?: () => void
  className?: string
}

// Animation States
export interface AnimationState {
  isSnowing: boolean
  sparklesEnabled: boolean
  floatingElementsEnabled: boolean
  performanceMode: boolean
}

// Message Handlers
export type MessageHandler = (message: string) => Promise<void>

// Event Callbacks
export interface ChatCallbacks {
  onMessageSent?: (message: ChatMessage) => void
  onSessionEnd?: () => void
}

// Theme Configuration
export interface ThemeConfig {
  colors: ChristmasTheme
  animations: AnimationState
  accessibility: {
    reduceMotion: boolean
    highContrast: boolean
    fontSize: 'normal' | 'large' | 'extra-large'
  }
}

// Error Types
export type ChatError = 
  | { type: 'network'; message: string }
  | { type: 'session'; message: string }
  | { type: 'validation'; message: string }
  | { type: 'timeout'; message: string }

// Helper Types
export type AnimationSpeed = 'slow' | 'medium' | 'fast'
export type ElementSize = 'small' | 'medium' | 'large'
export type ElementPosition = 'top' | 'bottom' | 'left' | 'right'

// Constants
export const ANIMATION_SPEEDS: Record<AnimationSpeed, number> = {
  slow: 10,
  medium: 7,
  fast: 4
}

export const ELEMENT_SIZES: Record<ElementSize, number> = {
  small: 20,
  medium: 30,
  large: 40
}
