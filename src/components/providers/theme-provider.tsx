'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'

type Theme = 'launcher' | 'ytpm' | 'scanner'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
}

/**
 * ThemeProvider - Aplica tema baseado na rota atual
 *
 * Detecta automaticamente a rota e aplica o tema correspondente:
 * - /ytpm/* -> tema ytpm (Industrial Dark com YouTube Red)
 * - /scanner/* -> tema scanner (Soft/Minimal com Cyan)
 * - / -> tema launcher (Editorial Dark)
 */
export function ThemeProvider({ children, defaultTheme = 'launcher' }: ThemeProviderProps) {
  const pathname = usePathname()

  const theme = useMemo<Theme>(() => {
    if (pathname?.startsWith('/ytpm')) {
      return 'ytpm'
    }
    if (pathname?.startsWith('/scanner')) {
      return 'scanner'
    }
    return defaultTheme
  }, [pathname, defaultTheme])

  useEffect(() => {
    // Atualiza o atributo data-theme no html
    const html = document.documentElement
    html.setAttribute('data-theme', theme)

    // Atualiza classes específicas do body baseado no tema
    const body = document.body
    body.classList.remove('theme-launcher', 'theme-ytpm', 'theme-scanner')
    body.classList.add(`theme-${theme}`)

    // Atualiza o meta theme-color para PWA
    const themeColors: Record<Theme, string> = {
      launcher: '#0a0a0b',
      ytpm: '#09090b',
      scanner: '#0f0f10',
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[theme])
    }

    return () => {
      // Cleanup se necessário
    }
  }, [theme])

  return <>{children}</>
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme(): Theme {
  const pathname = usePathname()

  return useMemo<Theme>(() => {
    if (pathname?.startsWith('/ytpm')) {
      return 'ytpm'
    }
    if (pathname?.startsWith('/scanner')) {
      return 'scanner'
    }
    return 'launcher'
  }, [pathname])
}

/**
 * Utilitário para obter classes de tema
 */
export function getThemeClasses(theme: Theme) {
  const themeClasses: Record<Theme, { bg: string; text: string; accent: string }> = {
    launcher: {
      bg: 'bg-launcher-bg',
      text: 'text-launcher-accent',
      accent: 'text-launcher-highlight',
    },
    ytpm: {
      bg: 'bg-ytpm-bg',
      text: 'text-ytpm-text',
      accent: 'text-ytpm-accent',
    },
    scanner: {
      bg: 'bg-scanner-bg',
      text: 'text-scanner-text',
      accent: 'text-scanner-accent',
    },
  }

  return themeClasses[theme]
}
