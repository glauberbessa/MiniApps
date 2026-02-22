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
import { RegisterForm } from "@/components/auth/register-form"

export default async function CadastroPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[350px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md" />}>
            <RegisterForm />
          </Suspense>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="ml-1 font-medium text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
