'use client'

import { ChatPageContent } from '@/components/chat/ChatPage'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { Snow } from "@/components/animations/Snow"
import dynamic from 'next/dynamic'

const DynamicSnow = dynamic(() => Promise.resolve(Snow), {
  ssr: false
})

export default function ChatPageComponent() {
  return (
    <ClientLayout>
      <div className="relative min-h-screen bg-[#1a1b1e] text-white">
        <div className="fixed inset-0 pointer-events-none opacity-30">
          <DynamicSnow density={0.3} />
        </div>
        <div className="relative z-10 h-screen flex">
          <ChatPageContent />
        </div>
      </div>
    </ClientLayout>
  )
}
