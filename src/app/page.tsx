import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loading } from '@/components/loading'

const ClientHome = dynamic(() => import('@/components/pages/HomePage'), {
  ssr: false,
  loading: () => <Loading />
})

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientHome />
    </Suspense>
  )
}
