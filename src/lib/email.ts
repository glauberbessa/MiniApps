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

// Cores do tema
const THEME = {
  primary: '#667eea',
  primaryDark: '#764ba2',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  textDark: '#111827',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  background: '#f9fafb',
}

export interface EmailResult {
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

/**
 * Envia e-mail de boas-vindas para novos usuários
 * @param email - E-mail do destinatário
 * @param name - Nome do usuário (opcional)
 * @returns Resultado do envio
 */
export async function sendWelcomeEmail(
  email: string,
  name?: string | null
): Promise<EmailResult> {
  const loginUrl = `${APP_URL}/login`
  const displayName = name || email.split('@')[0]

  // Em desenvolvimento sem API key, apenas log
  if (!resend) {
    logger.info('AUTH', 'Welcome email (dev mode)', {
      email,
      name: displayName,
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
      subject: `Bem-vindo ao ${APP_NAME}!`,
      html: getWelcomeEmailHtml(displayName, loginUrl),
      text: getWelcomeEmailText(displayName, loginUrl),
    })

    if (error) {
      logger.error('AUTH', 'Failed to send welcome email', undefined, {
        email,
        error: error.message,
      })
      return { success: false, error: error.message }
    }

    logger.info('AUTH', 'Welcome email sent', {
      email,
      messageId: data?.id,
    })

    return { success: true, messageId: data?.id }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    logger.error('AUTH', 'Exception sending welcome email', undefined, {
      email,
      error: errorMessage,
    })
    return { success: false, error: errorMessage }
  }
}

/**
 * Template HTML do e-mail de boas-vindas
 */
function getWelcomeEmailHtml(name: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao ${APP_NAME}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: ${THEME.gradient}; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${APP_NAME}</h1>
  </div>

  <div style="background: ${THEME.background}; padding: 30px; border: 1px solid ${THEME.border}; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: ${THEME.textDark}; margin-top: 0;">Bem-vindo, ${name}!</h2>

    <p>Sua conta foi criada com sucesso. Agora você tem acesso a todos os mini-apps da plataforma:</p>

    <ul style="color: ${THEME.textMuted}; padding-left: 20px;">
      <li><strong>YT Playlist Manager</strong> - Gerencie suas playlists do YouTube</li>
      <li><strong>Scanner QR/Barcode</strong> - Escaneie códigos QR e de barras</li>
      <li>E muito mais em breve...</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}"
         style="background: ${THEME.gradient};
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                display: inline-block;">
        Acessar Minha Conta
      </a>
    </div>

    <hr style="border: none; border-top: 1px solid ${THEME.border}; margin: 20px 0;">

    <p style="color: ${THEME.textLight}; font-size: 12px; margin-bottom: 0;">
      Se você não criou esta conta, por favor ignore este e-mail ou entre em contato conosco.
    </p>
  </div>
</body>
</html>
`
}

/**
 * Template texto do e-mail de boas-vindas
 */
function getWelcomeEmailText(name: string, loginUrl: string): string {
  return `
${APP_NAME} - Bem-vindo!

Olá ${name},

Sua conta foi criada com sucesso. Agora você tem acesso a todos os mini-apps da plataforma:

- YT Playlist Manager - Gerencie suas playlists do YouTube
- Scanner QR/Barcode - Escaneie códigos QR e de barras
- E muito mais em breve...

Acesse sua conta em: ${loginUrl}

Se você não criou esta conta, por favor ignore este e-mail.
`.trim()
}
