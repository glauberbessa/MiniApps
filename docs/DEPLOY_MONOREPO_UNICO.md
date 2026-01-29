# Deploy com Monorepo Único no Vercel

## ✅ Configuração Atual: Um Único Projeto no Vercel

Esta configuração permite fazer deploy de todos os apps com **um único projeto no Vercel**.

## Como Funciona

### Estrutura do Projeto

```
MiniApps/
├── app/                    → Launcher (página principal)
│   └── page.js            → Detecta NODE_ENV e usa paths corretos
├── YTPlaylistManagerProWeb/
│   ├── next.config.js     → basePath: '/ytpm'
│   └── ...
├── ScanQRCodeBar/
│   ├── next.config.js     → basePath: '/scanner'
│   └── ...
├── next.config.js         → Rewrites em dev, nada em prod
├── vercel.json            → Build command para todos os apps
└── package.json
```

### Funcionamento por Ambiente

#### 🔧 **Desenvolvimento (Local)**

```bash
npm run dev:all
```

- Launcher: `http://localhost:3000`
- YTPM: `http://localhost:3001` (sem basePath)
- Scanner: `http://localhost:3002` (sem basePath)
- Os rewrites no `next.config.js` fazem proxy de `/ytpm/*` e `/scanner/*`
- Os botões abrem em nova aba

#### 🚀 **Produção (Vercel)**

```
https://seu-projeto.vercel.app/
```

- Launcher: `/` (raiz)
- YTPM: `/ytpm` (com basePath configurado)
- Scanner: `/scanner` (com basePath configurado)
- Tudo em um único deploy
- Os botões navegam na mesma aba

## Deploy no Vercel

### 1. Conectar o Repositório

1. Acesse https://vercel.com/new
2. Importe seu repositório do GitHub
3. Configure o projeto:
   - **Framework**: Next.js
   - **Root Directory**: `.` (raiz - deixe em branco)
   - **Build Command**: (será sobrescrito pelo vercel.json)
   - **Output Directory**: `.next` (padrão)

### 2. Variáveis de Ambiente

Adicione as variáveis necessárias para o YTPM:

```
YOUTUBE_API_KEY=sua_chave_aqui
DATABASE_URL=sua_url_do_banco
NEXTAUTH_SECRET=seu_secret
NEXTAUTH_URL=https://seu-projeto.vercel.app
```

**Importante**: O `NEXTAUTH_URL` deve apontar para o domínio principal, não para `/ytpm`.

### 3. Deploy

```bash
git push origin main
```

O Vercel vai:
1. Instalar dependências da raiz
2. Buildar o launcher
3. Entrar em `YTPlaylistManagerProWeb`, instalar e buildar
4. Entrar em `ScanQRCodeBar`, instalar e buildar
5. Fazer deploy de tudo junto

### 4. Acessar

```
https://seu-projeto.vercel.app/          → Launcher
https://seu-projeto.vercel.app/ytpm      → YT Playlist Manager
https://seu-projeto.vercel.app/scanner   → Scanner
```

## Como o basePath Funciona

### YTPlaylistManagerProWeb

```javascript
// next.config.js
const nextConfig = {
  basePath: '/ytpm',  // Serve tudo em /ytpm/*
  // ...
}
```

Isso significa:
- Todas as rotas do app são prefixadas com `/ytpm`
- `pages/index.js` → `/ytpm/`
- `pages/about.js` → `/ytpm/about`
- Assets também são prefixados: `/_next/static/*` → `/ytpm/_next/static/*`

### ScanQRCodeBar

```javascript
// next.config.js
const nextConfig = {
  basePath: '/scanner',  // Serve tudo em /scanner/*
  // ...
}
```

## Vantagens desta Abordagem

✅ **Um único deploy**: Push uma vez, tudo atualiza
✅ **Um único domínio**: Sem CORS, cookies compartilhados
✅ **Mais simples**: Não precisa gerenciar múltiplos projetos
✅ **URLs limpas**: `/ytpm`, `/scanner`
✅ **Funciona local e produção**: Sem config adicional

## Desvantagens

❌ **Build mais demorado**: Builda todos os apps toda vez
❌ **Um erro quebra tudo**: Se um app falhar no build, o deploy falha
❌ **Variáveis globais**: Variáveis de ambiente são compartilhadas

## Troubleshooting

### ❌ Build falha no Vercel

**Problema**: Um dos apps não consegue buildar

**Solução**:
```bash
# Teste local
npm run build
cd YTPlaylistManagerProWeb && npm install && npm run build
cd ../ScanQRCodeBar && npm install && npm run build
```

### ❌ Apps não carregam em /ytpm ou /scanner

**Problema**: 404 ao acessar os subpaths

**Solução**:
1. Verifique se o basePath está configurado nos `next.config.js` dos apps
2. Confirme que os apps foram buildados com sucesso
3. Verifique os logs de build no Vercel

### ❌ Assets não carregam (CSS, JS, imagens)

**Problema**: 404 para `/_next/static/*`

**Solução**:
- O basePath deve estar configurado corretamente
- Em produção, o Next.js automaticamente prefixa os assets
- Verifique se você não está usando URLs absolutas nos apps

### ❌ Links internos não funcionam

**Problema**: Links do Next.js não respeitam o basePath

**Solução**:
```javascript
// ❌ Errado
<Link href="/dashboard">Dashboard</Link>

// ✅ Correto (Next.js adiciona basePath automaticamente)
<Link href="/dashboard">Dashboard</Link>

// O Next.js transforma automaticamente para /ytpm/dashboard
```

### ❌ Environment variables não funcionam

**Problema**: Apps não conseguem acessar variáveis de ambiente

**Solução**:
- Adicione as variáveis no dashboard do Vercel
- Variáveis que começam com `NEXT_PUBLIC_` ficam disponíveis no client
- Outras variáveis só ficam disponíveis no servidor

## Build Local para Testar

Para testar como vai funcionar em produção:

```bash
# 1. Build de todos os apps
npm run build
cd YTPlaylistManagerProWeb && npm install && npm run build && cd ..
cd ScanQRCodeBar && npm install && npm run build && cd ..

# 2. Start em modo produção
NODE_ENV=production npm run start

# 3. Acesse
# http://localhost:3000/
# http://localhost:3000/ytpm
# http://localhost:3000/scanner
```

## Alternativa: Scripts NPM

Você pode adicionar um script para facilitar:

```json
{
  "scripts": {
    "build:all": "npm run build && cd YTPlaylistManagerProWeb && npm install && npm run build && cd ../ScanQRCodeBar && npm install && npm run build",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:ytpm\" \"npm run dev:scanner\""
  }
}
```

Então:
```bash
npm run build:all  # Build de tudo
```

## Migração para Deploy Separado

Se você quiser voltar para deploy separado no futuro:

1. Remova o `basePath` dos `next.config.js` dos apps
2. Altere o `vercel.json` para usar rewrites externos
3. Crie 3 projetos no Vercel
4. Siga o guia em `DEPLOY_SIMPLES.md`

## Conclusão

Esta configuração é ideal para:
- ✅ Projetos pequenos a médios
- ✅ Apps que compartilham domínio e sessão
- ✅ Desenvolvimento simples sem complexidade

**Tudo funcionando com um único `git push`!** 🚀
