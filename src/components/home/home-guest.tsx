"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Mail, Lock, ArrowRight, Check, ExternalLink } from "lucide-react"

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

// Ícone do YouTube
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// Ícone de Camera para Scanner
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// Ícone de Check
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Ícone de Arrow Right
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

// Ícone de GitHub
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

interface AppCardProps {
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  iconBg: string
  glowColor: string
  openInNewTab?: boolean
  features: string[]
}

// Componente de Card de App
function AppCard({ title, subtitle, description, icon: Icon, href, iconBg, glowColor, openInNewTab, features }: AppCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      aria-label={`${title} - ${description}`}
      className="launcher-card-editorial group relative block p-8 md:p-10 focus-visible:outline-none opacity-0 launcher-animate-unfold"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect de fundo */}
      <div
        className={`
          absolute inset-0 rounded-2xl transition-opacity duration-500
          ${isHovered ? 'opacity-20' : 'opacity-0'}
          bg-gradient-to-br ${iconBg}
          blur-2xl -z-10 scale-110
        `}
        aria-hidden="true"
      />

      {/* Borda com glow sutil */}
      <div
        className={`
          absolute inset-0 rounded-2xl transition-all duration-300
          ${isHovered ? 'opacity-100' : 'opacity-0'}
          border border-white/10
        `}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Header do card */}
        <div className="flex items-start gap-5 mb-6">
          <div className={`
            relative w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br ${iconBg}
            shadow-lg transition-all duration-300
            ${isHovered ? `shadow-xl ${glowColor}` : ''}
          `}>
            <Icon className="w-8 h-8 text-white" />
            <div className={`
              absolute inset-0 rounded-xl bg-white/20
              transition-opacity duration-300
              ${isHovered ? 'opacity-100' : 'opacity-0'}
            `} />
          </div>

          <div className="flex-1 pt-1">
            {subtitle && (
              <span className="text-data-sm text-launcher-muted tracking-widest uppercase block mb-1">
                {subtitle}
              </span>
            )}
            <h3 className="text-heading-lg text-launcher-highlight leading-tight">
              {title}
            </h3>
          </div>
        </div>

        <div className={`h-px mb-5 transition-all duration-300 ${isHovered ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent' : 'bg-launcher-border'}`} aria-hidden="true" />

        <p className="text-ui text-launcher-muted leading-relaxed mb-6">
          {description}
        </p>

        {features && (
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-ui-sm">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${iconBg} flex-shrink-0`}>
                  <CheckIcon className="w-3 h-3 text-white" />
                </span>
                <span className="text-launcher-accent">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={`
          inline-flex items-center gap-2 px-5 py-2.5 rounded-full
          text-button text-sm font-medium
          transition-all duration-300
          ${isHovered
            ? `bg-gradient-to-r ${iconBg} text-white shadow-lg`
            : 'bg-launcher-surface text-launcher-highlight border border-launcher-border'}
        `}>
          <span>Acessar</span>
          <ArrowRightIcon
            className={`w-4 h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
          />
        </div>
      </div>
    </a>
  )
}

// Componente de Login Inline
function InlineLoginForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      // Refresh para atualizar o estado de autenticação
      window.location.reload()
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

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="launcher-card p-8 md:p-10 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />

      <div className="relative">
        <h2 className="text-heading-xs text-launcher-muted mb-2 tracking-[0.2em]">
          ACESSO
        </h2>
        <p className="text-heading-md text-launcher-highlight mb-6">
          Entre na sua conta
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-launcher-accent">{txt.labels.email}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-launcher-muted" />
                      <Input
                        type="email"
                        placeholder={txt.placeholders.email}
                        autoComplete="email"
                        disabled={isLoading}
                        className="pl-10 bg-launcher-surface border-launcher-border text-launcher-highlight placeholder:text-launcher-muted/50 focus:border-white/30 focus:ring-white/10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-launcher-accent">{txt.labels.password}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder={txt.placeholders.password}
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="bg-launcher-surface border-launcher-border text-launcher-highlight placeholder:text-launcher-muted/50 focus:border-white/30 focus:ring-white/10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                href="/esqueci-senha"
                className="text-sm text-launcher-muted hover:text-launcher-highlight transition-colors"
              >
                {txt.links.forgotPassword}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? txt.buttons.loggingIn : txt.buttons.login}
            </Button>
          </form>
        </Form>

        {/* Divisor */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-launcher-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-launcher-surface px-4 text-launcher-muted">
              {txt.dividers.orContinueWith}
            </span>
          </div>
        </div>

        {/* Google Button */}
        <Button
          variant="outline"
          className="w-full bg-launcher-surface border-launcher-border text-launcher-highlight hover:bg-white/5 hover:border-white/20"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {txt.buttons.loginWithGoogle}
        </Button>

        {/* Link para cadastro */}
        <p className="mt-6 text-center text-sm text-launcher-muted">
          {txt.links.noAccount}{" "}
          <Link
            href="/cadastro"
            className="text-launcher-highlight hover:text-white transition-colors font-medium"
          >
            {txt.links.register}
          </Link>
        </p>
      </div>
    </div>
  )
}

export function HomeGuest() {
  // URLs dos apps
  const isDev = process.env.NODE_ENV === "development"
  const ytpmUrl = isDev ? "http://localhost:3001/ytpm" : "/ytpm"
  const scannerUrl = isDev ? "http://localhost:3002/scanner" : "/scanner"

  const apps: AppCardProps[] = [
    {
      title: "Playlist Manager",
      subtitle: "YouTube",
      description: "Gerencie suas playlists do YouTube como um profissional. Sincronização automática, transferência de vídeos e monitoramento de quota em tempo real.",
      icon: YouTubeIcon,
      href: ytpmUrl,
      iconBg: "from-red-500 to-red-700",
      glowColor: "shadow-red-500/30",
      openInNewTab: isDev,
      features: [
        "Sincronização automática",
        "Transfer entre playlists",
        "Monitoramento de quota",
      ],
    },
    {
      title: "QR Code & Barras",
      subtitle: "Scanner",
      description: "Escaneie códigos QR e de barras instantaneamente. Interface minimalista focada na velocidade e precisão.",
      icon: CameraIcon,
      href: scannerUrl,
      iconBg: "from-cyan-500 to-teal-600",
      glowColor: "shadow-cyan-500/30",
      openInNewTab: isDev,
      features: [
        "QR Code e códigos de barras",
        "OCR para texto",
        "Zoom progressivo",
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col launcher-bg-mesh launcher-grain launcher-selection">
      {/* Header */}
      <header className="pt-20 pb-16 px-6 hero-launcher relative" role="banner">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-white/[0.01] to-transparent rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-launcher-surface border border-launcher-border mb-8 opacity-0 launcher-animate-unfold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-data-sm text-launcher-muted tracking-wider uppercase">v2.0 disponível</span>
          </div>

          <h1 className="text-display-xl text-launcher-highlight mb-6 launcher-animate-title tracking-[0.15em]">
            MINIAPPS
          </h1>

          <p className="text-editorial-lg text-launcher-muted max-w-md mx-auto opacity-0 launcher-animate-unfold launcher-stagger-1">
            &ldquo;Sua central de aplicativos&rdquo;
          </p>

          <div className="relative max-w-sm mx-auto mt-10 launcher-animate-line" aria-hidden="true">
            <div className="h-px bg-gradient-to-r from-transparent via-launcher-border to-transparent" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* Layout com Apps e Login */}
        <section className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Grid de Apps (2 colunas em desktop) */}
              <div className="lg:col-span-2">
                <h2 className="sr-only">Aplicativos disponíveis</h2>
                <div className="grid md:grid-cols-2 gap-8 launcher-stagger-children">
                  {apps.map((app, index) => (
                    <div key={app.title} className={`launcher-stagger-${index + 1}`}>
                      <AppCard {...app} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Login (sidebar) */}
              <div className="lg:col-span-1 opacity-0 launcher-animate-unfold launcher-stagger-2">
                <InlineLoginForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-launcher-border/50 bg-gradient-to-t from-black/20 to-transparent" role="contentinfo">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-display-sm text-launcher-highlight tracking-[0.1em]">MINIAPPS</span>
              <span className="w-px h-4 bg-launcher-border" aria-hidden="true" />
              <span className="text-ui-sm text-launcher-muted">Hub de Aplicativos</span>
            </div>

            <nav aria-label="Links do rodapé">
              <ul className="flex items-center gap-8 text-ui-sm">
                <li>
                  <a
                    href="#"
                    className="text-launcher-muted hover:text-launcher-highlight transition-colors duration-200"
                  >
                    Sobre
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-launcher-muted hover:text-launcher-highlight transition-colors duration-200"
                  >
                    Privacidade
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/glauberbessa/MiniApps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-launcher-muted hover:text-launcher-highlight transition-colors duration-200"
                  >
                    <GitHubIcon className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                </li>
              </ul>
            </nav>

            <p className="text-ui-sm text-launcher-muted/60">
              &copy; {new Date().getFullYear()} MiniApps
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
