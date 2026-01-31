"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Session } from "next-auth"
import {
  LogOut,
  Settings,
  User,
  ChevronRight,
  Shield,
  ExternalLink
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { UI_TEXT } from "@/lib/i18n"
import { useToast } from "@/components/ui/use-toast"

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

// Componente de Card do Usuário
function UserCard({ session }: { session: Session }) {
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const user = session.user
  const displayName = user?.name || user?.email?.split("@")[0] || "Usuário"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      toast({
        title: UI_TEXT.authToasts.logoutSuccess.title,
        description: UI_TEXT.authToasts.logoutSuccess.description,
      })
      await signOut({ callbackUrl: "/" })
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="launcher-card p-6 md:p-8 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />

      <div className="relative">
        {/* Header com avatar e info */}
        <div className="flex items-center gap-4 mb-6">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-14 h-14 rounded-full ring-2 ring-emerald-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-heading-md text-launcher-highlight">
              Olá, {displayName.split(" ")[0]}!
            </h2>
            <p className="text-ui-sm text-launcher-muted truncate">
              {user?.email}
            </p>
          </div>

          {/* Badge de status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-emerald-400">Online</span>
          </div>
        </div>

        {/* Linha separadora */}
        <div className="h-px bg-launcher-border mb-6" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <Link
            href="/perfil/alterar-senha"
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-launcher-muted group-hover:text-launcher-highlight transition-colors" />
              <span className="text-ui text-launcher-accent group-hover:text-launcher-highlight transition-colors">
                Alterar senha
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-launcher-muted group-hover:text-launcher-highlight transition-colors" />
          </Link>
        </div>

        {/* Linha separadora */}
        <div className="h-px bg-launcher-border my-4" />

        {/* Logout Button */}
        <Button
          variant="ghost"
          className="w-full justify-start text-launcher-muted hover:text-red-400 hover:bg-red-500/10"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          {isLoggingOut ? "Saindo..." : UI_TEXT.auth.logout}
        </Button>
      </div>
    </div>
  )
}

interface HomeAuthenticatedProps {
  session: Session
}

export function HomeAuthenticated({ session }: HomeAuthenticatedProps) {
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

  const displayName = session.user?.name || session.user?.email?.split("@")[0] || "Usuário"

  return (
    <div className="min-h-screen flex flex-col launcher-bg-mesh launcher-grain launcher-selection">
      {/* Header */}
      <header className="pt-16 pb-12 px-6 hero-launcher relative" role="banner">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-white/[0.01] to-transparent rounded-full blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-launcher-surface border border-launcher-border mb-6 opacity-0 launcher-animate-unfold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-data-sm text-launcher-muted tracking-wider uppercase">
              Bem-vindo de volta, {displayName.split(" ")[0]}
            </span>
          </div>

          <h1 className="text-display-xl text-launcher-highlight mb-4 launcher-animate-title tracking-[0.15em]">
            MINIAPPS
          </h1>

          <p className="text-editorial-lg text-launcher-muted max-w-md mx-auto opacity-0 launcher-animate-unfold launcher-stagger-1">
            &ldquo;Escolha um aplicativo para começar&rdquo;
          </p>

          <div className="relative max-w-sm mx-auto mt-8 launcher-animate-line" aria-hidden="true">
            <div className="h-px bg-gradient-to-r from-transparent via-launcher-border to-transparent" />
            <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
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

              {/* Card do Usuário (sidebar) */}
              <div className="lg:col-span-1 opacity-0 launcher-animate-unfold launcher-stagger-2">
                <UserCard session={session} />
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
