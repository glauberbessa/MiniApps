/**
 * API de Alterar Senha
 * POST /api/auth/change-password
 *
 * Permite que usuário logado altere sua senha
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validations/auth'
import { hashPassword, verifyPassword } from '@/lib/password'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Verificar se usuário está autenticado
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar dados de entrada
    const result = changePasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = result.data
    const userId = session.user.id

    // Buscar usuário com senha atual
    const { data: user, error: findError } = await supabase
      .from('User')
      .select('id, email, password, isActive')
      .eq('id', userId)
      .single()

    if (findError && findError.code !== 'PGRST116') throw findError

    // Usuário não encontrado (situação improvável se sessão é válida)
    if (!user) {
      logger.error('AUTH', 'Change password attempt for non-existent user', undefined, {
        userId,
      })
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      logger.warn('AUTH', 'Change password attempt for inactive user', {
        userId,
      })
      return NextResponse.json(
        { error: 'Conta não está ativa' },
        { status: 403 }
      )
    }

    // Verificar se usuário tem senha (pode ser conta OAuth-only)
    if (!user.password) {
      logger.warn('AUTH', 'Change password attempt for OAuth-only user', {
        userId,
        email: user.email,
      })
      return NextResponse.json(
        { error: 'Esta conta utiliza login social. Não é possível alterar a senha.' },
        { status: 400 }
      )
    }

    // Verificar senha atual
    const isValidCurrentPassword = await verifyPassword(currentPassword, user.password)
    if (!isValidCurrentPassword) {
      logger.warn('AUTH', 'Change password - invalid current password', {
        userId,
      })
      return NextResponse.json(
        { error: 'Senha atual incorreta' },
        { status: 400 }
      )
    }

    // Gerar hash da nova senha
    const hashedNewPassword = await hashPassword(newPassword)

    // Atualizar senha
    const { error: updateError } = await supabase
      .from('User')
      .update({
        password: hashedNewPassword,
      })
      .eq('id', userId)

    if (updateError) throw updateError

    logger.info('AUTH', 'Password changed successfully', {
      userId,
      email: user.email,
    })

    return NextResponse.json({
      message: 'Senha alterada com sucesso',
    })
  } catch (error) {
    logger.error(
      'AUTH',
      'Change password error',
      error instanceof Error ? error : undefined
    )
    return NextResponse.json(
      { error: 'Erro ao alterar senha. Tente novamente.' },
      { status: 500 }
    )
  }
}
