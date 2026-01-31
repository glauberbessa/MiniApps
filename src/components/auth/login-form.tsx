"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { loginSchema, LoginInput } from "@/lib/validations/auth"
import { UI_TEXT } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const { authForms: txt } = UI_TEXT

interface LoginFormProps {
  className?: string
  callbackUrl?: string
}

export function LoginForm({ className, callbackUrl }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultCallbackUrl = callbackUrl || searchParams.get("callbackUrl") || "/"

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError(txt.errors.invalidCredentials)
        toast({
          variant: "destructive",
          title: UI_TEXT.authToasts.loginError.title,
          description: UI_TEXT.authToasts.loginError.description,
        })
        return
      }

      toast({
        variant: "success",
        title: UI_TEXT.authToasts.loginSuccess.title,
        description: UI_TEXT.authToasts.loginSuccess.description,
      })

      router.push(defaultCallbackUrl)
      router.refresh()
    } catch {
      setError(txt.errors.loginFailed)
      toast({
        variant: "destructive",
        title: UI_TEXT.authToasts.loginError.title,
        description: UI_TEXT.authToasts.loginError.description,
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.password}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={txt.placeholders.password}
                  autoComplete="current-password"
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
          {isLoading ? txt.buttons.loggingIn : txt.buttons.login}
        </Button>
      </form>
    </Form>
  )
}
