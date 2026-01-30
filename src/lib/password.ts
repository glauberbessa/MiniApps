/**
 * Utilitários para hash e verificação de senhas
 * Usa bcryptjs (compatível com serverless/Vercel)
 */

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Gera hash de uma senha usando bcrypt
 * @param password - Senha em texto plano
 * @returns Hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verifica se uma senha corresponde a um hash
 * @param password - Senha em texto plano
 * @param hashedPassword - Hash armazenado
 * @returns true se a senha corresponde ao hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
