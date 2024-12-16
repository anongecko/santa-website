'use client';

import dynamic from 'next/dynamic';
import { AboutSection } from '@/components/layout/AboutSection';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { CountdownBanner } from '@/components/layout/CountdownBanner';
import { FeaturesSection } from '@/components/layout/FeaturesSection';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/layout/Hero';
import { HowItWorksSection } from '@/components/layout/HowItWorksSection';
import { MobileNav } from '@/components/layout/MobileNav';
import { NorthPoleMailRoom } from '@/components/layout/NorthPoleMailRoom';
import { SafetyTrustSection } from '@/components/layout/SafetyTrustSection';

const Snow = dynamic(() => import('@/components/animations/Snow').then((mod) => mod.Snow), {
  ssr: false,
});

export default function HomePage() {
  return (
    <ClientLayout>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="relative">
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
      </div>
    </ClientLayout>
  );
}
