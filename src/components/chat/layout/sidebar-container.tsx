'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface SidebarContainerProps {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function SidebarContainer({ 
  children, 
  isOpen,
  onToggle, 
  className 
}: SidebarContainerProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 h-full w-[300px]",
        "bg-gradient-to-b from-[hsl(var(--santa-red))] to-[hsl(var(--santa-red-dark))]",
        "transition-transform duration-200 ease-in-out",
        !isOpen && "-translate-x-full",
        className
      )}
    >
      {children}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={cn(
          "absolute -right-10 top-[72px]", // Adjusted position
          "text-gray-600 hover:text-gray-800",
          "bg-white/90 hover:bg-white",
          "shadow-md",
          "rounded-full p-1.5",
          "transition-colors",
          !isOpen && "translate-x-2" // Slight adjustment when closed
        )}
      >
        <ChevronLeft className={cn(
          "h-4 w-4",
          "transition-transform duration-200",
          !isOpen && "rotate-180"
        )} />
      </Button>
    </aside>
  )
}
