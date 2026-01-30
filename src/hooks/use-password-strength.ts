"use client"

import { useMemo } from "react"
import {
  evaluatePasswordCriteria,
  calculatePasswordStrength,
  PasswordCriteria,
  PASSWORD_STRENGTH_COLORS,
  PASSWORD_STRENGTH_LABELS,
} from "@/lib/validations/auth"

export interface UsePasswordStrengthResult {
  /** Critérios atendidos pela senha */
  criteria: PasswordCriteria
  /** Score de força (0-5) */
  strength: number
  /** Cor do indicador baseada na força */
  color: string
  /** Label de força (Muito fraca, Fraca, Regular, Boa, Forte) */
  label: string
  /** Porcentagem de força (0-100) */
  percentage: number
  /** Se a senha atende todos os critérios */
  isValid: boolean
}

/**
 * Hook para calcular a força da senha em tempo real
 * @param password - Senha a ser avaliada
 * @returns Objeto com informações de força da senha
 */
export function usePasswordStrength(password: string): UsePasswordStrengthResult {
  return useMemo(() => {
    const criteria = evaluatePasswordCriteria(password)
    const strength = calculatePasswordStrength(password)
    const color = PASSWORD_STRENGTH_COLORS[strength]
    const label = PASSWORD_STRENGTH_LABELS[strength]
    const percentage = (strength / 5) * 100
    const isValid = strength === 5

    return {
      criteria,
      strength,
      color,
      label,
      percentage,
      isValid,
    }
  }, [password])
}
