'use client'

import { useState } from 'react'

// Ícone do YouTube (SVG inline)
function YouTubeIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// Ícone de QR Code (SVG inline)
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
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

// Componente de Card de App
function AppCard({ title, description, icon: Icon, href, gradient, hoverGradient, iconBg, openInNewTab }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={`
        relative block p-6 rounded-2xl border border-slate-700/50
        transition-all duration-300 ease-out
        hover:scale-105 hover:border-slate-600/50
        hover:shadow-2xl hover:shadow-primary-500/20
        ${isHovered ? hoverGradient : gradient}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className={`
        absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
        ${isHovered ? 'opacity-20' : ''}
        bg-gradient-to-r ${iconBg}
        blur-xl
      `} />

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
        <p className="text-slate-400 text-sm leading-relaxed">
          {description}
        </p>

        {/* Indicador de "Abrir" */}
        <div className="mt-4 flex items-center text-sm font-medium text-primary-400">
          <span>Abrir aplicativo</span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
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
      description: 'Gerencie suas playlists do YouTube de forma profissional. Organize, configure e monitore suas playlists e canais favoritos.',
      icon: YouTubeIcon,
      href: ytpmUrl,
      gradient: 'bg-slate-800/50',
      hoverGradient: 'bg-slate-800/80',
      iconBg: 'from-red-500 to-red-700',
      openInNewTab: isDev, // Abre em nova aba apenas em dev
    },
    {
      title: 'ScanQRCodeBar',
      description: 'Escaneie QR Codes e códigos de barras com facilidade usando a câmera do seu dispositivo. Rápido e simples.',
      icon: QRCodeIcon,
      href: scannerUrl,
      gradient: 'bg-slate-800/50',
      hoverGradient: 'bg-slate-800/80',
      iconBg: 'from-emerald-500 to-teal-600',
      openInNewTab: isDev, // Abre em nova aba apenas em dev
    },
  ]

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 mb-6">
            <AppsIcon className="w-10 h-10 text-white" />
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
            MiniApps
          </h1>

          {/* Subtítulo */}
          <p className="text-slate-400 text-lg max-w-md mx-auto">
            Sua central de aplicativos. Escolha um app para começar.
          </p>
        </div>
      </header>

      {/* Grid de Apps */}
      <section className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {apps.map((app) => (
              <AppCard key={app.title} {...app} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            Para iniciar os apps, execute:{' '}
            <code className="bg-slate-800 px-2 py-1 rounded text-primary-400">
              npm run dev:all
            </code>
          </p>
          <p className="text-slate-600 text-xs mt-2">
            Launcher: porta 3000 | YTPM: porta 3001 | Scanner: porta 3002
          </p>
        </div>
      </footer>
    </main>
  )
}
