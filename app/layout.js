import './globals.css'

export const metadata = {
  title: 'MiniApps - Sua Central de Aplicativos',
  description: 'Acesse todos os seus mini aplicativos em um só lugar',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-foreground antialiased min-h-screen">
        {/* Skip Link para acessibilidade (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Pular para o conteúdo principal
        </a>
        {children}
      </body>
    </html>
  )
}
