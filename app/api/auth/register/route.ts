/**
 * API de Cadastro de Usuário
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
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
    const { data: existingUser, error: findError } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (findError && findError.code !== 'PGRST116') throw findError

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
    const { data: user, error: createError } = await supabase
      .from('User')
      .insert({
        name,
        email,
        password: hashedPassword,
        isActive: true,
      })
      .select('id, name, email, createdAt')
      .single()

    if (createError) throw createError

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
