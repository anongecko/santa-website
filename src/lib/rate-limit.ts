import { Redis } from '@upstash/redis'
import { RateLimitError } from './errors'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
  blocked?: boolean
}

export class RateLimiter {
  private redis: Redis
  private config: RateLimitConfig = {
    maxRequests: 20,
    windowMs: 60000,
    blockDurationMs: 300000
  }

  constructor(config?: Partial<RateLimitConfig>) {
    this.config = { ...this.config, ...config }
    this.redis = Redis.fromEnv()
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowKey = `ratelimit:${identifier}`
    const blockedKey = `ratelimit:blocked:${identifier}`

    try {
      // Check if user is blocked
      const isBlocked = await this.redis.get<number>(blockedKey)
      if (isBlocked) {
        const remaining = isBlocked - now
        if (remaining > 0) {
          return {
            success: false,
            remaining: 0,
            reset: isBlocked,
            blocked: true
          }
        }
        await this.redis.del(blockedKey)
      }

      // Get current window count
      const current = await this.redis.get<number[]>(windowKey) || [0, now]
      const [count, windowStart] = current

      // Reset if window has expired
      if (now - windowStart >= this.config.windowMs) {
        await this.redis.set(windowKey, [1, now], { ex: 60 })
        return {
          success: true,
          remaining: this.config.maxRequests - 1,
          reset: now + this.config.windowMs
        }
      }

      // Check if over limit
      if (count >= this.config.maxRequests) {
        // Block user if significantly over limit
        if (count >= this.config.maxRequests * 2) {
          const blockUntil = now + this.config.blockDurationMs
          await this.redis.set(blockedKey, blockUntil, {
            ex: Math.ceil(this.config.blockDurationMs / 1000)
          })
          return {
            success: false,
            remaining: 0,
            reset: blockUntil,
            blocked: true
          }
        }

        return {
          success: false,
          remaining: 0,
          reset: windowStart + this.config.windowMs
        }
      }

      // Increment counter
      await this.redis.set(windowKey, [count + 1, windowStart], { 
        ex: Math.ceil(this.config.windowMs / 1000)
      })

      return {
        success: true,
        remaining: this.config.maxRequests - (count + 1),
        reset: windowStart + this.config.windowMs
      }
    } catch (error) {
      console.error('Rate limit error:', error)
      // Fail open if Redis is down
      return {
        success: true,
        remaining: 1,
        reset: now + this.config.windowMs
      }
    }
  }

  async clearLimit(identifier: string): Promise<void> {
    const windowKey = `ratelimit:${identifier}`
    const blockedKey = `ratelimit:blocked:${identifier}`
    await Promise.all([
      this.redis.del(windowKey),
      this.redis.del(blockedKey)
    ])
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    const windowKey = `ratelimit:${identifier}`
    const current = await this.redis.get<number[]>(windowKey)
    if (!current) return this.config.maxRequests
    return Math.max(0, this.config.maxRequests - current[0])
  }
}

export const rateLimiter = new RateLimiter()

// Middleware helper
export async function withRateLimit(
  req: Request,
  identifier?: string
) {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             '127.0.0.1'
  
  const id = identifier || ip
  const result = await rateLimiter.limit(id)

  if (!result.success) {
    throw new RateLimitError(
      'Too many requests',
      result.reset,
      result.blocked
    )
  }

  return result
}
