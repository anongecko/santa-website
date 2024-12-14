'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Bell, MailOpen, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChat } from '@/context/chat-context';
import { SparkleButton } from '@/components/animations/Sparkles';
import { QuickPrompts } from './QuickPrompts';
import type { ChatUIProps, Message } from '@/types/chat';
import { cn } from '@/lib/utils';

function ChatMessage({ message, onRetry }: { message: Message; onRetry?: () => void }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'group relative max-w-[80%] rounded-lg px-4 py-2',
          isUser ? 'bg-[hsl(var(--santa-red))] text-white' : 'bg-white shadow-md text-gray-800'
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

export function ChatInterface({ sessionId, parentEmail, onSessionEnd }: ChatUIProps) {
  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useChat();
  const { messages, isTyping } = state;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const messageContent = input.trim();
    setInput('');
    const messageId = crypto.randomUUID();
    const aiMessageId = crypto.randomUUID();

    // Add user message
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
          parentEmail,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Update user message status
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'sent' },
      });

      // Add initial AI message
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

        // Update AI message with accumulated content
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
    if (sessionId && parentEmail && state.status === 'initializing') {
      dispatch({
        type: 'INITIALIZE_SESSION',
        payload: {
          id: sessionId,
          parentEmail,
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
          if (data.gifts) {
            data.gifts.forEach((gift: any) => {
              dispatch({ type: 'ADD_GIFT', payload: gift });
            });
          }
        })
        .catch(console.error);
    }
  }, [sessionId, parentEmail, state.status, dispatch]);

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
      <Card className="h-full flex flex-col bg-white/95 shadow-xl rounded-lg">
        <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--santa-red))]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[hsl(var(--santa-red))]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Santa Claus</h3>
              <div className="text-sm flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-gray-600">Online</span>
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">North Pole</span>
              </div>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSessionEnd}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <MailOpen className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>End chat and send wishlist to parent</p>
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

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message to Santa..."
              className="flex-1 bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-[hsl(var(--santa-red))]/50"
              disabled={isTyping}
            />
            <SparkleButton>
              <Button
                type="submit"
                size="icon"
                className="bg-[hsl(var(--santa-red))] hover:bg-[hsl(var(--santa-red-dark))] text-white"
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
