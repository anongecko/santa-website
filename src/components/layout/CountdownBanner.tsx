'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
}

export function CountdownBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: '00', hours: '00', minutes: '00' });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2024-12-17T21:00:00').getTime();

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
            {/* Main Content */}
            <div className="text-center pr-16">
              {' '}
              {/* Increased right padding to accommodate buttons */}
              <h2 className="text-sm sm:text-base font-medium mb-1">
                Coming Soon: AI-Powered Gift Wishlist Email Feature
              </h2>
              {/* Countdown Timer */}
              <div className="flex justify-center items-center gap-2 sm:gap-4 mb-0.5 font-mono">
                <motion.div
                  key={timeLeft.days}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-baseline"
                >
                  <span className="text-lg sm:text-2xl font-bold">{timeLeft.days}</span>
                  <span className="text-xs sm:text-sm ml-1">days</span>
                </motion.div>
                <span className="text-lg sm:text-2xl">:</span>
                <motion.div
                  key={timeLeft.hours}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-baseline"
                >
                  <span className="text-lg sm:text-2xl font-bold">{timeLeft.hours}</span>
                  <span className="text-xs sm:text-sm ml-1">hrs</span>
                </motion.div>
                <span className="text-lg sm:text-2xl">:</span>
                <motion.div
                  key={timeLeft.minutes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-baseline"
                >
                  <span className="text-lg sm:text-2xl font-bold">{timeLeft.minutes}</span>
                  <span className="text-xs sm:text-sm ml-1">min</span>
                </motion.div>
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

              {/* Close Button */}
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
