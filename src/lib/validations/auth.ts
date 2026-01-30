/**
 * Schemas de validação Zod para autenticação
 * Usados tanto no cliente (React Hook Form) quanto no servidor (API routes)
 */

import { z } from 'zod'

// ============================================
// Regras de Senha
// ============================================

/**
 * Schema de senha com regras de força
 * - Mínimo 8 caracteres
 * - Pelo menos 1 letra maiúscula
 * - Pelo menos 1 número
 * - Pelo menos 1 caractere especial
 */
export const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter pelo menos 1 letra maiúscula')
  .regex(/[a-z]/, 'Deve conter pelo menos 1 letra minúscula')
  .regex(/[0-9]/, 'Deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos 1 caractere especial (!@#$%^&*)')

/**
 * Schema de e-mail
 */
export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido')
  .toLowerCase()
  .trim()

// ============================================
// Schemas de Formulários
// ============================================

/**
 * Schema de Login
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Schema de Cadastro
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome muito longo')
      .trim(),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * Schema de Esqueci Senha
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

/**
 * Schema de Redefinir Senha
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

/**
 * Schema de Alterar Senha (usuário logado)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['newPassword'],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

// ============================================
// Critérios de Força da Senha
// ============================================

export interface PasswordCriteria {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

/**
 * Avalia os critérios de força da senha
 * @param password - Senha a ser avaliada
 * @returns Objeto com critérios atendidos
 */
export function evaluatePasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  }
}

/**
 * Calcula o score de força da senha (0-5)
 * @param password - Senha a ser avaliada
 * @returns Score de 0 a 5
 */
export function calculatePasswordStrength(password: string): number {
  const criteria = evaluatePasswordCriteria(password)
  return Object.values(criteria).filter(Boolean).length
}

/**
 * Labels dos critérios de senha
 */
export const PASSWORD_CRITERIA_LABELS: Record<keyof PasswordCriteria, string> = {
  minLength: 'Mínimo 8 caracteres',
  hasUppercase: 'Letra maiúscula',
  hasLowercase: 'Letra minúscula',
  hasNumber: 'Número',
  hasSpecial: 'Caractere especial (!@#$%^&*)',
}

/**
 * Cores por nível de força
 */
export const PASSWORD_STRENGTH_COLORS: Record<number, string> = {
  0: 'bg-gray-200',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-lime-500',
  5: 'bg-green-500',
}

/**
 * Labels por nível de força
 */
export const PASSWORD_STRENGTH_LABELS: Record<number, string> = {
  0: '',
  1: 'Muito fraca',
  2: 'Fraca',
  3: 'Regular',
  4: 'Boa',
  5: 'Forte',
}
