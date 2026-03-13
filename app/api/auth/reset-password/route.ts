/**
 * API de Redefinir Senha
 * POST /api/auth/reset-password
 *
 * Valida token e atualiza a senha
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { hashPassword } from '@/lib/password'
import { isTokenExpired } from '@/lib/tokens'
import { resetLoginAttempts } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados de entrada
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { token, password } = result.data

    // Buscar usuário pelo token
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, email, isActive, passwordResetExpires')
      .eq('passwordResetToken', token)
      .single()

    if (findError && findError.code !== 'PGRST116') throw findError

    // Token não encontrado
    if (!user) {
      logger.warn('AUTH', 'Password reset attempt with invalid token', {
        tokenPrefix: token.substring(0, 8),
      })
      return NextResponse.json(
        { error: 'Link de recuperação inválido ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      logger.warn('AUTH', 'Password reset attempt for inactive user', {
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Conta não está ativa' },
        { status: 400 }
      )
    }

    // Verificar se token expirou
    const expiresDate = user.passwordResetExpires ? new Date(user.passwordResetExpires) : null
    if (isTokenExpired(expiresDate)) {
      logger.warn('AUTH', 'Password reset attempt with expired token', {
        userId: user.id,
        expiredAt: expiresDate?.toISOString(),
      })
      return NextResponse.json(
        { error: 'Link de recuperação expirado. Solicite um novo.' },
        { status: 400 }
      )
    }

    // Gerar hash da nova senha
    const hashedPassword = await hashPassword(password)

    // Atualizar senha e limpar token
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      })
      .eq('id', user.id)

    if (updateError) throw updateError

    // Resetar tentativas de login (caso estivesse bloqueado)
    await resetLoginAttempts(user.id)

    logger.info('AUTH', 'Password reset successful', {
      userId: user.id,
      email: user.email,
    })

    return NextResponse.json({
      message: 'Senha redefinida com sucesso. Você já pode fazer login.',
    })
  } catch (error) {
    logger.error(
      'AUTH',
      'Reset password error',
      error instanceof Error ? error : undefined
    )
    return NextResponse.json(
      { error: 'Erro ao redefinir senha. Tente novamente.' },
      { status: 500 }
    )
  }
}
