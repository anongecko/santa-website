// src/app/chat/layout.tsx
import { ChatProvider } from '@/context/chat-context'
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from '@/components/ui/toaster'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider>
      <ChatProvider>
        {children}
        <Toaster />
      </ChatProvider>
    </TooltipProvider>
  )
}
