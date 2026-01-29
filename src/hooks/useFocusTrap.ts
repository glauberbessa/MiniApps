"use client"

import { useEffect, useRef, useCallback } from "react"

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ')

export interface UseFocusTrapOptions {
  isActive?: boolean
  initialFocus?: HTMLElement | null
  returnFocus?: boolean
  onEscape?: () => void
}

/**
 * Hook para gerenciar focus trap em modais e dialogs
 * Implementa WCAG 2.1.2 - Sem armadilhas de teclado
 *
 * @param options - Opções de configuração
 * @returns ref para o elemento container
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>({
  isActive = true,
  initialFocus,
  returnFocus = true,
  onEscape,
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T | null>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Pega todos os elementos focáveis dentro do container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []

    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
    return Array.from(elements).filter(
      el => el.offsetParent !== null // Filtra elementos visíveis
    )
  }, [])

  // Move o foco para o primeiro elemento focável
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
    }
  }, [getFocusableElements])

  // Move o foco para o último elemento focável
  const focusLast = useCallback(() => {
    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[elements.length - 1].focus()
    }
  }, [getFocusableElements])

  useEffect(() => {
    if (!isActive) return

    // Salva o elemento atualmente focado
    previousActiveElement.current = document.activeElement

    // Foca no elemento inicial ou no primeiro focável
    if (initialFocus) {
      initialFocus.focus()
    } else {
      focusFirst()
    }

    // Handler para Tab e Escape
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containerRef.current) return

      if (event.key === 'Escape' && onEscape) {
        event.preventDefault()
        onEscape()
        return
      }

      if (event.key !== 'Tab') return

      const elements = getFocusableElements()
      if (elements.length === 0) return

      const firstElement = elements[0]
      const lastElement = elements[elements.length - 1]
      const activeElement = document.activeElement

      // Shift + Tab no primeiro elemento -> vai para o último
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
        return
      }

      // Tab no último elemento -> vai para o primeiro
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
        return
      }
    }

    // Handler para cliques fora do container
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        event.preventDefault()
        focusFirst()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)

      // Retorna o foco para o elemento anterior
      if (
        returnFocus &&
        previousActiveElement.current &&
        previousActiveElement.current instanceof HTMLElement
      ) {
        previousActiveElement.current.focus()
      }
    }
  }, [isActive, initialFocus, returnFocus, onEscape, focusFirst, getFocusableElements])

  return containerRef
}

export default useFocusTrap
