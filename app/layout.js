import './globals.css'

export const metadata = {
  title: 'MiniApps - Sua Central de Aplicativos',
  description: 'Acesse todos os seus mini aplicativos em um só lugar',
  themeColor: '#0f172a',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
