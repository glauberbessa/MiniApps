'use client'

import { forwardRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

type FeedbackType = 'success' | 'error' | 'warning' | 'info'
type AnimationStyle = 'shake' | 'pulse' | 'bounce' | 'glow' | 'none'

interface AnimatedFeedbackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Tipo do feedback
   */
  type?: FeedbackType

  /**
   * Estilo da animação
   */
  animation?: AnimationStyle

  /**
   * Se a animação está ativa
   */
  active?: boolean

  /**
   * Se deve usar as cores do tema YTPM
   * @default false
   */
  ytpmTheme?: boolean

  /**
   * Se deve usar as cores do tema Scanner
   * @default false
   */
  scannerTheme?: boolean

  /**
   * Callback quando a animação terminar
   */
  onAnimationEnd?: () => void

  /**
   * Filhos do componente
   */
  children: React.ReactNode
}

const feedbackClasses: Record<FeedbackType, Record<AnimationStyle, string>> = {
  success: {
    shake: 'animate-shake',
    pulse: 'animate-success',
    bounce: 'animate-bounce',
    glow: 'hover-glow',
    none: '',
  },
  error: {
    shake: 'animate-shake',
    pulse: 'animate-error',
    bounce: 'animate-shake',
    glow: 'hover-glow',
    none: '',
  },
  warning: {
    shake: 'animate-shake-subtle',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'hover-glow',
    none: '',
  },
  info: {
    shake: 'animate-shake-subtle',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'hover-glow',
    none: '',
  },
}

const ytpmFeedbackClasses: Record<FeedbackType, Record<AnimationStyle, string>> = {
  success: {
    shake: 'ytpm-animate-shake',
    pulse: 'ytpm-animate-success',
    bounce: 'animate-bounce',
    glow: 'ytpm-animate-pulse',
    none: '',
  },
  error: {
    shake: 'ytpm-animate-shake',
    pulse: 'ytpm-animate-error',
    bounce: 'ytpm-animate-shake',
    glow: 'ytpm-animate-error',
    none: '',
  },
  warning: {
    shake: 'ytpm-animate-shake',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'ytpm-animate-pulse',
    none: '',
  },
  info: {
    shake: 'ytpm-animate-shake',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    glow: 'ytpm-animate-pulse',
    none: '',
  },
}

const scannerFeedbackClasses: Record<FeedbackType, Record<AnimationStyle, string>> = {
  success: {
    shake: 'animate-shake',
    pulse: 'scanner-animate-pulse',
    bounce: 'scanner-animate-bounce',
    glow: 'scanner-animate-code-glow',
    none: '',
  },
  error: {
    shake: 'animate-shake',
    pulse: 'animate-error',
    bounce: 'animate-shake',
    glow: 'animate-error',
    none: '',
  },
  warning: {
    shake: 'animate-shake-subtle',
    pulse: 'animate-pulse',
    bounce: 'scanner-animate-bounce',
    glow: 'scanner-animate-pulse',
    none: '',
  },
  info: {
    shake: 'animate-shake-subtle',
    pulse: 'scanner-animate-pulse',
    bounce: 'scanner-animate-bounce',
    glow: 'scanner-animate-pulse',
    none: '',
  },
}

/**
 * Componente para feedback visual animado
 *
 * @example
 * ```tsx
 * <AnimatedFeedback type="error" animation="shake" active={hasError}>
 *   <Input />
 * </AnimatedFeedback>
 * ```
 */
export const AnimatedFeedback = forwardRef<HTMLDivElement, AnimatedFeedbackProps>(
  (
    {
      type = 'info',
      animation = 'pulse',
      active = false,
      ytpmTheme = false,
      scannerTheme = false,
      onAnimationEnd,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
      if (active) {
        setAnimating(true)
      }
    }, [active])

    const handleAnimationEnd = useCallback(() => {
      setAnimating(false)
      onAnimationEnd?.()
    }, [onAnimationEnd])

    const getAnimationClass = () => {
      if (!animating) return ''

      if (scannerTheme) {
        return scannerFeedbackClasses[type][animation]
      }
      if (ytpmTheme) {
        return ytpmFeedbackClasses[type][animation]
      }
      return feedbackClasses[type][animation]
    }

    return (
      <div
        ref={ref}
        className={cn(getAnimationClass(), className)}
        onAnimationEnd={handleAnimationEnd}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedFeedback.displayName = 'AnimatedFeedback'

interface AnimatedListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Índice do item na lista (para stagger)
   */
  index?: number

  /**
   * Se o item está sendo removido
   */
  removing?: boolean

  /**
   * Se o item está sendo adicionado
   */
  adding?: boolean

  /**
   * Tema a usar
   */
  theme?: 'launcher' | 'ytpm' | 'scanner'

  /**
   * Callback quando animação de remoção terminar
   */
  onRemoved?: () => void

  /**
   * Filhos do componente
   */
  children: React.ReactNode
}

/**
 * Item de lista com animações de entrada/saída
 *
 * @example
 * ```tsx
 * {items.map((item, i) => (
 *   <AnimatedListItem
 *     key={item.id}
 *     index={i}
 *     removing={item.isRemoving}
 *     theme="ytpm"
 *   >
 *     {item.content}
 *   </AnimatedListItem>
 * ))}
 * ```
 */
export const AnimatedListItem = forwardRef<HTMLDivElement, AnimatedListItemProps>(
  (
    {
      index = 0,
      removing = false,
      adding = false,
      theme = 'launcher',
      onRemoved,
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(!adding)

    useEffect(() => {
      if (adding) {
        // Pequeno delay para trigger da animação
        const timeout = setTimeout(() => setIsVisible(true), 10)
        return () => clearTimeout(timeout)
      }
    }, [adding])

    const handleAnimationEnd = useCallback(() => {
      if (removing) {
        onRemoved?.()
      }
    }, [removing, onRemoved])

    const getAnimationClasses = () => {
      const classes: string[] = []

      if (removing) {
        switch (theme) {
          case 'ytpm':
            classes.push('ytpm-animate-slide-out')
            break
          case 'scanner':
            classes.push('animate-slide-out-right')
            break
          default:
            classes.push('animate-slide-out-right')
        }
      } else if (adding && isVisible) {
        switch (theme) {
          case 'ytpm':
            classes.push('ytpm-animate-wave')
            break
          case 'scanner':
            classes.push('scanner-animate-fade-in')
            break
          default:
            classes.push('animate-in-up')
        }
      } else if (!isVisible) {
        classes.push('opacity-0')
      }

      return classes.join(' ')
    }

    const getStaggerDelay = () => {
      if (adding && !removing) {
        return `${index * 50}ms`
      }
      return undefined
    }

    return (
      <div
        ref={ref}
        className={cn(getAnimationClasses(), className)}
        style={{
          ...style,
          animationDelay: getStaggerDelay(),
        }}
        onAnimationEnd={handleAnimationEnd}
        {...props}
      >
        {children}
      </div>
    )
  }
)

AnimatedListItem.displayName = 'AnimatedListItem'

interface FlyingItemProps {
  /**
   * Se o item deve "voar"
   */
  flying: boolean

  /**
   * Direção do voo
   */
  direction?: 'left' | 'right'

  /**
   * Tema a usar
   */
  theme?: 'launcher' | 'ytpm' | 'scanner'

  /**
   * Callback quando a animação terminar
   */
  onComplete?: () => void

  /**
   * Filhos do componente
   */
  children: React.ReactNode

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Componente para animação de "voo" (transferência entre listas)
 *
 * @example
 * ```tsx
 * <FlyingItem flying={isTransferring} direction="right" theme="ytpm">
 *   <VideoCard />
 * </FlyingItem>
 * ```
 */
export function FlyingItem({
  flying,
  direction = 'right',
  theme = 'ytpm',
  onComplete,
  children,
  className,
}: FlyingItemProps) {
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (flying) {
      setAnimating(true)
    }
  }, [flying])

  const handleAnimationEnd = useCallback(() => {
    setAnimating(false)
    onComplete?.()
  }, [onComplete])

  const getAnimationClass = () => {
    if (!animating) return ''

    if (theme === 'ytpm') {
      return direction === 'right' ? 'ytpm-animate-fly' : 'ytpm-animate-fly-in'
    }

    return direction === 'right' ? 'animate-fly' : 'animate-in-left'
  }

  return (
    <div
      className={cn(getAnimationClass(), className)}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  )
}

export default AnimatedFeedback
