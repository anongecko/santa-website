// src/app/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Snow } from '@/components/animations/Snow';
import type { ChatSession } from '@/types/chat';

export default function ChatPage() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      createNewSession();
    }
  }, []);

  const fetchSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Session not found');

      const data = await response.json();
      setSession({
        id: data.session.id,
        status: data.session.status as 'active' | 'ended',
        startTime: new Date(data.session.startTime).getTime(),
        lastActive: new Date(data.session.lastActive).getTime(),
      });
    } catch (error) {
      console.error('Error fetching session:', error);
      createNewSession();
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();

      const newSession: ChatSession = {
        id: data.sessionId,
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      };

      setSession(newSession);
      router.push(`/chat?session=${data.sessionId}`, { scroll: false });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[hsl(var(--cozy-cream))] to-[hsl(var(--snow-white))]">
      <div className="fixed inset-0 pointer-events-none opacity-70" style={{ zIndex: 0 }}>
        <Snow 
          density={0.3}
          minSpeed={1}
          maxSpeed={3}
          wind={0.1}
          color="255, 255, 255"
        />
      </div>

      <div className="relative h-screen overflow-hidden p-4" style={{ zIndex: 1 }}>
        <div className="h-full max-w-[1920px] mx-auto">
          {session && (
            <ChatInterface
              key={session.id}
              sessionId={session.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}
