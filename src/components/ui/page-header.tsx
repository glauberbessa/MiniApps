"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  showBreadcrumb?: boolean
}

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  (
    {
      title,
      description,
      breadcrumbs = [],
      actions,
      showBreadcrumb = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn("mb-6 space-y-4", className)}
        {...props}
      >
        {showBreadcrumb && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} />
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground sm:text-base max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              {actions}
            </div>
          )}
        </div>
      </header>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }
