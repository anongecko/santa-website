'use client'

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown } from "lucide-react"
import Link from "next/link"

export function SantaHeader() {
  return (
    <div className="p-4 border-b border-white/10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-santa-red/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-santa-red" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">$SANTA AI</div>
            </div>
            <ChevronDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/">Return Home</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
