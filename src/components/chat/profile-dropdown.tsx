'use client'

import { ChevronsUpDown, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProfileDropdownProps {
  email: string
  onEmailChange: () => void
  onEndChat: () => void
}

export function ProfileDropdown({ email, onEmailChange, onEndChat }: ProfileDropdownProps) {
  return (
    <div className="p-2 border-t border-white/10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-white/80 hover:text-white hover:bg-white/5"
          >
            <div className="w-8 h-8 rounded-full bg-santa-red/20 flex items-center justify-center overflow-hidden">
              <Image
                src="/images/framed_santa.png" // Replace with your image path
                alt="Santa Profile"
                width={46}
                height={46}
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">Santa Claus</div>
              <div className="text-xs text-white/60">{email}</div>
            </div>
            <ChevronsUpDown className="w-4 h-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[--radix-dropdown-menu-trigger-width]"
        >
          <DropdownMenuLabel>Chat Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEmailChange}>
            <MailIcon className="w-4 h-4 mr-2" />
            <span>Change Email</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEndChat} className="text-destructive focus:text-destructive">
            <span>End Chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
