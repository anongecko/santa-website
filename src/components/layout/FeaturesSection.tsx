'use client'

import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { 
  Bell, Send, Star, Gift,
  ArrowRight, ExternalLink
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { ResponsiveContainer } from "./ResponsiveContainer"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SparkleButton } from "@/components/animations/Sparkles"

const demoConversation = [
  {
    id: 1,
    role: 'assistant',
    content: "Ho ho ho! Merry Christmas! I'm so happy you're here! What's your name, dear friend? 🎅",
    feature: 'personality',
    featureTitle: 'Warm & Friendly',
    featureDescription: 'Santa maintains a jolly, warm personality throughout the conversation'
  },
  {
    id: 2,
    role: 'user',
    content: "Hi Santa! I'm Emily!",
  },
  {
    id: 3,
    role: 'assistant',
    content: "Emily! What a wonderful name! I've been looking forward to chatting with you. Have you been good this year? Tell me about some kind things you've done! 🌟",
    feature: 'engagement',
    featureTitle: 'Personal Connection',
    featureDescription: 'Santa remembers names and encourages positive behavior'
  },
  {
    id: 4,
    role: 'user',
    content: "I helped my little brother with his homework and shared my toys at school!",
  },
  {
    id: 5,
    role: 'assistant',
    content: "That's absolutely wonderful, Emily! Being kind to your brother and sharing with others shows what a caring person you are. I'm very proud of you! Would you like to tell me what's on your Christmas wishlist this year? 🎁",
    feature: 'recognition',
    featureTitle: 'Positive Reinforcement',
    featureDescription: 'Santa acknowledges good behavior and gently guides the conversation'
  },
  {
    id: 6,
    role: 'user',
    content: "I would love an art set to paint with and maybe a telescope to look at the stars!",
  },
  {
    id: 7,
    role: 'assistant',
    content: "Oh my! An art set and a telescope - those are wonderful choices, Emily! I can tell you're both creative and curious about science. The elves are excellent at making art supplies, and I do love stargazing myself on my sleigh rides! 🎨 🔭",
    feature: 'wishlist',
    featureTitle: 'Smart Wishlist',
    featureDescription: 'Santa identifies and remembers gift preferences while maintaining conversation'
  }
]

interface MessageBubbleProps {
  message: typeof demoConversation[0]
  isVisible: boolean
  onComplete?: () => void
}

function MessageBubble({ message, isVisible, onComplete }: MessageBubbleProps) {
  const controls = useAnimation()
  const [showFeature, setShowFeature] = useState(false)

  useEffect(() => {
    if (isVisible) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      }).then(() => {
        onComplete?.()
        if (message.feature) {
          setShowFeature(true)
        }
      })
    }
  }, [isVisible, controls, onComplete, message.feature])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className={cn(
        "flex flex-col max-w-[80%] space-y-2",
        message.role === 'assistant' ? "items-start" : "items-end ml-auto"
      )}
    >
      <div className={cn(
        "relative rounded-2xl px-4 py-2",
        message.role === 'assistant' 
          ? "bg-santa-red text-white" 
          : "bg-background border border-border"
      )}>
        <p className="text-sm md:text-base">{message.content}</p>
      </div>

      {message.feature && showFeature && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2"
        >
          <Badge variant="secondary" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            {message.featureTitle}
          </Badge>
        </motion.div>
      )}
    </motion.div>
  )
}

interface ChatPreviewProps {
  onComplete?: () => void
}

function ChatPreview({ onComplete }: ChatPreviewProps) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showTyping, setShowTyping] = useState(false)

  const showNextMessage = useCallback(() => {
    if (currentIndex < demoConversation.length) {
      setShowTyping(true)
      setTimeout(() => {
        setShowTyping(false)
        setVisibleMessages(prev => [...prev, currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 1500)
    } else {
      onComplete?.()
    }
  }, [currentIndex, onComplete])

  useEffect(() => {
    showNextMessage()
  }, [])

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative rounded-2xl border bg-background shadow-xl overflow-hidden">
        <div className="bg-santa-red p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Santa Claus</h3>
            <div className="text-white/80 text-sm flex items-center gap-2">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Online
              </span>
              <span>•</span>
              <span>North Pole</span>
            </div>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {demoConversation.map((message, index) => (
              visibleMessages.includes(index) && (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isVisible={true}
                  onComplete={showNextMessage}
                />
              )
            ))}
          </AnimatePresence>

          {showTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-santa-red"
                    animate={{
                      y: ['0%', '-50%', '0%']
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-sm">Santa is typing...</span>
            </motion.div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground">
              Type your message...
            </div>
            <button className="p-2 rounded-full bg-santa-red text-white hover:bg-santa-red-dark transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          {
            icon: Star,
            title: "Magical Conversations",
            description: "Natural, warm interactions that keep the Christmas spirit alive"
          },
          {
            icon: Gift,
            title: "Smart Wishlist",
            description: "Automatically detects and organizes gift mentions"
          },
          {
            icon: Bell,
            title: "Parent Updates",
            description: "Instant email notifications with organized wishlists"
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="p-4 rounded-xl border bg-background/50 backdrop-blur-sm"
          >
            <feature.icon className="w-6 h-6 text-santa-red mb-2" />
            <h4 className="font-semibold mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function FeaturesSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  })

  return (
    <section className="relative py-20 md:py-32 overflow-hidden" data-section="features">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
        <div className="absolute inset-0" />
      </div>

      <ResponsiveContainer>
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          className="space-y-16"
        >
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-santa-red">
           Experience the Magic 
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Santa's AI powered chat creates magical moments and helps organize Xmas wishes.
          </p>
        </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            <ChatPreview />
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button
                size="lg"
                className={cn(
                  "bg-white border-2 border-white text-slate-900 hover:bg-white/90",
                  "text-lg px-8 py-6 rounded-full shadow-lg",
                  "transition-all duration-300 hover:scale-105",
                  "hover:shadow-xl active:scale-95 min-w-[200px]",
                  "relative z-10"
                )}
              >
                <span className="flex items-center gap-2">
                  Chat Now
                  <ArrowRight className="w-5 h-5" />
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
                    "bg-gradient-to-r from-[#3c8d0d] to-[#4bae11]",
                    "hover:from-[#4bae11] hover:to-[#3c8d0d]",
                    "text-white shadow-lg hover:shadow-xl",
                    "transition-all duration-300 hover:scale-105",
                    "text-lg px-8 py-6 rounded-full min-w-[200px]",
                    "relative z-10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    View Chart
                    <ExternalLink className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
            </SparkleButton>
          </div>
        </motion.div>
      </ResponsiveContainer>
    </section>
  )
}

