"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePasswordStrength } from "@/hooks/use-password-strength"
import { PASSWORD_CRITERIA_LABELS, PasswordCriteria } from "@/lib/validations/auth"

interface PasswordStrengthProps {
  password: string
  showCriteria?: boolean
  className?: string
}

export function PasswordStrength({
  password,
  showCriteria = true,
  className,
}: PasswordStrengthProps) {
  const { criteria, strength, color, label, percentage } = usePasswordStrength(password)

  if (!password) {
    return null
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Força da senha</span>
          <span
            className={cn(
              "font-medium",
              strength <= 2 && "text-red-500",
              strength === 3 && "text-yellow-500",
              strength >= 4 && "text-green-500"
            )}
          >
            {label}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all duration-300", color)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Lista de critérios */}
      {showCriteria && (
        <ul className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
          {(Object.keys(criteria) as Array<keyof PasswordCriteria>).map((key) => (
            <li
              key={key}
              className={cn(
                "flex items-center gap-1.5 transition-colors",
                criteria[key] ? "text-success" : "text-muted-foreground"
              )}
            >
              {criteria[key] ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              <span>{PASSWORD_CRITERIA_LABELS[key]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
