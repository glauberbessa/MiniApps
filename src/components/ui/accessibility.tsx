'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * VisuallyHidden - Oculta visualmente mas mantém acessível para screen readers
 *
 * WCAG 1.1.1: Non-text Content
 * Use para fornecer labels acessíveis para ícones, imagens, etc.
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Fechar menu</VisuallyHidden>
 * </button>
 * ```
 */
interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  /** Se true, torna-se visível quando focado */
  focusable?: boolean
}

export function VisuallyHidden({
  children,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        focusable ? 'sr-only-focusable' : 'sr-only',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/**
 * AriaLabel - Wrapper para adicionar aria-label a elementos
 *
 * @example
 * ```tsx
 * <AriaLabel label="Abrir configurações">
 *   <IconButton><SettingsIcon /></IconButton>
 * </AriaLabel>
 * ```
 */
interface AriaLabelProps {
  children: React.ReactElement
  label: string
}

export function AriaLabel({ children, label }: AriaLabelProps) {
  return React.cloneElement(children, {
    'aria-label': label
  })
}

/**
 * Landmark - Wrapper semântico para regiões da página
 *
 * WCAG 1.3.1: Info and Relationships
 * WCAG 2.4.1: Bypass Blocks
 *
 * @example
 * ```tsx
 * <Landmark as="nav" label="Menu principal">
 *   <NavItems />
 * </Landmark>
 * ```
 */
interface LandmarkProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  as: 'main' | 'nav' | 'aside' | 'header' | 'footer' | 'section' | 'article'
  label?: string
  labelledBy?: string
}

export function Landmark({
  children,
  as: Component,
  label,
  labelledBy,
  className,
  ...props
}: LandmarkProps) {
  return (
    <Component
      aria-label={label}
      aria-labelledby={labelledBy}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * AccessibleIcon - Ícone com descrição acessível
 *
 * @example
 * ```tsx
 * <AccessibleIcon label="Carrinho de compras">
 *   <ShoppingCartIcon />
 * </AccessibleIcon>
 * ```
 */
interface AccessibleIconProps {
  children: React.ReactElement
  label: string
}

export function AccessibleIcon({ children, label }: AccessibleIconProps) {
  return (
    <>
      {React.cloneElement(children, {
        'aria-hidden': true,
        focusable: false
      })}
      <VisuallyHidden>{label}</VisuallyHidden>
    </>
  )
}

/**
 * ProgressIndicator - Indicador de progresso acessível
 *
 * WCAG 4.1.3: Status Messages
 *
 * @example
 * ```tsx
 * <ProgressIndicator
 *   value={75}
 *   max={100}
 *   label="Carregando arquivos"
 * />
 * ```
 */
interface ProgressIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  label: string
  showValue?: boolean
}

export function ProgressIndicator({
  value,
  max = 100,
  label,
  showValue = false,
  className,
  ...props
}: ProgressIndicatorProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div className={cn('relative', className)} {...props}>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground mt-1">
          {percentage}%
        </span>
      )}
      <VisuallyHidden>
        {label}: {percentage}% concluído
      </VisuallyHidden>
    </div>
  )
}

/**
 * LoadingIndicator - Indicador de carregamento acessível
 *
 * @example
 * ```tsx
 * <LoadingIndicator label="Carregando dados..." />
 * ```
 */
interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingIndicator({
  label = 'Carregando...',
  size = 'md',
  className,
  ...props
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <div
        className={cn(
          'rounded-full border-current border-r-transparent animate-spin',
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  )
}

/**
 * ErrorMessage - Mensagem de erro acessível
 *
 * @example
 * ```tsx
 * <ErrorMessage id="email-error">
 *   Email inválido
 * </ErrorMessage>
 * ```
 */
interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ErrorMessage({
  children,
  className,
  id,
  ...props
}: ErrorMessageProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        className
      )}
      {...props}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {children}
    </div>
  )
}

/**
 * SuccessMessage - Mensagem de sucesso acessível
 *
 * @example
 * ```tsx
 * <SuccessMessage>
 *   Dados salvos com sucesso!
 * </SuccessMessage>
 * ```
 */
interface SuccessMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SuccessMessage({
  children,
  className,
  ...props
}: SuccessMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 text-sm text-success',
        className
      )}
      {...props}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      {children}
    </div>
  )
}

/**
 * DescribedBy - Associa descrição a um elemento
 *
 * @example
 * ```tsx
 * <DescribedBy description="Mínimo 8 caracteres">
 *   {(descriptionId) => (
 *     <>
 *       <Input aria-describedby={descriptionId} />
 *       <span id={descriptionId} className="text-sm text-muted">
 *         Mínimo 8 caracteres
 *       </span>
 *     </>
 *   )}
 * </DescribedBy>
 * ```
 */
interface DescribedByProps {
  description: string
  children: (descriptionId: string) => React.ReactNode
}

export function DescribedBy({ description, children }: DescribedByProps) {
  const id = React.useId()
  const descriptionId = `description-${id}`

  return (
    <>
      {children(descriptionId)}
    </>
  )
}

/**
 * KeyboardShortcut - Exibe atalho de teclado acessível
 *
 * @example
 * ```tsx
 * <KeyboardShortcut keys={['Ctrl', 'S']}>Salvar</KeyboardShortcut>
 * ```
 */
interface KeyboardShortcutProps extends React.HTMLAttributes<HTMLElement> {
  keys: string[]
  children?: React.ReactNode
}

export function KeyboardShortcut({
  keys,
  children,
  className,
  ...props
}: KeyboardShortcutProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} {...props}>
      {children && <span className="mr-2">{children}</span>}
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <kbd
            className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border"
            aria-label={key}
          >
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground" aria-hidden="true">+</span>
          )}
        </React.Fragment>
      ))}
    </span>
  )
}

/**
 * FocusGuard - Evita que o foco escape de uma região
 *
 * Útil para modais, menus dropdown, etc.
 *
 * @example
 * ```tsx
 * <FocusGuard>
 *   <Modal>...</Modal>
 * </FocusGuard>
 * ```
 */
interface FocusGuardProps {
  children: React.ReactNode
  onEscape?: () => void
}

export function FocusGuard({ children, onEscape }: FocusGuardProps) {
  const startRef = React.useRef<HTMLDivElement>(null)
  const endRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleStartFocus = () => {
    // Mover para o último elemento focável
    const focusables = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusables && focusables.length > 0) {
      (focusables[focusables.length - 1] as HTMLElement).focus()
    }
  }

  const handleEndFocus = () => {
    // Mover para o primeiro elemento focável
    const focusables = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusables && focusables.length > 0) {
      (focusables[0] as HTMLElement).focus()
    }
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onEscape])

  return (
    <>
      <div
        ref={startRef}
        tabIndex={0}
        onFocus={handleStartFocus}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, width: 1, height: 1, opacity: 0 }}
      />
      <div ref={containerRef}>
        {children}
      </div>
      <div
        ref={endRef}
        tabIndex={0}
        onFocus={handleEndFocus}
        aria-hidden="true"
        style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0 }}
      />
    </>
  )
}

/**
 * AnnouncementRegion - Região para anúncios de status
 *
 * WCAG 4.1.3: Status Messages
 */
interface AnnouncementRegionProps {
  message?: string
  politeness?: 'polite' | 'assertive'
}

export function AnnouncementRegion({
  message,
  politeness = 'polite'
}: AnnouncementRegionProps) {
  const [currentMessage, setCurrentMessage] = React.useState(message)

  React.useEffect(() => {
    if (message) {
      setCurrentMessage(message)
    }
  }, [message])

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {currentMessage}
    </div>
  )
}
