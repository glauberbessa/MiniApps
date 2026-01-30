'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyImageOptions {
  threshold?: number
  rootMargin?: string
  blur?: boolean
  placeholder?: string
}

interface UseLazyImageReturn {
  ref: React.RefObject<HTMLImageElement | HTMLDivElement | null>
  isLoaded: boolean
  isInView: boolean
  src: string | undefined
  onLoad: () => void
}

/**
 * Hook para lazy loading de imagens com IntersectionObserver
 *
 * @param imageSrc - URL da imagem
 * @param options - Opções de configuração
 * @returns Objeto com ref, estados e handlers
 *
 * @example
 * ```tsx
 * function MyImage({ src, alt }) {
 *   const { ref, isLoaded, src: lazySrc, onLoad } = useLazyImage(src)
 *
 *   return (
 *     <div ref={ref} className="img-lazy-container">
 *       <img
 *         src={lazySrc}
 *         alt={alt}
 *         onLoad={onLoad}
 *         className={`img-lazy ${isLoaded ? 'loaded' : ''}`}
 *       />
 *     </div>
 *   )
 * }
 * ```
 */
export function useLazyImage(
  imageSrc: string,
  options: UseLazyImageOptions = {}
): UseLazyImageReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    blur = true,
    placeholder,
  } = options

  const ref = useRef<HTMLImageElement | HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  const onLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  return {
    ref,
    isLoaded,
    isInView,
    src: isInView ? imageSrc : placeholder,
    onLoad,
  }
}

/**
 * Hook para preload de imagens
 *
 * @param srcs - Array de URLs de imagens para preload
 */
export function useImagePreload(srcs: string[]) {
  useEffect(() => {
    const images: HTMLImageElement[] = []

    srcs.forEach((src) => {
      const img = new Image()
      img.src = src
      images.push(img)
    })

    return () => {
      images.forEach((img) => {
        img.src = ''
      })
    }
  }, [srcs])
}

/**
 * Hook para detectar se imagem está em cache
 */
export function useImageCacheStatus(src: string): boolean {
  const [isCached, setIsCached] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()

    img.onload = () => {
      // Se carregar muito rápido, provavelmente está em cache
      setIsCached(true)
    }

    // Força verificação de cache
    img.src = src

    // Se já está completo, está em cache
    if (img.complete) {
      setIsCached(true)
    }
  }, [src])

  return isCached
}

export default useLazyImage
