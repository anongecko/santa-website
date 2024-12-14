'use client'

import { cn } from "@/lib/utils"

interface ChatContainerProps {
  children: React.ReactNode
  isSidebarOpen: boolean
  className?: string
}

export function ChatContainer({ 
  children, 
  isSidebarOpen,
  className 
}: ChatContainerProps) {
  return (
    <div className="flex-1 relative h-screen bg-[hsl(var(--cozy-cream))]">
      <div
        className={cn(
          "fixed left-1/2 -translate-x-1/2",
          "h-[calc(100vh-2rem)]",
          "w-[min(100%,1000px)]",
          // Adjust width but ensure minimum content space
          isSidebarOpen && "w-[min(calc(100%-2rem),800px)] md:w-[min(calc(100%-300px),800px)]",
          "transition-all duration-200",
          "px-2 md:px-4",
          "top-2",
          "bg-white/80",
          "bg-[hsl(var(--holly-green))]/5",
          "backdrop-blur-sm",
          "rounded-lg",
          "shadow-lg",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
