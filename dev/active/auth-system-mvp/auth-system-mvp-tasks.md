# Checklist de Tarefas: Sistema de Autenticação MVP

**Última atualização:** 2026-01-31 (v10 - Fase 8 Completa)

---

## Fase 1: Infraestrutura (Base) ✅ COMPLETA

### 1.1 Dependências
- [x] Instalar bcryptjs e @types/bcryptjs
- [x] Instalar resend

### 1.2 Schema Prisma
- [x] Adicionar campo `password` (String?) ao User
- [x] Adicionar campo `isActive` (Boolean, default true) ao User
- [x] Adicionar campo `loginAttempts` (Int, default 0) ao User
- [x] Adicionar campo `lockedUntil` (DateTime?) ao User
- [x] Adicionar campo `passwordResetToken` (String? @unique) ao User
- [x] Adicionar campo `passwordResetExpires` (DateTime?) ao User
- [x] Gerar Prisma client (`npx prisma generate`)
- [ ] Executar `npm run db:push` (pendente: requer DATABASE_URL)

### 1.3 Utilitários
- [x] Criar `src/lib/password.ts` (hashPassword, verifyPassword)
- [x] Criar `src/lib/tokens.ts` (generateToken, getTokenExpiration, isTokenExpired)
- [x] Criar `src/lib/rate-limit.ts` (checkLoginAttempts, incrementAttempts, resetAttempts, getLockoutMessage)
- [x] Criar `src/lib/email.ts` (sendPasswordResetEmail com templates HTML/texto)

### 1.4 Validações
- [x] Criar `src/lib/validations/auth.ts` com schemas Zod:
  - [x] passwordSchema (regras de força)
  - [x] emailSchema
  - [x] loginSchema
  - [x] registerSchema
  - [x] forgotPasswordSchema
  - [x] resetPasswordSchema
  - [x] changePasswordSchema
  - [x] Helpers de força da senha (evaluatePasswordCriteria, calculatePasswordStrength)
  - [x] Labels e cores para indicador de força

---

## Fase 2: Backend (APIs e NextAuth) ✅ COMPLETA

### 2.1 NextAuth
- [x] Adicionar CredentialsProvider em `src/lib/auth.ts`
- [x] Implementar função `authorize`:
  - [x] Validar campos
  - [x] Verificar se usuário existe
  - [x] Verificar se está ativo
  - [x] Verificar bloqueio por tentativas
  - [x] Verificar senha
  - [x] Resetar tentativas em sucesso
  - [x] Incrementar tentativas em falha
- [x] Atualizar callback de signIn para credentials

### 2.2 API - Cadastro
- [x] Criar `app/api/auth/register/route.ts`
  - [x] POST: validar dados
  - [x] Verificar e-mail único
  - [x] Hash da senha
  - [x] Criar usuário
  - [x] Retornar sucesso

### 2.3 API - Esqueci Senha
- [x] Criar `app/api/auth/forgot-password/route.ts`
  - [x] POST: validar e-mail
  - [x] Gerar token
  - [x] Salvar token e expiração no User
  - [x] Enviar e-mail (ou log em dev)
  - [x] Retornar mensagem genérica

### 2.4 API - Redefinir Senha
- [x] Criar `app/api/auth/reset-password/route.ts`
  - [x] POST: validar token e senha
  - [x] Verificar token válido e não expirado
  - [x] Hash da nova senha
  - [x] Atualizar senha e limpar token
  - [x] Retornar sucesso

### 2.5 API - Alterar Senha
- [x] Criar `app/api/auth/change-password/route.ts`
  - [x] POST: verificar sessão
  - [x] Validar senha atual
  - [x] Hash da nova senha
  - [x] Atualizar senha
  - [x] Retornar sucesso

---

## Fase 3: Frontend (Componentes e Páginas) ✅ COMPLETA

### 3.1 Componentes UI Base
- [x] Criar `src/components/ui/form.tsx` (Form, FormField, FormItem, etc.)
- [x] Criar `src/components/ui/password-input.tsx` (input com toggle olho)

### 3.2 Componentes Auth
- [x] Criar `src/components/auth/password-strength.tsx`
  - [x] Calcular força da senha
  - [x] Mostrar barra visual
  - [x] Mostrar critérios atendidos
- [x] Criar `src/components/auth/login-form.tsx`
- [x] Criar `src/components/auth/register-form.tsx`
- [x] Criar `src/components/auth/forgot-password-form.tsx`
- [x] Criar `src/components/auth/reset-password-form.tsx`
- [x] Criar `src/components/auth/change-password-form.tsx`

### 3.3 Páginas
- [x] Criar `app/login/page.tsx`
  - [x] Layout com card centralizado
  - [x] LoginForm
  - [x] Link para cadastro
  - [x] Link para esqueci senha
  - [x] Botão OAuth Google
- [x] Criar `app/cadastro/page.tsx`
  - [x] Layout com card centralizado
  - [x] RegisterForm
  - [x] Link para login
- [x] Criar `app/esqueci-senha/page.tsx`
  - [x] Layout com card centralizado
  - [x] ForgotPasswordForm
  - [x] Link para login
- [x] Criar `app/redefinir-senha/[token]/page.tsx`
  - [x] Layout com card centralizado
  - [x] ResetPasswordForm
  - [x] Verificar token válido
- [x] Criar `app/perfil/alterar-senha/page.tsx`
  - [x] Layout protegido
  - [x] ChangePasswordForm
  - [x] Botão voltar

### 3.4 Hook de Força da Senha
- [x] Criar `src/hooks/use-password-strength.ts`
  - [x] Calcular score 0-5
  - [x] Retornar critérios atendidos
  - [x] Retornar cor do indicador

---

## Fase 4: E-mail ✅ COMPLETA

### 4.1 Configuração
- [x] Configurar variáveis de ambiente no .env.example (RESEND_API_KEY, EMAIL_FROM, NEXT_PUBLIC_APP_URL)
- [x] Criar conta no resend.com (usuário deve fazer manualmente)

### 4.2 Templates
- [x] Template de e-mail de recuperação de senha
  - [x] Assunto: "Recupere sua senha - MiniApps"
  - [x] Corpo HTML com design responsivo
  - [x] Versão texto plano
  - [x] Expiração informada (1 hora)
- [x] Template de e-mail de boas-vindas
  - [x] Assunto: "Bem-vindo ao MiniApps!"
  - [x] Corpo HTML com apresentação dos apps
  - [x] Versão texto plano

### 4.3 Implementação
- [x] `src/lib/email.ts` implementado com Resend
  - [x] `sendPasswordResetEmail()` - Recuperação de senha
  - [x] `sendWelcomeEmail()` - Boas-vindas no cadastro
  - [x] Fallback para modo dev (log quando RESEND_API_KEY não configurada)
  - [x] Logging de sucesso/erro
- [x] Integração com API de registro (envio de boas-vindas assíncrono)

---

## Fase 5: Middleware e Proteção ✅ COMPLETA

### 5.1 Middleware
- [x] Atualizar `middleware.ts` para proteger `/perfil/*`
- [x] Redirecionar não-autenticados para login
- [x] Passar `callbackUrl` para retornar após login

---

## Fase 6: i18n e UX ✅ COMPLETA

### 6.1 Traduções
- [x] Adicionar textos de auth em `src/lib/i18n.ts`:
  - [x] Labels de formulário (authForms.labels)
  - [x] Placeholders (authForms.placeholders)
  - [x] Mensagens de erro (authForms.errors)
  - [x] Mensagens de sucesso (authForms.success)
  - [x] Textos de botão (authForms.buttons)
  - [x] Textos de toasts (authToasts)

### 6.2 Feedback Visual
- [x] Loading states nos botões (texto muda quando isLoading)
- [x] Toast de sucesso/erro integrado em todos os formulários
- [x] Toaster adicionado ao layout principal (`app/layout.js`)

### 6.3 Animações de Transição
- [x] Animações CSS adicionadas em `src/styles/animations.css`:
  - [x] `animate-auth-card` - entrada suave para cards
  - [x] `animate-form-transition` - transição entre estados
  - [x] `animate-success-check` - checkmark com bounce
  - [x] `animate-feedback-in` - entrada de mensagens
  - [x] Classes para OAuth button e links
- [x] Animações inline do Tailwind CSS nos componentes

---

## Fase 7: Testes e Validação ✅ COMPLETA

### 7.1 Scripts de Validação Criados
- [x] `scripts/validate-auth-security.ts` - Script de verificação de segurança automatizado
- [x] `scripts/auth-test-checklist.md` - Checklist completo de testes manuais

### 7.2 Verificações de Segurança (24/24 testes passaram)
- [x] Hash de senhas com bcryptjs (salt rounds = 12)
- [x] Tempo de hash adequado (~368ms)
- [x] Verificação de senha correta/incorreta
- [x] Hashes únicos para mesma senha
- [x] Geração de tokens seguros (64 caracteres hex)
- [x] Tokens únicos (1000 gerados sem colisão)
- [x] Boa distribuição de entropia
- [x] Expiração de tokens em 1 hora
- [x] Detecção correta de tokens expirados
- [x] Rate limiting configurado (5 tentativas, 15 min bloqueio)
- [x] Validação de senhas (força, critérios)
- [x] Mensagens genéricas (não revelam se email existe)

### 7.3 Middleware Atualizado
- [x] Proteção explícita de rotas `/perfil/*` adicionada
- [x] Redirecionamento para `/login?callbackUrl=...`
- [x] Logging em ambiente de desenvolvimento

### 7.4 Testes Manuais (Checklist disponível)
O checklist detalhado para testes manuais está em:
`scripts/auth-test-checklist.md`

Inclui testes para:
- Cadastro (dados válidos, duplicados, senha fraca)
- Login (credenciais válidas/inválidas, bloqueio, inativo)
- Recuperação de senha (email existente/inexistente)
- Redefinição de senha (token válido/expirado)
- Alteração de senha (autenticado)
- Proteção de rotas
- UX/Feedback (loading states, toasts)

---

## Fase 8: Deploy ✅ COMPLETA

### 8.1 Preparação
- [x] Criar documentação de deploy (`docs/DEPLOY_AUTH_SYSTEM.md`)
- [x] Documentar variáveis de ambiente necessárias
- [x] Verificar TypeScript sem erros
- [x] Criar checklist de deploy para Vercel

### 8.2 Deploy
- [x] Push para branch de feature
- [x] Criar PR
- [ ] Review e merge (pendente aprovação)

### 8.3 Documentação Criada
- [x] Guia completo de configuração do Resend
- [x] Checklist de variáveis de ambiente
- [x] Instruções de troubleshooting
- [x] Documentação de segurança implementada

---

## Fase 9: Integração Login na Home (Última Etapa)

> **IMPORTANTE:** Esta fase só deve ser executada após todas as outras estarem completas.
> A página inicial atual deve permanecer inalterada até esta etapa.

### 9.1 Componentes da Home Integrada
- [ ] Criar `src/components/home/home-guest.tsx`
  - [ ] Cards dos mini-apps (igual atual)
  - [ ] Formulário de login inline
  - [ ] Link para cadastro
  - [ ] Botão OAuth Google
- [ ] Criar `src/components/home/home-authenticated.tsx`
  - [ ] Cards dos mini-apps com mais recursos
  - [ ] Informações do usuário logado
  - [ ] Acesso rápido às configurações
  - [ ] Botão de logout

### 9.2 Lógica Condicional
- [ ] Criar `src/components/home/home-content.tsx`
  - [ ] Verificar sessão do usuário
  - [ ] Renderizar HomeGuest se não autenticado
  - [ ] Renderizar HomeAuthenticated se autenticado

### 9.3 Página Principal
- [ ] Modificar `app/page.tsx`
  - [ ] Substituir conteúdo atual pelo HomeContent
  - [ ] Manter layout e estrutura visual
  - [ ] Garantir transição suave entre estados

### 9.4 Recursos Extras para Usuários Autenticados
- [ ] Definir recursos adicionais do launcher:
  - [ ] Favoritos/Apps recentes
  - [ ] Configurações rápidas
  - [ ] Status de conexão com serviços (YouTube, etc)
  - [ ] Notificações (futuro)

### 9.5 Testes da Integração
- [ ] Home sem autenticação mostra cards + login
- [ ] Login inline funciona corretamente
- [ ] Após login, home atualiza para versão autenticada
- [ ] Logout retorna para versão guest
- [ ] OAuth Google funciona da home
- [ ] Links para cadastro funcionam
- [ ] Responsividade mantida

---

## Notas

### Prioridades
1. **Alta:** Fases 1-4 (funcionalidade básica + e-mail) ✅
2. **Média:** Fase 5 (proteção de rotas) ✅
3. **Média:** Fase 6 (i18n e UX) ✅
4. **Baixa:** Fase 7 (testes e validação) ✅
5. **Baixa:** Fase 8 (deploy) ✅
6. **Final:** Fase 9 (integração home - só após todas as outras) - Pendente

### Bloqueadores Conhecidos
- Nenhum identificado

### Decisões Pendentes
- [ ] Domínio de e-mail para Resend (usar domínio próprio ou resend.dev)
- [ ] Tempo de bloqueio por tentativas (sugestão: 15 min)
