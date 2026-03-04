# Design System: Color Tokens & Theming

## Overview

MiniApps implementa um **design system baseado em CSS variables** com suporte para **três temas distintos**:

1. **Launcher** - Tema editorial/principal (Zinc)
2. **YTPM** - Tema YouTube (Vermelho)
3. **Scanner** - Tema minimalista (Ciano)

Todos os temas são **dark-first** (modo escuro sempre ativo). O sistema usa:
- **CSS Variables** (CSS custom properties) para tokens de design
- **Tailwind CSS** com classe `dark` para modo escuro
- **Data attributes** (`[data-theme]`) para alternância automática de temas por rota

---

## Arquitetura de Tokens

### 1. Tokens Base (Global)
**Arquivo:** `src/styles/tokens.css`

Definem a paleta de cores semântica usada em todos os temas:

```css
:root {
  /* Cores de marca principais */
  --color-primary-50: 204 100% 97%;
  --color-primary-500: 199 89% 48%;

  /* Cores semânticas (seguem shadcn/ui) */
  --background: 0 0% 0%;        /* Fundo principal */
  --foreground: 0 0% 100%;      /* Texto principal */
  --card: 0 0% 5%;              /* Cards */
  --primary: 199 89% 48%;       /* Ação primária */
  --destructive: 0 84% 60%;     /* Ações destrutivas */
  --success: 142 71% 45%;       /* Sucesso */
  --warning: 38 92% 50%;        /* Aviso */
  --error: 0 84% 60%;           /* Erro */
}
```

### 2. Tokens Específicos de Tema
**Arquivos:**
- `src/styles/themes/launcher.css` - Tema principal
- `src/styles/themes/ytpm.css` - YouTube Playlist Manager
- `src/styles/themes/scanner.css` - QR/Barcode Scanner

Cada tema define suas próprias variáveis CSS:

```css
:root,
[data-theme="launcher"] {
  /* Backgrounds */
  --launcher-bg: #0a0a0b;
  --launcher-surface: #141416;

  /* Accent Colors */
  --launcher-accent: #e4e4e7;

  /* Semantic Colors */
  --launcher-success: #4ade80;

  /* Overlays & Effects */
  --launcher-overlay-light: rgba(0, 0, 0, 0.3);
  --launcher-overlay-medium: rgba(0, 0, 0, 0.6);

  /* Button Text Colors */
  --launcher-btn-primary-text: #fff;
}
```

---

## Sistema de Temas

### Automatic Theme Switching

**Arquivo:** `src/components/providers/theme-provider.tsx`

O tema é definido automaticamente baseado na rota:

```typescript
- `/` → launcher
- `/ytpm/*` → ytpm
- `/scanner/*` → scanner
```

O provedor define o atributo `data-theme` no elemento HTML:
```html
<html data-theme="launcher">
```

CSS responde ao atributo:
```css
[data-theme="launcher"] {
  --background: var(--launcher-bg);
}
```

### Usando o Hook useTheme

```typescript
import { useTheme } from '@/components/providers/theme-provider'

export function MyComponent() {
  const theme = useTheme() // 'launcher' | 'ytpm' | 'scanner'

  return <div>Current theme: {theme}</div>
}
```

---

## Guia de Uso: Como Adicionar Cores

### ✅ Padrão Correto: Use CSS Variables

**BOM** ✅
```css
.my-button {
  background: var(--launcher-accent);
  color: var(--launcher-btn-primary-text);
  border: 1px solid var(--launcher-border);
}
```

**BOM** ✅ (com fallback)
```css
.my-card {
  background: var(--ytpm-surface, #18181b);
  color: var(--ytpm-text, #fafafa);
}
```

### ❌ Práticas a Evitar

**RUIM** ❌ - Cores hardcoded
```css
.my-button {
  background: #ff0033;  /* Sem variável! */
  color: white;         /* Sem variável! */
}
```

**RUIM** ❌ - Misturando temas
```css
.my-component {
  background: var(--launcher-bg);  /* Launcher */
  color: var(--ytpm-text);         /* YTPM - misturado! */
}
```

---

## Estrutura Completa de Tokens: YTPM

### Backgrounds
```css
--ytpm-bg: #09090b;               /* Background principal */
--ytpm-surface: #18181b;          /* Superfícies interativas */
--ytpm-card: #1f1f23;             /* Cards */
--ytpm-card-hover: #27272b;       /* Cards em hover */
```

### Accent Colors
```css
--ytpm-accent: #ff0033;           /* YouTube Red (ação primária) */
--ytpm-accent-soft: #ff4d6a;      /* Red suave para hovers */
--ytpm-accent-glow: rgba(255, 0, 51, 0.25);
```

### Semantic Colors
```css
--ytpm-success: #10b981;          /* Confirmações */
--ytpm-warning: #f59e0b;          /* Alertas */
--ytpm-error: #ef4444;            /* Erros */
--ytpm-info: #3b82f6;             /* Informações */
```

### Text
```css
--ytpm-text: #fafafa;             /* Texto principal */
--ytpm-text-secondary: #d4d4d8;   /* Texto secundário */
--ytpm-muted: #a1a1aa;            /* Texto mutado */
--ytpm-muted-dark: #71717a;       /* Texto mutado escuro */
--ytpm-btn-primary-text: #fff;    /* Texto em botões primários */
```

### Borders
```css
--ytpm-border: #27272a;           /* Bordas normais */
--ytpm-border-hover: #3f3f46;     /* Bordas em hover */
--ytpm-border-accent: rgba(255, 0, 51, 0.3);
```

### Overlays & Effects
```css
--ytpm-overlay-light: rgba(0, 0, 0, 0.3);
--ytpm-overlay-medium: rgba(0, 0, 0, 0.6);
--ytpm-overlay-strong: rgba(0, 0, 0, 0.8);
--ytpm-glow: rgba(255, 0, 51, 0.25);
```

### Shadows
```css
--ytpm-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
--ytpm-shadow-accent: 0 4px 14px -3px var(--ytpm-accent-glow);
```

---

## Padrões de Componentes

### Buttons

**Padrão correto em ytpm.css:**
```css
.ytpm-btn-primary {
  background: var(--ytpm-accent);
  color: var(--ytpm-btn-primary-text);
  border-radius: 0.375rem;
  transition: background 200ms ease;
}

.ytpm-btn-primary:hover {
  background: var(--ytpm-accent-soft);
  box-shadow: 0 4px 14px -3px var(--ytpm-accent-glow);
}
```

### Cards

**Padrão correto em ytpm.css:**
```css
.ytpm-card {
  background: var(--ytpm-card);
  border: 1px solid var(--ytpm-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: border-color 200ms ease;
}

.ytpm-card:hover {
  border-color: var(--ytpm-border-hover);
  background: var(--ytpm-card-hover);
}
```

### Overlays & Gradients

**Padrão correto - use variáveis:**
```css
.ytpm-thumbnail::after {
  background: linear-gradient(
    to top,
    var(--ytpm-overlay-medium) 0%,
    transparent 50%
  );
}
```

---

## Acessibilidade: Contraste & Modos

### Requisitos WCAG

- **AA Normal:** Mínimo 4.5:1 de contraste
- **AA Large:** Mínimo 3:1
- **AAA Normal:** Mínimo 7:1
- **AAA Large:** Mínimo 4.5:1

### Validando Contraste

Use ferramentas online:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/) (Chrome/Firefox)
- [Accessible Colors](https://accessible-colors.com/)

**Exemplo - Verificar YTPM:**
```
Text: var(--ytpm-btn-primary-text) = #fff (white)
Background: var(--ytpm-accent) = #ff0033 (YouTube Red)
Ratio: ~3.8:1 (AA ok, não AAA)
```

### High Contrast Mode (`prefers-contrast: high`)

**Padrão correto - responda ao usuário:**
```css
@media (prefers-contrast: high) {
  [data-theme="launcher"] {
    background: var(--launcher-bg);  /* Use variables, não hardcoded */
  }
}
```

### Reduced Motion (`prefers-reduced-motion`)

**Padrão correto:**
```css
@media (prefers-reduced-motion: reduce) {
  .ytpm-card {
    animation: none;
    transition: none;
  }
}
```

---

## Tailwind CSS Integration

### Configuração em tailwind.config.js

```javascript
module.exports = {
  darkMode: ['class'],  // Use class strategy, não 'media'
  theme: {
    extend: {
      colors: {
        launcher: {
          bg: 'var(--launcher-bg)',
          accent: 'var(--launcher-accent)',
          // ...
        },
        ytpm: {
          bg: 'var(--ytpm-bg)',
          accent: 'var(--ytpm-accent)',
          // ...
        },
        scanner: {
          bg: 'var(--scanner-bg)',
          accent: 'var(--scanner-accent)',
          // ...
        },
      },
    },
  },
}
```

### Usando em Tailwind Classes

```jsx
// ✅ BOM - USA VARIÁVEL
<div className="bg-launcher-bg text-launcher-accent">
  Conteúdo
</div>

// ❌ RUIM - HARDCODED
<div className="bg-[#0a0a0b] text-white">
  Conteúdo
</div>
```

---

## Adicionando um Novo Tema

Se precisar criar um novo tema (ex: `dark-blue`):

### 1. Criar arquivo de tema
**Arquivo:** `src/styles/themes/dark-blue.css`

```css
:root,
[data-theme="dark-blue"] {
  /* Backgrounds */
  --darkblue-bg: #0d1f2d;
  --darkblue-surface: #1a2f3f;

  /* Accent Colors */
  --darkblue-accent: #3b82f6;  /* Blue */
  --darkblue-accent-soft: #60a5fa;

  /* Text */
  --darkblue-text: #f0f4f8;
  --darkblue-btn-primary-text: #fff;

  /* Borders */
  --darkblue-border: #334155;

  /* Overlays */
  --darkblue-overlay-light: rgba(0, 0, 0, 0.3);
  --darkblue-overlay-medium: rgba(0, 0, 0, 0.6);

  /* Shadow */
  --darkblue-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}

.darkblue-card {
  background: var(--darkblue-surface);
  border: 1px solid var(--darkblue-border);
}

/* ... mais componentes ... */
```

### 2. Importar no index de temas
**Arquivo:** `src/styles/themes/index.css`

```css
@import './launcher.css';
@import './ytpm.css';
@import './scanner.css';
@import './dark-blue.css';  /* Novo tema */
```

### 3. Atualizar tema provider
**Arquivo:** `src/components/providers/theme-provider.tsx`

```typescript
type Theme = 'launcher' | 'ytpm' | 'scanner' | 'dark-blue'

const theme = useMemo<Theme>(() => {
  if (pathname?.startsWith('/ytpm')) return 'ytpm'
  if (pathname?.startsWith('/scanner')) return 'scanner'
  if (pathname?.startsWith('/darkblue')) return 'dark-blue'  // Novo
  return 'launcher'
}, [pathname])
```

### 4. Adicionar cores ao Tailwind
**Arquivo:** `tailwind.config.js`

```javascript
colors: {
  darkblue: {
    bg: 'var(--darkblue-bg)',
    accent: 'var(--darkblue-accent)',
    // ...
  },
}
```

---

## Checklist para Implementações

Ao criar novo componente ou página:

- [ ] Usar CSS variables para TODAS as cores
- [ ] Respeitar o tema atual (`[data-theme]`)
- [ ] Testar em modo **alto contraste** (`prefers-contrast: high`)
- [ ] Testar em modo **redução de movimento** (`prefers-reduced-motion`)
- [ ] Validar **contraste WCAG AA+**
- [ ] Documentar componentes tema-específicos
- [ ] Não hardcoded cores (#fff, #000, rgb values)
- [ ] Usar fallbacks em variáveis quando apropriado

---

## Debugging & Troubleshooting

### Colors não aparecem?
1. Verifique se `[data-theme]` está presente no HTML
2. Inspecione no DevTools se variável está definida
3. Verifique se está importando o arquivo de tema correto

### High Contrast não funciona?
1. Confirme que usa `var(--*-bg)` em vez de hardcoded colors
2. Teste com DevTools: `ctrl+shift+p` → "Render with forced colors"

### Inconsistência entre temas?
1. Compare as variáveis entre themes/*.css
2. Certifique-se de usar o prefixo correto (--launcher-*, --ytpm-*, etc)
3. Use `useTheme()` para componentes dinâmicos

---

## Referências

- **Arquivo raiz:** `app/globals.css`
- **Tokens base:** `src/styles/tokens.css`
- **Temas:** `src/styles/themes/*.css`
- **Configuração:** `tailwind.config.js`
- **Provider:** `src/components/providers/theme-provider.tsx`
- **TypeScript types:** `src/types/theme.ts` (if exists)

---

## Últimas Atualizações

- **v1.0** - Sistema de três temas implementado
- **v1.1** - Adicionadas variáveis de overlay RGBA
- **v1.2** - Adicionadas variáveis de button text color
- **v1.3** - Documentação completa de design system
