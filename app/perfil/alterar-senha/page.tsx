import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"

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
import { ChangePasswordForm } from "@/components/auth/change-password-form"

export default async function AlterarSenhaPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/perfil/alterar-senha")
  }

  // Verificar se o usuário tem senha (pode ser apenas OAuth)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { password: true },
  })

  const hasPassword = !!user?.password

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">Alterar Senha</CardTitle>
              <CardDescription>
                {hasPassword
                  ? "Digite sua senha atual e escolha uma nova senha"
                  : "Defina uma senha para sua conta"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!hasPassword ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-md bg-blue-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Conta sem senha</p>
                  <p className="mt-1 text-blue-700">
                    Sua conta foi criada usando Google. Para definir uma senha,
                    use a opção &quot;Esqueci minha senha&quot; no login.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/esqueci-senha">Definir Senha</Link>
              </Button>
            </div>
          ) : (
            <Suspense fallback={<div className="h-[300px] animate-pulse bg-gray-100 rounded-md" />}>
              <ChangePasswordForm />
            </Suspense>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
