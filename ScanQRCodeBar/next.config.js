/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita o modo estrito do React para evitar double-render em dev
  // (útil quando trabalhamos com câmera/scanner)
  reactStrictMode: false,
}

module.exports = nextConfig
