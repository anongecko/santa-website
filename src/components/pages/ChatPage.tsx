'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EmailGate } from '@/components/chat/EmailGate'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Snow } from '@/components/animations/Snow'
import { FloatingElements } from '@/components/animations/FloatingElements'
import type { ChatSession } from '@/types/chat'
import { cn } from '@/lib/utils'

const mockPreviousSessions: Array<{id: string; date: Date; preview: string; gifts: number}> = [
  {
    id: 'session-1',
    date: new Date(Date.now() - 86400000),
    preview: "Ho ho ho! Thank you for sharing your Christmas wishes!",
    gifts: 3
  },
  {
    id: 'session-2',
    date: new Date(Date.now() - 172800000),
    preview: "It was wonderful hearing about your kind deeds!",
    gifts: 2
  }
]

export function ChatPageContent() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [previousSessions] = useState(mockPreviousSessions)

  const handleEmailSubmit = async (email: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      parentEmail: email,
      status: 'active',
      startTime: Date.now(),
      lastActive: Date.now()
    }
    setSession(newSession)
  }

  const handleSkip = () => {
    const skipSession: ChatSession = {
      id: crypto.randomUUID(),
      parentEmail: 'skipped',
      status: 'active',
      startTime: Date.now(),
      lastActive: Date.now()
    }
    setSession(skipSession)
  }

  const handleSessionSelect = (sessionId: string) => {
    const selectedSession = previousSessions.find(s => s.id === sessionId)
    if (selectedSession) {
      console.log('Loading previous session:', sessionId)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1a1b1e]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <Snow density={0.3} />
        <FloatingElements 
          count={4} 
          enabledTypes={['star']}
          className="opacity-10"
        />
      </div>

      {/* Main Layout */}
      <div className={cn(
        "relative z-10 h-screen max-w-[1920px] mx-auto",
        "flex justify-center items-stretch",
        "transition-opacity duration-500",
        !session && "opacity-30"
      )}>
        {/* Chat Container */}
        <div className="flex-1 flex h-full max-w-screen-2xl mx-auto">
          {/* Main Chat Area */}
          <div className="flex-1 h-full overflow-hidden px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="h-full"
            >
              <ChatInterface 
                sessionId={session?.id ?? 'preview'}
                parentEmail={session?.parentEmail ?? 'preview@example.com'}
                onSessionEnd={() => setSession(null)}
                isPreview={!session}
                availableSessions={[
                  ...(session ? [{
                    id: session.id,
                    date: new Date(session.startTime),
                    preview: "Current chat with Santa",
                    gifts: 0
                  }] : []),
                  ...previousSessions
                ]}
                onSessionSelect={handleSessionSelect}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Email Gate */}
      {!session && (
        <div className="fixed inset-0 z-20">
          <EmailGate 
            onSubmit={handleEmailSubmit} 
            onSkip={handleSkip}
          />
        </div>
      )}
    </div>
  )
}

export default function ChatPage() {
  return (
    <div className="relative min-h-screen bg-[#1a1b1e] text-white">
      <ChatPageContent />
    </div>
  )
}
