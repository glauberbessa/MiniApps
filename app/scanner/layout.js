import './globals.css'

/**
 * EXPLICAÇÃO PARA DESENVOLVEDOR JÚNIOR:
 * 
 * Este é o "layout" raiz do Next.js. Pense nele como o "esqueleto" HTML
 * que envolve TODAS as páginas do seu app.
 * 
 * - metadata: Define título, descrição (SEO), ícones, etc.
 * - RootLayout: Componente que renderiza o <html> e <body>
 * - {children}: É onde o conteúdo das páginas será inserido
 */

// Metadados do site (SEO, título da aba, etc.)
export const metadata = {
  title: 'ScanQRCodeBar - Scanner de QR Code e Código de Barras',
  description: 'Escaneie QR Codes e códigos de barras facilmente com a câmera do seu dispositivo.',
  // Configuração para funcionar como PWA (app instalável)
  manifest: '/manifest.json',
  // Cor da barra de navegação em mobile
  themeColor: '#0f172a',
  // Ícones
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

// Configuração do viewport (importante para mobile)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  // Impede zoom ao focar em inputs (comum em mobile)
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
