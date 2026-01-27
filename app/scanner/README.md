# ScanQRCodeBar

Um scanner web moderno, rápido e acessível para QR Codes, Códigos de Barras e reconhecimento de texto numérico (OCR), construído com Next.js.

## ✨ Features

- **Multi-Scanner**: Lê QR Codes e principais formatos de Códigos de Barras (EAN, UPC, etc).
- **OCR Numérico**: Extrai sequências numéricas de imagens usando Tesseract.js (ideal para boletos, seriais).
  - *Mantém formatação original de espaços entre números.*
- **Zoom Inteligente**: Ciclo de zoom ajustável (2x → 16x) com fallback híbrido:
  - Usa zoom óptico de hardware se disponível.
  - Alterna automaticamente para zoom digital (recorte + escala) se o hardware não suportar.
- **Feedback Rico**: Confirmação visual, sonora (beep) e tátil (vibração) ao detectar códigos.
- **Acessibilidade**: Interface limpa, alto contraste e suporte a leitores de tela.
- **PWA Ready**: Projetado para funcionar como um aplicativo nativo no navegador.

## 🚀 Quick Start

Este módulo é parte do projeto MiniApps. Para executá-lo:

1. Certifique-se de estar na raiz do projeto:
   ```bash
   cd c:\dev\MiniApps
   ```

2. Instale as dependências (se ainda não fez):
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse via **HTTPS** ou **localhost** (necessário para acesso à câmera):
   - Local: `http://localhost:3000/scanner`
   - Rede: Use um túnel seguro ou configure HTTPS local para testar em dispositivos móveis.

## 🛠️ Tecnologias

- **Framework**: Next.js 13+ (App Router, Client Components)
- **Scanning**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js) (v5+)
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React / Heroicons

## 📱 Uso e Controles

### Modos de Leitura
1. **QR/Barcode**: Modo padrão. Aponte a câmera para qualquer código. A detecção é automática.
2. **OCR (Texto)**: Clique no ícone de texto/lupa. Capture uma foto para processar números.

### Controles da Câmera
- **Botão Zoom (2x - 16x)**: Toca para ciclar o nível de zoom.
  - Sequência: 2x → 4x → 6x → ... → 16x → 2x.
- **Botão Voltar**: Retorna ao menu principal do MiniApps.

## ⚠️ Requisitos do Navegador

- **Acesso à Câmera**: O navegador solicitará permissão de uso da câmera.
- **Contexto Seguro**: A API `navigator.mediaDevices` exige que a página seja servida via HTTPS ou localhost.

---
*Desenvolvido como parte da suíte MiniApps.*
