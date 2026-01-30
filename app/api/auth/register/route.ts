/**
 * API de Cadastro de Usuário
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { registerSchema } from '@/lib/validations/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados de entrada
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // Verificar se e-mail já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      logger.warn('AUTH', 'Registration attempt with existing email', { email })
      return NextResponse.json(
        { error: 'Este e-mail já está cadastrado' },
        { status: 409 }
      )
    }

    // Gerar hash da senha
    const hashedPassword = await hashPassword(password)

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    logger.info('AUTH', 'New user registered', {
      userId: user.id,
      email: user.email,
    })

    // Enviar e-mail de boas-vindas (não bloqueia o retorno)
    sendWelcomeEmail(user.email!, user.name).catch((err) => {
      logger.error('AUTH', 'Failed to send welcome email', err instanceof Error ? err : undefined, {
        userId: user.id,
        email: user.email,
      })
    })

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error(
      'AUTH',
      'Registration error',
      error instanceof Error ? error : undefined
    )
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
