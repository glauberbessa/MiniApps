'use client'

import { useState, useRef, useEffect } from 'react'

// --- ASSETS & ICONS (Minimalist & Sharp) ---

function YouTubeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function ScanIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9" />
      <path d="M15 2h2.5C19.99 2 22 4.01 22 6.5V9" />
      <path d="M22 15v2.5c0 2.49-2.01 4.5-4.5 4.5H15" />
      <path d="M9 22H6.5C4.01 22 2 19.99 2 17.5V15" />
      <path d="M10.5 7v10" />
      <path d="M13.5 7v10" />
      <path d="M7 10.5h10" />
      <path d="M7 13.5h10" />
    </svg>
  )
}

function ArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  )
}

// --- COMPONENTS ---

function AppRow({ 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  href, 
  accentColor, 
  index,
  openInNewTab
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : "_self"}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className="group relative block w-full border-t border-neutral-800 bg-neutral-950 transition-all duration-500 hover:bg-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
        
        {/* Index Number - Background Decoration */}
        <span className={`
          absolute left-4 top-4 text-9xl font-bold leading-none tracking-tighter opacity-5 transition-all duration-500 select-none
          md:left-12 md:top-1/2 md:-translate-y-1/2
          ${isHovered ? 'opacity-10 scale-110' : ''}
        `}
        style={{ color: isHovered ? accentColor : 'white' }}
        >
          0{index}
        </span>

        {/* Content Container */}
        <div className="relative z-10 flex flex-1 flex-col gap-4 md:flex-row md:items-center md:gap-12">
          
          {/* Icon Box */}
          <div className={`
            flex h-16 w-16 items-center justify-center border border-neutral-800 bg-neutral-950 transition-all duration-300
            group-hover:border-transparent group-hover:scale-110
          `}
          style={{ backgroundColor: isHovered ? accentColor : '' }}
          >
            <Icon className={`h-8 w-8 transition-colors duration-300 ${isHovered ? 'text-black' : 'text-white'}`} />
          </div>

          {/* Text Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-500 group-hover:text-white transition-colors">
                {subtitle}
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              {title}
            </h2>
            <p className="max-w-xl text-neutral-400 group-hover:text-neutral-300 transition-colors pt-2">
              {description}
            </p>
          </div>
        </div>

        {/* Action Arrow */}
        <div className={`
          relative z-10 mt-6 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 transition-all duration-300
          md:mt-0
          group-hover:border-white group-hover:bg-white group-hover:text-black group-hover:rotate-[-45deg]
        `}>
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>
      
      {/* Bottom Border Accent */}
      <div 
        className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: accentColor }}
      />
    </a>
  )
}

export default function Home() {
  const isDev = process.env.NODE_ENV === 'development'
  const ytpmUrl = isDev ? 'http://localhost:3001/ytpm' : '/ytpm'
  const scannerUrl = isDev ? 'http://localhost:3002/scanner' : '/scanner'

  const apps = [
    {
      title: 'Studio Pro',
      subtitle: 'YT Playlist Manager',
      description: 'Command center for professional YouTube playlist orchestration. Analytics, bulk actions, and deep organization.',
      icon: YouTubeIcon,
      href: ytpmUrl,
      accentColor: '#FF0000', // Pure Red
      openInNewTab: isDev,
    },
    {
      title: 'Scan.OS',
      subtitle: 'Universal Scanner',
      description: 'High-velocity optical recognition system. QR codes, barcodes, and OCR text extraction with hardware zoom.',
      icon: ScanIcon,
      href: scannerUrl,
      accentColor: '#00FF9D', // Neon Green
      openInNewTab: isDev,
    },
  ]

  return (
    <main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-neutral-800 px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">System Online</span>
            </div>
            
            <h1 className="max-w-4xl text-6xl font-black tracking-tighter text-white md:text-8xl lg:text-9xl">
              MINI<span className="text-neutral-800">APPS</span>
              <span className="text-neutral-800">.</span>
            </h1>
            
            <p className="max-w-xl text-lg text-neutral-400 md:text-xl leading-relaxed">
              Dev Environment v2.0. Select a module to initialize workspace context.
            </p>
          </div>
        </div>

        {/* Background Grid Decoration */}
        <div className="absolute right-0 top-0 -z-10 h-full w-1/3 border-l border-neutral-900 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]" />
      </header>

      {/* App List */}
      <section>
        {apps.map((app, idx) => (
          <AppRow key={app.title} {...app} index={idx + 1} />
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-neutral-500">
              TERMINAL: {isDev ? 'LOCALHOST' : 'PRODUCTION'}
            </span>
            <span className="font-mono text-xs text-neutral-600">
              BUILD: {new Date().toISOString().split('T')[0]}
            </span>
          </div>
          
          <div className="flex gap-4">
            <code className="bg-neutral-900 px-3 py-1 font-mono text-xs text-neutral-400">
              npm run dev:all
            </code>
          </div>
        </div>
      </footer>
    </main>
  )
}

