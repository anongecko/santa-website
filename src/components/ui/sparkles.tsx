'use client'

import React, { useRef, useEffect, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SparklesCoreProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  background?: string
  minSize?: number
  maxSize?: number
  particleDensity?: number
  particleColor?: string
}

export const SparklesCore = forwardRef<HTMLCanvasElement, SparklesCoreProps>(({
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = "var(--santa-red)",
  className,
  ...props
}, forwardedRef) => {
  const internalRef = useRef<HTMLCanvasElement>(null)
  
  // Use the internal ref if no ref is forwarded
  const canvasRef = (forwardedRef || internalRef) as React.RefObject<HTMLCanvasElement>

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particles: Array<{
      x: number
      y: number
      size: number
      vx: number
      vy: number
      life: number
    }> = []
    
    let animationFrame: number

    const resizeCanvas = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = []
      initParticles()
    }

    const initParticles = () => {
      if (!canvas) return
      const { width, height } = canvas
      const particleCount = Math.floor((width * height) / 10000) * particleDensity

      particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 0.5 + 0.5 // Particle lifespan between 0.5 and 1
      }))
    }

    const updateParticle = (p: typeof particles[0]) => {
      if (!canvas) return

      p.x += p.vx
      p.y += p.vy
      p.life -= 0.001 // Slowly decrease life

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      // Reset dead particles
      if (p.life <= 0) {
        p.x = Math.random() * canvas.width
        p.y = Math.random() * canvas.height
        p.life = 1
        p.size = Math.random() * (maxSize - minSize) + minSize
      }

      return p
    }

    const drawParticle = (p: typeof particles[0]) => {
      if (!ctx) return

      ctx.globalAlpha = p.life
      ctx.fillStyle = particleColor
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.fillStyle = background
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        updateParticle(p)
        drawParticle(p)
      })

      animationFrame = requestAnimationFrame(animate)
    }

    // Initialize
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [background, minSize, maxSize, particleDensity, particleColor])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none",
        className
      )}
      {...props}
    />
  )
})

SparklesCore.displayName = 'SparklesCore'
