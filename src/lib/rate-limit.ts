/**
 * Controle de tentativas de login (rate limiting)
 * Protege contra ataques de força bruta
 */

import { prisma } from '@/lib/prisma'
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loginAttempts: true, lockedUntil: true },
  })

  if (!user) {
    return { allowed: true, attemptsRemaining: MAX_LOGIN_ATTEMPTS, lockedUntil: null }
  }

  // Verificar se está bloqueado
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    logger.warn('AUTH', 'Login blocked - too many attempts', { userId })
    return {
      allowed: false,
      attemptsRemaining: 0,
      lockedUntil: user.lockedUntil,
    }
  }

  // Se o bloqueio expirou, resetar tentativas
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
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
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: { increment: 1 },
    },
    select: { loginAttempts: true },
  })

  // Se excedeu o limite, bloquear
  if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = new Date()
    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES)

    await prisma.user.update({
      where: { id: userId },
      data: { lockedUntil },
    })

    logger.warn('AUTH', 'User locked due to too many login attempts', {
      userId,
      lockedUntil: lockedUntil.toISOString(),
    })
  }

  return user.loginAttempts
}

/**
 * Reseta o contador de tentativas após login bem-sucedido
 * @param userId - ID do usuário
 */
export async function resetLoginAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      loginAttempts: 0,
      lockedUntil: null,
    },
  })
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
