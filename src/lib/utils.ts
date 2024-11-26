import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// UI Utilities
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorVariant(color: string, modifier: number): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  
  const modifiedColor = [r, g, b].map(c => {
    const modified = c * modifier
    return Math.min(255, Math.max(0, Math.round(modified)))
  })
  
  return `#${modifiedColor.map(c => c.toString(16).padStart(2, '0')).join('')}`
}

// Date and Time Utilities
export function formatChristmasDate(date: Date = new Date()): string {
  const daysUntilChristmas = getDaysUntilChristmas(date)
  if (daysUntilChristmas === 0) return "It's Christmas Day! 🎄"
  if (daysUntilChristmas === 1) return "Christmas Eve! 🎄✨"
  return `${daysUntilChristmas} days until Christmas! 🎄`
}

export function getDaysUntilChristmas(date: Date = new Date()): number {
  const christmas = new Date(date.getFullYear(), 11, 25)
  if (date.getMonth() === 11 && date.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1)
  }
  const diff = christmas.getTime() - date.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatKidFriendlyTime(date: Date = new Date()): string {
  const hours = date.getHours()
  if (hours < 6) return "very early in the morning"
  if (hours < 12) return "in the morning"
  if (hours < 17) return "in the afternoon"
  if (hours < 20) return "in the evening"
  return "at night"
}

export function isSantaAvailable(): boolean {
  const now = new Date()
  const hours = now.getHours()
  const month = now.getMonth()
  // Santa is more available during December!
  if (month === 11) {
    return hours < 3 || hours >= 4 // Only 1 hour break in December
  }
  return hours < 2 || hours >= 5 // Regular schedule rest of year
}

// Animation Utilities
export function getRandomDelay(min: number = 0, max: number = 5): string {
  return `${Math.random() * (max - min) + min}s`
}

export function generateSnowflakeStyles(maxWidth: number = 100) {
  return {
    left: `${Math.random() * maxWidth}%`,
    animationDelay: getRandomDelay(),
    opacity: Math.random() * 0.6 + 0.4,
    transform: `scale(${Math.random() * 0.5 + 0.5})`,
  }
}

export function canUseAnimation(): boolean {
  if (typeof window === 'undefined') return false
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches
  return !prefersReducedMotion && !prefersReducedData
}

// Content Formatting Utilities
export function getFestiveGreeting(): string {
  const time = new Date().getHours()
  const greetings = [
    "Ho ho ho! Welcome to the North Pole! 🎅",
    "Merry Christmas! Ready for some holiday magic? ✨",
    "Season's Greetings from Santa's Workshop! 🎄",
    "Ho ho ho! Happy Holidays! 🎁",
    "Jingle all the way to the North Pole! 🔔",
    "Welcome to Santa's Magical Workshop! ⭐",
  ]
  
  // Add time-specific greetings
  if (time < 12) greetings.push("Good morning from the North Pole! ☀️")
  else if (time < 17) greetings.push("Good afternoon, young friend! 🌟")
  else greetings.push("Good evening, what a magical night! 🌙")
  
  return greetings[Math.floor(Math.random() * greetings.length)]
}

export function formatGiftSuggestion(gift: string): string {
  return gift
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

// Email Validation and Handling
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i
  if (!emailRegex.test(email)) return false
  
  const [local, domain] = email.split('@')
  
  // Local part validation
  if (!local || local.length > 64 || local.length < 1) return false
  if (!/^[a-zA-Z0-9._-]+$/.test(local)) return false
  
  // Domain validation (must end in .com)
  if (!domain || domain.length > 255 || domain.length < 4) return false
  const domainParts = domain.split('.')
  if (domainParts.length !== 2 || domainParts[1].toLowerCase() !== 'com') return false
  if (!/^[a-zA-Z0-9-]+$/.test(domainParts[0])) return false
  
  return true
}

export function generateSessionId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  const prefix = 'santa'
  return `${prefix}-${timestamp}-${random}`
}

export function formatMessage(message: string, isFromSanta: boolean = false): string {
  if (!message) return ''
  
  let formattedMessage = message.trim()
  
  if (isFromSanta) {
    // Add festive elements
    const needsHoHoHo = !formattedMessage.toLowerCase().includes('ho ho ho')
    const shouldAddHoHoHo = Math.random() > 0.7
    
    if (needsHoHoHo && shouldAddHoHoHo) {
      formattedMessage = `Ho ho ho! ${formattedMessage}`
    }
    
    // Ensure message ends with festive emoji if it doesn't have one
    const festiveEmojis = ['🎅', '🎄', '✨', '⭐', '🎁']
    const hasEmoji = festiveEmojis.some(emoji => formattedMessage.includes(emoji))
    
    if (!hasEmoji) {
      formattedMessage += ` ${festiveEmojis[Math.floor(Math.random() * festiveEmojis.length)]}`
    }
  }
  
  return formattedMessage
}

// Type Guards
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function isValidSessionId(id: unknown): boolean {
  if (typeof id !== 'string') return false
  return /^santa-\d+-[a-z0-9]{6}$/.test(id)
}
