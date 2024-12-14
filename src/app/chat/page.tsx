import { Metadata } from 'next'
import ChatPage from '@/components/pages/ChatPage'

export const metadata: Metadata = {
  title: 'Chat with Santa - AI Christmas Magic',
  description: 'Have a magical chat with Santa Claus powered by AI. Share your Christmas wishes!'
}

export default function Page() {
  return <ChatPage />
}
