# Deploy Simplificado no Vercel - Um Único Comando

## Opção Recomendada: Deploy Separado com Rewrites

Você estava certo em querer um deploy mais simples! A forma mais fácil é:

### ✅ **Um único repositório, mas 3 deploys separados automáticos**

O Vercel pode detectar automaticamente os 3 Next.js apps no seu repo e fazer deploy de todos de uma vez.

---

## Configuração (Uma Vez Só)

### 1. Conecte o Repositório no Vercel

Vá em https://vercel.com/new e importe seu repositório do GitHub.

### 2. O Vercel Detectará Múltiplos Frameworks

O Vercel vai perguntar qual projeto você quer fazer deploy. Você vai criar 3 projetos a partir do mesmo repositório:

#### **Projeto 1: miniapps-launcher**
- Nome do Projeto: `miniapps` (ou o nome que quiser)
- Root Directory: `.` (raiz)
- Framework: Next.js
- Deploy!

#### **Projeto 2: miniapps-ytpm**
- Nome do Projeto: `miniapps-ytpm`
- Root Directory: `YTPlaylistManagerProWeb`
- Framework: Next.js
- Deploy!

#### **Projeto 3: miniapps-scanner**
- Nome do Projeto: `miniapps-scanner`
- Root Directory: `ScanQRCodeBar`
- Framework: Next.js
- Deploy!

### 3. Anotar as URLs

Após os deploys, você terá 3 URLs:
```
https://miniapps.vercel.app          (launcher)
https://miniapps-ytpm.vercel.app     (ytpm)
https://miniapps-scanner.vercel.app  (scanner)
```

### 4. Atualizar o vercel.json

Edite `vercel.json` na raiz e adicione as URLs reais:

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
  ]
}
```

### 5. Redeploy do Launcher

Faça commit e push do vercel.json atualizado. O Vercel vai fazer redeploy automaticamente do launcher.

---

## Como Funciona

```
Usuário acessa: https://miniapps.vercel.app/
├── / → Launcher (página inicial)
├── /ytpm → Rewrite para miniapps-ytpm.vercel.app
└── /scanner → Rewrite para miniapps-scanner.vercel.app
```

**Vantagens:**
- ✅ Um único push, 3 deploys automáticos
- ✅ Cada app tem seu próprio ambiente isolado
- ✅ Variáveis de ambiente separadas por app
- ✅ URLs limpas (`/ytpm`, `/scanner`)
- ✅ Funciona perfeitamente local e em produção

---

## Alternativa AINDA MAIS SIMPLES: Vercel CLI

Se você preferir fazer tudo via CLI de uma vez:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy do launcher
vercel --prod

# Deploy do YTPM
cd YTPlaylistManagerProWeb
vercel --prod
cd ..

# Deploy do Scanner
cd ScanQRCodeBar
vercel --prod
cd ..
```

Depois é só atualizar o `vercel.json` com as URLs e fazer commit!

---

## Deploy Único Verdadeiro (Mais Complexo)

Se você **realmente** quer um deploy único onde tudo é buildado junto, você precisa usar:

1. **Turborepo** (recomendado para monorepos)
2. **Nx** (outra ferramenta de monorepo)
3. **Build customizado com Vercel Build Output API**

Mas isso adiciona complexidade desnecessária para 3 apps simples. A abordagem com rewrites é a **recomendada pela Vercel** e usada por milhares de projetos em produção.

---

## Custos

Com 3 projetos no Vercel:
- **Plano Hobby (Gratuito)**: 100GB bandwidth, builds ilimitados
- Mesmo com 3 projetos, você fica dentro do limite gratuito
- Cada projeto conta como 1 projeto (você tem direito a dezenas no plano free)

---

## Resultado Final

**Local:**
```
npm run dev:all
→ localhost:3000 (launcher)
→ localhost:3001 (ytpm)
→ localhost:3002 (scanner)
```

**Produção:**
```
https://miniapps.vercel.app/
https://miniapps.vercel.app/ytpm
https://miniapps.vercel.app/scanner
```

**Simples, funcional e escalável!** 🚀
