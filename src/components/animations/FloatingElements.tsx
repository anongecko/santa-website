'use client'

import React, { useEffect, useState, memo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FloatingItem {
  id: string
  type: 'candy-cane' | 'ornament' | 'gift' | 'star'
  position: { x: number; y: number }
  size: number
  rotation: number
  delay: number
  variant: number
}

interface FloatingElementsProps {
  count?: number
  minSize?: number
  maxSize?: number
  className?: string
  enabledTypes?: Array<FloatingItem['type']>
  density?: number
  animated?: boolean
}

const itemTypes: Array<FloatingItem['type']> = ['candy-cane', 'ornament', 'gift', 'star']

const generateItems = (
  count: number,
  enabledTypes: Array<FloatingItem['type']>,
  minSize: number,
  maxSize: number
): FloatingItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}-${Date.now()}`,
    type: enabledTypes[Math.floor(Math.random() * enabledTypes.length)],
    position: {
      x: Math.random() * 100,
      y: Math.random() * 100
    },
    size: Math.random() * (maxSize - minSize) + minSize,
    rotation: Math.random() * 360,
    delay: Math.random() * 2,
    variant: Math.floor(Math.random() * 3)
  }))
}

const variants = {
  'candy-cane': {
    animate: {
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  'ornament': {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  'gift': {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [-5, 5, -5],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },
  'star': {
    animate: {
      scale: [0.9, 1.1, 0.9],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
} satisfies Record<FloatingItem['type'], { animate: any }>

const ItemContent = memo(({ type, variant, className }: { 
  type: FloatingItem['type']
  variant: number
  className?: string 
}) => {
  const colors = {
    gold: "text-yellow-400",
    red: "text-red-500",
    green: "text-green-500"
  }

  const colorVariants = [colors.gold, colors.red, colors.green]
  const selectedColor = colorVariants[variant]

  switch (type) {
    case 'candy-cane':
      return (
        <div className={cn(
          "w-full h-full bg-[url('/images/candy-cane.png')]",
          "bg-no-repeat bg-center bg-contain",
          className
        )} />
      )
    case 'ornament':
      return (
        <div className={cn(
          "w-full h-full rounded-full",
          "bg-gradient-to-br shadow-lg",
          variant === 0 && "from-yellow-400 via-red-500 to-green-500",
          variant === 1 && "from-red-500 via-green-500 to-yellow-400",
          variant === 2 && "from-green-500 via-yellow-400 to-red-500",
          className
        )} />
      )
    case 'gift':
      return (
        <div className={cn(
          "w-full h-full rounded-lg",
          selectedColor,
          "border-2 border-yellow-400",
          "shadow-xl relative",
          className
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/3 h-full bg-yellow-400 opacity-80" />
            <div className="w-full h-1/3 bg-yellow-400 opacity-80 absolute" />
          </div>
        </div>
      )
    case 'star':
      return (
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "w-full h-full",
            selectedColor,
            "fill-current drop-shadow-lg",
            className
          )}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )
  }
})
ItemContent.displayName = 'ItemContent'

export const FloatingElements = ({
  count = 12,
  minSize = 30,
  maxSize = 50,
  className,
  enabledTypes = itemTypes,
  density = 1,
  animated = true
}: FloatingElementsProps) => {
  const shouldReduceMotion = useReducedMotion()
  const [items, setItems] = useState<FloatingItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const adjustedCount = Math.floor(count * density)
    setItems(generateItems(adjustedCount, enabledTypes, minSize, maxSize))

    const interval = setInterval(() => {
      if (animated && !shouldReduceMotion) {
        setItems(generateItems(adjustedCount, enabledTypes, minSize, maxSize))
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [count, enabledTypes, minSize, maxSize, density, animated, shouldReduceMotion])

  if (!mounted) return null

  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none overflow-hidden z-40",
      className
    )}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.position.x}%`,
              top: `${item.position.y}%`,
              width: item.size,
              height: item.size,
            }}
            initial={{ scale: 0, rotate: item.rotation, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              ...(!shouldReduceMotion && variants[item.type].animate)
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: item.delay
            }}
          >
            <ItemContent 
              type={item.type} 
              variant={item.variant}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default memo(FloatingElements)
