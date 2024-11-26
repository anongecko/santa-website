import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loading } from '@/components/loading'

const ChatPageComponent = dynamic(
  () => import('@/components/pages/ChatPage'),
  {
    ssr: false,
    loading: () => <Loading />
  }
)

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatPageComponent />
    </Suspense>
  )
}
