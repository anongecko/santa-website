'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, ArrowRight } from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SparkleButton } from '@/components/animations/Sparkles';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player>(null);
  const { toast } = useToast();

  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText('TBD');
      toast({
        title: 'Contract Address Copied',
        description: 'The contract address has been copied to your clipboard.',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try copying the address manually.',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 overflow-hidden"
      data-section="about"
    >
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Content */}
          <motion.div ref={ref} className="relative z-10">
            {/* Section Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="secondary"
                onClick={handleCopyAddress}
                className="mb-8 bg-santa-red/10 text-santa-red hover:bg-santa-red/20 border-none"
              >
                <Star className="w-3 h-3 mr-1" />
                Copy CA: TBD
              </Button>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mb-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold">
                Where <span className="text-santa-red">Christmas Magic</span> Meets AI
              </h2>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6 max-w-xl"
            >
              <p className="text-lg text-muted-foreground leading-relaxed">
                $SANTA is an AI-backed Solana memecoin that lets you experience the magic of
                Christmas by chatting with Santa! Tell Santa what you want for Christmas to
                optionally receive a personalized, categorized wish list via email.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                The $SANTA release is a fair Raydium launch to provide ultimate profit potential to
                all Christmas believers. Whether you're simply a memecoin connoisseur or an AI
                enthusiast, being a part of the $SANTA community has plenty to offer.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/chat">
                <Button
                  size="lg"
                  className="bg-white border-2 border-white text-slate-900 hover:bg-white/90
                           text-lg px-8 py-6 rounded-full shadow-lg 
                           transition-all duration-300 hover:scale-105 
                           hover:shadow-xl active:scale-95 min-w-[200px]"
                >
                  <span className="flex items-center gap-2">
                    Chat Now
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </Button>
              </Link>

              <SparkleButton>
                <Link href="https://dexscreener.com" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className={cn(
                      'bg-gradient-to-r from-[#3c8d0d] to-[#4bae11]',
                      'hover:from-[#4bae11] hover:to-[#3c8d0d]',
                      'text-white shadow-lg hover:shadow-xl',
                      'transition-all duration-300 hover:scale-105',
                      'text-lg px-8 py-6 rounded-full min-w-[200px]'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      View Chart
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                </Link>
              </SparkleButton>
            </motion.div>
          </motion.div>

          {/* Right Column - Lottie Animation */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="relative lg:ml-auto"
          >
            <div className="relative w-full aspect-square max-w-[580px] mx-auto">
              <Player
                ref={playerRef}
                autoplay
                loop
                src="/animations/santa-chat-illustration.json"
                className="w-full h-full"
                onEvent={event => {
                  if (event === 'load') playerRef.current?.play();
                }}
              />

              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
            </div>

            {/* Modern Accent Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -z-10 inset-0 pointer-events-none"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-0 left-0 w-24 h-24 bg-santa-red/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-christmas-gold/5 rounded-full blur-3xl" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
