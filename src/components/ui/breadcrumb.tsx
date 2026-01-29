"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  showHomeIcon?: boolean
  homeHref?: string
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      items,
      separator,
      showHomeIcon = true,
      homeHref = "/",
      className,
      ...props
    },
    ref
  ) => {
    const defaultSeparator = (
      <ChevronRight
        className="h-4 w-4 text-muted-foreground flex-shrink-0"
        aria-hidden="true"
      />
    )

    return (
      <nav
        ref={ref}
        aria-label="Navegação estrutural"
        className={cn("mb-4", className)}
        {...props}
      >
        <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {showHomeIcon && (
            <>
              <li className="flex items-center">
                <Link
                  href={homeHref}
                  className="flex items-center hover:text-foreground transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                  aria-label="Início"
                >
                  <Home className="h-4 w-4" />
                </Link>
              </li>
              {items.length > 0 && (
                <li aria-hidden="true" className="flex items-center">
                  {separator || defaultSeparator}
                </li>
              )}
            </>
          )}

          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <li className="flex items-center gap-1.5">
                  {item.icon && (
                    <span className="flex-shrink-0" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-foreground transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm max-w-[200px] truncate"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        "max-w-[200px] truncate",
                        isLast && "text-foreground font-medium"
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
                {!isLast && (
                  <li aria-hidden="true" className="flex items-center">
                    {separator || defaultSeparator}
                  </li>
                )}
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

export { Breadcrumb }
