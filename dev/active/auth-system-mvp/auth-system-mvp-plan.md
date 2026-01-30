# Plano de Implementação: Sistema de Autenticação MVP

**Status:** Planejado
**Criado em:** 2026-01-30
**Última atualização:** 2026-01-30 (v2 - Adicionada Fase 6: Integração Home)

---

## 1. Visão Geral

Sistema de autenticação com e-mail e senha que coexiste com o OAuth Google existente. O MVP inclui login, cadastro, recuperação de senha e alteração de senha para usuários logados.

---

## 2. Arquitetura Proposta

### 2.1 Estrutura de Pastas

```
MiniApps/
├── prisma/
│   └── schema.prisma                    # Adicionar campos de auth
├── src/
│   ├── lib/
│   │   ├── auth.ts                      # Adicionar CredentialsProvider
│   │   ├── password.ts                  # NOVO: Utilitários de hash
│   │   ├── email.ts                     # NOVO: Serviço de e-mail
│   │   ├── tokens.ts                    # NOVO: Geração de tokens
│   │   ├── rate-limit.ts                # NOVO: Controle de tentativas
│   │   └── validations/
│   │       └── auth.ts                  # NOVO: Schemas Zod
│   ├── components/
│   │   ├── ui/
│   │   │   ├── form.tsx                 # NOVO: Wrapper React Hook Form
│   │   │   └── password-input.tsx       # NOVO: Input com toggle visibilidade
│   │   └── auth/
│   │       ├── login-form.tsx           # NOVO: Formulário de login
│   │       ├── register-form.tsx        # NOVO: Formulário de cadastro
│   │       ├── forgot-password-form.tsx # NOVO: Formulário recuperação
│   │       ├── reset-password-form.tsx  # NOVO: Formulário redefinição
│   │       ├── change-password-form.tsx # NOVO: Formulário alteração
│   │       └── password-strength.tsx    # NOVO: Indicador de força
│   └── hooks/
│       └── use-password-strength.ts     # NOVO: Hook força da senha
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts            # NOVO: API cadastro
│   │   ├── forgot-password/route.ts     # NOVO: API recuperação
│   │   ├── reset-password/route.ts      # NOVO: API redefinição
│   │   └── change-password/route.ts     # NOVO: API alteração
│   ├── login/page.tsx                   # NOVO: Página login
│   ├── cadastro/page.tsx                # NOVO: Página cadastro
│   ├── esqueci-senha/page.tsx           # NOVO: Página recuperação
│   ├── redefinir-senha/[token]/page.tsx # NOVO: Página redefinição
│   └── perfil/
│       └── alterar-senha/page.tsx       # NOVO: Página alteração (protegida)
```

### 2.2 Fluxo de Dados

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Cliente   │────►│  API Route   │────►│  Prisma DB  │
│  (React)    │◄────│  (NextAuth)  │◄────│ (PostgreSQL)│
└─────────────┘     └──────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │   Resend     │
       │            │  (E-mails)   │
       │            └──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  Validações (Zod + React Hook Form)                 │
│  - Cliente: feedback imediato                       │
│  - Servidor: segurança                              │
└─────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Dados

### 3.1 Alterações no Schema Prisma

```prisma
model User {
  id                   String    @id @default(cuid())
  email                String    @unique
  name                 String?
  password             String?   // Nullable para usuários OAuth
  isActive             Boolean   @default(true)
  loginAttempts        Int       @default(0)
  lockedUntil          DateTime?
  passwordResetToken   String?   @unique
  passwordResetExpires DateTime?

  // Campos existentes
  emailVerified        DateTime?
  image                String?
  youtubeChannelId     String?   @unique

  // Relações existentes
  accounts             Account[]
  sessions             Session[]

  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
}
```

### 3.2 Índices Recomendados

```prisma
@@index([email])
@@index([passwordResetToken])
@@index([isActive])
```

---

## 4. Schemas de Validação (Zod)

### 4.1 Regras de Senha

```typescript
const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter pelo menos 1 letra maiúscula")
  .regex(/[0-9]/, "Deve conter pelo menos 1 número")
  .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos 1 caractere especial");
```

### 4.2 Schemas por Funcionalidade

| Schema | Campos |
|--------|--------|
| `loginSchema` | email, password |
| `registerSchema` | email, password, confirmPassword, name |
| `forgotPasswordSchema` | email |
| `resetPasswordSchema` | token, password, confirmPassword |
| `changePasswordSchema` | currentPassword, newPassword, confirmPassword |

---

## 5. Segurança

### 5.1 Hash de Senhas

- **Biblioteca:** bcryptjs (compatível com serverless)
- **Salt rounds:** 12
- **Nunca armazenar senha em texto plano**

### 5.2 Controle de Tentativas

```typescript
// Após 5 tentativas falhas
loginAttempts >= 5 → lockedUntil = now() + 15 minutos

// Após login bem-sucedido
loginAttempts = 0
lockedUntil = null
```

### 5.3 Tokens de Recuperação

- **Geração:** crypto.randomBytes(32).toString('hex')
- **Expiração:** 1 hora
- **Uso único:** deletar após uso

### 5.4 Mensagens Genéricas

```typescript
// ❌ Não fazer
"E-mail não encontrado"
"Senha incorreta"

// ✅ Fazer
"Credenciais inválidas"
"Se o e-mail existir, enviaremos instruções"
```

---

## 6. Dependências

### 6.1 Produção

```json
{
  "bcryptjs": "^2.4.3",
  "resend": "^4.0.0"
}
```

### 6.2 Desenvolvimento

```json
{
  "@types/bcryptjs": "^2.4.6"
}
```

---

## 7. Variáveis de Ambiente

```env
# E-mail (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Existentes (manter)
AUTH_SECRET=
DATABASE_URL=
```

---

## 8. Fases de Implementação

### Fase 1: Infraestrutura (Base)
- Atualizar schema Prisma
- Criar utilitários (password, tokens, rate-limit)
- Instalar dependências

### Fase 2: Backend (APIs)
- Configurar CredentialsProvider no NextAuth
- Criar rotas de API (register, forgot, reset, change)
- Implementar validações server-side

### Fase 3: Frontend (UI)
- Criar componentes de formulário
- Criar páginas de autenticação
- Implementar validações client-side
- Adicionar indicador de força da senha

### Fase 4: E-mail
- Configurar Resend
- Criar templates de e-mail
- Implementar envio de recuperação

### Fase 5: Testes e Polish
- Testar todos os fluxos
- Ajustar UX/feedback
- Verificar segurança

### Fase 6: Integração Login na Home (Última Etapa)
- Manter página inicial atual até esta fase
- Criar versão condicional da home:
  - **Não autenticado:** Cards dos apps + formulário de login inline
  - **Autenticado:** Launcher completo com recursos adicionais
- Substituir página inicial apenas quando toda infraestrutura estiver pronta

---

## 9. Estimativas

| Fase | Complexidade |
|------|--------------|
| Fase 1 | Baixa |
| Fase 2 | Média |
| Fase 3 | Média |
| Fase 4 | Baixa |
| Fase 5 | Baixa |
| Fase 6 | Média |

---

## 10. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Conflito com OAuth existente | Campo `password` nullable, verificar provider |
| Cold start Vercel | bcryptjs (JS puro, sem bindings nativos) |
| Tokens expirados | Verificação de expiração antes de usar |
| E-mail não entregue | Log detalhado, retry com backoff |

---

## 11. Melhorias Futuras (Pós-MVP)

1. **Verificação de e-mail** - Confirmar e-mail no cadastro
2. **2FA/MFA** - Autenticação em dois fatores
3. **OAuth adicional** - GitHub, Microsoft
4. **Histórico de sessões** - Ver/revogar sessões ativas
5. **Audit log** - Log de ações de segurança
