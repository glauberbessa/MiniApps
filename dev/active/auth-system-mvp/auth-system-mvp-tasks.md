# Checklist de Tarefas: Sistema de Autenticação MVP

**Última atualização:** 2026-01-30

---

## Fase 1: Infraestrutura (Base)

### 1.1 Dependências
- [ ] Instalar bcryptjs e @types/bcryptjs
- [ ] Instalar resend

### 1.2 Schema Prisma
- [ ] Adicionar campo `password` (String?) ao User
- [ ] Adicionar campo `isActive` (Boolean, default true) ao User
- [ ] Adicionar campo `loginAttempts` (Int, default 0) ao User
- [ ] Adicionar campo `lockedUntil` (DateTime?) ao User
- [ ] Adicionar campo `passwordResetToken` (String? @unique) ao User
- [ ] Adicionar campo `passwordResetExpires` (DateTime?) ao User
- [ ] Executar `npm run db:push`

### 1.3 Utilitários
- [ ] Criar `src/lib/password.ts` (hashPassword, verifyPassword)
- [ ] Criar `src/lib/tokens.ts` (generateToken)
- [ ] Criar `src/lib/rate-limit.ts` (checkLoginAttempts, incrementAttempts, resetAttempts)
- [ ] Criar `src/lib/email.ts` (sendPasswordResetEmail)

### 1.4 Validações
- [ ] Criar `src/lib/validations/auth.ts` com schemas Zod:
  - [ ] passwordSchema (regras de força)
  - [ ] loginSchema
  - [ ] registerSchema
  - [ ] forgotPasswordSchema
  - [ ] resetPasswordSchema
  - [ ] changePasswordSchema

---

## Fase 2: Backend (APIs e NextAuth)

### 2.1 NextAuth
- [ ] Adicionar CredentialsProvider em `src/lib/auth.ts`
- [ ] Implementar função `authorize`:
  - [ ] Validar campos
  - [ ] Verificar se usuário existe
  - [ ] Verificar se está ativo
  - [ ] Verificar bloqueio por tentativas
  - [ ] Verificar senha
  - [ ] Resetar tentativas em sucesso
  - [ ] Incrementar tentativas em falha
- [ ] Atualizar callback de session para incluir isActive

### 2.2 API - Cadastro
- [ ] Criar `app/api/auth/register/route.ts`
  - [ ] POST: validar dados
  - [ ] Verificar e-mail único
  - [ ] Hash da senha
  - [ ] Criar usuário
  - [ ] Retornar sucesso

### 2.3 API - Esqueci Senha
- [ ] Criar `app/api/auth/forgot-password/route.ts`
  - [ ] POST: validar e-mail
  - [ ] Gerar token
  - [ ] Salvar token e expiração no User
  - [ ] Enviar e-mail (ou log em dev)
  - [ ] Retornar mensagem genérica

### 2.4 API - Redefinir Senha
- [ ] Criar `app/api/auth/reset-password/route.ts`
  - [ ] POST: validar token e senha
  - [ ] Verificar token válido e não expirado
  - [ ] Hash da nova senha
  - [ ] Atualizar senha e limpar token
  - [ ] Retornar sucesso

### 2.5 API - Alterar Senha
- [ ] Criar `app/api/auth/change-password/route.ts`
  - [ ] POST: verificar sessão
  - [ ] Validar senha atual
  - [ ] Hash da nova senha
  - [ ] Atualizar senha
  - [ ] Retornar sucesso

---

## Fase 3: Frontend (Componentes e Páginas)

### 3.1 Componentes UI Base
- [ ] Criar `src/components/ui/form.tsx` (Form, FormField, FormItem, etc.)
- [ ] Criar `src/components/ui/password-input.tsx` (input com toggle olho)

### 3.2 Componentes Auth
- [ ] Criar `src/components/auth/password-strength.tsx`
  - [ ] Calcular força da senha
  - [ ] Mostrar barra visual
  - [ ] Mostrar critérios atendidos
- [ ] Criar `src/components/auth/login-form.tsx`
- [ ] Criar `src/components/auth/register-form.tsx`
- [ ] Criar `src/components/auth/forgot-password-form.tsx`
- [ ] Criar `src/components/auth/reset-password-form.tsx`
- [ ] Criar `src/components/auth/change-password-form.tsx`

### 3.3 Páginas (Rotas Separadas - Temporário)
- [ ] Criar `app/login/page.tsx`
  - [ ] Layout com card centralizado
  - [ ] LoginForm
  - [ ] Link para cadastro
  - [ ] Link para esqueci senha
  - [ ] Botão OAuth Google
- [ ] Criar `app/cadastro/page.tsx`
  - [ ] Layout com card centralizado
  - [ ] RegisterForm
  - [ ] Link para login
- [ ] Criar `app/esqueci-senha/page.tsx`
  - [ ] Layout com card centralizado
  - [ ] ForgotPasswordForm
  - [ ] Link para login
- [ ] Criar `app/redefinir-senha/[token]/page.tsx`
  - [ ] Layout com card centralizado
  - [ ] ResetPasswordForm
  - [ ] Verificar token válido
- [ ] Criar `app/perfil/alterar-senha/page.tsx`
  - [ ] Layout protegido
  - [ ] ChangePasswordForm
  - [ ] Botão voltar

### 3.4 Hook de Força da Senha
- [ ] Criar `src/hooks/use-password-strength.ts`
  - [ ] Calcular score 0-4
  - [ ] Retornar critérios atendidos
  - [ ] Retornar cor do indicador

---

## Fase 4: E-mail

### 4.1 Configuração
- [ ] Configurar Resend API key no .env
- [ ] Criar conta no resend.com (se necessário)

### 4.2 Templates
- [ ] Criar template de e-mail de recuperação
  - [ ] Assunto: "Recupere sua senha"
  - [ ] Corpo: link com token
  - [ ] Expiração informada

### 4.3 Implementação
- [ ] Atualizar `src/lib/email.ts` com Resend
- [ ] Testar envio de e-mail

---

## Fase 5: Middleware e Proteção

### 5.1 Middleware
- [ ] Atualizar `middleware.ts` para proteger `/perfil/*`
- [ ] Redirecionar não-autenticados para login

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

## Fase 8: Integração na Home (ÚLTIMA ETAPA)

**IMPORTANTE:** Esta fase só deve ser iniciada após as Fases 1-7 estarem completas e testadas. A página inicial atual (`app/page.js`) permanece intacta durante todo o desenvolvimento anterior.

### 8.1 Componentes da Home
- [ ] Criar `src/components/home/home-auth-section.tsx`
  - [ ] Container para área de autenticação
  - [ ] Alternar entre login e painel do usuário
- [ ] Criar `src/components/home/home-login-form.tsx`
  - [ ] Versão compacta do LoginForm
  - [ ] Link "Criar conta" (abre modal ou redireciona)
  - [ ] Link "Esqueci minha senha"
  - [ ] Botão Google OAuth
- [ ] Criar `src/components/home/home-user-panel.tsx`
  - [ ] Saudação "Olá, {nome}"
  - [ ] Link para perfil/configurações
  - [ ] Botão sair
- [ ] Criar `src/components/home/register-modal.tsx` (opcional)
  - [ ] Modal com RegisterForm
  - [ ] Ou redirecionar para `/cadastro`

### 8.2 Modificar Página Inicial
- [ ] Converter `app/page.js` para `app/page.tsx`
- [ ] Adicionar verificação de sessão (server component)
- [ ] Implementar layout híbrido:
  - [ ] Lado esquerdo: cards dos apps (sempre visível)
  - [ ] Lado direito: HomeAuthSection
- [ ] Manter responsividade mobile

### 8.3 Ajustar Rotas Antigas
- [ ] Decidir destino de `/login`:
  - [ ] Opção A: Redirecionar para `/`
  - [ ] Opção B: Manter como fallback
- [ ] Decidir destino de `/cadastro`:
  - [ ] Opção A: Redirecionar para `/`
  - [ ] Opção B: Manter como página separada
- [ ] Atualizar links internos (navbar, footer, etc.)

### 8.4 Testes da Integração
- [ ] Home exibe login quando não autenticado
- [ ] Home exibe painel do usuário quando autenticado
- [ ] Login na home funciona corretamente
- [ ] Logout na home funciona corretamente
- [ ] Links para cadastro/esqueci senha funcionam
- [ ] Layout responsivo funciona em mobile
- [ ] Cards dos apps funcionam em ambos os estados

---

## Fase 9: Deploy Final

### 9.1 Preparação
- [ ] Adicionar RESEND_API_KEY na Vercel
- [ ] Verificar variáveis de ambiente
- [ ] Executar build local

### 9.2 Deploy
- [ ] Push para branch de feature
- [ ] Criar PR
- [ ] Review e merge

---

## Resumo das Fases

| Fase | Descrição | Pré-requisito |
|------|-----------|---------------|
| 1 | Infraestrutura | - |
| 2 | Backend/APIs | Fase 1 |
| 3 | Frontend (páginas separadas) | Fase 2 |
| 4 | E-mail | Fase 2 |
| 5 | Middleware/Proteção | Fase 3 |
| 6 | i18n/UX | Fase 3 |
| 7 | Testes | Fases 1-6 |
| **8** | **Integração na Home** | **Fases 1-7 completas** |
| 9 | Deploy | Fase 8 |

---

## Notas

### Prioridades
1. **Alta:** Fases 1-3 (funcionalidade básica)
2. **Média:** Fases 4-6 (e-mail, proteção, polish)
3. **Baixa:** Fase 7 (testes)
4. **Final:** Fase 8 (integração na home)

### Bloqueadores Conhecidos
- Nenhum identificado

### Decisões Pendentes
- [ ] Domínio de e-mail para Resend (usar domínio próprio ou resend.dev)
- [ ] Tempo de bloqueio por tentativas (sugestão: 15 min)
- [ ] Cadastro na home: modal ou página separada?
