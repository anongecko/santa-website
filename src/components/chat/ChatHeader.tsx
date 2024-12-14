// src/components/chat/ChatHeader.tsx
'use client'

import { useTheme } from 'next-themes'
import Link from 'next/link'
import { 
  Home, 
  Sun, 
  Moon, 
  Info,
  Settings,
  Bell 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  className?: string
  showInfoButton?: boolean
  showThemeToggle?: boolean
  onInfoClick?: () => void
}

export function ChatHeader({
  className,
  showInfoButton = true,
  showThemeToggle = true,
  onInfoClick
}: ChatHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#1a1b1e]",
      "border-b border-gray-200 dark:border-white/10",
      "flex items-center justify-between px-4 z-50",
      className
    )}>
      <Link 
        href="/" 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Bell className="w-6 h-6 text-santa-red" />
        <span className="font-medium text-lg">Santa Chat</span>
      </Link>

      <div className="flex items-center gap-4">
        {showThemeToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? 
                  <Sun className="w-5 h-5" /> : 
                  <Moon className="w-5 h-5" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        )}

        {showInfoButton && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onInfoClick}
              >
                <Info className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About Santa Chat</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <p>Talk directly with Santa! Share your Christmas wishes and tell him about all your good deeds.</p>
                <p>All chats are child-friendly and parent-monitored.</p>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
