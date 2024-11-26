'use client'

import { ClientLayout } from '@/components/layout/ClientLayout'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from "@/components/layout/Hero"
import { AboutSection } from "@/components/layout/AboutSection"
import { FeaturesSection } from "@/components/layout/FeaturesSection"
import { HowItWorksSection } from "@/components/layout/HowItWorksSection"
import { SafetyTrustSection } from "@/components/layout/SafetyTrustSection"
import { NorthPoleMailRoom } from "@/components/layout/NorthPoleMailRoom"
import { MobileNav } from '@/components/layout/MobileNav'
import dynamic from 'next/dynamic'

const Snow = dynamic(() => import('@/components/animations/Snow').then(mod => mod.Snow), {
  ssr: false
})

export default function HomePage() {
  return (
    <ClientLayout>
      <Header />
      <main className="relative min-h-screen">
        <div className="fixed inset-0 pointer-events-none">
          <Snow />
        </div>
        <Hero />
        <AboutSection />
        <HowItWorksSection />
        <FeaturesSection />
        <SafetyTrustSection />
        <NorthPoleMailRoom />
      </main>
      <Footer />
      <MobileNav />
    </ClientLayout>
  )
}
