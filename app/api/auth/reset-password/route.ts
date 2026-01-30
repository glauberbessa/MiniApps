/**
 * API de Redefinir Senha
 * POST /api/auth/reset-password
 *
 * Valida token e atualiza a senha
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
        passwordResetExpires: true,
      },
    })

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
    if (isTokenExpired(user.passwordResetExpires)) {
      logger.warn('AUTH', 'Password reset attempt with expired token', {
        userId: user.id,
        expiredAt: user.passwordResetExpires?.toISOString(),
      })
      return NextResponse.json(
        { error: 'Link de recuperação expirado. Solicite um novo.' },
        { status: 400 }
      )
    }

    // Gerar hash da nova senha
    const hashedPassword = await hashPassword(password)

    // Atualizar senha e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    })

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
