/**
 * Utilities for Supabase data handling
 * Reduces boilerplate for common patterns
 */

import type { PostgrestError } from '@supabase/supabase-js'

/**
 * PostgreSQL error codes we commonly ignore
 */
export const PGSQL_ERROR_CODES = {
  NO_ROWS: 'PGRST116', // No rows returned
  DUPLICATE_KEY: '23505', // Unique constraint violation
  FOREIGN_KEY: '23503', // Foreign key constraint
  NOT_NULL: '23502', // NOT NULL constraint
  CHECK: '23514', // CHECK constraint
} as const

/**
 * Throws error if it's not one of the ignorable codes
 * @param error PostgreSQL error to check
 * @param ignoreCodes Error codes to ignore (e.g., 'PGRST116' for no rows)
 */
export function throwIfError(
  error: PostgrestError | null | undefined,
  ignoreCodes: string[] = []
): void {
  if (error && !ignoreCodes.includes(error.code as string)) {
    throw error
  }
}

/**
 * Type-safe data extraction from Supabase response
 * Automatically handles null and error cases
 */
export function extractData<T>(
  data: T | null,
  error: PostgrestError | null | undefined,
  options: {
    ignoreNotFound?: boolean // Ignore PGRST116 (no rows)
    throwOnError?: boolean
  } = {}
): T | null {
  const { ignoreNotFound = true, throwOnError = true } = options

  if (error) {
    if (ignoreNotFound && error.code === PGSQL_ERROR_CODES.NO_ROWS) {
      return null
    }
    if (throwOnError) {
      throw error
    }
    return null
  }

  return data
}

/**
 * Simplifies the common pattern of checking if no rows and returning null
 * Usage: const user = await getOrNull(supabase.from('User').select().eq('id', id).single())
 */
export async function getOrNull<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T | null> {
  const { data, error } = await query
  return extractData(data, error, { ignoreNotFound: true, throwOnError: true })
}

/**
 * For queries that should always return data
 * Throws if no rows found
 */
export async function getOrThrow<T>(
  query: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await query
  if (error) throw error
  if (!data) throw new Error('No data returned from query')
  return data
}

/**
 * For insert/update operations where we ignore specific error codes
 */
export async function executeWithIgnore<T>(
  query: Promise<{ data: T; error: PostgrestError | null }>,
  ignoreCodes: (typeof PGSQL_ERROR_CODES)[keyof typeof PGSQL_ERROR_CODES][] = []
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const { data, error } = await query

  if (error && ignoreCodes.includes(error.code as any)) {
    return { data: null, error: null }
  }

  if (error) throw error

  return { data, error: null }
}

/**
 * Convert JavaScript Date to ISO string for database storage
 * Safe for PostgreSQL timestamps
 */
export function toISOString(date: Date | null | undefined): string | null {
  if (!date) return null
  return date instanceof Date ? date.toISOString() : date
}

/**
 * Convert PostgreSQL timestamp string to Date object
 */
export function toDate(timestamp: string | null | undefined): Date | null {
  if (!timestamp) return null
  return new Date(timestamp)
}

/**
 * Extract date part (YYYY-MM-DD) from Date for date-only fields
 */
export function toDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Safe null coalescing for database operations
 * Converts undefined to null for database insertion
 */
export function nullify<T>(value: T | null | undefined): T | null {
  return value ?? null
}

/**
 * Build a map from an array for efficient lookups
 * Useful for avoiding N+1 queries in related data
 */
export function toMap<T, K extends string | number | symbol>(
  items: T[],
  keyFn: (item: T) => K
): Map<K, T> {
  const map = new Map<K, T>()
  for (const item of items) {
    map.set(keyFn(item), item)
  }
  return map
}

/**
 * Join data from multiple queries using a key function
 * Replaces the need for separate queries per item
 */
export function joinData<T, R, K extends string | number | symbol>(
  primary: T[],
  related: R[],
  primaryKeyFn: (item: T) => K,
  relatedKeyFn: (item: R) => K,
  mergeFn: (primary: T, related: R | undefined) => any
): any[] {
  const relatedMap = toMap(related, relatedKeyFn)
  return primary.map(p => mergeFn(p, relatedMap.get(primaryKeyFn(p))))
}
