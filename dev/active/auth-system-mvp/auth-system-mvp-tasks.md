# Checklist de Tarefas: Sistema de Autenticação MVP

**Última atualização:** 2026-01-30 (v7 - Fase 5 Completa)

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

## Fase 6: i18n e UX

### 6.1 Traduções
- [ ] Adicionar textos de auth em `src/lib/i18n.ts`:
  - [ ] Labels de formulário
  - [ ] Mensagens de erro
  - [ ] Mensagens de sucesso
  - [ ] Textos de botão

### 6.2 Feedback Visual
- [ ] Loading states nos botões
- [ ] Toast de sucesso/erro
- [ ] Animações de transição

---

## Fase 7: Testes e Validação

### 7.1 Testes Manuais
- [ ] Cadastro com dados válidos
- [ ] Cadastro com e-mail duplicado
- [ ] Cadastro com senha fraca
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas
- [ ] Login após 5 tentativas (bloqueio)
- [ ] Login com usuário inativo
- [ ] Esqueci senha - e-mail existente
- [ ] Esqueci senha - e-mail inexistente
- [ ] Redefinir senha - token válido
- [ ] Redefinir senha - token expirado
- [ ] Alterar senha - senha atual correta
- [ ] Alterar senha - senha atual incorreta

### 7.2 Segurança
- [ ] Verificar hash de senhas no banco
- [ ] Verificar mensagens genéricas
- [ ] Verificar expiração de tokens
- [ ] Verificar bloqueio por tentativas
- [ ] Verificar HTTPS em produção

---

## Fase 8: Deploy

### 8.1 Preparação
- [ ] Adicionar RESEND_API_KEY na Vercel
- [ ] Verificar variáveis de ambiente
- [ ] Executar build local

### 8.2 Deploy
- [ ] Push para branch de feature
- [ ] Criar PR
- [ ] Review e merge

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
3. **Baixa:** Fases 6-8 (polish, testes e deploy)
4. **Final:** Fase 9 (integração home - só após todas as outras)

### Bloqueadores Conhecidos
- Nenhum identificado

### Decisões Pendentes
- [ ] Domínio de e-mail para Resend (usar domínio próprio ou resend.dev)
- [ ] Tempo de bloqueio por tentativas (sugestão: 15 min)
