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

// Componente de Card de App com estilo editorial
function AppCard({ title, description, icon: Icon, href, iconBg, openInNewTab, features }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      aria-label={`${title} - ${description}`}
      className="launcher-card-editorial relative block p-8 focus-visible:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div
        className={`
          absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
          ${isHovered ? 'opacity-15' : ''}
          bg-gradient-to-r ${iconBg}
          blur-xl -z-10
        `}
        aria-hidden="true"
      />

      <div className="relative z-10">
        {/* Ícone com gradiente */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-6
          bg-gradient-to-br ${iconBg}
          shadow-lg
        `}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Título em tipografia heading */}
        <h2 className="text-heading-md text-launcher-highlight mb-3">
          {title}
        </h2>

        {/* Linha decorativa */}
        <div className="decorative-line mb-4" aria-hidden="true" />

        {/* Descrição */}
        <p className="text-ui-sm text-launcher-muted leading-relaxed mb-4">
          {description}
        </p>

        {/* Features list */}
        {features && (
          <ul className="space-y-2 mb-6">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-ui-sm text-launcher-accent">
                <CheckIcon className="w-3.5 h-3.5 text-success-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Indicador de "Abrir" */}
        <div className="flex items-center text-button text-launcher-highlight group-hover:text-white">
          <span>Abrir</span>
          <ArrowRightIcon
            className={`w-4 h-4 ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
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
      number: '01',
      title: 'Faça login com Google',
      description: 'Use sua conta para acessar recursos completos',
    },
    {
      number: '02',
      title: 'Escolha seu aplicativo',
      description: 'Selecione um dos mini-apps disponíveis',
    },
    {
      number: '03',
      title: 'Comece a usar',
      description: 'Explore todas as funcionalidades',
    },
  ]

  return (
    <section
      aria-labelledby="getting-started-heading"
      className="px-6 py-12 opacity-0 launcher-animate-unfold launcher-stagger-3"
    >
      <div className="max-w-4xl mx-auto">
        <div className="launcher-card p-8 stagger-children">
          <h2
            id="getting-started-heading"
            className="text-heading-xs text-launcher-muted mb-6 tracking-widest"
          >
            COMEÇANDO
          </h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                <span className="text-data-md text-launcher-muted font-mono">
                  {step.number}
                </span>
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-8 h-px bg-launcher-border" aria-hidden="true" />
                  <div>
                    <h3 className="text-ui-md text-launcher-highlight">{step.title}</h3>
                    <p className="text-ui-sm text-launcher-muted mt-1">{step.description}</p>
                  </div>
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
      title: 'YouTube Playlist Manager',
      description: 'Gerencie playlists como um profissional. Sincronize, transfira e monitore.',
      icon: YouTubeIcon,
      href: ytpmUrl,
      iconBg: 'from-red-500 to-red-700',
      openInNewTab: isDev,
      features: [
        'Sincronização automática',
        'Transfer entre playlists',
        'Monitoramento de quota',
      ],
    },
    {
      title: 'Scanner QR Code',
      description: 'Escaneie códigos instantaneamente. QR Code, barras e OCR.',
      icon: QRCodeIcon,
      href: scannerUrl,
      iconBg: 'from-cyan-500 to-teal-600',
      openInNewTab: isDev,
      features: [
        'QR Code e códigos de barras',
        'OCR para texto',
        'Zoom progressivo',
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col launcher-bg-mesh">
      {/* Header com estilo editorial */}
      <header className="pt-16 pb-12 px-6 hero-launcher" role="banner">
        <div className="max-w-4xl mx-auto text-center">
          {/* Título principal com tipografia display */}
          <h1 className="text-display-xl text-launcher-highlight mb-6 launcher-animate-title">
            MINIAPPS
          </h1>

          {/* Subtítulo editorial em itálico */}
          <p className="text-editorial text-launcher-muted max-w-lg mx-auto opacity-0 launcher-animate-unfold launcher-stagger-1">
            "Sua central de aplicativos"
          </p>

          {/* Linha decorativa animada */}
          <div className="decorative-line max-w-xs mx-auto mt-8 launcher-animate-line" aria-hidden="true" />
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
            <div className="grid md:grid-cols-2 gap-8 launcher-stagger-children">
              {apps.map((app) => (
                <AppCard key={app.title} {...app} />
              ))}
            </div>
          </div>
        </section>

        {/* Seção Começando */}
        <GettingStartedSection />
      </main>

      {/* Footer com estilo editorial */}
      <footer className="py-8 px-6 border-t border-launcher-border" role="contentinfo">
        <div className="max-w-4xl mx-auto">
          {/* Linha decorativa */}
          <div className="decorative-line mb-8" aria-hidden="true" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <nav aria-label="Links do rodapé">
              <ul className="flex items-center gap-6 text-ui-sm">
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
                    className="text-launcher-muted hover:text-launcher-highlight transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </nav>

            <p className="text-ui-sm text-launcher-muted">
              © {new Date().getFullYear()} MiniApps
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
