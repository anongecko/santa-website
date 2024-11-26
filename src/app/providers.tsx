'use client'

import { useEffect, useState } from "react"
import { SparklesCore } from "@/components/ui/sparkles"
import { cn } from "@/lib/utils"
import { ChatProvider } from "@/context/chat-context"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        aria-hidden="true" 
        className={cn(
          "fixed inset-0 flex items-center justify-center",
          "bg-background/50 backdrop-blur-sm"
        )}
      >
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={100}
          className="w-full h-full"
          particleColor="var(--santa-red)"
        />
      </div>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChatProvider>
        {children}
      </ChatProvider>
      <Toaster />
    </ThemeProvider>
  )
}
