'use client';

import { Button } from '@/components/ui/button';
import { SparkleButton } from '@/components/animations/Sparkles';
import Link from 'next/link';
import { Bell, Gift, MessageCircle, Mail } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function NaturalSnow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-10vh) translateX(0);
          }
          100% {
            transform: translateY(100vh) translateX(20px);
          }
        }

        .snowflake {
          position: absolute;
          width: var(--size);
          height: var(--size);
          background: white;
          border-radius: 50%;
          filter: blur(var(--blur));
          animation: snowfall var(--speed) linear infinite;
          opacity: var(--opacity);
          will-change: transform;
        }
      `}</style>

      {Array.from({ length: 150 }).map((_, i) => {
        const size = Math.random() * 4 + 2;
        const blur = Math.random() * 1.5 + 0.5;
        const speed = `${Math.random() * 8 + 10}s`;
        const left = `${Math.random() * 100}%`;
        const opacity = Math.random() * 0.6 + 0.3;
        const delay = `-${Math.random() * 10}s`;

        return (
          <div
            key={i}
            className="snowflake"
            style={
              {
                '--size': `${size}px`,
                '--blur': `${blur}px`,
                '--speed': speed,
                '--opacity': opacity,
                left,
                animationDelay: delay,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

function FestiveDecorations() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <>
      {/* Candy Canes */}
      <div className="absolute -left-4 top-1/4 h-48 w-24 -rotate-12 opacity-10">
        <motion.div
          initial={{ rotate: -45, x: -100 }}
          animate={{ rotate: -12, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full w-full bg-[url('/images/candy-cane.svg')] bg-contain bg-no-repeat"
          style={{ y }}
        />
      </div>
      <div className="absolute -right-4 top-1/3 h-48 w-24 rotate-12 opacity-10">
        <motion.div
          initial={{ rotate: 45, x: 100 }}
          animate={{ rotate: 12, x: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="h-full w-full bg-[url('/images/candy-cane.svg')] bg-contain bg-no-repeat"
          style={{ y }}
        />
      </div>

      {/* Holly Leaves */}
      <div className="absolute bottom-1/4 left-8 h-16 w-16 opacity-10">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-full w-full bg-[url('/images/holly.svg')] bg-contain bg-no-repeat"
        />
      </div>
      <div className="absolute bottom-1/3 right-8 h-16 w-16 opacity-10">
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="h-full w-full scale-x-[-1] bg-[url('/images/holly.svg')] bg-contain bg-no-repeat"
        />
      </div>

      {/* Stars */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </>
  );
}

const steps = [
  {
    icon: Mail,
    title: 'Register with Email',
    description:
      "Securely connect your parent's email to start your magical journey",
  },
  {
    icon: MessageCircle,
    title: 'Chat with Santa',
    description:
      'Share your Christmas wishes and stories directly with Santa Claus',
  },
  {
    icon: Gift,
    title: 'Receive Your Gift List',
    description: 'Get a personalized wishlist sent straight to your parents',
  },
] as const;

const gradientButtonClasses =
  'bg-gradient-to-r from-[#3c8d0d] to-[#4bae11] hover:from-[#4bae11] hover:to-[#3c8d0d] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95';

export function Hero() {
  return (
    <section className="from-santa-red to-santa-red-dark relative min-h-screen overflow-hidden bg-gradient-to-b">
      <NaturalSnow />
      <FestiveDecorations />

      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-20 max-w-4xl space-y-8 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="relative mx-auto h-32 w-32 md:h-40 md:w-40"
          >
            <div className="absolute inset-0 rounded-full bg-white/30 blur-3xl" />
            <Image
              src="/images/santa.svg"
              alt="Santa Claus"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl font-bold text-white md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Chat with{' '}
            <motion.span
              className="text-[#49ab11]"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              $REDONE!
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mx-auto max-w-2xl text-xl text-white/90 md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            The AI-powered Solana token that lets you experience the magic of
            talking to Santa! 🎄
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col justify-center gap-4 pt-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/chat">
              <Button
                size="lg"
                className="min-w-[200px] rounded-full border-2 border-white bg-white px-8 py-6 text-lg text-slate-900 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white/90 hover:shadow-xl active:scale-95"
              >
                <span className="flex items-center gap-2">
                  Chat Now
                  <Bell className="h-5 w-5" />
                </span>
              </Button>
            </Link>

            <SparkleButton>
              <Link
                href="https://dexscreener.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className={cn(
                    gradientButtonClasses,
                    'min-w-[200px] rounded-full px-8 py-6 text-lg'
                  )}
                >
                  <span className="flex items-center gap-2">Get $REDONE</span>
                </Button>
              </Link>
            </SparkleButton>
          </motion.div>

          {/* Steps */}
          <motion.div
            className="mx-auto grid max-w-4xl grid-cols-1 gap-8 pt-8 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="relative"
              >
                <div className="group flex flex-col items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/20">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20"
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-white/80">{step.description}</p>

                  {i < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 transform text-white/20 md:block"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
