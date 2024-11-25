'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  wobble: number
  radius: number
  spin: number
  shape: 'circle' | 'star' | 'crystal'
}

interface SnowProps {
  className?: string
  density?: number
  minSize?: number
  maxSize?: number
  minSpeed?: number
  maxSpeed?: number
  wind?: number
  color?: string
  enableShapes?: boolean
  paused?: boolean
}

export function Snow({
  className,
  density = 0.15,
  minSize = 1,
  maxSize = 4,
  minSpeed = 0.5,
  maxSpeed = 1.5,
  wind = 0.3,
  color = '255, 255, 255',
  enableShapes = true,
  paused = false
}: SnowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const snowflakesRef = useRef<Snowflake[]>([])
  const frameRef = useRef<number>()
  const fpsInterval = useRef<number>(1000 / 60)
  const then = useRef<number>(Date.now())

  const drawSnowflake = useCallback((
    ctx: CanvasRenderingContext2D, 
    flake: Snowflake
  ) => {
    ctx.save()
    ctx.translate(flake.x, flake.y)
    ctx.rotate(flake.spin)
    ctx.beginPath()

    switch (flake.shape) {
      case 'star':
        for (let i = 0; i < 5; i++) {
          ctx.rotate(Math.PI * 2 / 5)
          ctx.lineTo(flake.size, 0)
          ctx.lineTo(flake.size / 2, flake.size / 2)
        }
        break
      case 'crystal':
        for (let i = 0; i < 6; i++) {
          ctx.rotate(Math.PI * 2 / 6)
          ctx.moveTo(0, 0)
          ctx.lineTo(flake.size, 0)
          ctx.moveTo(flake.size * 0.5, flake.size * 0.2)
          ctx.lineTo(flake.size * 0.5, -flake.size * 0.2)
        }
        break
      default:
        ctx.arc(0, 0, flake.size, 0, Math.PI * 2)
    }

    ctx.fillStyle = `rgba(${color}, ${flake.opacity})`
    ctx.strokeStyle = `rgba(${color}, ${flake.opacity * 0.8})`
    ctx.lineWidth = flake.size / 8
    
    if (flake.shape === 'crystal') {
      ctx.stroke()
    } else {
      ctx.fill()
    }
    ctx.restore()
  }, [color])

  const initSnowflakes = useCallback((width: number, height: number) => {
    const shapes: Array<'circle' | 'star' | 'crystal'> = ['circle']
    if (enableShapes) {
      shapes.push('star', 'crystal')
    }

    const count = Math.floor(width * density)
    const flakes: Snowflake[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * (maxSize - minSize) + minSize,
      speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
      opacity: Math.random() * 0.5 + 0.3,
      wobble: Math.random() * 2 * Math.PI,
      radius: Math.random() * 2,
      spin: 0,
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    }))
    
    snowflakesRef.current = flakes
  }, [density, minSize, maxSize, minSpeed, maxSpeed, enableShapes])

  const updateAndDrawSnowflakes = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    deltaTime: number
  ) => {
    ctx.clearRect(0, 0, width, height)
    
    snowflakesRef.current.forEach(flake => {
      // Update position with delta time for smooth animation
      const timeScale = deltaTime / 16.67 // normalize to 60fps
      flake.y += flake.speed * timeScale
      flake.x += Math.sin(flake.wobble) * wind * timeScale
      flake.wobble += 0.02 * timeScale
      flake.spin += (flake.speed / 10) * timeScale

      // Wrap around edges
      if (flake.y > height) {
        flake.y = -10
        flake.x = Math.random() * width
      }
      if (flake.x > width) flake.x = 0
      if (flake.x < 0) flake.x = width

      drawSnowflake(ctx, flake)
    })
  }, [drawSnowflake, wind])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const { clientWidth, clientHeight } = document.documentElement
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = clientWidth * dpr
      canvas.height = clientHeight * dpr
      canvas.style.width = `${clientWidth}px`
      canvas.style.height = `${clientHeight}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      setDimensions({ width: clientWidth, height: clientHeight })
      initSnowflakes(clientWidth, clientHeight)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initSnowflakes])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || paused) return

    const animate = (now: number) => {
      frameRef.current = requestAnimationFrame(animate)
      
      const elapsed = now - then.current
      if (elapsed <= fpsInterval.current) return

      then.current = now - (elapsed % fpsInterval.current)
      updateAndDrawSnowflakes(ctx, dimensions.width, dimensions.height, elapsed)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [dimensions, paused, updateAndDrawSnowflakes])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-50",
        "transition-opacity duration-1000",
        className
      )}
      style={{
        opacity: 0.7,
        willChange: 'transform',
        filter: 'blur(0.5px)'
      }}
      aria-hidden="true"
    />
  )
}
