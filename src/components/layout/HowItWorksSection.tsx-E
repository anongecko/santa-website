'use client';

import { useInView } from 'react-intersection-observer';
import {
  Mail,
  MessageCircle,
  Gift,
  Star,
  ChevronRight,
  Bell,
  ArrowRight,
  Shield,
  ExternalLink,
  Pause,
  Play,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SparkleButton } from '@/components/animations/Sparkles';
import { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  animation: string;
  details: string[];
  preview: React.ReactNode;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Parent Setup',
    description: 'Quick and secure email registration',
    icon: Mail,
    color: 'holly-green',
    animation: '/animations/email-verification-lottie.json',
    details: [
      "Enter parent's email",
      'Instant verification',
      'Privacy protected',
      'No account needed',
    ],
    preview: (
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-6">
        <div className="w-full space-y-3">
          <div className="text-muted-foreground mb-2 text-sm">
            Parent's Email
          </div>
          <Input
            type="email"
            placeholder="parent@email.com"
            defaultValue="northpole@santa.com"
            className="bg-background text-foreground shadow-sm"
            disabled
          />
        </div>

        <div className="w-full space-y-4">
          <Button className="bg-santa-red hover:bg-santa-red-dark flex w-full items-center justify-center gap-2 py-6 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <Mail className="h-5 w-5" />
            <span className="text-base">Verify Email</span>
          </Button>

          <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            <span>Secure & Private</span>
          </div>
        </div>

        <div className="text-muted-foreground/80 bg-background/50 flex items-center gap-3 rounded-full border px-4 py-2 text-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          Ready to spread Christmas magic
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Start Chatting',
    description: 'Magical conversation with Santa',
    icon: MessageCircle,
    color: 'santa-red',
    animation: '/animations/santa-chat-lottie.json',
    details: [
      'Natural conversation',
      'Share Christmas wishes',
      'Tell Santa about yourself',
      'Discuss gift ideas',
    ],
    preview: (
      <div className="space-y-4">
        <div className="bg-santa-red max-w-[80%] rounded-xl p-3 text-white">
          Ho ho ho! What's your name? I hear you've been very good this year! 🎅
        </div>
        <div className="bg-background ml-auto max-w-[80%] rounded-xl border p-3">
          Hi Santa! I'm Emily! I've been helping mom and dad a lot!
        </div>
        <div className="bg-santa-red max-w-[80%] rounded-xl p-3 text-white">
          That's wonderful to hear, Emily! Would you like to tell me what you'd
          love for Christmas? ✨
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Smart Wishlist',
    description: 'AI detects and organizes gifts',
    icon: Gift,
    color: 'winter-blue',
    animation: '/animations/wishlist-analysis-lottie.json',
    details: [
      'Automatic gift detection',
      'Priority sorting',
      'Sentiment analysis',
      'Gift category tagging',
    ],
    preview: (
      <div className="space-y-3">
        {[
          { name: 'Art Supply Set', priority: 'High', price: '$25-40' },
          { name: 'Beginner Telescope', priority: 'Medium', price: '$50-80' },
          { name: 'Adventure Books', priority: 'Medium', price: '$30-45' },
        ].map((gift, i) => (
          <div
            key={i}
            className="bg-background flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-2">
              <Gift className="text-winter-blue h-4 w-4" />
              <div>
                <div>{gift.name}</div>
                <div className="text-muted-foreground text-xs">
                  {gift.price}
                </div>
              </div>
            </div>
            <span
              className={cn(
                'rounded-full px-2 py-1 text-xs',
                gift.priority === 'High'
                  ? 'bg-santa-red/10 text-santa-red'
                  : 'bg-winter-blue/10 text-winter-blue'
              )}
            >
              {gift.priority}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    title: 'Parent Delivery',
    description: 'Organized wishlist sent to parents',
    icon: Bell,
    color: 'christmas-gold',
    animation: '/animations/gift-delivery-lottie.json',
    details: [
      'Instant email delivery',
      'Organized gift list',
      'Interest insights included',
      'Safe & secure',
    ],
    preview: (
      <div className="bg-background relative space-y-4 rounded-xl border p-6">
        <div className="flex items-center gap-3">
          <Bell className="text-christmas-gold h-6 w-6" />
          <div>
            <div className="font-medium">Wishlist Ready!</div>
            <div className="text-muted-foreground text-sm">
              Sent to: northpole@santa.com
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="text-holly-green h-4 w-4" />
            <span>Encrypted & Secure Delivery</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="border-christmas-gold/20 bg-background flex h-20 items-center justify-center rounded-lg border-2 border-dashed"
              >
                <Gift className="text-christmas-gold/40 h-6 w-6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

interface PreviewProps {
  step: Step;
  isLeft: boolean;
}

function Preview({ step, isLeft }: PreviewProps) {
  return (
    <div className="grid w-full items-center gap-6 md:grid-cols-2 md:gap-10">
      {/* Content Preview */}
      <div
        className={cn(
          'bg-background/95 dark:bg-background/20 rounded-xl border p-4 md:p-6',
          'h-full min-h-[200px] w-full',
          'flex items-center justify-center',
          'order-2',
          isLeft && 'md:order-1'
        )}
      >
        <div className="w-full max-w-[90%]">{step.preview}</div>
      </div>

      {/* Animation Container */}
      <div
        className={cn(
          'aspect-square w-full md:aspect-auto',
          'relative flex items-center justify-center',
          'order-1 min-h-[200px] md:min-h-[300px]',
          isLeft && 'md:order-2'
        )}
      >
        <Player
          src={step.animation}
          className="h-full w-full"
          loop={true}
          autoplay={true}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}

interface StepColumnProps {
  steps: Step[];
  activeStep: number;
  setActiveStep: (step: number) => void;
}

function StepColumn({ steps, activeStep, setActiveStep }: StepColumnProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.id}
          className={cn(
            'relative rounded-xl p-4 transition-all duration-300',
            'min-h-[160px] md:min-h-[220px]',
            'hover:bg-background/50 dark:hover:bg-background/10',
            'dark:hover:shadow-background/5 hover:shadow-md',
            'cursor-pointer overflow-hidden',
            'border border-transparent',
            'flex flex-col',
            activeStep === step.id && [
              'bg-background dark:bg-background/20',
              'border-border/50 dark:border-border/10',
              'shadow-sm',
            ]
          )}
          onClick={() => setActiveStep(step.id)}
          role="button"
          tabIndex={0}
          aria-pressed={activeStep === step.id}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveStep(step.id);
            }
          }}
        >
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'h-10 w-10 shrink-0 rounded-xl',
                  `bg-${step.color}/10 dark:bg-${step.color}/5`,
                  'flex items-center justify-center',
                  'transition-transform duration-300',
                  activeStep === step.id && 'scale-110'
                )}
              >
                <motion.div
                  animate={
                    activeStep === step.id
                      ? {
                          scale: [1, 1.05, 1],
                          opacity: [1, 0.85, 1],
                        }
                      : { scale: 1, opacity: 1 }
                  }
                  transition={{
                    duration: 3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatType: 'mirror',
                  }}
                >
                  <step.icon
                    className={cn(
                      'h-5 w-5',
                      `text-${step.color}`,
                      'transition-transform duration-300'
                    )}
                  />
                </motion.div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      'truncate font-semibold',
                      'dark:text-white',
                      activeStep === step.id &&
                        'text-santa-red dark:text-santa-red-light'
                    )}
                  >
                    {step.title}
                  </h3>
                  {activeStep === step.id && (
                    <motion.div
                      className={cn(
                        'h-4 w-4 shrink-0 rounded-full',
                        `bg-${step.color}/10 dark:bg-${step.color}/5`,
                        'flex items-center justify-center'
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 2,
                          ease: 'easeInOut',
                          repeat: Infinity,
                        }}
                      >
                        <Star
                          className={cn('h-2.5 w-2.5', `text-${step.color}`)}
                        />
                      </motion.div>
                    </motion.div>
                  )}
                </div>
                <p
                  className={cn(
                    'text-muted-foreground text-sm dark:text-gray-400',
                    'line-clamp-2',
                    activeStep === step.id &&
                      'text-foreground dark:text-gray-300'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>

            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                activeStep === step.id
                  ? 'max-h-[200px] opacity-100'
                  : 'max-h-0 opacity-0 md:max-h-[200px] md:opacity-40'
              )}
            >
              <div className="space-y-2 pt-2">
                {step.details.map((detail, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center gap-2 py-1 text-sm',
                      'transition-all duration-300',
                      activeStep === step.id && 'translate-x-1'
                    )}
                  >
                    <motion.div
                      animate={
                        activeStep === step.id ? { x: [0, 2, 0] } : { x: 0 }
                      }
                      transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    >
                      <ChevronRight
                        className={cn('h-3 w-3', `text-${step.color}`)}
                      />
                    </motion.div>
                    <span
                      className={cn(
                        'line-clamp-2',
                        'text-muted-foreground dark:text-gray-400',
                        activeStep === step.id &&
                          'text-foreground dark:text-gray-300'
                      )}
                    >
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
  );
}
export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '50px',
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inView && autoPlayEnabled) {
      interval = setInterval(() => {
        setActiveStep((current) => (current < STEPS.length ? current + 1 : 1));
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [inView, autoPlayEnabled]);

  const currentStep = STEPS.find((step) => step.id === activeStep) || STEPS[0];

  const handleStepChange = (stepId: number) => {
    setAutoPlayEnabled(false);
    setActiveStep(stepId);
  };

  const handleMouseLeave = () => {
    setAutoPlayEnabled(true);
  };

  return (
    <section
      ref={ref}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative overflow-hidden py-12 md:py-20 lg:py-32',
        'bg-background dark:bg-background/50',
        'min-h-[calc(100vh-4rem)]',
        'flex flex-col items-center justify-center'
      )}
      data-section="how-it-works"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="dark:from-background dark:to-background/80 absolute inset-0 dark:bg-gradient-to-b" />
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5" />
      </div>

      <div className="container relative z-10 mx-auto w-full max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-12 space-y-4 text-center md:mb-20"
        >
          <h2
            className={cn(
              'text-3xl font-bold md:text-4xl lg:text-5xl',
              'bg-clip-text text-transparent',
              'from-santa-red to-santa-red-light bg-gradient-to-r',
              'dark:from-santa-red-light dark:to-santa-red',
              'inline-block px-4'
            )}
          >
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl px-4 text-lg md:text-xl">
            Experience the magic in four simple steps
          </p>
        </motion.div>

        <div className="mx-auto w-full max-w-[1400px] space-y-12 md:space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <StepColumn
              steps={STEPS}
              activeStep={activeStep}
              setActiveStep={handleStepChange}
            />
          </motion.div>

          {/* Progress Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-3 pt-4"
          >
            {STEPS.map((step) => (
              <motion.button
                key={step.id}
                onClick={() => handleStepChange(step.id)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  activeStep === step.id
                    ? 'bg-santa-red w-8'
                    : 'bg-santa-red/20 hover:bg-santa-red/40 w-4'
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
            <motion.button
              className={cn(
                'ml-2 rounded-full p-2',
                'text-santa-red/60 hover:text-santa-red',
                'transition-colors duration-200'
              )}
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {autoPlayEnabled ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative w-full"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="from-background/0 via-background to-background/0 dark:from-background/0 dark:via-background/20 dark:to-background/0 absolute inset-0 bg-gradient-to-b" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-center"
              >
                <Preview step={currentStep} isLeft={activeStep % 2 === 0} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mx-auto mt-8 flex w-full max-w-2xl flex-col justify-center gap-6 px-4 sm:flex-row md:mt-16"
          >
            <Link href="/chat" className="w-full sm:w-auto">
              <Button
                className={cn(
                  'w-full sm:w-auto',
                  'border-2 border-white bg-white dark:bg-white/90',
                  'text-slate-900 dark:text-slate-800',
                  'hover:bg-white/90 dark:hover:bg-white/80',
                  'px-6 py-4 text-base md:px-8 md:py-6 md:text-lg',
                  'rounded-full shadow-lg',
                  'transition-all duration-300',
                  'hover:scale-105 hover:shadow-xl active:scale-95',
                  'min-w-[180px] md:min-w-[200px]'
                )}
              >
                <motion.span
                  className="flex items-center gap-2 whitespace-nowrap"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  Chat Now
                  <ArrowRight className="h-4 w-4 flex-shrink-0 md:h-5 md:w-5" />
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
                    'w-full sm:w-auto',
                    'bg-gradient-to-r from-[#3c8d0d] to-[#4bae11]',
                    'hover:from-[#4bae11] hover:to-[#3c8d0d]',
                    'text-white dark:text-white',
                    'shadow-lg hover:shadow-xl',
                    'transition-all duration-300',
                    'hover:scale-105 active:scale-95',
                    'px-6 py-4 text-base md:px-8 md:py-6 md:text-lg',
                    'min-w-[180px] rounded-full md:min-w-[200px]'
                  )}
                >
                  <motion.span
                    className="flex items-center gap-2 whitespace-nowrap"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    Get $REDONE
                    <ExternalLink className="h-4 w-4 flex-shrink-0 md:h-5 md:w-5" />
                  </motion.span>
                </Button>
              </Link>
            </SparkleButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
