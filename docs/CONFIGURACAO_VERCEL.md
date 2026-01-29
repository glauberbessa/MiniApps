# Configuração no Vercel - Passo a Passo

## Resumo da Estratégia

Você vai criar **3 projetos separados** no Vercel:
1. **miniapps-ytpm** - YTPlaylistManagerProWeb
2. **miniapps-scanner** - ScanQRCodeBar
3. **miniapps-launcher** - Página inicial (conecta os outros via rewrites)

---

## Passo 1: Deploy do YTPlaylistManagerProWeb

### Via CLI (Recomendado)

```bash
cd YTPlaylistManagerProWeb
vercel
```

### Via Dashboard do Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub
3. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `YTPlaylistManagerProWeb`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

4. **Variáveis de Ambiente** (clique em "Environment Variables"):
   - Adicione as variáveis necessárias do `.env.example`
   - Exemplo: `YOUTUBE_API_KEY`, `DATABASE_URL`, etc.

5. Clique em **Deploy**

6. **Anote a URL de produção**, exemplo:
   ```
   https://miniapps-ytpm.vercel.app
   ```

---

## Passo 2: Deploy do ScanQRCodeBar

### Via CLI (Recomendado)

```bash
cd ../ScanQRCodeBar
vercel
```

### Via Dashboard do Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub novamente
3. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `ScanQRCodeBar`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

4. **Variáveis de Ambiente**:
   - Este app geralmente não precisa de variáveis especiais

5. Clique em **Deploy**

6. **Anote a URL de produção**, exemplo:
   ```
   https://miniapps-scanner.vercel.app
   ```

---

## Passo 3: Atualizar o vercel.json com as URLs Reais

No arquivo `vercel.json` na **raiz do projeto**, substitua as URLs de placeholder pelas URLs reais dos seus projetos:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1"],
  "rewrites": [
    {
      "source": "/ytpm",
      "destination": "https://miniapps-ytpm.vercel.app"
    },
    {
      "source": "/ytpm/:path*",
      "destination": "https://miniapps-ytpm.vercel.app/:path*"
    },
    {
      "source": "/scanner",
      "destination": "https://miniapps-scanner.vercel.app"
    },
    {
      "source": "/scanner/:path*",
      "destination": "https://miniapps-scanner.vercel.app/:path*"
    }
  ],
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  }
}
```

**⚠️ IMPORTANTE**: Substitua as URLs pelos domínios reais que você anotou nos passos 1 e 2!

---

## Passo 4: Deploy do Launcher (Página Principal)

### Via CLI (Recomendado)

```bash
cd ..  # Volte para a raiz do projeto
vercel
```

### Via Dashboard do Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub novamente
3. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (raiz - deixe em branco ou coloque `.`)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

4. **Não precisa de variáveis de ambiente**

5. Clique em **Deploy**

6. Sua URL principal será algo como:
   ```
   https://miniapps.vercel.app
   ```

---

## Passo 5: Testar

Acesse sua URL principal e teste:

```
https://miniapps.vercel.app/          → Página inicial ✅
https://miniapps.vercel.app/ytpm      → App YTPM ✅
https://miniapps.vercel.app/scanner   → App Scanner ✅
```

Os botões na página inicial devem funcionar e navegar para `/ytpm` e `/scanner`!

---

## Configuração Alternativa: Deploy de uma Branch Específica

Se seu projeto está em um monorepo e você quer fazer deploy de branches/diretórios diferentes:

### Para YTPlaylistManagerProWeb
- **Root Directory**: `YTPlaylistManagerProWeb`
- O Vercel vai buildar apenas esse diretório

### Para ScanQRCodeBar
- **Root Directory**: `ScanQRCodeBar`
- O Vercel vai buildar apenas esse diretório

### Para o Launcher
- **Root Directory**: `.` ou deixe em branco
- O Vercel vai buildar a raiz

---

## Troubleshooting

### ❌ Erro: "Os apps não carregam em /ytpm ou /scanner"

**Solução**:
- Verifique se as URLs no `vercel.json` estão corretas
- Certifique-se de ter feito redeploy do launcher após atualizar o `vercel.json`
- No Vercel, vá em **Deployments** → **Redeploy** para forçar um novo build

### ❌ Erro: "404 Not Found" nos subpaths

**Solução**:
- Confirme que os projetos YTPM e Scanner foram deployados com sucesso
- Teste as URLs diretas primeiro (ex: `https://miniapps-ytpm.vercel.app`)
- Verifique se não há barras finais nas URLs do `vercel.json`

### ❌ Erro: "Build Failed" no Vercel

**Solução**:
- Verifique os logs de build no dashboard do Vercel
- Certifique-se de que o `Root Directory` está configurado corretamente
- Para o YTPM, confirme que todas as variáveis de ambiente necessárias foram adicionadas

### ⚠️ Aviso: CORS ou Cookies não funcionam

**Solução**:
- Os rewrites do Vercel mantêm o mesmo domínio, então CORS não deve ser problema
- Se usar cookies, certifique-se de que os apps estão configurados para aceitar cookies do domínio principal

---

## Resumo Visual

```
GitHub Repo
│
├── YTPlaylistManagerProWeb/     → Deploy → miniapps-ytpm.vercel.app
│
├── ScanQRCodeBar/               → Deploy → miniapps-scanner.vercel.app
│
└── app/ (launcher)              → Deploy → miniapps.vercel.app
    └── vercel.json (com rewrites)
        ├── /ytpm/* → miniapps-ytpm.vercel.app
        └── /scanner/* → miniapps-scanner.vercel.app
```

**Resultado Final**:
- `miniapps.vercel.app/` → Página inicial
- `miniapps.vercel.app/ytpm` → YT Playlist Manager (rewrite)
- `miniapps.vercel.app/scanner` → Scanner (rewrite)

---

## Comandos Úteis

```bash
# Deploy em produção
vercel --prod

# Ver logs
vercel logs [deployment-url]

# Listar projetos
vercel ls

# Ver detalhes do projeto
vercel inspect [deployment-url]
```

---

## Custos no Vercel

- **Hobby (Gratuito)**:
  - 100GB de bandwidth
  - Builds ilimitados
  - Suficiente para uso pessoal e protótipos

- **Pro ($20/mês)**:
  - 1TB de bandwidth
  - Melhor para apps com mais usuários

Com 3 projetos separados, você ainda fica dentro dos limites do plano gratuito! 🎉
