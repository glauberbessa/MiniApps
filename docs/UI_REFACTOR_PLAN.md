# Plano de Refatoração UI/UX - MiniApps

> **Documento de Planejamento para Melhoria da Experiência do Usuário**
>
> Data: 29/01/2026
> Versão: 1.0

---

## Sumário Executivo

Este documento apresenta um plano abrangente para refatoração das interfaces do MiniApps e seus sub-apps (YTPlaylistManagerProWeb e ScanQRCodeBar), com foco em:

- **Acessibilidade** (WCAG 2.1 AA)
- **Consistência de Design**
- **Experiência do Usuário (UX)**
- **Performance Visual**
- **Design System Unificado**

---

## 1. Diagnóstico Atual

### 1.1 Pontos Fortes Identificados

| Aspecto | Descrição |
|---------|-----------|
| Componentes UI | Biblioteca shadcn/ui bem implementada com 22 primitivos |
| Tema Dark | Design moderno com cores consistentes no YTPM |
| Responsividade | Layout adapta-se bem para mobile/tablet/desktop |
| Variáveis CSS | Uso de custom properties para theming |
| Animações | Transições suaves em elementos interativos |

### 1.2 Problemas Críticos

#### A. Acessibilidade (WCAG)
- **0 aria-live regions** para atualizações dinâmicas
- **Apenas 1 aria-label** em toda a base de código
- **Falta de focus trap** em modais/dialogs
- **Contraste de cores** potencialmente insuficiente em textos muted
- **Navegação por teclado** inconsistente entre apps

#### B. Inconsistências de Design
- **3 abordagens diferentes** para estilização (CSS vars, inline Tailwind, classes customizadas)
- **Ícones** misturados: Lucide React + SVG inline
- **Hierarquia tipográfica** inconsistente entre páginas
- **Padrões de botões** variam entre apps

#### C. Experiência do Usuário
- **Feedback visual** insuficiente em operações longas
- **Estados de erro** não padronizados
- **Onboarding** inexistente para novos usuários
- **Navegação** sem breadcrumbs ou indicadores de contexto

---

## 2. Design System Unificado

### 2.1 Fundação do Design System

#### Paleta de Cores Expandida

```css
/* Core Brand Colors */
--color-primary-50: #f0f9ff;
--color-primary-100: #e0f2fe;
--color-primary-200: #bae6fd;
--color-primary-300: #7dd3fc;
--color-primary-400: #38bdf8;
--color-primary-500: #0ea5e9;  /* Primary */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;
--color-primary-800: #075985;
--color-primary-900: #0c4a6e;
--color-primary-950: #082f49;

/* Semantic Colors */
--color-success-500: #22c55e;
--color-warning-500: #f59e0b;
--color-error-500: #ef4444;
--color-info-500: #3b82f6;

/* Neutral Scale (Dark Theme) */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-gray-950: #030712;
```

#### Escala Tipográfica

```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes (with line-height) */
--text-xs: 0.75rem / 1rem;      /* 12px / 16px */
--text-sm: 0.875rem / 1.25rem;  /* 14px / 20px */
--text-base: 1rem / 1.5rem;     /* 16px / 24px */
--text-lg: 1.125rem / 1.75rem;  /* 18px / 28px */
--text-xl: 1.25rem / 1.75rem;   /* 20px / 28px */
--text-2xl: 1.5rem / 2rem;      /* 24px / 32px */
--text-3xl: 1.875rem / 2.25rem; /* 30px / 36px */
--text-4xl: 2.25rem / 2.5rem;   /* 36px / 40px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### Espaçamento Consistente

```css
/* Spacing Scale (8px base) */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### 2.2 Componentes Novos a Criar

| Componente | Descrição | Prioridade |
|------------|-----------|------------|
| `PageHeader` | Header de página com título, breadcrumb e ações | Alta |
| `EmptyState` | Estado vazio com ilustração e CTA | Alta |
| `LoadingOverlay` | Overlay de loading para operações longas | Alta |
| `ErrorBoundary` | Componente de error boundary visual | Alta |
| `ConfirmationDialog` | Dialog padronizado para confirmações | Média |
| `NotificationBanner` | Banner para notificações inline | Média |
| `Breadcrumb` | Navegação de breadcrumb | Média |
| `Avatar` | Avatar de usuário com fallback | Baixa |
| `Badge` | Badge para status e labels | Baixa |
| `Tooltip` | Tooltip melhorado com acessibilidade | Baixa |

### 2.3 Tokens de Animação

```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

/* Easings */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Standard Transitions */
--transition-colors: color var(--duration-fast) var(--ease-in-out),
                     background-color var(--duration-fast) var(--ease-in-out),
                     border-color var(--duration-fast) var(--ease-in-out);
--transition-transform: transform var(--duration-normal) var(--ease-out);
--transition-all: all var(--duration-normal) var(--ease-in-out);
```

---

## 3. Melhorias de Acessibilidade

### 3.1 Checklist WCAG 2.1 AA

#### Perceptível

- [ ] **1.1.1** - Adicionar alt text descritivo em todas as imagens
- [ ] **1.3.1** - Implementar landmarks ARIA (main, nav, aside, header)
- [ ] **1.3.2** - Garantir ordem lógica de leitura
- [ ] **1.4.1** - Não usar cor como único indicador
- [ ] **1.4.3** - Contraste mínimo 4.5:1 para texto normal
- [ ] **1.4.4** - Texto redimensionável até 200%
- [ ] **1.4.11** - Contraste 3:1 para elementos UI

#### Operável

- [ ] **2.1.1** - Todas as funcionalidades acessíveis via teclado
- [ ] **2.1.2** - Sem armadilhas de teclado (keyboard traps)
- [ ] **2.4.1** - Skip links para navegação principal
- [ ] **2.4.3** - Ordem de foco lógica
- [ ] **2.4.4** - Links com texto descritivo
- [ ] **2.4.6** - Headings e labels descritivos
- [ ] **2.4.7** - Indicador de foco visível

#### Compreensível

- [ ] **3.1.1** - Declarar idioma da página (lang="pt-BR")
- [ ] **3.2.1** - Navegação consistente
- [ ] **3.2.2** - Inputs não mudam contexto inesperadamente
- [ ] **3.3.1** - Identificação de erros
- [ ] **3.3.2** - Labels e instruções

#### Robusto

- [ ] **4.1.1** - Parsing - HTML válido
- [ ] **4.1.2** - Nome, função, valor para todos os controles UI
- [ ] **4.1.3** - Status messages via aria-live

### 3.2 Implementações Específicas

#### Focus Management
```tsx
// Exemplo de Focus Trap para modais
import { useFocusTrap } from '@/hooks/useFocusTrap'

function Dialog({ children, isOpen, onClose }) {
  const dialogRef = useFocusTrap(isOpen)

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {children}
    </div>
  )
}
```

#### Live Regions
```tsx
// Componente para anúncios de screen reader
function LiveRegion({ message, type = 'polite' }) {
  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}
```

#### Skip Links
```tsx
// Skip link para pular para conteúdo principal
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50
                 focus:bg-primary focus:text-white focus:p-4"
    >
      Pular para o conteúdo principal
    </a>
  )
}
```

---

## 4. Melhorias por App

### 4.1 Main Launcher

#### Estado Atual
- Landing page com 2 cards de apps
- Design atraente mas com problemas de acessibilidade
- Sem feedback para usuários que acessam pela primeira vez

#### Melhorias Propostas

| ID | Melhoria | Impacto | Esforço |
|----|----------|---------|---------|
| L1 | Adicionar skip link e landmarks | Alto | Baixo |
| L2 | Implementar navegação por teclado nos cards | Alto | Baixo |
| L3 | Criar seção "Começando" para novos usuários | Médio | Médio |
| L4 | Adicionar breadcrumb e título de página | Médio | Baixo |
| L5 | Implementar skeleton loading | Baixo | Baixo |
| L6 | Adicionar animação de entrada suave | Baixo | Baixo |
| L7 | Criar footer com links úteis | Baixo | Médio |

#### Wireframe Conceitual

```
┌─────────────────────────────────────────────────────────────┐
│ [Skip to content]                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    MiniApps                          │    │
│  │           Sua central de aplicativos                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐        │
│  │    📺 YouTube       │    │    📷 Scanner       │        │
│  │    Playlist         │    │    QR Code          │        │
│  │    Manager          │    │                     │        │
│  │                     │    │                     │        │
│  │   [Abrir App →]     │    │   [Abrir App →]     │        │
│  └─────────────────────┘    └─────────────────────┘        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📚 Começando                                        │    │
│  │  • Faça login com sua conta Google                   │    │
│  │  • Gerencie suas playlists do YouTube                │    │
│  │  • Escaneie códigos QR e de barras                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Sobre] [Privacidade] [GitHub]          © 2026 MiniApps    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 YTPlaylistManagerProWeb (YTPM)

#### Estado Atual
- Dashboard funcional com sidebar colapsável
- Gestão de playlists e canais
- Múltiplas visualizações (tabela, grid, lista)
- Filtros avançados

#### Melhorias Propostas

| ID | Melhoria | Impacto | Esforço |
|----|----------|---------|---------|
| Y1 | Redesenhar página de login com melhor onboarding | Alto | Médio |
| Y2 | Adicionar tour guiado para novos usuários | Alto | Alto |
| Y3 | Implementar breadcrumb em todas as páginas | Alto | Baixo |
| Y4 | Melhorar feedback visual de operações | Alto | Médio |
| Y5 | Criar estado vazio atraente para listas | Médio | Baixo |
| Y6 | Adicionar atalhos de teclado | Médio | Médio |
| Y7 | Implementar drag-and-drop para reordenar | Médio | Alto |
| Y8 | Melhorar visualização mobile da tabela | Médio | Médio |
| Y9 | Adicionar preview de vídeo inline | Baixo | Médio |
| Y10 | Implementar dark/light mode toggle | Baixo | Médio |

#### Melhorias Específicas por Tela

##### Login Page

**Antes:**
- Card centralizado simples
- 3 cards de features estáticos
- Botão de login Google básico

**Depois:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🎬 YTPM Pro                                    │
│         Gerencie suas playlists como um profissional        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │    [G] Continuar com Google                         │    │
│  │                                                     │    │
│  │    ────────────────────────────────────            │    │
│  │                                                     │    │
│  │    ✓ Sincronize suas playlists                     │    │
│  │    ✓ Transfira vídeos entre playlists              │    │
│  │    ✓ Gerencie canais inscritos                     │    │
│  │    ✓ Monitore sua quota da API                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  📊 Estatísticas │  │  🔒 Privacidade  │                 │
│  │  Acompanhe uso   │  │  Dados seguros   │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

##### Dashboard - Playlists

**Melhorias:**
1. **Header de página padronizado** com título, descrição e ações
2. **Breadcrumb** para contexto de navegação
3. **Stats melhoradas** com mini-gráficos
4. **Empty state** quando não há vídeos
5. **Bulk actions** com confirmação visual
6. **Filtros colapsados por padrão** no mobile

```
┌─────────────────────────────────────────────────────────────┐
│ Home > Playlists                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Gerenciar Playlists                               [Ajuda?] │
│  Transfira vídeos entre suas playlists do YouTube           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Playlist de Origem  │  │ Playlist de Destino │          │
│  │ [Selecionar ▼]      │  │ [Selecionar ▼]      │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Filtros                                    [▼]   │    │
│  │ Pesquisa, idioma, duração, visualizações...         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────┬─────┬─────┐  Total: 45 | Filtrados: 32 | ☑ 5     │
│  │ ▤  │ ▦  │ ≡  │                                         │
│  └─────┴─────┴─────┘                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [☐] [🖼] Título do Vídeo        Canal    5:32  12K │    │
│  │ [☐] [🖼] Outro Vídeo            Canal    3:45   8K │    │
│  │ [☑] [🖼] Vídeo Selecionado      Canal   12:00  45K │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Remover da Origem (1)]           [Transferir Vídeos (1)] │
└─────────────────────────────────────────────────────────────┘
```

##### Quota Page

**Melhorias:**
1. **Visualização gráfica** do uso de quota
2. **Histórico interativo** com tooltips
3. **Alertas proativos** quando quota está baixa
4. **Estimativa de uso** baseada no padrão

```
┌─────────────────────────────────────────────────────────────┐
│  Monitoramento de Quota                                     │
│                                                             │
│  ┌────────────────────────────────────────────┐            │
│  │  ████████████░░░░░░░░░░░░░░  45%          │            │
│  │  4,500 / 10,000 unidades usadas            │            │
│  │  Renova em: 23:45:12                       │            │
│  └────────────────────────────────────────────┘            │
│                                                             │
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │ Usadas      │ Restantes   │ Status      │               │
│  │ 4,500       │ 5,500       │ 🟢 Normal   │               │
│  └─────────────┴─────────────┴─────────────┘               │
│                                                             │
│  📊 Histórico dos últimos 7 dias                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │     ▃                                               │    │
│  │  ▄  █  ▅                                           │    │
│  │  █  █  █  ▂                                        │    │
│  │  █  █  █  █  ▅  ▃                                  │    │
│  │  █  █  █  █  █  █  ▂                               │    │
│  │  Seg Ter Qua Qui Sex Sáb Dom                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 ScanQRCodeBar

#### Estado Atual
- App simples com 3 estados (home, scanning, result)
- Animação de linha de scan
- Interface minimalista

#### Melhorias Propostas

| ID | Melhoria | Impacto | Esforço |
|----|----------|---------|---------|
| S1 | Melhorar feedback de permissão de câmera | Alto | Baixo |
| S2 | Adicionar histórico de scans | Alto | Médio |
| S3 | Melhorar animação de sucesso | Médio | Baixo |
| S4 | Adicionar modo lanterna | Médio | Baixo |
| S5 | Suporte a múltiplos formatos (QR, barcode, etc) | Médio | Médio |
| S6 | Implementar galeria para scan de imagem | Baixo | Médio |
| S7 | Adicionar vibração haptic no sucesso | Baixo | Baixo |

#### Novo Fluxo Proposto

```
HOME                    SCANNING                 RESULT
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│              │        │ ┌──────────┐ │        │              │
│    [📷]      │        │ │  ┼──┼   │ │        │    ✓         │
│              │ ───►   │ │   cam    │ │  ───►  │   Sucesso!   │
│   ESCANEAR   │        │ │  ┼──┼   │ │        │              │
│              │        │ └──────────┘ │        │ ┌──────────┐ │
│  [📁] [🔦]   │        │              │        │ │ resultado │ │
│              │        │  [Cancelar]  │        │ └──────────┘ │
│              │        │              │        │              │
│  📜 Histórico│        │  [🔦 Liga]   │        │ [📋] [🔗] [📱]│
│  • scan 1    │        │              │        │              │
│  • scan 2    │        │              │        │ [Nova Leitura]│
└──────────────┘        └──────────────┘        └──────────────┘
```

---

## 5. Roadmap de Implementação

### Fase 1: Fundação (Semanas 1-2)

**Objetivo:** Estabelecer base sólida para melhorias futuras

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 1.1 | Atualizar tokens de design no Tailwind | `tailwind.config.js` |
| 1.2 | Criar novos componentes base | `src/components/ui/` |
| 1.3 | Implementar skip links | `app/layout.js`, `app/ytpm/layout.tsx` |
| 1.4 | Adicionar landmarks ARIA | Todos os layouts |
| 1.5 | Criar hook useFocusTrap | `src/hooks/useFocusTrap.ts` |
| 1.6 | Implementar LiveRegion component | `src/components/ui/live-region.tsx` |

### Fase 2: Acessibilidade (Semanas 3-4)

**Objetivo:** Alcançar conformidade WCAG 2.1 AA

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 2.1 | Adicionar aria-labels em todos os controles | Todos os componentes |
| 2.2 | Implementar focus management em modais | `dialog.tsx`, `sheet.tsx` |
| 2.3 | Corrigir contraste de cores | `globals.css` |
| 2.4 | Adicionar alt text descritivo | Componentes de imagem |
| 2.5 | Implementar navegação por teclado | Cards, listas |
| 2.6 | Testar com screen readers | - |

### Fase 3: Main Launcher (Semana 5)

**Objetivo:** Melhorar experiência do launcher principal

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 3.1 | Redesenhar layout com novo design system | `app/page.js` |
| 3.2 | Adicionar seção "Começando" | `app/page.js` |
| 3.3 | Implementar footer | `src/components/layout/Footer.tsx` |
| 3.4 | Adicionar animações de entrada | `app/globals.css` |
| 3.5 | Melhorar cards de app | `app/page.js` |

### Fase 4: YTPM - Core (Semanas 6-7)

**Objetivo:** Melhorar páginas principais do YTPM

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 4.1 | Criar componente PageHeader | `src/components/layout/PageHeader.tsx` |
| 4.2 | Criar componente Breadcrumb | `src/components/ui/breadcrumb.tsx` |
| 4.3 | Criar componente EmptyState | `src/components/ui/empty-state.tsx` |
| 4.4 | Redesenhar página de login | `app/ytpm/(auth)/login/page.tsx` |
| 4.5 | Melhorar página de playlists | `app/ytpm/(dashboard)/playlists/page.tsx` |
| 4.6 | Melhorar página de canais | `app/ytpm/(dashboard)/channels/page.tsx` |

### Fase 5: YTPM - Secundário (Semana 8)

**Objetivo:** Melhorar páginas secundárias do YTPM

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 5.1 | Redesenhar página de quota | `app/ytpm/(dashboard)/quota/page.tsx` |
| 5.2 | Melhorar configurações de canais | `app/ytpm/(dashboard)/config/channels/page.tsx` |
| 5.3 | Melhorar configurações de playlists | `app/ytpm/(dashboard)/config/playlists/page.tsx` |
| 5.4 | Adicionar gráficos interativos | `src/components/quota/QuotaChart.tsx` |

### Fase 6: ScanQRCodeBar (Semanas 9-10)

**Objetivo:** Elevar experiência do scanner

| Tarefa | Descrição | Arquivos |
|--------|-----------|----------|
| 6.1 | Redesenhar tela home | `ScanQRCodeBar/app/page.js` |
| 6.2 | Melhorar animação de scan | `ScanQRCodeBar/app/globals.css` |
| 6.3 | Implementar histórico de scans | `ScanQRCodeBar/app/components/History.js` |
| 6.4 | Implementar modo lanterna | `ScanQRCodeBar/app/components/Scanner.js` |
| 6.5 | Melhorar feedback de permissão | `ScanQRCodeBar/app/components/PermissionRequest.js` |

### Fase 7: Polish & QA (Semanas 11-12)

**Objetivo:** Refinamento e garantia de qualidade

| Tarefa | Descrição |
|--------|-----------|
| 7.1 | Testes de acessibilidade automatizados |
| 7.2 | Testes manuais com screen readers |
| 7.3 | Testes de usabilidade |
| 7.4 | Performance audit (Lighthouse) |
| 7.5 | Cross-browser testing |
| 7.6 | Mobile testing |
| 7.7 | Documentação de componentes |

---

## 6. Métricas de Sucesso

### Acessibilidade
- [ ] Score Lighthouse Accessibility > 95
- [ ] 0 violações WCAG 2.1 AA (axe-core)
- [ ] Testado com NVDA/VoiceOver
- [ ] Navegação 100% funcional via teclado

### Performance
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Score Lighthouse Performance > 90

### Usabilidade
- [ ] Tempo para completar tarefa principal reduzido em 20%
- [ ] Taxa de erro reduzida em 30%
- [ ] NPS aumentado (se medido)

### Qualidade de Código
- [ ] 0 erros de TypeScript
- [ ] Cobertura de testes > 70%
- [ ] 0 warnings ESLint

---

## 7. Estimativa de Esforço

### Por Fase

| Fase | Duração | Story Points | Complexidade |
|------|---------|--------------|--------------|
| 1. Fundação | 2 semanas | 21 | Média |
| 2. Acessibilidade | 2 semanas | 26 | Alta |
| 3. Main Launcher | 1 semana | 13 | Baixa |
| 4. YTPM Core | 2 semanas | 34 | Alta |
| 5. YTPM Secundário | 1 semana | 18 | Média |
| 6. ScanQRCodeBar | 2 semanas | 26 | Média |
| 7. Polish & QA | 2 semanas | 21 | Média |
| **Total** | **12 semanas** | **159** | - |

### Por Tipo de Trabalho

| Tipo | Porcentagem |
|------|-------------|
| Desenvolvimento Frontend | 50% |
| Design/UX | 20% |
| Acessibilidade | 15% |
| Testes/QA | 15% |

---

## 8. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Breaking changes em componentes | Média | Alto | Testes de regressão automatizados |
| Incompatibilidade de browser | Baixa | Médio | Cross-browser testing desde início |
| Performance degradation | Média | Alto | Lighthouse CI em cada PR |
| Scope creep | Alta | Médio | Priorização estrita por fase |
| Dependências desatualizadas | Baixa | Baixo | Renovate/Dependabot |

---

## 9. Próximos Passos

1. **Revisão do plano** com stakeholders
2. **Priorização** das melhorias com base no valor de negócio
3. **Setup de ferramentas** de teste de acessibilidade
4. **Criação de issues** no GitHub para tracking
5. **Início da Fase 1** com foco em tokens de design

---

## Apêndice A: Referências

### Design Systems
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### Acessibilidade
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Ferramentas
- [axe DevTools](https://www.deque.com/axe/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WAVE](https://wave.webaim.org/)

---

## Apêndice B: Componentes Detalhados

### PageHeader Component

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
}

function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </header>
  );
}
```

### EmptyState Component

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">{icon}</div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-2 max-w-sm">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

### Breadcrumb Component

```tsx
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

*Documento gerado para o projeto MiniApps*
*Última atualização: 29/01/2026*
