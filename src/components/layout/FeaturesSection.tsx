'use client';

import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Bell, Send, Star, Gift, ArrowRight, ExternalLink } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer } from './ResponsiveContainer';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SparkleButton } from '@/components/animations/Sparkles';

const demoConversation = [
  {
    id: 1,
    role: 'assistant',
    content:
      "Ho ho ho! Merry Christmas! I'm so happy you're here! What's your name, dear friend? 🎅",
    feature: 'personality',
    featureTitle: 'Warm & Friendly',
    featureDescription:
      'Santa maintains a jolly, warm personality throughout the conversation',
  },
  {
    id: 2,
    role: 'user',
    content: "Hi Santa! I'm Emily!",
  },
  {
    id: 3,
    role: 'assistant',
    content:
      "Emily! What a wonderful name! I've been looking forward to chatting with you. Have you been good this year? Tell me about some kind things you've done! 🌟",
    feature: 'engagement',
    featureTitle: 'Personal Connection',
    featureDescription:
      'Santa remembers names and encourages positive behavior',
  },
  {
    id: 4,
    role: 'user',
    content:
      'I helped my little brother with his homework and shared my toys at school!',
  },
  {
    id: 5,
    role: 'assistant',
    content:
      "That's absolutely wonderful, Emily! Being kind to your brother and sharing with others shows what a caring person you are. I'm very proud of you! Would you like to tell me what's on your Christmas wishlist this year? 🎁",
    feature: 'recognition',
    featureTitle: 'Positive Reinforcement',
    featureDescription:
      'Santa acknowledges good behavior and gently guides the conversation',
  },
  {
    id: 6,
    role: 'user',
    content:
      'I would love an art set to paint with and maybe a telescope to look at the stars!',
  },
  {
    id: 7,
    role: 'assistant',
    content:
      "Oh my! An art set and a telescope - those are wonderful choices, Emily! I can tell you're both creative and curious about science. The elves are excellent at making art supplies, and I do love stargazing myself on my sleigh rides! 🎨 🔭",
    feature: 'wishlist',
    featureTitle: 'Smart Wishlist',
    featureDescription:
      'Santa identifies and remembers gift preferences while maintaining conversation',
  },
];

interface MessageBubbleProps {
  message: (typeof demoConversation)[0];
  index: number;
}

function MessageBubble({ message, index }: MessageBubbleProps) {
  const [showFeature, setShowFeature] = useState(false);

  useEffect(() => {
    if (message.feature) {
      const timer = setTimeout(() => setShowFeature(true), 500);
      return () => clearTimeout(timer);
    }
  }, [message.feature]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={cn(
        'flex max-w-[80%] flex-col space-y-2',
        message.role === 'assistant' ? 'items-start' : 'ml-auto items-end'
      )}
    >
      <div
        className={cn(
          'relative rounded-2xl px-4 py-2',
          message.role === 'assistant'
            ? 'bg-santa-red text-white'
            : 'bg-background border-border border'
        )}
      >
        <p className="whitespace-pre-wrap text-sm md:text-base">
          {message.content}
        </p>
      </div>

      {message.feature && showFeature && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2"
        >
          <Badge variant="secondary" className="text-xs">
            <Star className="mr-1 h-3 w-3" />
            {message.featureTitle}
          </Badge>
        </motion.div>
      )}
    </motion.div>
  );
}

function ChatPreview() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev < demoConversation.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="bg-background relative overflow-hidden rounded-2xl border shadow-xl">
        {/* Chat Header */}
        <div className="bg-santa-red flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Santa Claus</h3>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <span className="flex items-center gap-1">
                <motion.div
                  className="h-2 w-2 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Online
              </span>
              <span>•</span>
              <span>North Pole</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="h-[400px] space-y-4 overflow-y-auto p-4">
          <AnimatePresence>
            {demoConversation.slice(0, visibleCount).map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
          </AnimatePresence>
        </div>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <div className="bg-background text-muted-foreground flex-1 rounded-full border px-4 py-2 text-sm">
              Type your message...
            </div>
            <button className="bg-santa-red hover:bg-santa-red-dark rounded-full p-2 text-white transition-colors">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            icon: Star,
            title: 'Magical Conversations',
            description:
              'Natural, warm interactions that keep the Christmas spirit alive',
          },
          {
            icon: Gift,
            title: 'Smart Wishlist',
            description: 'Automatically detects and organizes gift mentions',
          },
          {
            icon: Bell,
            title: 'Parent Updates',
            description: 'Instant email notifications with organized wishlists',
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="bg-background/50 hover:bg-background/70 rounded-xl border p-4 backdrop-blur-sm transition-colors"
          >
            <feature.icon className="text-santa-red mb-2 h-6 w-6" />
            <h4 className="mb-1 font-semibold">{feature.title}</h4>
            <p className="text-muted-foreground text-sm">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-32"
      data-section="features"
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
      </div>

      <ResponsiveContainer>
        <div className="space-y-16">
          {/* Title section - Now outside the gradient overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            className="relative z-10 mb-16 space-y-3 text-center"
          >
            <h2 className="text-santa-red text-3xl font-bold md:text-4xl lg:text-5xl">
              Experience the Magic
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              See how Santa's AI powered chat creates magical moments and helps
              organize Xmas wishes.
            </p>
          </motion.div>

          {/* Chat preview section - With its own gradient background */}
          <div className="relative">
            <div className="from-background via-background/50 to-background absolute inset-0 -z-10 bg-gradient-to-b" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
              }
              transition={{ duration: 0.5 }}
            >
              <ChatPreview />
            </motion.div>
          </div>

          {/* Buttons section */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/chat">
              <Button
                size="lg"
                className={cn(
                  'border-2 border-white bg-white text-slate-900 hover:bg-white/90',
                  'rounded-full px-8 py-6 text-lg shadow-lg',
                  'transition-all duration-300 hover:scale-105',
                  'min-w-[200px] hover:shadow-xl active:scale-95',
                  'relative z-10'
                )}
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                >
                  Chat Now
                  <ArrowRight className="h-5 w-5" />
                </motion.span>
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
                    'bg-gradient-to-r from-[#3c8d0d] to-[#4bae11]',
                    'hover:from-[#4bae11] hover:to-[#3c8d0d]',
                    'text-white shadow-lg hover:shadow-xl',
                    'transition-all duration-300 hover:scale-105',
                    'min-w-[200px] rounded-full px-8 py-6 text-lg',
                    'relative z-10'
                  )}
                >
                  <motion.span
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                  >
                    Get $REDONE
                    <ExternalLink className="h-5 w-5" />
                  </motion.span>
                </Button>
              </Link>
            </SparkleButton>
          </div>
        </div>
      </ResponsiveContainer>
    </section>
  );
}
