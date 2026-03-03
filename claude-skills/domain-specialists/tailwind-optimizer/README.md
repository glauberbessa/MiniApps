# /tailwind-optimizer

**Tailwind CSS utility-first styling, optimization, and design systems.**

Use this skill when styling components, configuring Tailwind, building design systems, or optimizing CSS performance.

---

## What This Skill Does

Teaches Tailwind **thinking and strategy**. Covers:
- 🎨 Utility-first CSS principles
- 🛠️ Configuration and customization
- 🎭 Component composition patterns
- 📦 CSS optimization and purging
- 🌈 Design tokens and theming
- 📱 Responsive design patterns
- ♿ Accessibility with Tailwind

---

## When to Use

✅ Styling components with Tailwind
✅ Configuring Tailwind for project
✅ Building design system
✅ Responsive design strategy
✅ Dark mode implementation
✅ Accessibility improvements

❌ CSS fundamentals (use CSS guide)
❌ Custom CSS (use CSS-in-JS guides)

---

## Utility-First CSS Principles

### What is Utility-First?

**Traditional CSS:**
```css
.card {
  padding: 16px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

**Utility-First (Tailwind):**
```html
<div class="p-4 rounded-lg bg-white shadow-sm">
  Content
</div>
```

### Benefits

| Benefit | Why |
|---------|-----|
| **No naming** | Don't need semantic class names |
| **Consistency** | Design tokens built-in |
| **Small CSS** | Only used utilities in bundle |
| **Maintainable** | Styles stay with HTML |
| **Responsive** | Mobile-first responsive included |

### When to Reach for Components

```typescript
// ❌ Too much repetition
<div className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">
  Button
</div>
<div className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">
  Another Button
</div>

// ✅ Extract component
function Button({ children }) {
  return (
    <button className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600">
      {children}
    </button>
  );
}
```

---

## Tailwind Configuration

### Basic Setup

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
};
```

### Colors Configuration

```javascript
theme: {
  colors: {
    // Define custom palette
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      // ... extends default grays
    },
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
  },
}
```

**Usage:**
```html
<button class="bg-primary-500 hover:bg-primary-600">
  Click me
</button>
```

### Spacing Scale

```javascript
theme: {
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem',  // 8px
    4: '1rem',    // 16px
    8: '2rem',    // 32px
    16: '4rem',   // 64px
  }
}
```

**Usage:**
```html
<!-- Padding: p-4 = 1rem = 16px -->
<div class="p-4">Content</div>

<!-- Margin: m-8 = 2rem = 32px -->
<div class="m-8">Content</div>
```

---

## Common Utility Patterns

### Spacing Utilities

```html
<!-- Padding (p = padding, px = horizontal, py = vertical) -->
<div class="p-4">All sides: 1rem</div>
<div class="px-4 py-8">Horizontal 1rem, Vertical 2rem</div>
<div class="pt-2 pr-4 pb-6 pl-8">Top, Right, Bottom, Left</div>

<!-- Margin (negative values with -) -->
<div class="m-4 -mt-2">Negative top margin</div>
```

### Sizing

```html
<!-- Width/Height: w-1/2 = 50%, h-12 = 3rem -->
<div class="w-1/2 h-12">50% wide, 3rem tall</div>

<!-- Min/Max -->
<div class="min-h-screen">At least full screen height</div>
<div class="max-w-2xl">Max width: 42rem</div>
```

### Flexbox

```html
<!-- flex = display: flex -->
<div class="flex gap-4">
  <!-- gap = space between items -->
  <div class="flex-1">Auto width</div>
  <div class="flex-1">Auto width</div>
</div>

<!-- Alignment -->
<div class="flex items-center justify-between">
  <!-- items-center = align vertically -->
  <!-- justify-between = distribute horizontally -->
  <span>Left</span>
  <span>Right</span>
</div>
```

### Grid

```html
<div class="grid grid-cols-3 gap-4">
  <!-- 3 equal columns, 1rem gap -->
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- Responsive: 1 col on mobile, 2 on tablet, 3 on desktop -->
</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Utility Prefix |
|-----------|-------|--------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Mobile-First Pattern

```html
<!-- Start small, add complexity -->
<div class="text-sm md:text-base lg:text-lg">
  <!-- sm text on mobile -->
  <!-- base text on tablet -->
  <!-- lg text on desktop -->
</div>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- 1 column mobile, 2 tablet, 4 desktop -->
</div>
```

### Custom Breakpoints

```javascript
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
    // Custom
    'mobile': '320px',
    'tablet': '900px',
  }
}
```

---

## Dark Mode Implementation

### Strategy 1: Class-Based (Recommended)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

```typescript
// app/layout.tsx
import { useEffect, useState } from 'react';

export function RootLayout() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  return (
    <html className={isDark ? 'dark' : ''}>
      <body>
        {/* Toggle button */}
        <button
          onClick={() => {
            setIsDark(!isDark);
            document.documentElement.classList.toggle('dark');
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </body>
    </html>
  );
}
```

### Using Dark Utilities

```html
<!-- Light mode: bg-white, Dark mode: bg-gray-900 -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">Content</p>
</div>
```

### Strategy 2: System Preference

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'media', // Respects OS preference
}
```

---

## Design Tokens & Customization

### Color System

```javascript
theme: {
  colors: {
    // Semantic colors
    'success': {
      light: '#d1fae5',
      DEFAULT: '#10b981',
      dark: '#065f46',
    },
    'warning': {
      light: '#fef3c7',
      DEFAULT: '#f59e0b',
      dark: '#92400e',
    },
    'error': {
      light: '#fee2e2',
      DEFAULT: '#ef4444',
      dark: '#7f1d1d',
    },
  }
}
```

### Typography

```javascript
theme: {
  fontSize: {
    'xs': ['0.75rem', '1rem'],        // 12px, line-height
    'sm': ['0.875rem', '1.25rem'],    // 14px
    'base': ['1rem', '1.5rem'],       // 16px
    'lg': ['1.125rem', '1.75rem'],    // 18px
    'xl': ['1.25rem', '1.75rem'],     // 20px
  },
  fontWeight: {
    'light': 300,
    'normal': 400,
    'semibold': 600,
    'bold': 700,
  }
}
```

### Using Tokens

```html
<h1 class="text-2xl font-bold text-gray-900">Heading</h1>
<p class="text-base font-normal text-gray-600">Paragraph</p>
<small class="text-sm font-light text-gray-500">Captions</small>
```

---

## Component Patterns

### Button Component

```typescript
function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}) {
  const baseStyles = 'font-semibold rounded transition-colors';

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card Component

```typescript
function Card({ children, className }) {
  return (
    <div className={`
      bg-white dark:bg-gray-800
      rounded-lg
      shadow-md
      p-6
      border border-gray-200 dark:border-gray-700
      ${className}
    `}>
      {children}
    </div>
  );
}
```

### Using Components

```html
<Card>
  <h2 class="text-lg font-bold mb-4">Card Title</h2>
  <p class="text-gray-600 dark:text-gray-400">Card content</p>
</Card>

<Button variant="primary" size="lg">
  Click me
</Button>
```

---

## Performance Optimization

### Purge Unused CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include all files where you use Tailwind
  ],
  // ...
}
```

**Impact:** Development bundle might be 500KB, production CSS only 15KB

### CSS Size Reduction

| Step | Approach | Savings |
|------|----------|---------|
| **Purge unused** | Only include used utilities | -95% |
| **Minify** | Compress output | -20% |
| **Gzip** | Server compression | -80% |
| **Final** | All three combined | 1-5KB |

---

## Accessibility with Tailwind

### Focus States

```html
<!-- Always include focus styles -->
<button class="
  bg-blue-500
  focus:outline-none
  focus:ring-2
  focus:ring-blue-300
  focus:ring-offset-2
">
  Click me
</button>
```

### Color Contrast

```html
<!-- Good contrast (WCAG AA) -->
<p class="text-gray-900 bg-white">High contrast ✓</p>

<!-- Poor contrast (fail WCAG) -->
<p class="text-gray-400 bg-white">Low contrast ✗</p>
```

### Semantic HTML + Tailwind

```html
<!-- Use semantic elements -->
<nav class="bg-gray-800 text-white">
  <ul class="flex gap-4">
    <li><a href="/" class="hover:underline">Home</a></li>
  </ul>
</nav>

<!-- Use proper form labels -->
<label htmlFor="email" class="block text-sm font-medium">
  Email
</label>
<input id="email" type="email" class="mt-1 block w-full rounded border" />
```

---

## Common Mistakes to Avoid

### ❌ Avoiding Repetition Wrong Way

```html
<!-- DON'T: Over-extract components for tiny classes -->
<div class="text-lg">Title</div>
<!-- vs extract only if used 3+ times -->
```

### ✅ Smart Extraction

```typescript
// DO: Extract when same styles repeat
function PageTitle({ children }) {
  return <h1 class="text-3xl font-bold text-gray-900">{children}</h1>;
}
```

### ❌ Performance Issues

```html
<!-- DON'T: Dynamic class names (not detected by purger) -->
<div className={`p-${value}`}></div>

<!-- DO: Use fixed class names -->
<div className="p-4" style={{ padding: value }}></div>
```

### ✅ Responsive Best Practices

```html
<!-- DO: Mobile-first, add complexity -->
<div class="block md:inline-block lg:flex">
  Responsive layout
</div>

<!-- DON'T: Start with desktop, remove on mobile -->
<!-- (uses more CSS) -->
```

---

## Tailwind Checklist

- [ ] **content configured** - All template files included
- [ ] **design tokens defined** - Colors, spacing, typography
- [ ] **responsive breakpoints** - Mobile-first strategy
- [ ] **dark mode** - Class or media strategy
- [ ] **components extracted** - Reusable styles
- [ ] **a11y focus states** - Keyboard navigation visible
- [ ] **CSS optimized** - Production bundle <10KB
- [ ] **accessibility** - Color contrast checked

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Hardcode colors (use theme)
- Use arbitrary utilities heavily (`[color:purple]`)
- Skip responsive design
- Mix utility + custom CSS inconsistently
- Forget focus states
- Ignore dark mode

✅ **DO:**
- Define design tokens in config
- Use named utilities
- Mobile-first responsive
- Keep styles consistent
- Accessibility first
- Plan dark mode early

---

## Next Steps

1. **Configure theme** - Define colors, spacing, typography
2. **Create components** - Button, Card, Input patterns
3. **Mobile-first layouts** - Start small, add detail
4. **Dark mode** - Implement and test
5. **Optimize CSS** - Verify bundle size
6. **Accessibility** - Check contrast, focus states

---

## Related Skills

- `/frontend-expert` - For component strategy
- `/react-expert` - For component implementation
- `/nextjs-builder` - For full-stack styling
- `/ui-design-system` - For design systems
