import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/lib/auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default async function EsqueciSenhaPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu e-mail e enviaremos instruções para redefinir sua senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div className="h-[120px] animate-pulse bg-muted rounded-md" />}>
            <ForgotPasswordForm />
          </Suspense>

          <Button variant="ghost" className="w-full" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
