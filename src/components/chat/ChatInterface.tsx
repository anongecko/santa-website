'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, RotateCw, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ChatUIProps, Message, ChatMessageProps } from '@/types/chat';
import { cn } from '@/lib/utils';
import { SparkleButton } from '@/components/animations/Sparkles';
import { QuickPrompts } from './QuickPrompts';
import { useChat } from '@/context/chat-context';
import Image from 'next/image';

function SantaProfile() {
  return (
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 bg-[hsl(var(--santa-red))] rounded-full opacity-20 animate-breathe"></div>
      <div className="relative w-10 h-10 rounded-full bg-[hsl(var(--santa-red))]/10 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/framed_santa.png"
          alt="Santa Claus"
          width={32}
          height={32}
          className="object-cover transform hover:scale-110 transition-transform duration-300"
          priority
        />
      </div>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[hsl(var(--christmas-gold))]"
          style={{
            top: Math.sin((i * Math.PI) / 2) * 20 + 20,
            left: Math.cos((i * Math.PI) / 2) * 20 + 20,
            animation: `twinkle 1.5s infinite ${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ message, onRetry }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group relative max-w-[80%] rounded-lg px-4 py-2',
          isUser
            ? 'bg-white/95 text-gray-800 shadow-md hover:shadow-xl border border-gray-100 hover:scale-[1.02] hover:border-[hsl(var(--christmas-gold))]'
            : 'bg-[hsl(var(--santa-red))] text-white shadow-md hover:shadow-xl hover:scale-[1.02]',
          'transition-all duration-200'
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
            <RotateCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ChatInterface({ sessionId }: ChatUIProps) {
  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useChat();
  const { messages, isTyping } = state;

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to create new session');
      const data = await response.json();

      dispatch({
        type: 'RESET_SESSION',
        payload: {
          id: data.sessionId,
          status: 'active',
          startTime: Date.now(),
          lastActive: Date.now(),
        },
      });

      window.history.pushState({}, '', `/chat?session=${data.sessionId}`);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const messageContent = input.trim();
    setInput('');
    const messageId = crypto.randomUUID();
    const aiMessageId = crypto.randomUUID();

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: messageId,
        role: 'user',
        content: messageContent,
        timestamp: Date.now(),
        status: 'sending',
      },
    });

    try {
      dispatch({ type: 'SET_TYPING', payload: true });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'sent' },
      });

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          status: 'sending',
        },
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        aiContent += chunk;

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: aiMessageId,
            role: 'assistant',
            content: aiContent,
            timestamp: Date.now(),
            status: 'sent',
          },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'error' },
      });
      setInput(messageContent);
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  useEffect(() => {
    if (sessionId && state.status === 'initializing') {
      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: {
          id: sessionId,
          status: 'active',
          startTime: Date.now(),
          lastActive: Date.now(),
        },
      });

      fetch(`/api/chat/history?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            data.messages.forEach((message: Message) => {
              dispatch({
                type: 'ADD_MESSAGE',
                payload: { ...message, status: 'sent' },
              });
            });
          }
        })
        .catch(console.error);
    }
  }, [sessionId, state.status, dispatch]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
  };

  return (
    <div className="h-full">
      <Card className="h-full flex flex-col bg-gradient-to-b from-[hsl(var(--snow-white))] to-[hsl(var(--cozy-cream))] shadow-xl rounded-lg border-1 border-[hsl(var(--holly-green))]">
        <div className="absolute -inset-1 -z-10 rounded-lg bg-[#0B5D1E]/5 blur-lg" />
        <div className="absolute -inset-2 -z-20 rounded-lg bg-gradient-to-b from-[#0B5D1E]/3 to-transparent blur-2xl" />
        <header className="flex items-center justify-between px-4 py-4 border-b border-[var(--santa-red)] bg-[hsl(var(--santa-red))] rounded-t-lg">
          <div className="flex items-center gap-3">
            <SantaProfile />
            <div>
              <h3 className="font-semibold text-white">Santa Claus</h3>
              <div className="text-sm flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white/90">Online</span>
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/90 flex items-center gap-1">
                  North Pole
                  <span>🎄</span>
                </span>
              </div>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewChat}
                className="text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCcw className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Start a new chat</p>
            </TooltipContent>
          </Tooltip>
        </header>
        <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-[#f8fafc]">
          {showPrompts && messages.length === 0 && (
            <div className="mb-8">
              <QuickPrompts onPromptSelect={handlePromptSelect} />
            </div>
          )}
          <div className="space-y-4">
            {messages.map((message: Message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-[hsl(var(--santa-red))] animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm">Santa is typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[hsl(var(--santa-red))] bg-[var(--chat-header-bg)]"
        >
          <div className="flex gap-2 relative">
            <div className="absolute top-2 left-2 text-[hsl(var(--holly-green))/30] pointer-events-none">
              🎄
            </div>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message to Santa..."
              className="flex-1 bg-[var(--chat-input-bg)] border-[hsl(var(--santa-red))] text-gray-800 placeholder:text-gray-400 pl-8 focus:border-[hsl(var(--santa-red))/50]"
              disabled={isTyping}
            />
            <SparkleButton>
              <Button
                type="submit"
                size="icon"
                className="bg-[hsl(var(--santa-red))] hover:bg-[hsl(var(--holly-green))] text-white transition-colors duration-300"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </SparkleButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
