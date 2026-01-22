/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para apps em diferentes portas
  async rewrites() {
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
  },
}

module.exports = nextConfig
