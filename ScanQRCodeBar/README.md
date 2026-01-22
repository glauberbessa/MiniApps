# ScanQRCodeBar 📱

Scanner de QR Code e Código de Barras - Aplicação web moderna e responsiva.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## ✨ Funcionalidades

- ✅ Leitura de QR Codes
- ✅ Leitura de Códigos de Barras (EAN-13, Code128, UPC, etc.)
- ✅ Cópia automática para clipboard
- ✅ Feedback sonoro e vibração
- ✅ Interface responsiva (mobile-first)
- ✅ Tratamento de erros amigável
- ✅ Design moderno e minimalista

## 🚀 Deploy no Vercel

### Opção 1: Via GitHub (Recomendado)

1. **Suba o projeto para o GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/scanqrcodebar.git
   git push -u origin main
   ```

2. **Conecte ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório do GitHub
   - Clique em "Deploy"

### Opção 2: Via CLI

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça deploy
vercel
```

## 💻 Desenvolvimento Local

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:3000
```

> ⚠️ **Nota:** A câmera só funciona em HTTPS ou localhost.

## 📁 Estrutura do Projeto

```
scanqrcodebar/
├── app/
│   ├── components/
│   │   └── Scanner.js      # Componente principal
│   ├── globals.css         # Estilos globais + Tailwind
│   ├── layout.js           # Layout raiz (HTML base)
│   └── page.js             # Página inicial
├── public/                 # Arquivos estáticos
├── package.json            # Dependências
├── next.config.js          # Configuração Next.js
├── tailwind.config.js      # Configuração Tailwind
└── postcss.config.js       # Configuração PostCSS
```

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca UI
- **Tailwind CSS 3.4** - Framework CSS utilitário
- **html5-qrcode** - Biblioteca de leitura de códigos

## 📱 Requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão HTTPS (obrigatório para acesso à câmera)
- Dispositivo com câmera

## 📄 Licença

MIT - Use como quiser!

---

Desenvolvido com ❤️ usando Next.js e Tailwind CSS
