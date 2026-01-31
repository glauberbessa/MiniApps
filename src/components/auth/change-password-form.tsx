"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, CheckCircle } from "lucide-react"

import { changePasswordSchema, ChangePasswordInput } from "@/lib/validations/auth"
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

interface ChangePasswordFormProps {
  className?: string
}

export function ChangePasswordForm({ className }: ChangePasswordFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = form.watch("newPassword")

  async function onSubmit(data: ChangePasswordInput) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || txt.errors.changePasswordFailed)
        toast({
          variant: "destructive",
          title: UI_TEXT.authToasts.passwordChangeError.title,
          description: result.error || UI_TEXT.authToasts.passwordChangeError.description,
        })
        return
      }

      setSuccess(true)
      toast({
        variant: "success",
        title: UI_TEXT.authToasts.passwordChangeSuccess.title,
        description: UI_TEXT.authToasts.passwordChangeSuccess.description,
      })
      form.reset()
    } catch {
      setError(txt.errors.changePasswordError)
      toast({
        variant: "destructive",
        title: UI_TEXT.authToasts.passwordChangeError.title,
        description: UI_TEXT.authToasts.passwordChangeError.description,
      })
    } finally {
      setIsLoading(false)
    }
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

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-800 animate-in fade-in-0 zoom-in-95 duration-300">
            <CheckCircle className="h-4 w-4" />
            {txt.success.passwordChanged}
          </div>
        )}

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.currentPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={txt.placeholders.currentPassword}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
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
              <PasswordStrength password={newPassword} />
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
          {isLoading ? txt.buttons.changingPassword : txt.buttons.changePassword}
        </Button>
      </form>
    </Form>
  )
}
