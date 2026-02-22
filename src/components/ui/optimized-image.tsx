'use client'

import React, { forwardRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useLazyImage } from '@/hooks/useLazyImage'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** URL da imagem */
  src: string
  /** Texto alternativo obrigatório */
  alt: string
  /** Aspect ratio do container (ex: 16/9, 4/3, 1) */
  aspectRatio?: number
  /** URL de imagem placeholder blur (base64 ou URL pequena) */
  blurPlaceholder?: string
  /** Mostrar skeleton durante loading */
  skeleton?: boolean
  /** Classes do container */
  containerClassName?: string
  /** Callback quando imagem carrega */
  onImageLoad?: () => void
  /** Usar containment CSS para performance */
  contained?: boolean
}

/**
 * Componente de imagem otimizada com lazy loading e blur placeholder
 *
 * Features:
 * - Lazy loading via IntersectionObserver
 * - Blur placeholder com transição suave
 * - Skeleton loading opcional
 * - CSS containment para performance
 * - Aspect ratio preservado (evita CLS)
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/thumbnail.jpg"
 *   alt="Video thumbnail"
 *   aspectRatio={16/9}
 *   skeleton
 *   containerClassName="rounded-lg"
 * />
 * ```
 */
export const OptimizedImage = forwardRef<HTMLDivElement, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      alt,
      aspectRatio = 16 / 9,
      blurPlaceholder,
      skeleton = true,
      containerClassName,
      className,
      onImageLoad,
      contained = true,
      style,
      ...props
    },
    forwardedRef
  ) {
    const [hasError, setHasError] = useState(false)
    const { ref, isLoaded, isInView, src: lazySrc, onLoad } = useLazyImage(src)

    const handleLoad = useCallback(() => {
      onLoad()
      onImageLoad?.()
    }, [onLoad, onImageLoad])

    const handleError = useCallback(() => {
      setHasError(true)
    }, [])

    return (
      <div
        ref={(node) => {
          // Combina refs
          if (typeof forwardedRef === 'function') {
            forwardedRef(node)
          } else if (forwardedRef) {
            forwardedRef.current = node
          }
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
        }}
        className={cn(
          'img-lazy-container relative overflow-hidden',
          contained && 'contain-content',
          containerClassName
        )}
        style={{
          aspectRatio,
          ...style,
        }}
      >
        {/* Skeleton loading */}
        {skeleton && !isLoaded && !hasError && (
          <div
            className="img-skeleton absolute inset-0"
            aria-hidden="true"
          />
        )}

        {/* Blur placeholder */}
        {blurPlaceholder && !hasError && (
          <div
            className={cn(
              'img-placeholder',
              isLoaded && 'loaded'
            )}
            style={{
              backgroundImage: `url(${blurPlaceholder})`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Imagem principal */}
        {isInView && !hasError && (
          <img
            src={lazySrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'img-lazy w-full h-full object-cover',
              isLoaded && 'loaded',
              className
            )}
            loading="lazy"
            decoding="async"
            {...props}
          />
        )}

        {/* Error fallback */}
        {hasError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500"
            role="img"
            aria-label={`Erro ao carregar: ${alt}`}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
    )
  }
)

/**
 * Container para thumbnail de vídeo com aspectRatio 16:9 predefinido
 */
export function VideoThumbnail({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'aspectRatio'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio={16 / 9}
      className={cn('rounded-md', className)}
      {...props}
    />
  )
}

/**
 * Avatar otimizado com aspectRatio 1:1
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: Omit<OptimizedImageProps, 'aspectRatio'> & { size?: number }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio={1}
      skeleton={false}
      className={cn('rounded-full', className)}
      containerClassName="rounded-full"
      style={{
        width: size,
        height: size,
      }}
      {...props}
    />
  )
}

export default OptimizedImage
