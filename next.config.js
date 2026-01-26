// Ignorar erro de patch do lockfile - define antes da importação do Next.js
process.env.NEXT_IGNORE_LOCKFILE_PATCH = 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    // Only apply rewrites in development
    // In production (Vercel), the app runs as a single deployment
    // and rewrites to localhost would cause 404 errors
    if (process.env.NODE_ENV === 'production') {
      console.log('[next.config.js] Production mode - skipping localhost rewrites');
      return [];
    }

    console.log('[next.config.js] Development mode - applying localhost rewrites');
    return [
      {
        source: '/ytpm',
        destination: 'http://localhost:3001/ytpm',
      },
      {
        source: '/ytpm/:path*',
        destination: 'http://localhost:3001/ytpm/:path*',
      },
      {
        source: '/scanner',
        destination: 'http://localhost:3002',
      },
      {
        source: '/scanner/:path*',
        destination: 'http://localhost:3002/:path*',
      },
    ];
  },
}

module.exports = nextConfig
