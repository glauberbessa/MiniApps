# Deploy do Sistema de Autenticação - MiniApps

Guia para configurar o sistema de autenticação com e-mail/senha na Vercel.

## Pré-requisitos

- Projeto MiniApps já configurado na Vercel
- Banco de dados PostgreSQL (Supabase) configurado
- Conta no Google Cloud para OAuth (já existente)

## Variáveis de Ambiente

### Variáveis Obrigatórias

Configure estas variáveis no painel da Vercel em **Settings > Environment Variables**:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do projeto Supabase | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço Supabase (para servidor) | `eyJhbGciOiJIUzI1NiIs...` |
| `AUTH_SECRET` | Segredo para JWT (32+ caracteres) | Gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL base do app | `https://miniapps.vercel.app` |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth Google | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Segredo do cliente OAuth | `GOCSPX-xxx` |

### Variáveis para E-mail (Resend)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `RESEND_API_KEY` | API key do Resend | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Remetente dos e-mails | `MiniApps <noreply@resend.dev>` |
| `NEXT_PUBLIC_APP_URL` | URL pública do app | `https://miniapps.vercel.app` |

## Configurar Resend

### 1. Criar Conta

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Verifique seu e-mail

### 2. Obter API Key

1. Vá em **API Keys** no dashboard
2. Clique em **Create API Key**
3. Dê um nome (ex: "MiniApps Production")
4. Copie a chave gerada (começa com `re_`)
5. Adicione como `RESEND_API_KEY` na Vercel

### 3. Configurar Domínio (Opcional)

Por padrão, os e-mails são enviados de `noreply@resend.dev`.

Para usar seu próprio domínio:

1. Vá em **Domains** no dashboard do Resend
2. Adicione seu domínio
3. Configure os registros DNS indicados
4. Aguarde verificação
5. Atualize `EMAIL_FROM` para usar seu domínio

## Configurar Banco de Dados

### Configurar Supabase

O sistema de autenticação usa Supabase PostgreSQL para armazenar dados de usuários e sessões.

#### Passo 1: Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto (escolha uma senha forte)
3. Vá em **Settings > API** para copiar as credenciais:
   - `SUPABASE_URL` - URL do projeto
   - `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (use a anon key para cliente)

#### Passo 2: Criar Tabelas

A aplicação automaticamente verifica e cria as tabelas necessárias na inicialização. As tabelas criadas são:

- **User** - Usuários com autenticação (email/senha e OAuth)
- **Account** - Contas OAuth vinculadas (Google, etc)
- **Session** - Sessões de usuários
- **VerificationToken** - Tokens para reset de senha
- **PlaylistConfig** - Configurações de playlists (YTPM)
- **ChannelConfig** - Configurações de canais (YTPM)
- **QuotaHistory** - Histórico de quota de API (YTPM)

#### Passo 3: Configurar Variáveis no Vercel

Configure `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no painel da Vercel em **Settings > Environment Variables**.

### Campos do Usuário

O sistema de autenticação adiciona estes campos ao modelo User:

```sql
password             TEXT        -- Hash bcrypt da senha
isActive             BOOLEAN     -- Status da conta (padrão: true)
loginAttempts        INTEGER     -- Contador de tentativas falhadas (padrão: 0)
lockedUntil          TIMESTAMP   -- Data até quando a conta está bloqueada
passwordResetToken   TEXT UNIQUE -- Token para reset de senha
passwordResetExpires TIMESTAMP   -- Expiração do token de reset
youtubeChannelId     TEXT UNIQUE -- Canal YouTube associado (para YTPM)
```

## Rotas da Aplicação

### Públicas (não requerem autenticação)

| Rota | Descrição |
|------|-----------|
| `/login` | Página de login |
| `/cadastro` | Página de cadastro |
| `/esqueci-senha` | Solicitar recuperação de senha |
| `/redefinir-senha/[token]` | Redefinir senha com token |

### Protegidas (requerem autenticação)

| Rota | Descrição |
|------|-----------|
| `/perfil/*` | Todas as páginas de perfil |
| `/perfil/alterar-senha` | Alterar senha do usuário |

## Endpoints de API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/register` | POST | Criar nova conta |
| `/api/auth/forgot-password` | POST | Solicitar recuperação |
| `/api/auth/reset-password` | POST | Redefinir senha |
| `/api/auth/change-password` | POST | Alterar senha (autenticado) |

## Checklist de Deploy

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] `RESEND_API_KEY` configurada (ou e-mails serão apenas logados)
- [ ] `DATABASE_URL` aponta para banco de produção
- [ ] `NEXTAUTH_URL` aponta para URL de produção
- [ ] `NEXT_PUBLIC_APP_URL` aponta para URL de produção

### Após o Deploy

- [ ] Acessar `/login` e verificar se página carrega
- [ ] Testar cadastro com e-mail válido
- [ ] Verificar se e-mail de boas-vindas foi recebido
- [ ] Testar login com credenciais criadas
- [ ] Testar "Esqueci minha senha"
- [ ] Verificar se e-mail de recuperação foi recebido
- [ ] Testar redefinição de senha com token
- [ ] Testar login com Google OAuth (já existente)
- [ ] Acessar `/perfil/alterar-senha` logado

## Segurança

### Implementada

- Senhas hasheadas com bcrypt (12 salt rounds)
- Tokens de recuperação criptograficamente seguros
- Expiração de tokens em 1 hora
- Bloqueio após 5 tentativas falhas (15 minutos)
- Mensagens genéricas (não revelam se e-mail existe)
- Proteção de rotas via middleware
- Validação dupla (cliente + servidor)

### Recomendações Adicionais

1. **HTTPS**: Vercel já fornece SSL automaticamente
2. **Rate Limiting**: Considere adicionar rate limiting adicional via Vercel Edge
3. **Monitoramento**: Configure alertas para tentativas de login falhas em massa
4. **Backup**: Mantenha backups regulares do banco de dados

## Troubleshooting

### E-mails não estão sendo enviados

1. Verifique se `RESEND_API_KEY` está configurada
2. Verifique os logs no dashboard do Resend
3. Em desenvolvimento, e-mails são apenas logados no console

### Erro "Invalid credentials"

1. Verifique se a senha está correta
2. Verifique se a conta não está bloqueada (5 tentativas)
3. Aguarde 15 minutos se estiver bloqueada

### Token de recuperação inválido

1. Tokens expiram em 1 hora
2. Tokens são de uso único
3. Solicite um novo link de recuperação

### Usuário não consegue fazer login após OAuth

Se o usuário criou conta via Google OAuth, ele não tem senha definida. Opções:

1. Continuar usando login via Google
2. Usar "Esqueci minha senha" para definir uma senha

## Logs e Monitoramento

O sistema usa o logger centralizado em `src/lib/logger.ts`:

```typescript
// Categorias de log para autenticação
LogCategory.AUTH - Eventos de autenticação
LogCategory.API_ROUTE - Requisições de API
```

Logs são exibidos no painel de Functions da Vercel.
