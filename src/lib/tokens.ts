/**
 * Utilitários para geração de tokens seguros
 */

import crypto from 'crypto'

/**
 * Gera um token seguro para recuperação de senha
 * @param length - Tamanho do token em bytes (default: 32)
 * @returns Token em formato hexadecimal (64 caracteres para 32 bytes)
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Calcula a data de expiração do token
 * @param hours - Horas até expiração (default: 1)
 * @returns Data de expiração
 */
export function getTokenExpiration(hours: number = 1): Date {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + hours)
  return expiration
}

/**
 * Verifica se um token está expirado
 * @param expirationDate - Data de expiração do token
 * @returns true se o token está expirado
 */
export function isTokenExpired(expirationDate: Date | null): boolean {
  if (!expirationDate) return true
  return new Date() > expirationDate
}
