/**
 * Serviço de envio de e-mails
 * Usa Resend para envio em produção
 */

import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// Inicializa Resend apenas se a API key estiver configurada
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Configurações
const FROM_EMAIL = process.env.EMAIL_FROM || 'MiniApps <noreply@resend.dev>'
const APP_NAME = 'MiniApps'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Envia e-mail de recuperação de senha
 * @param email - E-mail do destinatário
 * @param token - Token de recuperação
 * @returns Resultado do envio
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<EmailResult> {
  const resetUrl = `${APP_URL}/redefinir-senha/${token}`

  // Em desenvolvimento sem API key, apenas log
  if (!resend) {
    logger.info('AUTH', 'Password reset email (dev mode)', {
      email,
      resetUrl,
      message: 'RESEND_API_KEY não configurada - e-mail não enviado',
    })
    return {
      success: true,
      messageId: 'dev-mode-no-email-sent',
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Recupere sua senha - ${APP_NAME}`,
      html: getPasswordResetEmailHtml(resetUrl),
      text: getPasswordResetEmailText(resetUrl),
    })

    if (error) {
      logger.error('AUTH', 'Failed to send password reset email', undefined, {
        email,
        error: error.message,
      })
      return { success: false, error: error.message }
    }

    logger.info('AUTH', 'Password reset email sent', {
      email,
      messageId: data?.id,
    })

    return { success: true, messageId: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    logger.error('AUTH', 'Exception sending password reset email', undefined, {
      email,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

/**
 * Template HTML do e-mail de recuperação
 */
function getPasswordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recupere sua senha</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
  </div>

  <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #111827; margin-top: 0;">Recuperação de Senha</h2>

    <p>Você solicitou a recuperação da sua senha. Clique no botão abaixo para criar uma nova senha:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}"
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                display: inline-block;">
        Redefinir Senha
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px;">
      Este link expira em <strong>1 hora</strong>.
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá inalterada.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0;">
      Se o botão não funcionar, copie e cole este link no seu navegador:<br>
      <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
    </p>
  </div>
</body>
</html>
`
}

/**
 * Template texto do e-mail de recuperação
 */
function getPasswordResetEmailText(resetUrl: string): string {
  return `
${APP_NAME} - Recuperação de Senha

Você solicitou a recuperação da sua senha.

Acesse o link abaixo para criar uma nova senha:
${resetUrl}

Este link expira em 1 hora.

Se você não solicitou esta recuperação, ignore este e-mail. Sua senha permanecerá inalterada.
`.trim()
}
