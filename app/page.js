'use client'

import { useState } from 'react'

// Ícone do YouTube usando Lucide-style
function YouTubeIcon({ className }) {
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

// Ícone de QR Code
function QRCodeIcon({ className }) {
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  )
}

// Ícone de Grid/Apps
function AppsIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// Ícone de Check
function CheckIcon({ className }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Ícone de Arrow Right
function ArrowRightIcon({ className }) {
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
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

// Componente de Card de App com acessibilidade melhorada
function AppCard({ title, description, icon: Icon, href, gradient, hoverGradient, iconBg, openInNewTab, features }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      aria-label={`${title} - ${description}`}
      className={`
        relative block p-6 rounded-2xl border border-gray-700/50
        transition-all duration-normal ease-out
        hover:scale-105 hover:border-gray-600/50
        hover:shadow-2xl hover:shadow-primary-500/20
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
        ${isHovered ? hoverGradient : gradient}
        card-shine
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-normal
          ${isHovered ? 'opacity-20' : ''}
          bg-gradient-to-r ${iconBg}
          blur-xl
        `}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Ícone */}
        <div className={`
          w-16 h-16 rounded-xl flex items-center justify-center mb-4
          bg-gradient-to-br ${iconBg}
          shadow-lg
        `}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Título */}
        <h2 className="text-xl font-bold text-white mb-2">
          {title}
        </h2>

        {/* Descrição */}
        <p className="text-gray-400 text-sm leading-relaxed mb-3">
          {description}
        </p>

        {/* Features list */}
        {features && (
          <ul className="space-y-1 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckIcon className="w-3 h-3 text-success-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Indicador de "Abrir" */}
        <div className="mt-4 flex items-center text-sm font-medium text-primary-400">
          <span>Abrir aplicativo</span>
          <ArrowRightIcon
            className={`w-4 h-4 ml-2 transition-transform duration-normal ${isHovered ? 'translate-x-1' : ''}`}
          />
        </div>
      </div>
    </a>
  )
}

// Seção "Começando" para novos usuários
function GettingStartedSection() {
  const steps = [
    {
      number: '1',
      title: 'Escolha um aplicativo',
      description: 'Selecione um dos mini-apps disponíveis acima',
    },
    {
      number: '2',
      title: 'Faça login (se necessário)',
      description: 'Use sua conta Google para acessar recursos completos',
    },
    {
      number: '3',
      title: 'Aproveite!',
      description: 'Explore todas as funcionalidades do aplicativo',
    },
  ]

  return (
    <section
      aria-labelledby="getting-started-heading"
      className="px-6 py-8 animate-fade-in-up"
      style={{ animationDelay: '200ms' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6">
          <h2
            id="getting-started-heading"
            className="text-lg font-semibold text-white mb-4 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-400 text-sm">?</span>
            </span>
            Começando
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-300">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  // URLs dos apps
  // Em desenvolvimento: usa localhost com portas diferentes
  // Em produção (Vercel): usa paths relativos (/ytpm e /scanner)
  const isDev = process.env.NODE_ENV === 'development'
  const ytpmUrl = isDev ? 'http://localhost:3001/ytpm' : '/ytpm'
  const scannerUrl = isDev ? 'http://localhost:3002/scanner' : '/scanner'

  const apps = [
    {
      title: 'YT Playlist Manager Pro',
      description: 'Gerencie suas playlists do YouTube de forma profissional.',
      icon: YouTubeIcon,
      href: ytpmUrl,
      gradient: 'bg-gray-800/50',
      hoverGradient: 'bg-gray-800/80',
      iconBg: 'from-red-500 to-red-700',
      openInNewTab: isDev,
      features: [
        'Sincronize playlists',
        'Transfira vídeos',
        'Monitore sua quota',
      ],
    },
    {
      title: 'ScanQRCodeBar',
      description: 'Escaneie QR Codes e códigos de barras com facilidade.',
      icon: QRCodeIcon,
      href: scannerUrl,
      gradient: 'bg-gray-800/50',
      hoverGradient: 'bg-gray-800/80',
      iconBg: 'from-emerald-500 to-teal-600',
      openInNewTab: isDev,
      features: [
        'QR Code e códigos de barras',
        'OCR para texto',
        'Zoom progressivo',
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-6" role="banner">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          {/* Logo */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-6"
            aria-hidden="true"
          >
            <AppsIcon className="w-10 h-10 text-white" />
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
            MiniApps
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Sua central de aplicativos. Escolha um app para começar.
          </p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* Grid de Apps */}
        <section
          aria-labelledby="apps-heading"
          className="px-6 py-8"
        >
          <h2 id="apps-heading" className="sr-only">Aplicativos disponíveis</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 stagger-animation">
              {apps.map((app) => (
                <AppCard key={app.title} {...app} />
              ))}
            </div>
          </div>
        </section>

        {/* Seção Começando */}
        <GettingStartedSection />
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-800" role="contentinfo">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                Para iniciar os apps, execute:{' '}
                <code className="bg-gray-800 px-2 py-1 rounded text-primary-400 text-xs">
                  npm run dev:all
                </code>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Launcher: 3000 | YTPM: 3001 | Scanner: 3002
              </p>
            </div>

            <nav aria-label="Links do rodapé">
              <ul className="flex items-center gap-4 text-sm">
                <li>
                  <a
                    href="https://github.com/glauberbessa/MiniApps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-300 transition-colors duration-fast"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            © {new Date().getFullYear()} MiniApps. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
