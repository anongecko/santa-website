'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EmailGate } from '@/components/chat/EmailGate';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { useToast } from '@/hooks/use-toast';
import type { ChatSession } from '@/types/chat';

export function EmailSessionManager() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [showEmailGate, setShowEmailGate] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session');
    if (sessionId) {
      fetchSession(sessionId);
    }
  }, []);

  const fetchSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Session not found');

      const data = await response.json();
      if (data.session?.parentEmail && data.session?.parentEmail !== 'anonymous@example.com') {
        setSession({
          id: data.session.id,
          parentEmail: data.session.parentEmail,
          status: data.session.status as 'active' | 'ended',
          startTime: new Date(data.session.startTime).getTime(),
          lastActive: new Date(data.session.lastActive).getTime(),
        });
        setShowEmailGate(false);
      } else {
        setShowEmailGate(true);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setShowEmailGate(true);
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

      const newSession: ChatSession = {
        id: data.sessionId,
        parentEmail: email,
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      };

      setSession(newSession);
      setShowEmailGate(false);
      router.push(`/chat?session=${data.sessionId}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSessionEnd = async () => {
    if (!session?.id) return;

    try {
      const response = await fetch('/api/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!response.ok) throw new Error('Failed to end session');

      setSession(prev => (prev ? { ...prev, status: 'ended' } : null));

      if (session.parentEmail !== 'anonymous@example.com') {
        toast({
          title: 'Wishlist Sent! 🎄',
          description: `Santa's wishlist has been sent to ${session.parentEmail}`,
          duration: 5000,
        });
      }

      // Create new session for continued chat
      const newResponse = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail: session.parentEmail }),
      });

      if (!newResponse.ok) throw new Error('Failed to create new session');
      const newData = await newResponse.json();

      const newSession: ChatSession = {
        id: newData.sessionId,
        parentEmail: session.parentEmail,
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      };

      setSession(newSession);
      router.push(`/chat?session=${newData.sessionId}`, { scroll: false });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to send wishlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSkip = async () => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail: 'anonymous@example.com' }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();

      const newSession: ChatSession = {
        id: data.sessionId,
        parentEmail: 'anonymous@example.com',
        status: 'active',
        startTime: Date.now(),
        lastActive: Date.now(),
      };

      setSession(newSession);
      setShowEmailGate(false);
      router.push(`/chat?session=${data.sessionId}`);
    } catch (error) {
      console.error('Failed to start anonymous session:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-[hsl(var(--cozy-cream))]">
      <div className="h-screen overflow-hidden p-4">
        <div
          className={`h-full max-w-[1920px] mx-auto transition-opacity duration-500 
          ${!session || showEmailGate ? 'opacity-30' : 'opacity-100'}`}
        >
          {session && (
            <ChatInterface
              key={session.id}
              sessionId={session.id}
              parentEmail={session.parentEmail}
              onSessionEnd={handleSessionEnd}
            />
          )}
        </div>
      </div>

      {showEmailGate && (
        <div className="fixed inset-0 z-20">
          <EmailGate onSubmit={handleEmailSubmit} onSkip={handleSkip} />
        </div>
      )}
    </div>
  );
}

export default EmailSessionManager;
