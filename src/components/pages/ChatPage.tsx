'use client';

import { useState } from 'react';
import { EmailGate } from '@/components/chat/EmailGate';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { EmailSessionManager } from '@/components/chat/EmailSessionManager';
import { Snow } from '@/components/animations/Snow';
import type { ChatSession } from '@/types/chat';
import { cn } from '@/lib/utils';

export function ChatPageContent() {
  const [session, setSession] = useState<ChatSession | null>(null);

  const handleSkip = async () => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentEmail: 'anonymous@example.com', // Use a default email for skipped sessions
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();

      setSession({
        id: data.sessionId,
        parentEmail: 'anonymous@example.com',
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      });
    } catch (error) {
      console.error('Failed to start anonymous session:', error);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail: email }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();

      setSession({
        id: data.sessionId,
        parentEmail: email,
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[hsl(var(--cozy-cream))]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Snow density={0.1} minSpeed={1} maxSpeed={2} wind={0.1} color="255, 255, 255" />
      </div>

      {/* Main Layout */}
      <div className="h-screen overflow-hidden p-4">
        <div
          className={cn(
            'h-full max-w-[1920px] mx-auto',
            'transition-opacity duration-500',
            !session && 'opacity-30'
          )}
        >
          <ChatInterface
            key={session?.id}
            sessionId={session?.id ?? 'preview'}
            parentEmail={session?.parentEmail ?? 'preview@example.com'}
            onSessionEnd={() => setSession(null)}
          />
        </div>
      </div>

      {/* Email Gate */}
      {!session && (
        <div className="fixed inset-0 z-20">
          <EmailGate onSubmit={handleEmailSubmit} onSkip={handleSkip} />
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="chat-theme relative min-h-screen bg-[hsl(var(--cozy-cream))] text-gray-800">
      <EmailSessionManager />
    </div>
  );
}
