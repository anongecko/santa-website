'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
}

const TimeUnit = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-baseline">
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        className="text-lg sm:text-2xl font-bold"
      >
        {value}
      </motion.span>
    </AnimatePresence>
    <span className="text-xs sm:text-sm ml-1">{label}</span>
  </div>
);

export function CountdownBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: '00', hours: '00', minutes: '00' });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2024-12-25T21:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsVisible(false);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={expanded ? 'expanded' : ''}
      onValueChange={(value) => setExpanded(value === 'expanded')}
    >
      <AccordionItem value="expanded" className="border-none">
        <div className="w-full bg-[hsl(var(--holly-green))] text-white shadow-lg">
          <div className="max-w-7xl mx-auto p-2 sm:p-2.5 relative">
            <div className="text-center pr-16">
              <h2 className="text-sm sm:text-base font-medium mb-1">
                Coming Soon: AI-Powered Gift Wishlist Email Feature
              </h2>
              <div className="flex justify-center items-center gap-2 sm:gap-4 mb-0.5 font-mono">
                <TimeUnit value={timeLeft.days} label="days" />
                <span className="text-lg sm:text-2xl">:</span>
                <TimeUnit value={timeLeft.hours} label="hrs" />
                <span className="text-lg sm:text-2xl">:</span>
                <TimeUnit value={timeLeft.minutes} label="min" />
              </div>
            </div>

            <div className="flex items-center absolute right-2 top-1/2 -translate-y-1/2 gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/90 hover:bg-white/10 h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white/90 hover:bg-white/10 h-8 w-8"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AccordionContent className="text-white/90">
            <div className="max-w-7xl mx-auto px-4 pb-3">
              <div className="max-w-3xl mx-auto space-y-4 text-sm sm:text-base">
                <p className="font-medium text-white">
                  Experience the future of Christmas gift planning with our upcoming AI-powered
                  Wishlist feature!
                </p>

                <div className="space-y-2">
                  <h3 className="font-medium text-white">🎁 Smart Gift Detection & Analysis</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>AI automatically detects gift wishes during your chat with Santa</li>
                    <li>Live product suggestions with detailed AI-powered analysis</li>
                    <li>Three curated options for each gift: Budget, Mid-Range, and Premium</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-white">📊 Comprehensive Product Intelligence</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Smart price tracking and deal alerts</li>
                    <li>Quality analysis based on verified reviews and brand reputation</li>
                    <li>Feature comparison with competing products</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-white">✨ Interactive Email Experience</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Beautiful, animated email design with expandable sections</li>
                    <li>One-click access to product pages</li>
                    <li>Complete product specifications and key features</li>
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
