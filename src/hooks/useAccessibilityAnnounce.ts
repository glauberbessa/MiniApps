'use client'

import { useCallback, useState, useEffect } from 'react'
import type { LiveRegionPoliteness } from '@/components/ui/live-region'

/**
 * Tipos de anúncios pré-definidos para contextos comuns
 */
export type AnnouncementType =
  | 'video_transferred'
  | 'scan_success'
  | 'error'
  | 'loading'
  | 'success'
  | 'warning'
  | 'info'
  | 'navigation'

/**
 * Parâmetros para anúncios contextuais
 */
export interface AnnouncementParams {
  videoTransferred?: {
    videoTitle: string
    playlistName: string
  }
  scanSuccess?: {
    codeType: 'QR' | 'Barcode' | 'URL' | 'Text'
    value: string
  }
  error?: {
    message: string
    action?: string
  }
  loading?: {
    context: string
  }
  success?: {
    message: string
  }
  warning?: {
    message: string
  }
  info?: {
    message: string
  }
  navigation?: {
    page: string
  }
}

/**
 * Estado de um anúncio
 */
export interface Announcement {
  id: string
  message: string
  politeness: LiveRegionPoliteness
  timestamp: number
}

/**
 * Gera mensagem de anúncio baseada no tipo e parâmetros
 */
function generateAnnouncementMessage(
  type: AnnouncementType,
  params?: AnnouncementParams
): { message: string; politeness: LiveRegionPoliteness } {
  switch (type) {
    case 'video_transferred':
      if (params?.videoTransferred) {
        const { videoTitle, playlistName } = params.videoTransferred
        return {
          message: `Vídeo "${videoTitle}" transferido para a playlist "${playlistName}".`,
          politeness: 'polite'
        }
      }
      return { message: 'Vídeo transferido com sucesso.', politeness: 'polite' }

    case 'scan_success':
      if (params?.scanSuccess) {
        const { codeType, value } = params.scanSuccess
        const typeLabel = {
          QR: 'QR Code',
          Barcode: 'Código de barras',
          URL: 'URL',
          Text: 'Texto'
        }[codeType]
        // Truncar valor se muito longo
        const truncatedValue = value.length > 50 ? `${value.slice(0, 50)}...` : value
        return {
          message: `Código detectado: ${typeLabel}. Resultado: ${truncatedValue}`,
          politeness: 'assertive'
        }
      }
      return { message: 'Código detectado com sucesso.', politeness: 'assertive' }

    case 'error':
      if (params?.error) {
        const { message, action } = params.error
        const actionText = action ? ` ${action}` : ''
        return {
          message: `Erro: ${message}.${actionText}`,
          politeness: 'assertive'
        }
      }
      return { message: 'Ocorreu um erro.', politeness: 'assertive' }

    case 'loading':
      if (params?.loading) {
        return {
          message: `Carregando ${params.loading.context}...`,
          politeness: 'polite'
        }
      }
      return { message: 'Carregando...', politeness: 'polite' }

    case 'success':
      return {
        message: params?.success?.message || 'Operação concluída com sucesso.',
        politeness: 'polite'
      }

    case 'warning':
      return {
        message: params?.warning?.message || 'Atenção.',
        politeness: 'polite'
      }

    case 'info':
      return {
        message: params?.info?.message || '',
        politeness: 'polite'
      }

    case 'navigation':
      if (params?.navigation) {
        return {
          message: `Navegado para ${params.navigation.page}.`,
          politeness: 'polite'
        }
      }
      return { message: 'Página carregada.', politeness: 'polite' }

    default:
      return { message: '', politeness: 'polite' }
  }
}

/**
 * Hook para gerenciar anúncios de acessibilidade
 *
 * Fornece funções para anunciar mensagens para screen readers
 * com suporte a anúncios contextuais pré-definidos.
 *
 * @example
 * ```tsx
 * function TransferButton() {
 *   const { announceByType } = useAccessibilityAnnounce()
 *
 *   const handleTransfer = async () => {
 *     await transferVideo()
 *     announceByType('video_transferred', {
 *       videoTransferred: {
 *         videoTitle: 'Meu Vídeo',
 *         playlistName: 'Favoritos'
 *       }
 *     })
 *   }
 *
 *   return <button onClick={handleTransfer}>Transferir</button>
 * }
 * ```
 */
export function useAccessibilityAnnounce() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  // Limpar anúncios antigos após 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setAnnouncements(prev =>
        prev.filter(a => now - a.timestamp < 10000)
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /**
   * Anuncia uma mensagem customizada
   */
  const announce = useCallback(
    (message: string, politeness: LiveRegionPoliteness = 'polite') => {
      if (!message) return

      const newAnnouncement: Announcement = {
        id: `announce-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        message,
        politeness,
        timestamp: Date.now()
      }

      setAnnouncements(prev => [...prev, newAnnouncement])
    },
    []
  )

  /**
   * Anuncia uma mensagem baseada em tipo pré-definido
   */
  const announceByType = useCallback(
    (type: AnnouncementType, params?: AnnouncementParams) => {
      const { message, politeness } = generateAnnouncementMessage(type, params)
      if (message) {
        announce(message, politeness)
      }
    },
    [announce]
  )

  /**
   * Funções de atalho para anúncios comuns
   */
  const announceVideoTransferred = useCallback(
    (videoTitle: string, playlistName: string) => {
      announceByType('video_transferred', {
        videoTransferred: { videoTitle, playlistName }
      })
    },
    [announceByType]
  )

  const announceScanSuccess = useCallback(
    (codeType: 'QR' | 'Barcode' | 'URL' | 'Text', value: string) => {
      announceByType('scan_success', {
        scanSuccess: { codeType, value }
      })
    },
    [announceByType]
  )

  const announceError = useCallback(
    (message: string, action?: string) => {
      announceByType('error', {
        error: { message, action }
      })
    },
    [announceByType]
  )

  const announceLoading = useCallback(
    (context: string) => {
      announceByType('loading', {
        loading: { context }
      })
    },
    [announceByType]
  )

  const announceSuccess = useCallback(
    (message: string) => {
      announceByType('success', { success: { message } })
    },
    [announceByType]
  )

  const clearAnnouncements = useCallback(() => {
    setAnnouncements([])
  }, [])

  return {
    announcements,
    announce,
    announceByType,
    announceVideoTransferred,
    announceScanSuccess,
    announceError,
    announceLoading,
    announceSuccess,
    clearAnnouncements
  }
}

export default useAccessibilityAnnounce
