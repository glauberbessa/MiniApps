'use client'

import * as React from 'react'
import { LiveRegion, AlertLiveRegion } from '@/components/ui/live-region'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Tipos de anúncios para screen readers
 */
export type AnnouncementPoliteness = 'polite' | 'assertive'

export interface Announcement {
  id: string
  message: string
  politeness: AnnouncementPoliteness
  timestamp: number
}

/**
 * Contexto de acessibilidade
 */
interface AccessibilityContextValue {
  // Anúncios
  announce: (message: string, politeness?: AnnouncementPoliteness) => void
  announcePolite: (message: string) => void
  announceAssertive: (message: string) => void

  // Anúncios contextuais
  announceVideoTransferred: (videoTitle: string, playlistName: string) => void
  announceScanSuccess: (codeType: string, value: string) => void
  announceError: (message: string, action?: string) => void
  announceLoading: (context: string) => void
  announceSuccess: (message: string) => void

  // Preferências
  prefersReducedMotion: boolean

  // Estado
  currentAnnouncement: Announcement | null
}

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null)

/**
 * Hook para acessar o contexto de acessibilidade
 */
export function useAccessibility() {
  const context = React.useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  }
  return context
}

/**
 * Props do AccessibilityProvider
 */
interface AccessibilityProviderProps {
  children: React.ReactNode
}

/**
 * Provider global de acessibilidade
 *
 * Fornece:
 * - Sistema de anúncios para screen readers
 * - Detecção de preferência de movimento reduzido
 * - Funções helper para anúncios contextuais
 *
 * @example
 * ```tsx
 * // Em layout.tsx
 * <AccessibilityProvider>
 *   <App />
 * </AccessibilityProvider>
 *
 * // Em componentes
 * function TransferButton() {
 *   const { announceVideoTransferred } = useAccessibility()
 *
 *   const handleTransfer = async () => {
 *     await transferVideo()
 *     announceVideoTransferred('Meu Vídeo', 'Favoritos')
 *   }
 *
 *   return <button onClick={handleTransfer}>Transferir</button>
 * }
 * ```
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [currentAnnouncement, setCurrentAnnouncement] = React.useState<Announcement | null>(null)

  // Queue de anúncios para evitar sobreposição
  const announcementQueue = React.useRef<Announcement[]>([])
  const isProcessing = React.useRef(false)

  /**
   * Processa a fila de anúncios
   */
  const processQueue = React.useCallback(() => {
    if (isProcessing.current || announcementQueue.current.length === 0) {
      return
    }

    isProcessing.current = true
    const announcement = announcementQueue.current.shift()

    if (announcement) {
      setCurrentAnnouncement(announcement)

      // Limpar após um tempo para permitir próximo anúncio
      setTimeout(() => {
        setCurrentAnnouncement(null)
        isProcessing.current = false
        processQueue()
      }, 3000)
    }
  }, [])

  /**
   * Adiciona anúncio à fila
   */
  const queueAnnouncement = React.useCallback(
    (message: string, politeness: AnnouncementPoliteness) => {
      const announcement: Announcement = {
        id: `announce-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        message,
        politeness,
        timestamp: Date.now()
      }

      // Anúncios assertivos vão para o início da fila
      if (politeness === 'assertive') {
        announcementQueue.current.unshift(announcement)
      } else {
        announcementQueue.current.push(announcement)
      }

      processQueue()
    },
    [processQueue]
  )

  /**
   * Função principal de anúncio
   */
  const announce = React.useCallback(
    (message: string, politeness: AnnouncementPoliteness = 'polite') => {
      if (!message) return
      queueAnnouncement(message, politeness)
    },
    [queueAnnouncement]
  )

  /**
   * Atalhos para anúncios
   */
  const announcePolite = React.useCallback(
    (message: string) => announce(message, 'polite'),
    [announce]
  )

  const announceAssertive = React.useCallback(
    (message: string) => announce(message, 'assertive'),
    [announce]
  )

  /**
   * Anúncios contextuais - YTPM
   */
  const announceVideoTransferred = React.useCallback(
    (videoTitle: string, playlistName: string) => {
      const truncatedTitle = videoTitle.length > 50
        ? `${videoTitle.slice(0, 47)}...`
        : videoTitle
      announce(
        `Vídeo "${truncatedTitle}" transferido para a playlist "${playlistName}".`,
        'polite'
      )
    },
    [announce]
  )

  /**
   * Anúncios contextuais - Scanner
   */
  const announceScanSuccess = React.useCallback(
    (codeType: string, value: string) => {
      const truncatedValue = value.length > 100
        ? `${value.slice(0, 97)}...`
        : value
      announce(
        `Código detectado: ${codeType}. Resultado: ${truncatedValue}`,
        'assertive'
      )
    },
    [announce]
  )

  /**
   * Anúncio de erro
   */
  const announceError = React.useCallback(
    (message: string, action?: string) => {
      const actionText = action ? ` ${action}` : ''
      announce(`Erro: ${message}.${actionText}`, 'assertive')
    },
    [announce]
  )

  /**
   * Anúncio de loading
   */
  const announceLoading = React.useCallback(
    (context: string) => {
      announce(`Carregando ${context}...`, 'polite')
    },
    [announce]
  )

  /**
   * Anúncio de sucesso
   */
  const announceSuccess = React.useCallback(
    (message: string) => {
      announce(message, 'polite')
    },
    [announce]
  )

  const value: AccessibilityContextValue = {
    announce,
    announcePolite,
    announceAssertive,
    announceVideoTransferred,
    announceScanSuccess,
    announceError,
    announceLoading,
    announceSuccess,
    prefersReducedMotion,
    currentAnnouncement
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}

      {/* Live Region para anúncios polidos */}
      {currentAnnouncement?.politeness === 'polite' && (
        <LiveRegion
          key={currentAnnouncement.id}
          message={currentAnnouncement.message}
          politeness="polite"
        />
      )}

      {/* Alert Live Region para anúncios assertivos */}
      {currentAnnouncement?.politeness === 'assertive' && (
        <AlertLiveRegion
          key={currentAnnouncement.id}
          message={currentAnnouncement.message}
        />
      )}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityProvider
