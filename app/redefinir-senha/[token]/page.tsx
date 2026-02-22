import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

interface RedefinirSenhaPageProps {
  params: Promise<{ token: string }>
}

export default async function RedefinirSenhaPage({ params }: RedefinirSenhaPageProps) {
  const session = await auth()
  const { token } = await params

  if (session) {
    redirect("/")
  }

  // Verificar se o token é válido
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              Link Inválido
            </CardTitle>
            <CardDescription>
              Este link de recuperação de senha expirou ou é inválido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Os links de recuperação são válidos por 1 hora. Se seu link expirou,
              solicite um novo.
            </p>
            <Button className="w-full" asChild>
              <Link href="/esqueci-senha">Solicitar Novo Link</Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login">Voltar para o Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[250px] animate-pulse bg-gray-100 rounded-md" />}>
            <ResetPasswordForm token={token} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
