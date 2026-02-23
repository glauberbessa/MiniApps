import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/auth/login-form"
import { GoogleButton } from "./google-button"

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()
  const params = await searchParams

  if (session) {
    redirect("/")
  }

  const registered = params.registered === "true"
  const reset = params.reset === "true"

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
          <CardDescription>
            Entre com seu e-mail e senha ou use sua conta Google
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {registered && (
            <div className="rounded-md bg-success/10 p-3 text-sm text-success">
              Conta criada com sucesso! Faça login para continuar.
            </div>
          )}
          {reset && (
            <div className="rounded-md bg-success/10 p-3 text-sm text-success">
              Senha redefinida com sucesso! Faça login com sua nova senha.
            </div>
          )}

          <Suspense fallback={<div className="h-[200px] animate-pulse bg-muted rounded-md" />}>
            <LoginForm />
          </Suspense>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <GoogleButton />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm">
          <Link
            href="/esqueci-senha"
            className="text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Esqueceu sua senha?
          </Link>
          <div className="text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
