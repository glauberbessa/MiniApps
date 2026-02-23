"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Mail } from "lucide-react"

import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validations/auth"
import { UI_TEXT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const { authForms: txt } = UI_TEXT

interface ForgotPasswordFormProps {
  className?: string
}

export function ForgotPasswordForm({ className }: ForgotPasswordFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || txt.errors.forgotPasswordFailed)
        return
      }

      setSuccess(true)
      toast({
        variant: "success",
        title: UI_TEXT.authToasts.passwordResetEmailSent.title,
        description: UI_TEXT.authToasts.passwordResetEmailSent.description,
      })
    } catch {
      setError(txt.errors.forgotPasswordError)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
          <Mail className="h-6 w-6 text-success" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium">{txt.verification.checkEmail}</h3>
          <p className="text-sm text-muted-foreground">
            {txt.success.emailSent}
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={txt.placeholders.email}
                  autoComplete="email"
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
          {isLoading ? txt.buttons.sendingInstructions : txt.buttons.forgotPassword}
        </Button>
      </form>
    </Form>
  )
}
