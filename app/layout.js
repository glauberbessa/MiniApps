import './globals.css'
import { Playfair_Display, DM_Sans, Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AccessibilityProvider } from '@/components/providers/accessibility-provider'

// Fonts distintivas por aplicação
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600'],
})

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
  themeColor: '#0a0a0b',
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${playfairDisplay.variable} ${dmSans.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="text-foreground antialiased min-h-screen font-ui">
        <ThemeProvider>
          <AccessibilityProvider>
            {/* Skip Link para acessibilidade (WCAG 2.4.1) */}
            <a
              href="#main-content"
              className="skip-link"
            >
              Pular para o conteúdo principal
            </a>
            {children}
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
