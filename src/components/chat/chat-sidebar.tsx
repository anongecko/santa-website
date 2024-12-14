// src/components/chat/chat-sidebar.tsx
'use client';

import { SidebarContainer } from './layout/sidebar-container';
import { ChatHistoryList } from './chat-history-list';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: Array<{
    id: string;
    date: string;
    preview: string;
    isActive?: boolean;
  }>;
  email: string;
  onSessionClick: (id: string) => void;
  onNewChat: () => void;
  onEmailChange: () => void;
  onEndChat: () => void;
  className?: string;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  sessions,
  email,
  onSessionClick,
  onNewChat,
  onEmailChange,
  onEndChat,
  className,
}: ChatSidebarProps) {
  return (
    <SidebarContainer isOpen={isOpen} onToggle={onToggle} className={className}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">$SANTA AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <ChatHistoryList
            sessions={sessions}
            activeSessionId={sessions.find(s => s.isActive)?.id || ''}
            onSessionClick={onSessionClick}
          />
        </div>

        <div className="mt-auto p-4 space-y-4 border-t border-white/10">
          <Button
            variant="outline"
            className="w-full bg-transparent text-white border-white/20 hover:bg-white/5 transition-colors"
            onClick={onNewChat}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          <ProfileDropdown email={email} onEmailChange={onEmailChange} onEndChat={onEndChat} />
        </div>
      </div>
    </SidebarContainer>
  );
}
