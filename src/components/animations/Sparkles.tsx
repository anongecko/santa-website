'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SparkleInstanceProps {
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}

interface SparklesProps {
  children?: React.ReactNode;
  color?: string;
  variance?: number;
  minSize?: number;
  maxSize?: number;
  density?: number;
  className?: string;
}

const DEFAULT_COLOR = 'hsl(var(--christmas-gold))';

const generateSparkle = (minSize: number, maxSize: number, variance: number, color: string) => {
  const size = Math.random() * (maxSize - minSize) + minSize;
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    color,
    size,
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      zIndex: 2,
      transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
    },
  };
};

const SparkleInstance = ({ color = DEFAULT_COLOR, size = 10, style }: SparkleInstanceProps) => {
  return (
    <motion.svg
      style={style}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      }}
      className="absolute"
    >
      <path
        d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
        fill={color}
      />
    </motion.svg>
  );
};

export function Sparkles({
  children,
  color = DEFAULT_COLOR,
  variance = 400,
  minSize = 10,
  maxSize = 20,
  density = 1,
  className,
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<Array<any>>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const now = Date.now();
      const sparkleCount = Math.floor(Math.random() * 2 * density) + 1;
      const newSparkles = Array.from({ length: sparkleCount }, () =>
        generateSparkle(minSize, maxSize, variance, color)
      );

      // Remove old sparkles and add new ones
      setSparkles(oldSparkles => [
        ...oldSparkles.filter(sparkle => now - sparkle.createdAt < 1000),
        ...newSparkles,
      ]);
    };

    const interval = setInterval(generateSparkles, 1000);
    return () => clearInterval(interval);
  }, [color, variance, minSize, maxSize, density]);

  return (
    <span className={cn('inline-block relative', className)}>
      <AnimatePresence mode="sync">
        {sparkles.map(sparkle => (
          <SparkleInstance
            key={sparkle.id}
            color={sparkle.color}
            size={sparkle.size}
            style={sparkle.style}
          />
        ))}
      </AnimatePresence>
      <span className="relative inline-block z-1">{children}</span>
    </span>
  );
}

// Wrapper component for adding sparkles to interactive elements
export function SparkleButton({
  children,
  className,
  ...props
}: React.PropsWithChildren<{ className?: string }>) {
  const child = React.Children.only(children) as React.ReactElement;

  return (
    <Sparkles color="hsl(var(--christmas-gold))" density={1.5}>
      {React.cloneElement(child, {
        className: cn(
          'relative transition-all duration-300',
          'hover:scale-105 active:scale-95',
          child.props.className,
          className
        ),
        ...props,
      })}
    </Sparkles>
  );
}

// Hover effect wrapper
export function SparkleHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <Sparkles color="hsl(var(--christmas-gold))" density={2} minSize={8} maxSize={15} />
      )}
      {children}
    </div>
  );
}
