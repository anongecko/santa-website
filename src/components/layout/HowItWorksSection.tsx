'use client'

import { useInView } from "react-intersection-observer"
import { 
  Mail, MessageCircle, Gift, Star, 
  ChevronRight, Bell, ArrowRight,
  Shield, ExternalLink, Send
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Player } from "@lottiefiles/react-lottie-player"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SparkleButton } from "@/components/animations/Sparkles"

const steps = [
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

function Preview({
  step,
  isLeft,
  isActive
}: {
  step: typeof steps[0]
  isLeft: boolean
  isActive: boolean
}) {
  return (
    <div className="grid md:grid-cols-2 gap-10 items-center min-h-[250px]">
      <div
        className={cn(
          "p-6 rounded-xl border bg-background h-full",
          "order-2",
          isLeft && "md:order-1"
        )}
      >
        {step.preview}
      </div>

      <div className={cn(
        "w-full max-w-sm mx-auto order-1 h-[300px]",
        isLeft && "md:order-2"
      )}>
        <Player
          src={step.animation}
          className="w-full h-full"
          loop={true}
          autoplay={true}
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}

function StepColumn({ 
  steps,
  activeStep,
  setActiveStep 
}: { 
  steps: typeof steps
  activeStep: number 
  setActiveStep: (step: number) => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((step) => (
        <div
          key={step.id}
          className={cn(
            "relative p-4 rounded-xl transition-colors duration-300",
            "hover:bg-background/50 cursor-pointer",
            activeStep === step.id && "bg-background"
          )}
          onClick={() => setActiveStep(step.id)}
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0",
                `bg-${step.color}/10`,
                "flex items-center justify-center"
              )}>
                <step.icon className={cn("w-5 h-5", `text-${step.color}`)} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{step.title}</h3>
                  {activeStep === step.id && (
                    <div className={cn(
                      "w-4 h-4 rounded-full",
                      `bg-${step.color}/10`,
                      "flex items-center justify-center"
                    )}>
                      <Star className={cn("w-2.5 h-2.5", `text-${step.color}`)} />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>

            <ul className={cn(
              "grid gap-2 transition-all duration-300",
              activeStep === step.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            )}>
              <div className="overflow-hidden">
                {step.details.map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm py-1"
                  >
                    <ChevronRight className={cn("w-3 h-3", `text-${step.color}`)} />
                    <span>{detail}</span>
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1)
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (inView) {
      interval = setInterval(() => {
        setActiveStep(current => current < steps.length ? current + 1 : 1)
      }, 8000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [inView])

  return (
    <section 
      ref={ref}
      className="py-20 md:py-32"
      data-section="how-it-works"
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-santa-red">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the magic in four simple steps
          </p>
        </div>

        <div className="space-y-5">
          <StepColumn 
            steps={steps}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <div className="min-h-[285px] relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Preview 
                step={steps[activeStep - 1]}
                isLeft={activeStep % 2 === 0}
                isActive={true}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/chat">
              <Button
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
              <Link 
                href="https://dexscreener.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button
                  className={cn(
                    "bg-[#3c8d0d] hover:bg-[#4bae11]",
                    "text-white shadow-lg hover:shadow-xl",
                    "transition-all duration-300 hover:scale-105",
                    "text-lg px-8 py-6 rounded-full min-w-[200px]"
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
        </div>
      </div>
    </section>
  )
}

