'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Gift as GiftIcon,
  Bell,
  MailOpen,
  Menu,
  ArrowLeft,
  RefreshCw,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useChat } from '@/context/chat-context';
import { SparkleButton } from '@/components/animations/Sparkles';
import { QuickPrompts } from './QuickPrompts';
import { ChatSidebar } from './chat-sidebar';
import { ChatContainer } from './layout/chat-container';
import type { ChatUIProps, ChatMessageProps, Message } from '@/types/chat';
import { cn } from '@/lib/utils';

function ChatMessage({ message, onRetry }: ChatMessageProps) {
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
            <RefreshCw className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function ChatInterface({ sessionId, parentEmail, onSessionEnd }: ChatUIProps) {
  const [input, setInput] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Array<{ id: string }>>([]);
  const { state, dispatch, endSession, retryMessage } = useChat();
  const { messages, isTyping, gifts } = state;
  const router = useRouter();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      date: Date;
      preview: string;
      isActive: boolean;
    }>
  >([]);

  useEffect(() => {
    if (sessionId && parentEmail) {
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

      // First, get or create a conversation
      fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.conversationId) {
            setCurrentConversationId(data.conversationId);
          }
          return fetch(`/api/chat/history?sessionId=${sessionId}`);
        })
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

      loadAllSessions();
    }
  }, [sessionId, parentEmail, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsHistoryOpen(width >= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const loadAllSessions = async () => {
    try {
      const response = await fetch('/api/session/list');
      if (!response.ok) throw new Error('Failed to load sessions');

      const data = await response.json();
      setSessions(
        data.sessions.map((session: any) => ({
          id: session.id,
          date: new Date(session.startTime),
          preview: session.conversations?.[0]?.messages?.[0]?.content || 'New chat',
          isActive: session.id === sessionId,
        }))
      );
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await fetch('/api/session/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentEmail }),
      });

      if (!response.ok) throw new Error('Failed to create new chat');

      const data = await response.json();
      setInput('');
      setShowPrompts(true);
      router.push(`/chat?session=${data.sessionId}`);
      await loadAllSessions();
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const messageContent = input;
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

    // Create the initial AI message placeholder
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

    dispatch({ type: 'SET_TYPING', payload: true });

    try {
      if (!currentConversationId) {
        const convResponse = await fetch('/api/conversation/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!convResponse.ok) throw new Error('Failed to get conversation');
        const convData = await convResponse.json();
        setCurrentConversationId(convData.id);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
          sessionId,
          conversationId: currentConversationId,
          parentEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'sent' },
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullContent += chunk;

        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: aiMessageId,
            content: fullContent,
            status: 'sent',
          },
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: messageId, status: 'error' },
      });
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: { id: aiMessageId, status: 'error' },
      });
      setInput(messageContent);
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to load session');

      const data = await response.json();

      dispatch({ type: 'CLEAR_MESSAGES' });

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

      setCurrentConversationId(data.conversations?.[0]?.id);
      router.push(`/chat?session=${sessionId}`);
      setIsHistoryOpen(false);
    } catch (error) {
      console.error('Error switching session:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
    setShowPrompts(false);
    scrollToBottom();
  };

  const handleEmailChange = async () => {
    try {
      const currentSession = {
        messages,
        gifts,
        sessionId,
      };
      localStorage.setItem('tempChatData', JSON.stringify(currentSession));
      await endSession();
      onSessionEnd?.();
    } catch (error) {
      console.error('Error handling email change:', error);
    }
  };

  const handleEndChat = async () => {
    try {
      await endSession();
      onSessionEnd?.();
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  };

  const handleRetry = async (messageId: string) => {
    try {
      await retryMessage(messageId);
      scrollToBottom();
    } catch (error) {
      console.error('Error retrying message:', error);
    }
  };

  return (
    <div className="flex h-full chat-theme bg-[hsl(var(--cozy-cream))]">
      <ChatSidebar
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        sessions={sessions}
        email={parentEmail}
        onSessionClick={handleSessionClick} // Change this line
        onNewChat={handleNewChat}
        onEmailChange={handleEmailChange}
        onEndChat={handleEndChat}
      />

      <ChatContainer isSidebarOpen={isHistoryOpen}>
        <Card className="h-full flex flex-col bg-white/95 shadow-xl rounded-lg">
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="text-gray-600 hover:text-[hsl(var(--holly-green))] hover:bg-[hsl(var(--holly-green))]/10"
              >
                {isHistoryOpen ? <ArrowLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

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

            <div className="flex items-center gap-2">
              {gifts.length > 0 && (
                <div className="relative">
                  <GiftIcon className="w-5 h-5 text-gray-600" />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(var(--holly-green))] 
                              text-white text-xs flex items-center justify-center"
                  >
                    {gifts.length}
                  </span>
                </div>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEndChat}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <MailOpen className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>End chat and send wishlist to parent</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-[#f8fafc]">
            {showPrompts && messages.length === 0 && (
              <div className="mb-8">
                <QuickPrompts onPromptSelect={handlePromptSelect} />
              </div>
            )}
            <div className="space-y-4">
              {messages.map((message: Message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRetry={message.status === 'error' ? () => handleRetry(message.id) : undefined}
                />
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

          {/* Input Area */}
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
      </ChatContainer>

      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 z-20 md:hidden',
          'transition-opacity duration-200',
          isHistoryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsHistoryOpen(false)}
      />

      {/* Mobile Close Button */}
      <button
        className={cn(
          'fixed top-4 right-4 z-50 md:hidden',
          'transition-opacity duration-200',
          isHistoryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsHistoryOpen(false)}
      >
        <div className="rounded-full bg-white/90 backdrop-blur border border-gray-200 p-2 shadow-lg">
          <X className="w-5 h-5 text-gray-600" />
        </div>
      </button>
    </div>
  );
}
