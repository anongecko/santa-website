import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Combines Tailwind classes efficiently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format dates in a festive way
export function formatChristmasDate(date: Date): string {
  const daysUntilChristmas = getDaysUntilChristmas(date)
  if (daysUntilChristmas === 0) return "It's Christmas Day! 🎄"
  return `${daysUntilChristmas} ${daysUntilChristmas === 1 ? 'day' : 'days'} until Christmas! 🎄`
}

// Calculate days until Christmas
export function getDaysUntilChristmas(date: Date = new Date()): number {
  const christmas = new Date(date.getFullYear(), 11, 25)
  if (date.getMonth() === 11 && date.getDate() > 25) {
    christmas.setFullYear(christmas.getFullYear() + 1)
  }
  const diff = christmas.getTime() - date.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Generate festive greetings
export function getFestiveGreeting(): string {
  const greetings = [
    "Ho ho ho!",
    "Merry Christmas!",
    "Season's Greetings!",
    "Happy Holidays!",
    "Jingle all the way!",
    "Welcome to Santa's Workshop!",
  ]
  return greetings[Math.floor(Math.random() * greetings.length)]
}

// Format time in a kid-friendly way
export function formatKidFriendlyTime(date: Date): string {
  const hours = date.getHours()
  if (hours < 6) return "very early in the morning"
  if (hours < 12) return "in the morning"
  if (hours < 17) return "in the afternoon"
  if (hours < 20) return "in the evening"
  return "at night"
}

// Check if it's an appropriate time for Santa to chat
export function isSantaAvailable(): boolean {
  const now = new Date()
  const hours = now.getHours()
  // Santa is "busy with the reindeer" between 2 AM and 5 AM
  return hours < 2 || hours >= 5
}

// Generate random delays for animations
export function getRandomDelay(min: number = 0, max: number = 5): string {
  return `${Math.random() * (max - min) + min}s`
}

// Create snowflake positions
export function generateSnowflakeStyles() {
  return {
    left: `${Math.random() * 100}%`,
    animationDelay: getRandomDelay(),
    opacity: Math.random() * 0.6 + 0.4,
  }
}

// Check if device supports animation
export function canUseAnimation(): boolean {
  if (typeof window === 'undefined') return false
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Format gift suggestions
export function formatGiftSuggestion(gift: string): string {
  return gift.charAt(0).toUpperCase() + gift.slice(1).toLowerCase()
}

// Validate email in a kid-friendly way
export function isParentEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Create unique session IDs
export function generateSessionId(): string {
  return `santa-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Format messages for display
export function formatMessage(message: string, isFromSanta: boolean = false): string {
  if (isFromSanta && !message.includes('Ho ho ho')) {
    const shouldAddHoHoHo = Math.random() > 0.7
    return shouldAddHoHoHo ? `Ho ho ho! ${message}` : message
  }
  return message
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
