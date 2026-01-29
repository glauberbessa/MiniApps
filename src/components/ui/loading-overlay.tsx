"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  message?: string
  fullScreen?: boolean
  blur?: boolean
  spinnerSize?: "sm" | "md" | "lg"
}

const spinnerSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    {
      isLoading,
      message,
      fullScreen = false,
      blur = true,
      spinnerSize = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    if (!isLoading && !children) {
      return null
    }

    const overlay = (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy={isLoading}
        aria-label={message || "Carregando..."}
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          fullScreen
            ? "fixed inset-0 z-modal bg-background/80"
            : "absolute inset-0 z-10 bg-background/60",
          blur && "backdrop-blur-sm",
          "transition-opacity duration-normal",
          isLoading ? "opacity-100" : "opacity-0 pointer-events-none",
          className
        )}
        {...props}
      >
        <Loader2
          className={cn(
            spinnerSizes[spinnerSize],
            "animate-spin text-primary"
          )}
          aria-hidden="true"
        />
        {message && (
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            {message}
          </p>
        )}
      </div>
    )

    if (fullScreen) {
      return isLoading ? overlay : null
    }

    return (
      <div className="relative">
        {children}
        {overlay}
      </div>
    )
  }
)
LoadingOverlay.displayName = "LoadingOverlay"

// Componente simplificado para spinner inline
export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  message?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = "md", message, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={message || "Carregando..."}
        className={cn("flex items-center justify-center gap-2", className)}
        {...props}
      >
        <Loader2
          className={cn(spinnerSizes[size], "animate-spin text-primary")}
          aria-hidden="true"
        />
        {message && (
          <span className="text-sm text-muted-foreground">{message}</span>
        )}
        <span className="sr-only">{message || "Carregando..."}</span>
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingOverlay, LoadingSpinner }
