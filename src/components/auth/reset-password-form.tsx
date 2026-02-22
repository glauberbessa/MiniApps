"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle } from "lucide-react"

import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations/auth"
import { UI_TEXT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordStrength } from "./password-strength"

const { authForms: txt } = UI_TEXT

interface ResetPasswordFormProps {
  token: string
  className?: string
}

export function ResetPasswordForm({ token, className }: ResetPasswordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  })

  const password = form.watch("password")

  async function onSubmit(data: ResetPasswordInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || txt.errors.resetPasswordFailed)
        return
      }

      setSuccess(true)
      toast({
        variant: "success",
        title: UI_TEXT.authToasts.passwordResetSuccess.title,
        description: UI_TEXT.authToasts.passwordResetSuccess.description,
      })
      setTimeout(() => {
        router.push("/login?reset=true")
      }, 3000)
    } catch {
      setError(txt.errors.resetPasswordError)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{txt.verification.passwordRedefined}</h3>
          <p className="text-sm text-muted-foreground">
            {txt.success.passwordReset}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
      >
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.newPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={txt.placeholders.newPassword}
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <PasswordStrength password={password} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.confirmNewPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={txt.placeholders.confirmNewPassword}
                  autoComplete="new-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? txt.buttons.resettingPassword : txt.buttons.resetPassword}
        </Button>
      </form>
    </Form>
  )
}
