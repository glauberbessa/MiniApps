"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { InboxIcon } from "lucide-react"

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive"
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  size?: "sm" | "md" | "lg"
}

const sizeStyles = {
  sm: {
    container: "py-8",
    icon: "h-10 w-10 mb-3",
    title: "text-base",
    description: "text-sm max-w-xs",
  },
  md: {
    container: "py-12",
    icon: "h-12 w-12 mb-4",
    title: "text-lg",
    description: "text-sm max-w-sm",
  },
  lg: {
    container: "py-16",
    icon: "h-16 w-16 mb-6",
    title: "text-xl",
    description: "text-base max-w-md",
  },
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon,
      title,
      description,
      action,
      secondaryAction,
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const styles = sizeStyles[size]
    const defaultIcon = <InboxIcon className={cn(styles.icon, "text-muted-foreground")} />

    return (
      <div
        ref={ref}
        role="status"
        aria-label={title}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          styles.container,
          className
        )}
        {...props}
      >
        {icon ? (
          <div className={cn(styles.icon, "text-muted-foreground flex items-center justify-center")}>
            {icon}
          </div>
        ) : (
          defaultIcon
        )}

        <h3 className={cn("font-medium text-foreground", styles.title)}>
          {title}
        </h3>

        {description && (
          <p className={cn("text-muted-foreground mt-2", styles.description)}>
            {description}
          </p>
        )}

        {(action || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || "default"}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || "outline"}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
