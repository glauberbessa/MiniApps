# Deploy no Vercel - Configuração de Monorepo

Este guia explica como fazer deploy do MiniApps no Vercel usando a estratégia de múltiplos projetos com rewrites.

## Arquitetura

- **Projeto Principal (Launcher)**: Página inicial em `/`
- **YTPlaylistManagerPro**: App separado acessível via `/ytpm`
- **ScanQRCodeBar**: App separado acessível via `/scanner`

## Passos para Deploy

### 1. Deploy dos Apps Individuais

Primeiro, faça deploy de cada app individualmente no Vercel:

#### a) Deploy do YTPlaylistManagerProWeb

```bash
cd YTPlaylistManagerProWeb
vercel
```

- Escolha criar um novo projeto ou linkar a um existente
- Anote a URL de produção (ex: `ytpm-miniapps.vercel.app`)
- Configure as variáveis de ambiente necessárias (API keys do YouTube, etc)

#### b) Deploy do ScanQRCodeBar

```bash
cd ../ScanQRCodeBar
vercel
```

- Escolha criar um novo projeto ou linkar a um existente
- Anote a URL de produção (ex: `scanner-miniapps.vercel.app`)

### 2. Configurar o Projeto Principal (Launcher)

#### a) Atualizar o vercel.json

Edite o arquivo `vercel.json` na raiz do projeto e substitua as URLs pelos seus domínios reais:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1"],
  "rewrites": [
    {
      "source": "/ytpm",
      "destination": "https://ytpm-miniapps.vercel.app"
    },
    {
      "source": "/ytpm/:path*",
      "destination": "https://ytpm-miniapps.vercel.app/:path*"
    },
    {
      "source": "/scanner",
      "destination": "https://scanner-miniapps.vercel.app"
    },
    {
      "source": "/scanner/:path*",
      "destination": "https://scanner-miniapps.vercel.app/:path*"
    }
  ]
}
```

#### b) Deploy do Launcher

```bash
# Volte para a raiz do projeto
cd ..

# Faça o deploy
vercel
```

### 3. Como Funciona

#### Desenvolvimento Local

Quando você executa `npm run dev:all`:
- Launcher roda em `http://localhost:3000`
- YTPM roda em `http://localhost:3001`
- Scanner roda em `http://localhost:3002`
- Os botões abrem os apps em **nova aba** (target="_blank")
- O `next.config.js` usa rewrites para fazer proxy das requisições

#### Produção (Vercel)

Quando deploy no Vercel:
- Launcher está em `https://seu-dominio.vercel.app`
- `/ytpm` faz rewrite para o projeto YTPM no Vercel
- `/scanner` faz rewrite para o projeto Scanner no Vercel
- Os botões navegam na **mesma aba** (target="_self")
- Cada app roda em seu próprio projeto Vercel

## Vantagens desta Abordagem

1. ✅ **Isolamento**: Cada app tem seu próprio ambiente, variáveis e configurações
2. ✅ **Escalabilidade**: Cada app escala independentemente
3. ✅ **Deploy Independente**: Você pode atualizar um app sem afetar os outros
4. ✅ **URLs Simples**: Os usuários veem URLs limpas como `/ytpm` e `/scanner`
5. ✅ **Funciona Local e em Produção**: Sem necessidade de configurações adicionais

## Variáveis de Ambiente

### YTPlaylistManagerProWeb
Configure no projeto do Vercel:
- `YOUTUBE_API_KEY`
- `DATABASE_URL`
- Outras variáveis necessárias (veja `.env.example`)

### ScanQRCodeBar
Geralmente não precisa de variáveis especiais, pois roda no cliente.

### Launcher (Projeto Principal)
Não precisa de variáveis de ambiente especiais. Os rewrites são configurados no `vercel.json`.

## Troubleshooting

### Os apps não carregam no path correto

Certifique-se de que:
1. As URLs no `vercel.json` estão corretas
2. Os projetos dos apps foram deployados com sucesso
3. Você fez redeploy do launcher após atualizar o `vercel.json`

### CORS errors

Os rewrites do Vercel mantêm o mesmo domínio, então não deve haver problemas de CORS. Se houver:
1. Verifique se as URLs no `vercel.json` não têm barras finais
2. Certifique-se de que os apps não têm configurações de CORS muito restritivas

### Desenvolvimento local não funciona

Execute todos os apps simultaneamente:
```bash
npm run dev:all
```

Ou execute cada um manualmente em terminais separados:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:ytpm

# Terminal 3
npm run dev:scanner
```

## Atualizando os Apps

Para atualizar um app específico:

```bash
cd YTPlaylistManagerProWeb  # ou ScanQRCodeBar
git pull
vercel --prod
```

O launcher continuará funcionando e apontando automaticamente para a nova versão.
