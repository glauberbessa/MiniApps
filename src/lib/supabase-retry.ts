/**
 * Retry logic for Supabase operations with exponential backoff
 * Handles transient failures gracefully
 */

import { PostgrestError } from '@supabase/supabase-js'
import { logger } from './logger'

interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  onRetry: () => {},
}

/**
 * Determines if an error is retryable
 * Some database errors are transient and safe to retry
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false

  // PostgreSQL error codes that indicate transient failures
  const retryableCodes = [
    '40P01', // deadlock_detected
    '40001', // serialization_failure
    '08006', // connection_failure
    '08003', // connection_does_not_exist
  ]

  if (error instanceof Error) {
    const postgresError = error as PostgrestError & Error
    if (postgresError.code && retryableCodes.includes(postgresError.code)) {
      return true
    }

    // Network errors
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('networkerror')
    )
  }

  return false
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate backoff delay with exponential strategy
 */
function calculateBackoffDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
  multiplier: number
): number {
  const exponentialDelay = initialDelayMs * Math.pow(multiplier, attempt)
  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * Math.random()
  return Math.min(exponentialDelay + jitter, maxDelayMs)
}

/**
 * Execute async function with automatic retry on transient failures
 * @example
 * const result = await withRetry(
 *   async () => supabase.from('User').select().single(),
 *   { maxRetries: 3 }
 * )
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error
      }

      // Don't retry after last attempt
      if (attempt === config.maxRetries) {
        throw error
      }

      // Calculate backoff and wait
      const delayMs = calculateBackoffDelay(
        attempt,
        config.initialDelayMs,
        config.maxDelayMs,
        config.backoffMultiplier
      )

      config.onRetry(attempt + 1, lastError)

      await sleep(delayMs)
    }
  }

  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Retry wrapper for Supabase query builders
 * @example
 * const result = await retryQuery(
 *   supabase.from('User').select().eq('id', userId).single()
 * )
 */
export async function retryQuery<T extends { data: any; error: any }>(
  query: Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const result = await withRetry(
    () => query,
    {
      ...options,
      onRetry: (attempt, error) => {
        logger.warn('API', `Retrying query (attempt ${attempt})`, {
          attempt,
          error: error.message,
        })
        options.onRetry?.(attempt, error)
      },
    }
  )

  if (result.error) {
    throw result.error
  }

  return result
}

/**
 * Batch operation with retry per item
 * Continues on individual failures while tracking them
 */
export async function retryBatch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  options: RetryOptions = {}
): Promise<{
  successful: Array<{ item: T; result: R }>
  failed: Array<{ item: T; error: Error }>
}> {
  const successful: Array<{ item: T; result: R }> = []
  const failed: Array<{ item: T; error: Error }> = []

  for (const item of items) {
    try {
      const result = await withRetry(() => fn(item), options)
      successful.push({ item, result })
    } catch (error) {
      failed.push({
        item,
        error: error instanceof Error ? error : new Error(String(error)),
      })
    }
  }

  return { successful, failed }
}
