import Scanner from './components/Scanner'

/**
 * EXPLICAÇÃO PARA DESENVOLVEDOR JÚNIOR:
 * 
 * No Next.js com App Router (pasta /app), cada arquivo page.js
 * representa uma ROTA (URL) do seu site.
 * 
 * - app/page.js → rota "/" (página inicial)
 * - app/about/page.js → rota "/about"
 * - app/products/[id]/page.js → rota "/products/123" (dinâmica)
 * 
 * Este page.js é a página inicial, então renderiza nosso Scanner.
 */

export default function Home() {
  return (
    <main>
      <Scanner />
    </main>
  )
}
