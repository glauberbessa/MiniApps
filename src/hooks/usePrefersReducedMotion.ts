'use client'

import { useState, useEffect } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Hook para detectar se o usuário prefere movimento reduzido
 *
 * @returns true se o usuário prefere movimento reduzido
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion()
 *
 *   return (
 *     <div className={prefersReducedMotion ? '' : 'animate-in-up'}>
 *       Content
 *     </div>
 *   )
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  // Valor padrão para SSR - assume que não há preferência
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') return

    const mediaQueryList = window.matchMedia(QUERY)

    // Definir valor inicial
    setPrefersReducedMotion(mediaQueryList.matches)

    // Listener para mudanças
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Adicionar listener (com fallback para browsers antigos)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener)
    } else {
      // Fallback para Safari < 14
      mediaQueryList.addListener(listener)
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener)
      } else {
        mediaQueryList.removeListener(listener)
      }
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Retorna classes de animação condicionais baseadas na preferência do usuário
 *
 * @param animationClass - Classe de animação a usar quando motion é permitido
 * @param fallbackClass - Classe alternativa quando motion é reduzido (opcional)
 * @returns A classe apropriada baseada na preferência
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const getAnimationClass = useConditionalAnimation()
 *
 *   return (
 *     <div className={getAnimationClass('animate-in-up', 'opacity-100')}>
 *       Content
 *     </div>
 *   )
 * }
 * ```
 */
export function useConditionalAnimation() {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (animationClass: string, fallbackClass = ''): string => {
    if (prefersReducedMotion) {
      return fallbackClass
    }
    return animationClass
  }
}

export default usePrefersReducedMotion
