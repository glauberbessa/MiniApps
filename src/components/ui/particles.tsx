'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ParticleProps {
  x: number
  y: number
  delay: number
  color?: string
}

function Particle({ x, y, delay, color = 'var(--scanner-success)' }: ParticleProps) {
  return (
    <div
      className="scanner-particle"
      style={{
        '--particle-x': `${x}px`,
        '--particle-y': `${y}px`,
        animationDelay: `${delay}s`,
        background: color,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      } as React.CSSProperties}
    />
  )
}

interface ParticleSystemProps {
  /**
   * Se true, dispara as partículas
   */
  active: boolean

  /**
   * Número de partículas a criar
   * @default 8
   */
  count?: number

  /**
   * Cor das partículas
   * @default 'var(--scanner-success)'
   */
  color?: string

  /**
   * Raio de dispersão das partículas
   * @default 40
   */
  radius?: number

  /**
   * Callback quando a animação terminar
   */
  onComplete?: () => void

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Sistema de partículas para feedback visual de sucesso
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <ParticleSystem active={scanSuccess} color="var(--scanner-success)" />
 *   <Content />
 * </div>
 * ```
 */
export function ParticleSystem({
  active,
  count = 8,
  color = 'var(--scanner-success)',
  radius = 40,
  onComplete,
  className,
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<ParticleProps[]>([])

  const generateParticles = useCallback(() => {
    const newParticles: ParticleProps[] = []
    const angleStep = (2 * Math.PI) / count

    for (let i = 0; i < count; i++) {
      const angle = angleStep * i
      newParticles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        delay: i * 0.02,
        color,
      })
    }

    return newParticles
  }, [count, radius, color])

  useEffect(() => {
    if (active) {
      setParticles(generateParticles())

      // Limpar partículas após animação
      const timeout = setTimeout(() => {
        setParticles([])
        onComplete?.()
      }, 600 + count * 20) // Duração base + delays

      return () => clearTimeout(timeout)
    } else {
      setParticles([])
    }
  }, [active, generateParticles, count, onComplete])

  if (!active || particles.length === 0) return null

  return (
    <div className={cn('scanner-particles', className)}>
      {particles.map((particle, index) => (
        <Particle key={index} {...particle} />
      ))}
    </div>
  )
}

interface SuccessRingProps {
  /**
   * Se true, mostra o anel de sucesso
   */
  active: boolean

  /**
   * Callback quando a animação terminar
   */
  onComplete?: () => void

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Anel de sucesso que se expande
 */
export function SuccessRing({ active, onComplete, className }: SuccessRingProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)

      const timeout = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 600)

      return () => clearTimeout(timeout)
    }
  }, [active, onComplete])

  if (!visible) return null

  return <div className={cn('scanner-success-ring', className)} />
}

interface FlashOverlayProps {
  /**
   * Se true, mostra o flash
   */
  active: boolean

  /**
   * Cor do flash
   * @default 'var(--scanner-success)'
   */
  color?: string

  /**
   * Callback quando a animação terminar
   */
  onComplete?: () => void

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Overlay de flash para feedback visual
 */
export function FlashOverlay({
  active,
  color = 'var(--scanner-success)',
  onComplete,
  className,
}: FlashOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)

      const timeout = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 300)

      return () => clearTimeout(timeout)
    }
  }, [active, onComplete])

  if (!visible) return null

  return (
    <div
      className={cn('scanner-flash-overlay', className)}
      style={{ background: color }}
    />
  )
}

interface ScanSuccessEffectProps {
  /**
   * Se true, dispara todos os efeitos de sucesso
   */
  active: boolean

  /**
   * Callback quando todas as animações terminarem
   */
  onComplete?: () => void

  /**
   * Classes CSS adicionais
   */
  className?: string
}

/**
 * Efeito combinado de sucesso do scanner
 * Inclui: Flash + Partículas + Anel
 */
export function ScanSuccessEffect({
  active,
  onComplete,
  className,
}: ScanSuccessEffectProps) {
  const [effectsComplete, setEffectsComplete] = useState(0)

  useEffect(() => {
    if (!active) {
      setEffectsComplete(0)
    }
  }, [active])

  const handleEffectComplete = () => {
    setEffectsComplete((prev) => {
      const next = prev + 1
      if (next >= 3 && onComplete) {
        onComplete()
      }
      return next
    })
  }

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      <FlashOverlay active={active} onComplete={handleEffectComplete} />
      <ParticleSystem active={active} onComplete={handleEffectComplete} />
      <SuccessRing active={active} onComplete={handleEffectComplete} />
    </div>
  )
}

export default ParticleSystem
