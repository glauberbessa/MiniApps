/**
 * API de Esqueci Senha
 * POST /api/auth/forgot-password
 *
 * Gera token de recuperação e envia e-mail
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { generateToken, getTokenExpiration } from '@/lib/tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

// Mensagem genérica por segurança (não revelar se e-mail existe)
const GENERIC_SUCCESS_MESSAGE =
  'Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar e-mail
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'E-mail inválido',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Buscar usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
      },
    })

    // Se usuário não existir, retornar mensagem genérica (segurança)
    if (!user) {
      logger.info('AUTH', 'Password reset requested for non-existent email', { email })
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
    }

    // Se usuário não está ativo, retornar mensagem genérica
    if (!user.isActive) {
      logger.info('AUTH', 'Password reset requested for inactive user', { email })
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
    }

    // Se usuário não tem senha (conta OAuth-only), retornar mensagem genérica
    // mas avisar no log para debug
    if (!user.password) {
      logger.info('AUTH', 'Password reset requested for OAuth-only user', { email })
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
    }

    // Gerar token e data de expiração
    const token = generateToken()
    const expiresAt = getTokenExpiration(1) // 1 hora

    // Salvar token no usuário
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
    })

    logger.info('AUTH', 'Password reset token generated', {
      userId: user.id,
      expiresAt: expiresAt.toISOString(),
    })

    // Enviar e-mail
    const emailResult = await sendPasswordResetEmail(email, token)

    if (!emailResult.success) {
      logger.error('AUTH', 'Failed to send password reset email', undefined, {
        userId: user.id,
        error: emailResult.error,
      })
      // Mesmo com falha no e-mail, retornamos sucesso por segurança
      // O log captura o erro para investigação
    }

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
  } catch (error) {
    logger.error(
      'AUTH',
      'Forgot password error',
      error instanceof Error ? error : undefined
    )
    return NextResponse.json(
      { error: 'Erro ao processar solicitação. Tente novamente.' },
      { status: 500 }
    )
  }
}
