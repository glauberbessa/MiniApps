"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { registerSchema, RegisterInput } from "@/lib/validations/auth"
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
import { PasswordStrength } from "./password-strength"

const { authForms: txt } = UI_TEXT

interface RegisterFormProps {
  className?: string
}

export function RegisterForm({ className }: RegisterFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = form.watch("password")

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || txt.errors.registerFailed)
        toast({
          variant: "destructive",
          title: UI_TEXT.authToasts.registerError.title,
          description: result.error || UI_TEXT.authToasts.registerError.description,
        })
        return
      }

      setSuccess(true)
      toast({
        variant: "success",
        title: UI_TEXT.authToasts.registerSuccess.title,
        description: UI_TEXT.authToasts.registerSuccess.description,
      })
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
    } catch {
      setError(txt.errors.registerError)
      toast({
        variant: "destructive",
        title: UI_TEXT.authToasts.registerError.title,
        description: UI_TEXT.authToasts.registerError.description,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-md bg-success/10 p-4 text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <p className="text-sm text-success">
          {txt.success.registered}
        </p>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{txt.labels.name}</FormLabel>
              <FormControl>
                <Input
                  placeholder={txt.placeholders.name}
                  autoComplete="name"
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
              <FormLabel>{txt.labels.confirmPassword}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={txt.placeholders.confirmPassword}
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
          {isLoading ? txt.buttons.registering : txt.buttons.register}
        </Button>
      </form>
    </Form>
  )
}
