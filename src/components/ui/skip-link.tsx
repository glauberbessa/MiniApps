"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  targetId?: string
  label?: string
}

/**
 * Skip Link para navegação por teclado
 * Implementa WCAG 2.4.1 - Bypass Blocks
 *
 * Permite que usuários de teclado e screen reader pulem diretamente para o conteúdo principal.
 *
 * @example
 * // No layout
 * <SkipLink />
 * <header>...</header>
 * <main id="main-content">...</main>
 */
const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  (
    {
      targetId = "main-content",
      label = "Pular para o conteúdo principal",
      className,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()

      const target = document.getElementById(targetId)
      if (target) {
        // Faz o elemento focável temporariamente
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1')
        }

        target.focus()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }

    return (
      <a
        ref={ref}
        href={`#${targetId}`}
        onClick={handleClick}
        className={cn(
          // Escondido por padrão
          "absolute left-0 top-0 z-[9999]",
          "-translate-y-full opacity-0",
          // Visível quando focado
          "focus:translate-y-0 focus:opacity-100",
          // Estilo do botão
          "bg-primary text-primary-foreground",
          "px-4 py-3",
          "text-sm font-medium",
          "rounded-br-lg",
          // Transições
          "transition-all duration-fast",
          // Focus ring
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {label}
      </a>
    )
  }
)
SkipLink.displayName = "SkipLink"

/**
 * Componente auxiliar para marcar a área de conteúdo principal
 * Use junto com SkipLink
 */
const SkipLinkTarget = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { id?: string }
>(({ id = "main-content", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      className="outline-none"
      {...props}
    >
      {children}
    </div>
  )
})
SkipLinkTarget.displayName = "SkipLinkTarget"

export { SkipLink, SkipLinkTarget }
