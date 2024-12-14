'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Send, X, Gift, RefreshCw,
  MailOpen, Menu,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useChat } from '@/context/chat-context'
import { SparkleButton } from '@/components/animations/Sparkles'
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChatHistoryPanel } from './ChatHistoryPanel'
import { QuickPrompts } from './QuickPrompts'
import { GiftTrackingPanel } from './GiftTrackingPanel'
import type { ChatUIProps, ChatMessageProps } from '@/types/chat'
import type { Gift as GiftType } from '@/types/chat'
import { cn } from '@/lib/utils'

function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={cn(
          "group relative max-w-[80%] rounded-lg px-4 py-2",
          isUser 
            ? "bg-santa-red text-white"
            : "bg-[#1a1b1e] border border-white/10 text-white/90"
        )}
      >
        {message.content}
        
        {message.status === 'error' && onRetry && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRetry}
            className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function ChatInterface({ sessionId, parentEmail, onSessionEnd }: ChatUIProps) {
  // State
  const [input, setInput] = useState('')
  const [isGiftPanelOpen, setIsGiftPanelOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Chat Context
  const { state, sendMessage, endSession, updateGift } = useChat()
  const { messages, isTyping, gifts } = state

  // Effects
  useEffect(() => {
    if (messages.length > 0) {
      setShowPrompts(false)
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsHistoryOpen(false)
        setIsGiftPanelOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handlers
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const message = input
    setInput('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleEnd = async () => {
    await endSession()
    onSessionEnd?.()
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
    setShowPrompts(false)
    scrollToBottom()
  }

  const handleGiftUpdate = (id: string, updates: Partial<GiftType>) => {
    updateGift(id, updates)
  }

  const toggleMobilePanel = (panel: 'history' | 'gifts') => {
    if (panel === 'history') {
      setIsHistoryOpen(!isHistoryOpen)
      setIsGiftPanelOpen(false)
    } else {
      setIsGiftPanelOpen(!isGiftPanelOpen)
      setIsHistoryOpen(false)
    }
  }

  // Main component render
  return (
    <div className="relative h-full flex w-full max-w-[1800px] mx-auto">
  {/* Left Panel - Chat History */}
  <ChatHistoryPanel
  isOpen={isHistoryOpen}
  onClose={() => setIsHistoryOpen(false)}
  sessions={[
    {
      id: sessionId,
      date: new Date(),
      preview: messages[messages.length - 1]?.content || "Start chatting with Santa!",
      gifts: gifts.length
    },
    {
      id: 'prev-1',
      date: new Date(Date.now() - 86400000), // 1 day ago
      preview: "Ho ho ho! Thank you for sharing your Christmas wishes!",
      gifts: 3
    },
    {
      id: 'prev-2',
      date: new Date(Date.now() - 172800000), // 2 days ago
      preview: "It was wonderful hearing about your kind deeds!",
      gifts: 2
    }
  ]}
  currentSessionId={sessionId}
  onSessionClick={(id) => {
    if (id === sessionId) {
      setIsHistoryOpen(false)
      return
    }
    // Handle switching to previous sessions
    console.log('Loading previous session:', id)
  }}
/>
      {/* Main Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col bg-[#2d2e32] border-white/10 shadow-2xl",
        "transition-all duration-200",
        (isHistoryOpen || isGiftPanelOpen) && "lg:opacity-90"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1b1e] text-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white/70 hover:text-white"
              onClick={() => toggleMobilePanel('history')}
            >
              {isHistoryOpen ? (
                <ArrowLeft className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <motion.div
              animate={{
                rotate: [0, -10, 10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-10 h-10 rounded-full bg-santa-red/20 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-santa-red" />
            </motion.div>
            <div>
              <h3 className="font-semibold">Santa Claus</h3>
              <div className="text-sm flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400" 
                  />
                  <span className="text-white/70">Online</span>
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/70">North Pole</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {gifts.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleMobilePanel('gifts')}
                    className={cn(
                      "text-white/70 hover:text-white hover:bg-white/10",
                      isGiftPanelOpen && "bg-white/10 text-white"
                    )}
                  >
                    <Gift className="w-5 h-5" />
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 
                               text-white text-xs flex items-center justify-center"
                    >
                      {gifts.length}
                    </motion.span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>View wishlist ({gifts.length} items)</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleEnd}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <MailOpen className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>End chat and send wishlist to parent</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {showPrompts && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <QuickPrompts onPromptSelect={handlePromptSelect} />
            </motion.div>
          )}
          <div className="space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={
                    message.status === 'error'
                      ? () => sendMessage(message.content)
                      : undefined
                  }
                />
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence mode="wait">
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-2 text-white/50"
                >
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-santa-red"
                        animate={{
                          y: ['0%', '-50%', '0%']
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm">Santa is typing...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message to Santa..."
              className="flex-1 bg-[#1a1b1e] border-white/10 text-white placeholder:text-white/50"
              disabled={isTyping}
            />
            <SparkleButton>
              <Button 
                type="submit" 
                size="icon"
                className="bg-santa-red hover:bg-santa-red-dark text-white"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </SparkleButton>
          </div>
        </form>
      </Card>

      {/* Right Panel - Gift Tracking */}
      <GiftTrackingPanel
        isOpen={isGiftPanelOpen}
        onClose={() => setIsGiftPanelOpen(false)}
        gifts={gifts}
        onUpdateGift={handleGiftUpdate}
      />

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {(isHistoryOpen || isGiftPanelOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => {
              setIsHistoryOpen(false)
              setIsGiftPanelOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile Panel Close Buttons */}
      <AnimatePresence>
        {(isHistoryOpen || isGiftPanelOpen) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 lg:hidden"
            onClick={() => {
              setIsHistoryOpen(false)
              setIsGiftPanelOpen(false)
            }}
          >
            <div className="rounded-full bg-[#1a1b1e] border border-white/10 p-2">
              <X className="w-5 h-5 text-white/70" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

