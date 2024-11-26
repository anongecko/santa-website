'use client'

import { useInView } from "react-intersection-observer"
import { 
  Mail, MessageCircle, Gift, Star, 
  ChevronRight, Bell, ArrowRight,
  Shield, ExternalLink, Send
} from "lucide-react"
import { useState, useEffect } from "react"
import { Player } from "@lottiefiles/react-lottie-player"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SparkleButton } from "@/components/animations/Sparkles"
import { LucideIcon } from 'lucide-react'
import { motion } from "framer-motion"

interface Step {
  id: number
  title: string
  description: string
  icon: LucideIcon
  color: string
  animation: string
  details: string[]
  preview: React.ReactNode
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "Parent Setup",
    description: "Quick and secure email registration",
    icon: Mail,
    color: "holly-green",
    animation: "/animations/email-verification-lottie.json",
    details: [
      "Enter parent's email",
      "Instant verification",
      "Privacy protected",
      "No account needed"
    ],
    preview: (
      <div className="flex flex-col gap-4">
        <Input 
          type="email"
          placeholder="parent@email.com"
          defaultValue="northpole@santa.com"
          className="bg-background text-foreground"
          disabled
        />
        <Button 
          className="w-1/2 mx-auto bg-santa-red hover:bg-santa-red-dark"
        >
          <Send className="w-4 h-4 mr-2" />
          Start Magic
        </Button>
      </div>
    )
  },
  {
    id: 2,
    title: "Start Chatting",
    description: "Magical conversation with Santa",
    icon: MessageCircle,
    color: "santa-red",
    animation: "/animations/santa-chat-lottie.json",
    details: [
      "Natural conversation",
      "Share Christmas wishes",
      "Tell Santa about yourself",
      "Discuss gift ideas"
    ],
    preview: (
      <div className="space-y-4">
        <div className="bg-santa-red text-white p-3 rounded-xl max-w-[80%]">
          Ho ho ho! What's your name? I hear you've been very good this year! 🎅
        </div>
        <div className="bg-background border p-3 rounded-xl max-w-[80%] ml-auto">
          Hi Santa! I'm Emily! I've been helping mom and dad a lot!
        </div>
        <div className="bg-santa-red text-white p-3 rounded-xl max-w-[80%]">
          That's wonderful to hear, Emily! Would you like to tell me what you'd love for Christmas? ✨
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Smart Wishlist",
    description: "AI detects and organizes gifts",
    icon: Gift,
    color: "winter-blue",
    animation: "/animations/wishlist-analysis-lottie.json",
    details: [
      "Automatic gift detection",
      "Priority sorting",
      "Shopping suggestions", 
      "Price estimates"
    ],
    preview: (
      <div className="space-y-3">
        {[
          { name: "Art Supply Set", priority: "High", price: "$25-40" },
          { name: "Beginner Telescope", priority: "Medium", price: "$50-80" },
          { name: "Adventure Books", priority: "Medium", price: "$30-45" }
        ].map((gift, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg border bg-background"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-winter-blue" />
              <div>
                <div>{gift.name}</div>
                <div className="text-xs text-muted-foreground">{gift.price}</div>
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              gift.priority === "High" 
                ? "bg-santa-red/10 text-santa-red"
                : "bg-winter-blue/10 text-winter-blue"
            )}>{gift.priority}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 4,
    title: "Parent Delivery",
    description: "Organized wishlist sent to parents",
    icon: Bell,
    color: "christmas-gold",
    animation: "/animations/gift-delivery-lottie.json",
    details: [
      "Instant email delivery",
      "Organized gift list",
      "Shopping links included",
      "Safe & secure"
    ],
    preview: (
      <div className="relative rounded-xl border p-6 space-y-4 bg-background">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-christmas-gold" />
          <div>
            <div className="font-medium">Wishlist Ready!</div>
            <div className="text-sm text-muted-foreground">
              Sent to: northpole@santa.com
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-holly-green" />
            <span>Encrypted & Secure Delivery</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className="h-20 border-2 border-dashed border-christmas-gold/20 
                         rounded-lg flex items-center justify-center bg-background"
              >
                <Gift className="w-6 h-6 text-christmas-gold/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
]

interface PreviewProps {
  step: Step
  isLeft: boolean
}

function Preview({ step, isLeft }: PreviewProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center min-h-[150px] md:min-h-[300px] w-full">
      <div
        className={cn(
          "p-4 md:p-6 rounded-xl border bg-background/95 dark:bg-background/20 w-full",
          "min-h-[200px] md:min-h-[300px] max-h-[300px]",
          "overflow-y-auto shadow-sm",
          "flex items-center justify-center",
          "order-2",
          isLeft && "md:order-1"
        )}
      >
        <div className="w-full max-w-[90%] mx-auto">
          <div className="flex items-center justify-center">
            {step.preview}
          </div>
        </div>
      </div>

      <div className={cn(
        "w-full aspect-square md:aspect-auto md:h-[300px]",
        "flex items-center justify-center",
        "order-1",
        isLeft && "md:order-2"
      )}>
        <Player
          src={step.animation}
          className="w-full h-full"
          loop={true}
          autoplay={true}
          style={{ 
            maxWidth: '100%',
            maxHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </div>
    </div>
  )
}

interface StepColumnProps {
  steps: Step[]
  activeStep: number
  setActiveStep: (step: number) => void
}

function StepColumn({ steps, activeStep, setActiveStep }: StepColumnProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((step) => (
        <div
          key={step.id}
          className={cn(
            "relative p-4 rounded-xl transition-all duration-300",
            "min-h-[200px] md:min-h-[280px]",
            "hover:bg-background/50 dark:hover:bg-background/10",
            "hover:shadow-md dark:hover:shadow-background/5",
            "cursor-pointer overflow-hidden",
            "border border-transparent",
            "flex flex-col",
            activeStep === step.id && [
              "bg-background dark:bg-background/20",
              "border-border/50 dark:border-border/10",
              "shadow-sm"
            ]
          )}
          onClick={() => setActiveStep(step.id)}
          role="button"
          tabIndex={0}
          aria-pressed={activeStep === step.id}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setActiveStep(step.id)
            }
          }}
        >
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0",
                `bg-${step.color}/10 dark:bg-${step.color}/5`,
                "flex items-center justify-center",
                "transition-transform duration-300",
                activeStep === step.id && "scale-110"
              )}>
                <step.icon className={cn(
                  "w-5 h-5",
                  `text-${step.color}`,
                  "transition-transform duration-300",
                  activeStep === step.id && "animate-pulse"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold truncate",
                    "dark:text-white",
                    activeStep === step.id && "text-santa-red dark:text-santa-red-light"
                  )}>
                    {step.title}
                  </h3>
                  {activeStep === step.id && (
                    <div className={cn(
                      "w-4 h-4 rounded-full shrink-0",
                      `bg-${step.color}/10 dark:bg-${step.color}/5`,
                      "flex items-center justify-center"
                    )}>
                      <Star className={cn(
                        "w-2.5 h-2.5",
                        `text-${step.color}`,
                        "animate-pulse"
                      )} />
                    </div>
                  )}
                </div>
                <p className={cn(
                  "text-sm text-muted-foreground dark:text-gray-400",
                  "line-clamp-2",
                  activeStep === step.id && "text-foreground dark:text-gray-300"
                )}>
                  {step.description}
                </p>
              </div>
            </div>

            <div className={cn(
              "transition-all duration-300 overflow-hidden",
              activeStep === step.id 
                ? "opacity-100 max-h-[200px]" 
                : "opacity-0 max-h-0 md:max-h-[200px] md:opacity-40"
            )}>
              <div className="space-y-2 pt-2">
                {step.details.map((detail, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-2 text-sm py-1",
                      "transition-all duration-300",
                      activeStep === step.id && "translate-x-1"
                    )}
                  >
                    <ChevronRight className={cn(
                      "w-3 h-3",
                      `text-${step.color}`,
                      "transition-transform duration-300",
                      activeStep === step.id && "animate-bounce"
                    )} />
                    <span className={cn(
                      "line-clamp-2",
                      "text-muted-foreground dark:text-gray-400",
                      activeStep === step.id && "text-foreground dark:text-gray-300"
                    )}>
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inView && autoPlayEnabled) {
      interval = setInterval(() => {
        setActiveStep(current => current < STEPS.length ? current + 1 : 1)
      }, 8000)
    }
    return () => clearInterval(interval)
  }, [inView, autoPlayEnabled])

  const currentStep = STEPS.find(step => step.id === activeStep) || STEPS[0]

  // Pause autoplay when user interacts
  const handleStepChange = (stepId: number) => {
    setAutoPlayEnabled(false)
    setActiveStep(stepId)
  }

  return (
    <section 
      ref={ref}
      className={cn(
        "relative py-12 md:py-20 lg:py-32 overflow-hidden",
        "bg-background dark:bg-background/50"
      )}
      data-section="how-it-works"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 dark:bg-gradient-to-b dark:from-background dark:to-background/80" />
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />

      <div className="container relative z-10 max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 mb-8 md:mb-16"
        >
          <h2 className={cn(
            "text-3xl md:text-4xl lg:text-5xl font-bold",
            "bg-clip-text text-transparent",
            "bg-gradient-to-r from-santa-red to-santa-red-light",
            "dark:from-santa-red-light dark:to-santa-red"
          )}>
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground dark:text-gray-400 max-w-2xl mx-auto">
            Experience the magic in four simple steps
          </p>
        </motion.div>

        <div className="space-y-8 md:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StepColumn 
              steps={STEPS}
              activeStep={activeStep}
              setActiveStep={handleStepChange}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background to-background/0 dark:from-background/0 dark:via-background/20 dark:to-background/0" />
            <div className="relative z-10 flex items-center justify-center">
              <Preview 
                step={currentStep}
                isLeft={activeStep % 2 === 0}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-8 md:mt-12"
          >
            <Link href="/chat" className="w-full sm:w-auto">
              <Button
                className={cn(
                  "w-full sm:w-auto",
                  "bg-white dark:bg-white/90 border-2 border-white",
                  "text-slate-900 dark:text-slate-800",
                  "hover:bg-white/90 dark:hover:bg-white/80",
                  "text-base md:text-lg px-6 md:px-8 py-4 md:py-6",
                  "rounded-full shadow-lg",
                  "transition-all duration-300",
                  "hover:scale-105 hover:shadow-xl active:scale-95",
                  "min-w-[180px] md:min-w-[200px]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <motion.span 
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Chat Now
                  <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
                </motion.span>
              </Button>
            </Link>
            
            <SparkleButton className="w-full sm:w-auto">
              <Link 
                href="https://dexscreener.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  className={cn(
                    "w-full sm:w-auto",
                    "bg-gradient-to-r from-[#3c8d0d] to-[#4bae11]",
                    "hover:from-[#4bae11] hover:to-[#3c8d0d]",
                    "text-white dark:text-white",
                    "shadow-lg hover:shadow-xl",
                    "transition-all duration-300",
                    "hover:scale-105 active:scale-95",
                    "text-base md:text-lg px-6 md:px-8 py-4 md:py-6",
                    "rounded-full min-w-[180px] md:min-w-[200px]"
                  )}
                >
                  <motion.span 
                    className="flex items-center gap-2"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    View Chart
                    <ExternalLink className="w-4 md:w-5 h-4 md:h-5" />
                  </motion.span>
                </Button>
              </Link>
            </SparkleButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
