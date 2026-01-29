"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type LiveRegionPoliteness = "polite" | "assertive" | "off"

export interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  politeness?: LiveRegionPoliteness
  atomic?: boolean
  relevant?: "additions" | "removals" | "text" | "all" | "additions text"
  clearAfter?: number
}

/**
 * Componente para anúncios de screen reader
 * Implementa WCAG 4.1.3 - Status Messages
 *
 * @example
 * // Anúncio educado (não interrompe)
 * <LiveRegion message="Item adicionado ao carrinho" />
 *
 * @example
 * // Anúncio assertivo (interrompe imediatamente)
 * <LiveRegion message="Erro ao salvar" politeness="assertive" />
 */
const LiveRegion = React.forwardRef<HTMLDivElement, LiveRegionProps>(
  (
    {
      message,
      politeness = "polite",
      atomic = true,
      relevant = "additions text",
      clearAfter,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [currentMessage, setCurrentMessage] = React.useState(message)

    React.useEffect(() => {
      setCurrentMessage(message)

      if (clearAfter && message) {
        const timer = setTimeout(() => {
          setCurrentMessage(undefined)
        }, clearAfter)

        return () => clearTimeout(timer)
      }
    }, [message, clearAfter])

    return (
      <div
        ref={ref}
        role="status"
        aria-live={politeness}
        aria-atomic={atomic}
        aria-relevant={relevant}
        className={cn("sr-only", className)}
        {...props}
      >
        {currentMessage || children}
      </div>
    )
  }
)
LiveRegion.displayName = "LiveRegion"

/**
 * Componente para anúncios de alerta crítico
 * Usado para mensagens que devem interromper o usuário
 */
const AlertLiveRegion = React.forwardRef<HTMLDivElement, Omit<LiveRegionProps, "politeness">>(
  (props, ref) => {
    return (
      <LiveRegion
        ref={ref}
        politeness="assertive"
        role="alert"
        {...props}
      />
    )
  }
)
AlertLiveRegion.displayName = "AlertLiveRegion"

/**
 * Hook para gerenciar anúncios de screen reader programaticamente
 */
export function useLiveAnnounce() {
  const [announcement, setAnnouncement] = React.useState<{
    message: string
    politeness: LiveRegionPoliteness
  } | null>(null)

  const announce = React.useCallback(
    (message: string, politeness: LiveRegionPoliteness = "polite") => {
      // Reset para garantir que o screen reader leia mensagens repetidas
      setAnnouncement(null)

      // Pequeno delay para garantir que o reset foi processado
      requestAnimationFrame(() => {
        setAnnouncement({ message, politeness })
      })
    },
    []
  )

  const announcePolite = React.useCallback(
    (message: string) => announce(message, "polite"),
    [announce]
  )

  const announceAssertive = React.useCallback(
    (message: string) => announce(message, "assertive"),
    [announce]
  )

  const clear = React.useCallback(() => {
    setAnnouncement(null)
  }, [])

  const LiveAnnouncer = React.useCallback(
    () =>
      announcement ? (
        <LiveRegion
          message={announcement.message}
          politeness={announcement.politeness}
          clearAfter={5000}
        />
      ) : null,
    [announcement]
  )

  return {
    announce,
    announcePolite,
    announceAssertive,
    clear,
    LiveAnnouncer,
    currentAnnouncement: announcement,
  }
}

export { LiveRegion, AlertLiveRegion }
