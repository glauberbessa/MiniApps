/**
 * In-memory caching for quota status
 * Reduces database queries for frequently checked quota
 * TTL: 60 seconds (quota updates frequently)
 */

import { QuotaStatus } from '@/types/quota'
import { logger } from './logger'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class QuotaCache {
  private cache = new Map<string, CacheEntry<QuotaStatus>>()
  private readonly DEFAULT_TTL_MS = 60000 // 60 seconds

  /**
   * Get cached quota status if still valid
   */
  get(userId: string): QuotaStatus | null {
    const entry = this.cache.get(userId)

    if (!entry) {
      logger.debug('DATABASE', 'Quota cache miss', { userId })
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      logger.debug('DATABASE', 'Quota cache expired', { userId })
      this.cache.delete(userId)
      return null
    }

    logger.debug('DATABASE', 'Quota cache hit', { userId })
    return entry.value
  }

  /**
   * Set quota status in cache
   */
  set(userId: string, value: QuotaStatus, ttlMs: number = this.DEFAULT_TTL_MS): void {
    logger.debug('DATABASE', 'Quota cache set', {
      userId,
      ttlMs,
      consumedUnits: value.consumedUnits,
    })

    this.cache.set(userId, {
      value,
      expiresAt: Date.now() + ttlMs,
    })
  }

  /**
   * Invalidate cache entry (e.g., after quota-consuming operation)
   */
  invalidate(userId: string): void {
    logger.debug('DATABASE', 'Quota cache invalidated', { userId })
    this.cache.delete(userId)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    logger.debug('DATABASE', 'Quota cache cleared', {
      entriesCleared: this.cache.size,
    })
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number
    entries: Array<{ userId: string; expiresIn: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([userId, entry]) => ({
      userId,
      expiresIn: Math.max(0, entry.expiresAt - now),
    }))

    return {
      size: this.cache.size,
      entries,
    }
  }
}

// Singleton instance
export const quotaCache = new QuotaCache()

/**
 * Decorator to cache function results
 * Useful for wrapping getQuotaStatus()
 */
export function withQuotaCache(
  fn: (userId: string) => Promise<QuotaStatus>,
  ttlMs: number = 60000
) {
  return async (userId: string): Promise<QuotaStatus> => {
    // Try cache first
    const cached = quotaCache.get(userId)
    if (cached) {
      return cached
    }

    // Fetch from source
    const result = await fn(userId)

    // Cache result
    quotaCache.set(userId, result, ttlMs)

    return result
  }
}
