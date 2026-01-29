# Plano de Refatoração UI/UX - MiniApps

> **Documento de Planejamento para Design Frontend Distintivo**
>
> Data: 29/01/2026
> Versão: 2.0 (Baseado na skill frontend-design)

---

## Sumário Executivo

Este documento apresenta o plano de refatoração das interfaces do MiniApps, seus sub-apps (YTPlaylistManagerProWeb e ScanQRCodeBar), aplicando os princípios da **skill frontend-design** para criar interfaces **distintivas e memoráveis** que evitam estéticas genéricas de "AI slop".

### Princípios Fundamentais

1. **Direção Estética BOLD** - Cada app com identidade visual única e intencional
2. **Tipografia Distintiva** - Fontes caracterizadas que elevam a experiência
3. **Cores Dominantes** - Paletas com acentos marcantes, não distribuições tímidas
4. **Motion com Propósito** - Animações em momentos de alto impacto
5. **Composição Inesperada** - Layouts que quebram o previsível
6. **Produção Real** - Código funcional, não protótipos

---

## 1. Design Thinking por Aplicação

### 1.1 Main Launcher

#### Direção Estética: **Editorial/Magazine**

**Por quê?** O launcher é a porta de entrada - deve comunicar sofisticação e organização, como a capa de uma revista de tecnologia premium.

| Aspecto | Decisão |
|---------|---------|
| **Propósito** | Hub central que inspira confiança e curiosidade |
| **Tom** | Sofisticado, limpo, editorial |
| **Diferenciador** | Tipografia bold com hierarquia dramática, espaço negativo generoso |
| **Memorável** | A transição de entrada - cards que "desdobram" como páginas de revista |

#### Paleta de Cores
```css
/* Editorial Dark - Contrastes dramáticos */
--launcher-bg: #0a0a0b;
--launcher-surface: #141416;
--launcher-accent: #e4e4e7;      /* Zinc-200 - texto principal */
--launcher-muted: #71717a;       /* Zinc-500 - texto secundário */
--launcher-highlight: #fafafa;   /* Branco puro para destaques */
--launcher-border: #27272a;      /* Zinc-800 - bordas sutis */
```

#### Tipografia
```css
/* Display: Dramatica e memorável */
--font-display: 'Playfair Display', Georgia, serif;

/* UI: Moderna e legível */
--font-ui: 'DM Sans', system-ui, sans-serif;

/* Mono: Para detalhes técnicos */
--font-mono: 'JetBrains Mono', monospace;
```

---

### 1.2 YTPlaylistManagerProWeb (YTPM)

#### Direção Estética: **Industrial/Utilitarian com Toques de Cor**

**Por quê?** Um gerenciador de playlists é uma ferramenta de trabalho. Deve parecer poderoso e eficiente, como um painel de controle profissional, mas com a energia vibrante do YouTube.

| Aspecto | Decisão |
|---------|---------|
| **Propósito** | Ferramenta produtiva para gerenciar mídia |
| **Tom** | Profissional, eficiente, energético |
| **Diferenciador** | Interface "dashboard de missão" com acentos vermelhos do YouTube |
| **Memorável** | Micro-animações em operações - vídeos que "voam" entre playlists |

#### Paleta de Cores
```css
/* Industrial Dark com energia YouTube */
--ytpm-bg: #09090b;             /* Quase preto */
--ytpm-surface: #18181b;        /* Zinc-900 */
--ytpm-card: #1f1f23;           /* Elevação sutil */
--ytpm-accent: #ff0033;         /* YouTube Red */
--ytpm-accent-soft: #ff4d6a;    /* Red suave para hovers */
--ytpm-success: #10b981;        /* Emerald para confirmações */
--ytpm-warning: #f59e0b;        /* Amber para alertas */
--ytpm-text: #fafafa;           /* Texto principal */
--ytpm-muted: #a1a1aa;          /* Zinc-400 */
```

#### Tipografia
```css
/* Headers: Geométrica e moderna */
--font-heading: 'Space Grotesk', system-ui, sans-serif;

/* Body: Alta legibilidade */
--font-body: 'Inter var', system-ui, sans-serif;

/* Data: Monospace para números e códigos */
--font-data: 'IBM Plex Mono', monospace;
```

---

### 1.3 ScanQRCodeBar

#### Direção Estética: **Soft/Minimal com Foco no Conteúdo**

**Por quê?** Um scanner deve sair do caminho e focar a atenção no que está sendo escaneado. Interface quase invisível que aparece apenas quando necessário.

| Aspecto | Decisão |
|---------|---------|
| **Propósito** | Captura rápida e eficiente de códigos |
| **Tom** | Discreto, focado, satisfatório |
| **Diferenciador** | UI que "desaparece" durante scan, feedback háptico visual |
| **Memorável** | A animação de sucesso - partículas que emanam do código detectado |

#### Paleta de Cores
```css
/* Soft Dark - Minimalista */
--scanner-bg: #0f0f10;
--scanner-surface: rgba(255, 255, 255, 0.03);
--scanner-accent: #22d3ee;      /* Cyan vibrante para scan */
--scanner-success: #4ade80;     /* Green para sucesso */
--scanner-text: #e4e4e7;
--scanner-muted: #52525b;
--scanner-glow: rgba(34, 211, 238, 0.2);  /* Glow do scanner */
```

#### Tipografia
```css
/* Minimal e técnico */
--font-scanner: 'Geist', system-ui, sans-serif;
--font-result: 'Geist Mono', monospace;
```

---

## 2. Status de Implementação

### ✅ FASE 1: FUNDAÇÃO (COMPLETA)

> **Implementada em:** 29/01/2026
> **Commits:** `7c8ff3b`, `2ff0ac5`, `e07e175`, `be58582`

| Item | Status | Detalhes |
|------|--------|----------|
| 1.1 Tokens de Design | ✅ | `tailwind.config.js` + `src/styles/tokens.css` |
| 1.2 Componentes Base | ✅ | PageHeader, Breadcrumb, EmptyState, LoadingOverlay |
| 1.3 Skip Links | ✅ | Componente + integração em layouts |
| 1.4 Landmarks ARIA | ✅ | header, main, nav, footer, sections |
| 1.5 useFocusTrap | ✅ | Hook completo com opções |
| 1.6 LiveRegion | ✅ | Componente + hook useLiveAnnounce |

**Componentes criados:**
- `src/components/ui/page-header.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/loading-overlay.tsx`
- `src/components/ui/skip-link.tsx`
- `src/components/ui/live-region.tsx`
- `src/hooks/useFocusTrap.ts`

---

### ✅ FASE 2: IDENTIDADE VISUAL DISTINTIVA (COMPLETA)

> **Implementada em:** 29/01/2026

| Item | Status | Detalhes |
|------|--------|----------|
| 2.1 Sistema Tipográfico | ✅ | Google Fonts integradas via next/font |
| 2.2 Classes de Tipografia | ✅ | `src/styles/typography.css` com 25+ classes |
| 2.3 Tokens por Aplicação | ✅ | `src/styles/themes/` com 3 temas |
| 2.4 Seletor de Tema por Rota | ✅ | ThemeProvider + hook useTheme |
| 2.5 Backgrounds e Atmosfera | ✅ | `src/styles/backgrounds.css` |
| 2.6 Atualização do Launcher | ✅ | `app/page.js` com estilo editorial |

**Fonts integradas (via next/font/google):**
- Playfair Display (display/editorial)
- DM Sans (UI)
- Space Grotesk (headings)
- Inter (body)
- JetBrains Mono (data/código)

**Arquivos de tema criados:**
- `src/styles/typography.css` - Classes utilitárias de tipografia
- `src/styles/themes/launcher.css` - Tema Editorial Dark
- `src/styles/themes/ytpm.css` - Tema Industrial Dark (YouTube Red)
- `src/styles/themes/scanner.css` - Tema Soft/Minimal (Cyan)
- `src/styles/themes/index.css` - Índice dos temas
- `src/styles/backgrounds.css` - Backgrounds e atmosfera por app
- `src/components/providers/theme-provider.tsx` - Seletor de tema por rota

**Classes de tipografia implementadas:**
```css
/* Display (Launcher) */
.text-display, .text-display-sm, .text-display-md, .text-display-lg, .text-display-xl
.text-editorial, .text-editorial-lg

/* Heading (YTPM) */
.text-heading, .text-heading-xs, .text-heading-sm, .text-heading-md, .text-heading-lg, .text-heading-xl

/* UI (Interface) */
.text-ui, .text-ui-sm, .text-ui-md, .text-ui-lg
.text-label, .text-button

/* Body (Conteúdo) */
.text-body, .text-body-sm, .text-body-md, .text-body-lg

/* Data (Números/Código) */
.text-data, .text-data-sm, .text-data-md, .text-data-lg, .text-code

/* Efeitos especiais */
.text-gradient, .text-gradient-ytpm, .text-gradient-scanner, .text-gradient-launcher
```

**Tailwind extendido com:**
- Fonts: `font-display`, `font-ui`, `font-heading`, `font-body`, `font-data`
- Cores: `launcher-*`, `ytpm-*`, `scanner-*`

---

## 3. Fases Pendentes

### ✅ FASE 3: Motion e Micro-interações (COMPLETA)

> **Implementada em:** 29/01/2026

**Objetivo:** Criar momentos de delícia sem sobrecarregar a interface

#### 3.1 Animações de Entrada (High-Impact)

| Contexto | Animação | Status |
|----------|----------|--------|
| Launcher load | Cards "desdobram" com stagger | ✅ `launcher-animate-unfold`, `launcher-stagger-children` |
| YTPM dashboard | Elementos surgem em wave | ✅ `ytpm-animate-wave`, `ytpm-stagger-children` |
| Scanner ready | Pulse no viewfinder | ✅ `scanner-animate-pulse`, `scanner-corners-pulse` |

**Arquivos criados:**
- `src/styles/animations.css` - Sistema centralizado de animações (500+ linhas)
- `src/hooks/useAnimateOnScroll.ts` - Hook para animações com Intersection Observer
- `src/hooks/useAnimationFeedback.ts` - Hook para feedback programático

**Classes de animação disponíveis:**
```css
/* Entrada */
.animate-fade-in, .animate-in-up, .animate-in-down, .animate-in-left, .animate-in-right
.animate-scale-in, .animate-scale-in-center
.animate-unfold, .animate-wave, .animate-pop

/* Stagger (delays progressivos) */
.stagger-1 a .stagger-8, .stagger-fast-*, .stagger-slow-*
.stagger-children (container automático)
```

#### 3.2 Feedback de Ações

| Ação | Feedback Visual | Status |
|------|-----------------|--------|
| Transferir vídeo | Vídeo "voa" para playlist destino | ✅ `ytpm-animate-fly`, `ytpm-animate-fly-in` |
| Scan success | Partículas + flash + anel | ✅ `ParticleSystem`, `FlashOverlay`, `SuccessRing` |
| Delete item | Fade + slide out | ✅ `animate-slide-out-*`, `animate-collapse` |
| Error | Shake + red pulse | ✅ `animate-error`, `ytpm-animate-error` |
| Success | Green pulse | ✅ `animate-success`, `ytpm-animate-success` |

**Componentes criados:**
- `src/components/ui/particles.tsx` - Sistema de partículas para scanner
  - `ParticleSystem` - Partículas emanando do centro
  - `SuccessRing` - Anel expandindo
  - `FlashOverlay` - Flash de luz
  - `ScanSuccessEffect` - Combinação dos três efeitos
- `src/components/ui/animated-feedback.tsx` - Componentes de feedback
  - `AnimatedFeedback` - Wrapper para feedback visual
  - `AnimatedListItem` - Item de lista com animações
  - `FlyingItem` - Animação de transferência

#### 3.3 Hover States Distintivos

| App | Efeito | Status |
|-----|--------|--------|
| Launcher | Perspectiva 3D editorial + brilho | ✅ `.launcher-card-editorial:hover` |
| YTPM | Elevação + glow vermelho | ✅ `.ytpm-video-card:hover`, `.ytpm-card-interactive:hover` |
| Scanner | Minimal com glow cyan | ✅ `.scanner-card:hover`, `.scanner-btn-icon:hover` |

**Classes utilitárias de hover:**
```css
.hover-lift      /* Elevação suave */
.hover-grow      /* Escala suave */
.hover-glow      /* Brilho ao hover */
.hover-perspective /* Rotação 3D */
.hover-industrial  /* Estilo YTPM com glow vermelho */
.hover-minimal     /* Estilo Scanner discreto */
```

#### 3.4 Suporte a prefers-reduced-motion

| Item | Status |
|------|--------|
| CSS: Desabilitar animações | ✅ Em todos os arquivos de tema |
| CSS: Manter feedback funcional | ✅ Outline substitui transforms |
| Hook: Detecção de preferência | ✅ `usePrefersReducedMotion.ts` |

**Hook criado:**
- `src/hooks/usePrefersReducedMotion.ts` - Detecta preferência do usuário

```tsx
// Uso
const prefersReducedMotion = usePrefersReducedMotion()
const getAnimationClass = useConditionalAnimation()
```

---

### FASE 4: Redesign das Páginas Principais

#### 4.1 Main Launcher - Redesign Editorial

**Layout Proposto:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│        M I N I A P P S                                          │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │    "Sua central de                                      │   │
│   │     aplicativos"                                        │   │
│   │                          ← Tipografia Playfair Italic   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌───────────────────────────┐  ┌───────────────────────────┐  │
│   │                           │  │                           │  │
│   │   YOUTUBE                 │  │   SCANNER                 │  │
│   │   PLAYLIST                │  │   QR CODE                 │  │
│   │   MANAGER                 │  │                           │  │
│   │                           │  │   [ícone câmera           │  │
│   │   [ícone play             │  │    com efeito glow]       │  │
│   │    com gradiente red]     │  │                           │  │
│   │                           │  │                           │  │
│   │   ─────────────────────   │  │   ─────────────────────   │  │
│   │                           │  │                           │  │
│   │   Gerencie playlists      │  │   Escaneie códigos        │  │
│   │   como um profissional    │  │   instantaneamente        │  │
│   │                           │  │                           │  │
│   │            [Abrir →]      │  │            [Abrir →]      │  │
│   │                           │  │                           │  │
│   └───────────────────────────┘  └───────────────────────────┘  │
│                                                                 │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │   COMEÇANDO                                             │   │
│   │                                                         │   │
│   │   01 ─── Faça login com Google                          │   │
│   │   02 ─── Escolha seu aplicativo                         │   │
│   │   03 ─── Comece a usar                                  │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│─────────────────────────────────────────────────────────────────│
│   Sobre   Privacidade   GitHub              © 2026 MiniApps     │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.2 YTPM Login - Redesign Industrial

**Layout Proposto:**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │           ▶ YTPM PRO                                    │   │
│   │                                                         │   │
│   │           ═══════════════════════════════               │   │
│   │                                                         │   │
│   │           GERENCIE SUAS                                 │   │
│   │           PLAYLISTS                                     │   │
│   │           COMO UM PRO                                   │   │
│   │                                                         │   │
│   │           ───────────────────────────────               │   │
│   │                                                         │   │
│   │           ┌─────────────────────────────┐               │   │
│   │           │                             │               │   │
│   │           │  [G]  Continuar com Google  │               │   │
│   │           │                             │               │   │
│   │           └─────────────────────────────┘               │   │
│   │                                                         │   │
│   │           ─── OU ───                                    │   │
│   │                                                         │   │
│   │           ✓ Sincronização automática                    │   │
│   │           ✓ Transfer entre playlists                    │   │
│   │           ✓ Monitoramento de quota                      │   │
│   │           ✓ Interface profissional                      │   │
│   │                                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   ┌──────────────────────┐    ┌──────────────────────┐          │
│   │  📊 ESTATÍSTICAS     │    │  🔒 PRIVACIDADE      │          │
│   │                      │    │                      │          │
│   │  Acompanhe o uso     │    │  Seus dados          │          │
│   │  da API em tempo     │    │  permanecem          │          │
│   │  real                │    │  seguros             │          │
│   └──────────────────────┘    └──────────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.3 YTPM Dashboard - Melhorias

| Área | Melhoria | Impacto Visual |
|------|----------|----------------|
| Header | Gradiente sutil no título | Energia |
| Stats | Mini-gráficos sparkline | Profissionalismo |
| Tabela | Hover com glow vermelho sutil | Feedback |
| Empty State | Ilustração custom + animação | Personalidade |
| Actions Bar | Sticky com blur backdrop | Funcionalidade |

#### 4.4 Scanner - Redesign Focado

**Fluxo Visual:**
```
   IDLE                    SCANNING                 SUCCESS
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│              │        │              │        │              │
│              │        │   ┌──────┐   │        │      ✓       │
│    ◉         │        │   │ ╳──╳ │   │        │              │
│              │  ───►  │   │      │   │  ───►  │   [RESULT]   │
│   ESCANEAR   │        │   │ ╳──╳ │   │        │              │
│              │        │   └──────┘   │        │ ┌──────────┐ │
│              │        │      ↕       │        │ │ conteúdo │ │
│  [🔦] [📁]   │        │   scanning   │        │ └──────────┘ │
│              │        │              │        │              │
│  ─ histórico │        │  [Cancelar]  │        │ [📋][🔗][↺] │
└──────────────┘        └──────────────┘        └──────────────┘
     glow                 pulse cyan              particles
     suave                animado                 + flash
```

---

### FASE 5: Acessibilidade Avançada

**Objetivo:** Manter WCAG 2.1 AA enquanto eleva a experiência visual

#### 5.1 Contraste e Legibilidade

| Verificação | Ferramenta | Target |
|-------------|------------|--------|
| Texto normal (4.5:1) | axe-core | AA |
| Texto grande (3:1) | axe-core | AA |
| Elementos UI (3:1) | Manual | AA |
| Focus indicators | Manual | Visível |

#### 5.2 Motion e Preferências

```css
/* Respeitar preferências do usuário */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Manter feedback funcional */
@media (prefers-reduced-motion: reduce) {
  .video-card:hover {
    transform: none;
    outline: 2px solid var(--ytpm-accent);
  }
}
```

#### 5.3 Screen Reader Experience

| Contexto | Anúncio |
|----------|---------|
| Video transferido | "Vídeo [título] transferido para [playlist]" |
| Scan success | "Código detectado: [tipo]. Resultado: [valor]" |
| Error | "Erro: [descrição]. [ação sugerida]" |
| Loading | "Carregando [contexto]..." |

---

### FASE 6: Polish e Refinamento

#### 6.1 Detalhes Visuais

| Detalhe | Implementação | App |
|---------|---------------|-----|
| Custom cursors | cursor: url() | Launcher |
| Selection color | ::selection | Todos |
| Scrollbar styling | ::-webkit-scrollbar | YTPM |
| Grain overlay | SVG noise filter | Todos |

```css
/* Scrollbar YTPM */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--ytpm-bg);
}

::-webkit-scrollbar-thumb {
  background: var(--ytpm-surface);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ytpm-accent);
}
```

#### 6.2 Performance Visual

| Otimização | Técnica |
|------------|---------|
| Font loading | `font-display: swap` + preload |
| Animation perf | `will-change` seletivo |
| Image loading | Blur placeholder + lazy |
| CSS containment | `contain: content` em cards |

#### 6.3 Testes Finais

| Tipo | Ferramentas | Critério |
|------|-------------|----------|
| Acessibilidade | axe-core, WAVE | 0 violações AA |
| Performance | Lighthouse | Score > 90 |
| Visual | Manual | Coerência estética |
| Cross-browser | BrowserStack | Chrome, Firefox, Safari |

---

## 4. Métricas de Sucesso

### Design

- [ ] Cada app tem identidade visual **distintiva e memorável**
- [ ] Zero uso de fontes genéricas (Inter, Roboto, Arial em texto principal)
- [ ] Paletas de cores com **pelo menos um acento bold**
- [ ] Animações em **momentos de alto impacto** identificados

### Técnico

- [ ] Lighthouse Accessibility > 95
- [ ] Lighthouse Performance > 90
- [ ] 0 violações WCAG 2.1 AA
- [ ] Suporte a `prefers-reduced-motion`

### UX

- [ ] Tempo para primeira ação reduzido
- [ ] Feedback visual para **todas** operações assíncronas
- [ ] Estados vazios com personalidade
- [ ] Navegação 100% funcional via teclado

---

## 5. Cronograma

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Fundação (Tokens, Componentes Base, A11y) | ✅ COMPLETA |
| 2 | Identidade Visual Distintiva | ✅ COMPLETA |
| 3 | Motion e Micro-interações | ✅ COMPLETA |
| 4 | Redesign das Páginas Principais | 🔄 Pendente |
| 5 | Acessibilidade Avançada | 🔄 Pendente |
| 6 | Polish e Refinamento | 🔄 Pendente |

---

## 6. O Que Evitar (Anti-patterns)

### Estéticas Genéricas de "AI Slop"

❌ **Fontes:** Inter, Roboto, Arial, system-ui como única opção
❌ **Cores:** Gradientes roxos em fundo branco, paletas "safe"
❌ **Layouts:** Cards uniformemente espaçados em grid previsível
❌ **Animações:** Fade-in genérico em tudo, bounces exagerados

### Em vez disso:

✅ **Fontes:** Playfair Display para drama, Space Grotesk para modernidade
✅ **Cores:** Preto profundo com acentos vibrantes (vermelho YouTube, cyan scanner)
✅ **Layouts:** Hierarquia clara, assimetria intencional, espaço negativo
✅ **Animações:** Stagger calculado, efeitos em momentos específicos

---

## 7. Referências

### Design Systems
- [Radix UI](https://www.radix-ui.com/) - Primitivos acessíveis
- [shadcn/ui](https://ui.shadcn.com/) - Padrões de componentes

### Tipografia
- [Google Fonts](https://fonts.google.com/) - Playfair Display, DM Sans, Space Grotesk
- [Vercel Geist](https://vercel.com/font) - Geist Sans/Mono

### Motion
- [Framer Motion](https://www.framer.com/motion/) - Animações React
- [CSS Easing Functions](https://easings.net/) - Curvas de animação

### Acessibilidade
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/) - Diretrizes
- [A11y Project](https://www.a11yproject.com/) - Checklist

---

*Documento baseado na skill frontend-design*
*Última atualização: 29/01/2026 - Fase 3 concluída*
