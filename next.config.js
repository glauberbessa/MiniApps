// Ignorar erro de patch do lockfile - define antes da importação do Next.js
process.env.NEXT_IGNORE_LOCKFILE_PATCH = 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para apps em diferentes portas
  async rewrites() {
    // No ambiente de desenvolvimento, faz proxy para as portas locais
    // No Vercel, os subpaths serão servidos pelos builds dos apps
    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      return [
        // Proxy para YTPlaylistManagerProWeb na porta 3001
        {
          source: '/ytpm/:path*',
          destination: 'http://localhost:3001/:path*',
        },
        // Proxy para ScanQRCodeBar na porta 3002
        {
          source: '/scanner/:path*',
          destination: 'http://localhost:3002/:path*',
        },
      ]
    }

    // No Vercel, não precisa de rewrites porque vamos usar basePath nos apps
    return []
  },
}

module.exports = nextConfig
