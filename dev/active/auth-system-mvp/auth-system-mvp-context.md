# Contexto: Sistema de Autenticação MVP

**Última atualização:** 2026-01-31 (v8 - Fase 6 Completa)

---

## Status do Projeto

| Fase | Status |
|------|--------|
| Fase 1: Infraestrutura | ✅ Completa |
| Fase 2: Backend | ✅ Completa |
| Fase 3: Frontend | ✅ Completa |
| Fase 4: E-mail | ✅ Completa |
| Fase 5: Middleware | ✅ Completa |
| Fase 6: i18n e UX | ✅ Completa |
| Fase 7: Testes | Pendente |
| Fase 8: Deploy | Pendente |
| Fase 9: Integração Home | Pendente |

---

## Arquivos-Chave para Modificação

### Configuração Principal

| Arquivo | Ação | Status | Descrição |
|---------|------|--------|-----------|
| `prisma/schema.prisma` | MODIFICAR | ✅ | Campos de auth adicionados ao User |
| `package.json` | MODIFICAR | ✅ | bcryptjs e resend adicionados |
| `src/lib/auth.ts` | MODIFICAR | ✅ | CredentialsProvider adicionado |
| `middleware.ts` | MODIFICAR | ✅ | Proteger rotas /perfil/* com auth wrapper |
| `.env` | MODIFICAR | ✅ (vars em .env.example) | Adicionar RESEND_API_KEY e EMAIL_FROM |

### Novos Arquivos - Utilitários (Fase 1 - ✅ CRIADOS)

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/lib/password.ts` | ✅ | Hash e verificação de senhas (bcryptjs, 12 salt rounds) |
| `src/lib/email.ts` | ✅ | Serviço de e-mails (Resend): recuperação de senha + boas-vindas |
| `src/lib/tokens.ts` | ✅ | Geração de tokens seguros (crypto.randomBytes) |
| `src/lib/rate-limit.ts` | ✅ | Controle de tentativas (5 tentativas, 15min bloqueio) |
| `src/lib/validations/auth.ts` | ✅ | Schemas Zod + helpers de força da senha |

### Novos Arquivos - Componentes (Fase 3 - ✅ CRIADOS)

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `src/components/ui/form.tsx` | ✅ | Wrapper React Hook Form (shadcn/ui) |
| `src/components/ui/password-input.tsx` | ✅ | Input com toggle visibilidade (olho) |
| `src/components/auth/login-form.tsx` | ✅ | Formulário de login com validação |
| `src/components/auth/register-form.tsx` | ✅ | Formulário de cadastro com indicador de força |
| `src/components/auth/forgot-password-form.tsx` | ✅ | Formulário recuperação de senha |
| `src/components/auth/reset-password-form.tsx` | ✅ | Formulário redefinição de senha |
| `src/components/auth/change-password-form.tsx` | ✅ | Formulário alteração de senha |
| `src/components/auth/password-strength.tsx` | ✅ | Indicador visual de força da senha |
| `src/hooks/use-password-strength.ts` | ✅ | Hook para cálculo de força da senha |

### Novos Arquivos - APIs (Fase 2 - ✅ CRIADOS)

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `app/api/auth/register/route.ts` | ✅ | Endpoint de cadastro |
| `app/api/auth/forgot-password/route.ts` | ✅ | Endpoint recuperação |
| `app/api/auth/reset-password/route.ts` | ✅ | Endpoint redefinição |
| `app/api/auth/change-password/route.ts` | ✅ | Endpoint alteração |

### Novos Arquivos - Páginas (Fase 3 - ✅ CRIADOS)

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `app/login/page.tsx` | ✅ | Página de login (card centralizado, OAuth Google) |
| `app/login/google-button.tsx` | ✅ | Botão de login com Google |
| `app/cadastro/page.tsx` | ✅ | Página de cadastro |
| `app/esqueci-senha/page.tsx` | ✅ | Página esqueci senha |
| `app/redefinir-senha/[token]/page.tsx` | ✅ | Página redefinir senha (validação de token) |
| `app/perfil/alterar-senha/page.tsx` | ✅ | Página alterar senha (protegida) |

### Arquivos Modificados - Fase 6 (i18n e UX) ✅

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/lib/i18n.ts` | MODIFICADO | Adicionado `authForms` e `authToasts` com textos centralizados |
| `app/layout.js` | MODIFICADO | Adicionado componente `<Toaster />` |
| `src/components/auth/login-form.tsx` | MODIFICADO | Textos do i18n, toasts, loading state |
| `src/components/auth/register-form.tsx` | MODIFICADO | Textos do i18n, toasts, loading state |
| `src/components/auth/forgot-password-form.tsx` | MODIFICADO | Textos do i18n, toasts, loading state |
| `src/components/auth/reset-password-form.tsx` | MODIFICADO | Textos do i18n, toasts, loading state |
| `src/components/auth/change-password-form.tsx` | MODIFICADO | Textos do i18n, toasts, loading state |
| `src/styles/animations.css` | MODIFICADO | Animações específicas para autenticação |

### Novos Arquivos - Integração Home (Fase 9 - Última Etapa)

| Arquivo | Descrição |
|---------|-----------|
| `src/components/home/home-guest.tsx` | Home para visitantes (cards + login) |
| `src/components/home/home-authenticated.tsx` | Home para usuários logados |
| `src/components/home/home-content.tsx` | Componente condicional da home |
| `app/page.tsx` | MODIFICAR apenas na Fase 9 |

---

## Decisões Arquiteturais

### 1. bcryptjs vs bcrypt

**Decisão:** Usar `bcryptjs`

**Justificativa:**
- Pure JavaScript, sem bindings nativos
- Compatível com Vercel serverless
- Sem problemas de build em diferentes plataformas
- Performance suficiente para MVP

### 2. Estrutura de Rotas

**Decisão:** Rotas em português no path raiz

**Justificativa:**
- Aplicação em pt-BR
- Melhor UX para usuários brasileiros
- URLs amigáveis: `/login`, `/cadastro`, `/esqueci-senha`

### 3. Coexistência OAuth + Credentials

**Decisão:** Campo `password` nullable no User

**Justificativa:**
- Usuários podem ter conta OAuth sem senha
- Usuários podem ter conta com senha sem OAuth
- Usuários podem ter ambos (vincular depois)

### 4. Serviço de E-mail

**Decisão:** Resend

**Justificativa:**
- API moderna e simples
- Free tier generoso (100 e-mails/dia)
- Ótima deliverability
- SDK TypeScript oficial

### 5. Tokens de Recuperação

**Decisão:** Campo direto no User (não tabela separada)

**Justificativa:**
- Simplicidade para MVP
- Um token por usuário por vez
- Fácil verificação e limpeza

### 6. Integração Login na Home

**Decisão:** Implementar apenas na última fase (Fase 9)

**Justificativa:**
- Manter app funcional durante todo o desenvolvimento
- Página atual continua funcionando enquanto auth é desenvolvido
- Substituição só ocorre quando toda infraestrutura está pronta
- Reduz risco de breaking changes durante desenvolvimento

**Comportamento:**
- **Não autenticado:** Mostra cards dos apps + formulário de login inline
- **Autenticado:** Mostra launcher completo com recursos extras (favoritos, configs, status)

### 7. NextAuth v5 com auth()

**Decisão:** Usar a função `auth()` exportada do NextAuth v5

**Justificativa:**
- NextAuth v5 não exporta mais `getServerSession`
- A função `auth()` é a nova forma de obter sessão no servidor
- Importar diretamente de `@/lib/auth` para manter consistência

### 8. Middleware com auth wrapper (Fase 5)

**Decisão:** Usar `auth()` como middleware wrapper

**Implementação:**
```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export const middleware = auth((request) => {
  const session = request.auth;

  // Proteção de rotas
  if (isProtectedRoute(url.pathname) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
});
```

**Rotas protegidas:**
- `/perfil/*` - Todas as páginas de perfil

**Comportamento:**
- Se não autenticado → Redireciona para `/login?callbackUrl=/perfil/...`
- Se autenticado → Permite acesso normalmente
- Mantém limpeza de cookies PKCE para rotas `/api/auth/*`

---

## Padrões a Seguir

### Validação

```typescript
// 1. Schema Zod
const schema = z.object({ ... });

// 2. Validar no cliente (React Hook Form)
const form = useForm({ resolver: zodResolver(schema) });

// 3. Validar no servidor (API route)
const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

### Mensagens de Erro

```typescript
// Usar i18n centralizado
import { UI_TEXT } from '@/lib/i18n';

return { error: UI_TEXT.auth.invalidCredentials };
```

### Componentes de Formulário

```typescript
// Seguir padrão shadcn/ui
<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>E-mail</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### Logging

```typescript
import { logger } from '@/lib/logger';

logger.info('AUTH', 'User registered', { email });
logger.error('AUTH', 'Login failed', undefined, { email, reason });
```

---

## Referências do Projeto Existente

### Componentes UI Existentes

- `src/components/ui/input.tsx` - Input base
- `src/components/ui/button.tsx` - Botões com variantes
- `src/components/ui/card.tsx` - Cards para layouts
- `src/components/ui/alert.tsx` - Alertas de erro
- `src/components/ui/toast.tsx` - Notificações

### Hooks Existentes

- `src/hooks/use-toast.ts` - Toast notifications

### Configuração NextAuth v5 Atual

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [GoogleProvider({ ... }), CredentialsProvider({ ... })],
  callbacks: { signIn, jwt, session },
  pages: { signIn: "/ytpm/login" },
});

// Helper para obter sessão
export async function getAuthSession() {
  return await auth();
}
```

### Schema Prisma Atualizado (User) - Fase 1 ✅

```prisma
model User {
  id               String    @id @default(cuid())
  name             String?
  email            String?   @unique
  emailVerified    DateTime?
  image            String?
  youtubeChannelId String?   @unique

  // Campos de autenticação por senha (NOVOS)
  password             String?   // Nullable para usuários OAuth
  isActive             Boolean   @default(true)
  loginAttempts        Int       @default(0)
  lockedUntil          DateTime?
  passwordResetToken   String?   @unique
  passwordResetExpires DateTime?

  accounts         Account[]
  sessions         Session[]
  playlistConfigs  PlaylistConfig[]
  channelConfigs   ChannelConfig[]
  quotaHistories   QuotaHistory[]

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([email])
  @@index([passwordResetToken])
  @@index([isActive])
}
```

---

## Variáveis de Ambiente Necessárias

```env
# Nova (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx

# Opcional (override URL)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Existentes (já configuradas)
AUTH_SECRET=xxx
NEXTAUTH_URL=xxx
DATABASE_URL=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## Comandos Úteis

```bash
# Instalar dependências
npm install bcryptjs resend
npm install -D @types/bcryptjs

# Atualizar banco de dados
npm run db:push

# Verificar schema
npx prisma format

# Abrir Prisma Studio
npm run db:studio

# Build para verificar erros
npm run build

# Lint
npm run lint
```
