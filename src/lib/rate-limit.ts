/**
 * Controle de tentativas de login (rate limiting)
 * Protege contra ataques de força bruta
 */

import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

// Configurações
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION_MINUTES = 15

interface RateLimitResult {
  allowed: boolean
  attemptsRemaining: number
  lockedUntil: Date | null
}

/**
 * Verifica se o usuário pode tentar login
 * @param userId - ID do usuário
 * @returns Resultado indicando se a tentativa é permitida
 */
export async function checkLoginAttempts(userId: string): Promise<RateLimitResult> {
  const { data: user, error } = await supabase
    .from('User')
    .select('loginAttempts, lockedUntil')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error

  if (!user) {
    return { allowed: true, attemptsRemaining: MAX_LOGIN_ATTEMPTS, lockedUntil: null }
  }

  const lockedUntil = user.lockedUntil ? new Date(user.lockedUntil) : null

  // Verificar se está bloqueado
  if (lockedUntil && lockedUntil > new Date()) {
    logger.warn('AUTH', 'Login blocked - too many attempts', { userId })
    return {
      allowed: false,
      attemptsRemaining: 0,
      lockedUntil,
    }
  }

  // Se o bloqueio expirou, resetar tentativas
  if (lockedUntil && lockedUntil <= new Date()) {
    await resetLoginAttempts(userId)
    return { allowed: true, attemptsRemaining: MAX_LOGIN_ATTEMPTS, lockedUntil: null }
  }

  const attemptsRemaining = MAX_LOGIN_ATTEMPTS - user.loginAttempts
  return {
    allowed: attemptsRemaining > 0,
    attemptsRemaining: Math.max(0, attemptsRemaining),
    lockedUntil: null,
  }
}

/**
 * Incrementa o contador de tentativas falhas
 * Bloqueia o usuário se exceder o limite
 * @param userId - ID do usuário
 * @returns Novo número de tentativas
 */
export async function incrementLoginAttempts(userId: string): Promise<number> {
  // Get current attempts
  const { data: currentUser, error: getError } = await supabase
    .from('User')
    .select('loginAttempts')
    .eq('id', userId)
    .single()

  if (getError && getError.code !== 'PGRST116') throw getError

  const currentAttempts = currentUser?.loginAttempts ?? 0
  const newAttempts = currentAttempts + 1

  // Update attempts
  const { error: updateError } = await supabase
    .from('User')
    .update({ loginAttempts: newAttempts })
    .eq('id', userId)

  if (updateError) throw updateError

  // Se excedeu o limite, bloquear
  if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date()
    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES)

    const { error: lockError } = await supabase
      .from('User')
      .update({ lockedUntil: lockedUntil.toISOString() })
      .eq('id', userId)

    if (lockError) throw lockError

    logger.warn('AUTH', 'User locked due to too many login attempts', {
      userId,
      lockedUntil: lockedUntil.toISOString(),
    })
  }

  return newAttempts
}

/**
 * Reseta o contador de tentativas após login bem-sucedido
 * @param userId - ID do usuário
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  const { error } = await supabase
    .from('User')
    .update({
      loginAttempts: 0,
      lockedUntil: null,
    })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Obtém a mensagem de bloqueio formatada
 * @param lockedUntil - Data de desbloqueio
 * @returns Mensagem formatada ou null
 */
export function getLockoutMessage(lockedUntil: Date | null): string | null {
  if (!lockedUntil || lockedUntil <= new Date()) return null

  const minutesRemaining = Math.ceil(
    (lockedUntil.getTime() - Date.now()) / (1000 * 60)
  )

  return `Conta bloqueada. Tente novamente em ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''}.`
}
