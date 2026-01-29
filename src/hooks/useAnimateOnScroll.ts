'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAnimateOnScrollOptions {
  /**
   * Threshold do Intersection Observer (0-1)
   * @default 0.1
   */
  threshold?: number

  /**
   * Margin ao redor do root
   * @default '0px'
   */
  rootMargin?: string

  /**
   * Se deve animar apenas uma vez
   * @default true
   */
  once?: boolean

  /**
   * Delay antes de marcar como visível (ms)
   * @default 0
   */
  delay?: number

  /**
   * Callback quando o elemento se torna visível
   */
  onVisible?: () => void

  /**
   * Se a animação está desabilitada
   * @default false
   */
  disabled?: boolean
}

interface UseAnimateOnScrollReturn {
  /**
   * Ref para anexar ao elemento
   */
  ref: React.RefObject<HTMLElement>

  /**
   * Se o elemento está visível
   */
  isVisible: boolean

  /**
   * Se o elemento já foi visto pelo menos uma vez
   */
  hasBeenVisible: boolean
}

/**
 * Hook para animar elementos quando entram no viewport
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { ref, isVisible } = useAnimateOnScroll({ threshold: 0.2 })
 *
 *   return (
 *     <div
 *       ref={ref}
 *       className={cn(
 *         'opacity-0',
 *         isVisible && 'animate-in-up'
 *       )}
 *     >
 *       Content
 *     </div>
 *   )
 * }
 * ```
 */
export function useAnimateOnScroll(
  options: UseAnimateOnScrollOptions = {}
): UseAnimateOnScrollReturn {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    once = true,
    delay = 0,
    onVisible,
    disabled = false,
  } = options

  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries

      if (entry.isIntersecting) {
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            setIsVisible(true)
            setHasBeenVisible(true)
            onVisible?.()
          }, delay)
        } else {
          setIsVisible(true)
          setHasBeenVisible(true)
          onVisible?.()
        }
      } else if (!once) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        setIsVisible(false)
      }
    },
    [delay, once, onVisible]
  )

  useEffect(() => {
    if (disabled || typeof IntersectionObserver === 'undefined') {
      // Se desabilitado ou sem suporte, marca como visível
      setIsVisible(true)
      setHasBeenVisible(true)
      return
    }

    const element = ref.current
    if (!element) return

    // Se já foi visto e once=true, não observar mais
    if (once && hasBeenVisible) return

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    })

    observer.observe(element)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      observer.disconnect()
    }
  }, [threshold, rootMargin, once, hasBeenVisible, handleIntersect, disabled])

  return {
    ref: ref as React.RefObject<HTMLElement>,
    isVisible,
    hasBeenVisible,
  }
}

interface UseStaggerAnimationOptions extends UseAnimateOnScrollOptions {
  /**
   * Número de itens a animar
   */
  itemCount: number

  /**
   * Delay entre cada item (ms)
   * @default 80
   */
  staggerDelay?: number
}

interface UseStaggerAnimationReturn {
  /**
   * Ref para o container
   */
  containerRef: React.RefObject<HTMLElement>

  /**
   * Se o container está visível
   */
  isVisible: boolean

  /**
   * Retorna o delay de animação para um item específico
   */
  getItemDelay: (index: number) => string

  /**
   * Retorna classes de animação para um item específico
   */
  getItemClasses: (index: number, baseClass?: string) => string
}

/**
 * Hook para animar múltiplos itens com stagger quando entram no viewport
 *
 * @example
 * ```tsx
 * function MyList({ items }) {
 *   const { containerRef, isVisible, getItemClasses } = useStaggerAnimation({
 *     itemCount: items.length,
 *     staggerDelay: 100,
 *   })
 *
 *   return (
 *     <ul ref={containerRef}>
 *       {items.map((item, i) => (
 *         <li key={i} className={getItemClasses(i, 'animate-in-up')}>
 *           {item}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useStaggerAnimation(
  options: UseStaggerAnimationOptions
): UseStaggerAnimationReturn {
  const { itemCount, staggerDelay = 80, ...scrollOptions } = options

  const { ref, isVisible } = useAnimateOnScroll(scrollOptions)

  const getItemDelay = useCallback(
    (index: number): string => {
      return `${index * staggerDelay}ms`
    },
    [staggerDelay]
  )

  const getItemClasses = useCallback(
    (index: number, baseClass = ''): string => {
      if (!isVisible) {
        return `opacity-0 ${baseClass}`
      }

      return `${baseClass}`
    },
    [isVisible]
  )

  return {
    containerRef: ref as React.RefObject<HTMLElement>,
    isVisible,
    getItemDelay,
    getItemClasses,
  }
}

export default useAnimateOnScroll
