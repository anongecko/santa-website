'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function SantaHeader() {
  return (
    <div className="border-b border-white/10 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-white/80 hover:bg-white/5 hover:text-white"
          >
            <div className="bg-santa-red/20 flex h-8 w-8 items-center justify-center rounded-full">
              <Bell className="text-santa-red h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">$REDONE AI</div>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/">Return Home</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
