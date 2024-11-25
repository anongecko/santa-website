// src/components/chat/ChatPage.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { EmailGate } from '@/components/chat/EmailGate'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Snow } from '@/components/animations/Snow'
import { FloatingElements } from '@/components/animations/FloatingElements'
import type { ChatSession } from '@/types/chat'
import { Button } from '@/components/ui/button'

export function ChatPageContent() {
  const [session, setSession] = useState<ChatSession | null>(null)

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

// Modified ChatPageContent return section
return (
  <div className="relative min-h-screen bg-[#1a1b1e]"> {/* Changed from red gradient */}
    {/* Background Effects */}
    <div className="fixed inset-0 pointer-events-none opacity-30">
      <Snow density={0.3} />
      <FloatingElements 
        count={4} 
        enabledTypes={['star']}
        className="opacity-10"
      />
    </div>

    {/* Three Panel Layout */}
    <div className={`relative z-10 h-screen flex transition-opacity duration-500 ${!session ? 'opacity-30' : 'opacity-100'}`}>
      {/* Left Panel */}
      <div className="hidden lg:block w-[250px] h-full border-r border-white/10 bg-[#2d2e32]/80 backdrop-blur-sm p-4">
        <div className="space-y-6">
          <h3 className="font-semibold text-white/80">Quick Messages</h3>
          {[
            "Tell Santa about good deeds",
            "Share Christmas wishes",
            "Ask about the reindeer",
            "Tell a Christmas story"
          ].map((prompt, i) => (
            <Button 
              key={i}
              variant="ghost" 
              className="w-full justify-start text-sm text-white/70 hover:text-white hover:bg-white/5"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Chat Area - Modified width */}
      <div className="flex-1 h-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8 h-full"
        >
          <ChatInterface 
            sessionId={session?.id ?? 'preview'}
            parentEmail={session?.parentEmail ?? 'preview@example.com'}
            onSessionEnd={() => setSession(null)}
            isPreview={!session}
          />
        </motion.div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:block w-[300px] h-full border-l border-white/10 bg-[#2d2e32]/80 backdrop-blur-sm p-4">
        <div className="space-y-4">
          <h3 className="font-semibold text-white/80">Wishlist</h3>
          {/* Gift tracking will go here */}
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
