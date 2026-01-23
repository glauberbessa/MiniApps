/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve o app em /scanner em produção
  basePath: '/scanner',

  // Desabilita o modo estrito do React para evitar double-render em dev
  // (útil quando trabalhamos com câmera/scanner)
  reactStrictMode: false,
}

module.exports = nextConfig
