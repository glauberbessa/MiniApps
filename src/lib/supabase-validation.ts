/**
 * Zod schemas for Supabase response validation
 * Provides type safety for database operations
 */

import { z } from 'zod'

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  password: z.string().nullable(),
  emailVerified: z.string().datetime().nullable(),
  isActive: z.boolean(),
  loginAttempts: z.number().int().min(0),
  lockedUntil: z.string().datetime().nullable(),
  passwordResetToken: z.string().nullable(),
  passwordResetExpires: z.string().datetime().nullable(),
  youtubeChannelId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

// Playlist Config schema
export const PlaylistConfigSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  playlistId: z.string(),
  title: z.string(),
  isEnabled: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type PlaylistConfig = z.infer<typeof PlaylistConfigSchema>

// Input schema for playlist config (without id/userId/timestamps)
export const PlaylistConfigInputSchema = PlaylistConfigSchema.pick({
  playlistId: true,
  title: true,
  isEnabled: true,
})

export type PlaylistConfigInput = z.infer<typeof PlaylistConfigInputSchema>

// Channel Config schema
export const ChannelConfigSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  channelId: z.string(),
  title: z.string(),
  isEnabled: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type ChannelConfig = z.infer<typeof ChannelConfigSchema>

// Input schema for channel config (without id/userId/timestamps)
export const ChannelConfigInputSchema = ChannelConfigSchema.pick({
  channelId: true,
  title: true,
  isEnabled: true,
})

export type ChannelConfigInput = z.infer<typeof ChannelConfigInputSchema>

// Quota History schema
export const QuotaHistorySchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  date: z.string().date(), // YYYY-MM-DD
  consumedUnits: z.number().int().min(0),
  dailyLimit: z.number().int().min(0),
  createdAt: z.string().datetime().optional(),
})

export type QuotaHistory = z.infer<typeof QuotaHistorySchema>

// Export Progress schema
export const ExportProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceType: z.enum(['playlist', 'channel']),
  sourceId: z.string(),
  sourceTitle: z.string(),
  status: z.enum(['pending', 'in_progress', 'completed']),
  totalItems: z.number().int().default(0),
  importedItems: z.number().int().default(0),
  lastPageToken: z.string().nullable().default(null),
  lastImportedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime().optional(),
})

export type ExportProgress = z.infer<typeof ExportProgressSchema>

// Validate array of configs
export function validateConfigs<T extends z.ZodSchema>(schema: T, data: unknown): z.infer<T>[] {
  const arraySchema = z.array(schema)
  return arraySchema.parse(data)
}

// Safe validation with fallback
export function safeParse<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0]?.message || 'Validation failed',
    }
  }
  return { success: true, data: result.data }
}
