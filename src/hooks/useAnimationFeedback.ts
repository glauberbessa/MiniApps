'use client'

import { useCallback, useRef } from 'react'

/**
 * Tipos de feedback de animação disponíveis
 */
export type AnimationFeedbackType =
  | 'success'
  | 'error'
  | 'shake'
  | 'pulse'
  | 'fly'
  | 'fly-in'
  | 'slide-out'
  | 'collapse'
  | 'pop'
  | 'bounce'

/**
 * Configuração de animação por tipo
 */
const animationConfig: Record<
  AnimationFeedbackType,
  {
    launcher: string
    ytpm: string
    scanner: string
    duration: number
  }
> = {
  success: {
    launcher: 'animate-success',
    ytpm: 'ytpm-animate-success',
    scanner: 'scanner-animate-success',
    duration: 800,
  },
  error: {
    launcher: 'animate-error',
    ytpm: 'ytpm-animate-error',
    scanner: 'animate-error',
    duration: 500,
  },
  shake: {
    launcher: 'animate-shake',
    ytpm: 'ytpm-animate-shake',
    scanner: 'animate-shake',
    duration: 500,
  },
  pulse: {
    launcher: 'animate-pulse',
    ytpm: 'ytpm-animate-pulse',
    scanner: 'scanner-animate-pulse',
    duration: 2000,
  },
  fly: {
    launcher: 'animate-fly',
    ytpm: 'ytpm-animate-fly',
    scanner: 'animate-fly',
    duration: 600,
  },
  'fly-in': {
    launcher: 'animate-in-left',
    ytpm: 'ytpm-animate-fly-in',
    scanner: 'scanner-animate-fade-in',
    duration: 500,
  },
  'slide-out': {
    launcher: 'animate-slide-out-right',
    ytpm: 'ytpm-animate-slide-out',
    scanner: 'animate-slide-out-right',
    duration: 400,
  },
  collapse: {
    launcher: 'animate-collapse',
    ytpm: 'ytpm-animate-collapse',
    scanner: 'animate-collapse',
    duration: 300,
  },
  pop: {
    launcher: 'animate-pop',
    ytpm: 'animate-pop',
    scanner: 'scanner-animate-success',
    duration: 300,
  },
  bounce: {
    launcher: 'animate-bounce',
    ytpm: 'animate-bounce',
    scanner: 'scanner-animate-bounce',
    duration: 600,
  },
}

type Theme = 'launcher' | 'ytpm' | 'scanner'

interface UseAnimationFeedbackOptions {
  theme?: Theme
  onComplete?: () => void
}

interface UseAnimationFeedbackReturn {
  /**
   * Ref para anexar ao elemento que receberá a animação
   */
  ref: React.RefObject<HTMLElement>

  /**
   * Dispara uma animação de feedback
   * @param type - Tipo da animação
   * @param options - Opções adicionais
   */
  trigger: (
    type: AnimationFeedbackType,
    options?: { onComplete?: () => void }
  ) => void

  /**
   * Remove todas as classes de animação
   */
  reset: () => void
}

/**
 * Hook para aplicar animações de feedback a elementos
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, trigger } = useAnimationFeedback({ theme: 'ytpm' })
 *
 *   const handleError = () => {
 *     trigger('error', { onComplete: () => console.log('Animation done') })
 *   }
 *
 *   return <div ref={ref}>Content</div>
 * }
 * ```
 */
export function useAnimationFeedback(
  options: UseAnimationFeedbackOptions = {}
): UseAnimationFeedbackReturn {
  const { theme = 'launcher', onComplete } = options
  const ref = useRef<HTMLElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const reset = useCallback(() => {
    if (ref.current) {
      // Remove todas as classes de animação conhecidas
      Object.values(animationConfig).forEach((config) => {
        ref.current?.classList.remove(config.launcher)
        ref.current?.classList.remove(config.ytpm)
        ref.current?.classList.remove(config.scanner)
      })
    }
  }, [])

  const trigger = useCallback(
    (
      type: AnimationFeedbackType,
      triggerOptions?: { onComplete?: () => void }
    ) => {
      if (!ref.current) return

      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Resetar animações anteriores
      reset()

      // Forçar reflow para reiniciar animação
      void ref.current.offsetWidth

      // Obter configuração da animação
      const config = animationConfig[type]
      const className = config[theme]

      // Aplicar classe de animação
      ref.current.classList.add(className)

      // Configurar callback de conclusão
      const completeCallback = triggerOptions?.onComplete || onComplete
      if (completeCallback || type !== 'pulse') {
        timeoutRef.current = setTimeout(() => {
          // Não remover classes de animações contínuas (pulse)
          if (type !== 'pulse') {
            reset()
          }
          completeCallback?.()
        }, config.duration)
      }
    },
    [theme, onComplete, reset]
  )

  return {
    ref: ref as React.RefObject<HTMLElement>,
    trigger,
    reset,
  }
}

/**
 * Hook para detectar preferência de movimento reduzido
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mediaQuery.matches
}

export default useAnimationFeedback
