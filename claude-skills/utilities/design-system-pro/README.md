# /design-system-pro

**Design system fundamentals, token systems, and design-to-code workflow.**

Use this skill when building design systems, creating component libraries, or establishing design tokens.

---

## What This Skill Does

Teaches **design system thinking**. Covers:
- 🎨 Design system principles and benefits
- 🏗️ Component library architecture
- 🎯 Design tokens (colors, spacing, typography)
- 🧩 Component patterns and anatomy
- 🌈 Color systems and accessibility
- 📏 Spacing and sizing scales
- 🔤 Typography system design
- ♿ Accessibility in design systems
- 🔗 Design-to-code workflow
- 📚 Documentation standards

---

## When to Use

✅ Building component libraries
✅ Establishing design systems
✅ Creating design tokens
✅ Documenting components
✅ Scaling design across teams

❌ Visual design tools (use design tools)

---

## Design System Definition

### What is a Design System?

A design system is a collection of reusable components, patterns, and design principles that enable teams to design and build digital products consistently.

### Design System Benefits

```
Consistency
├─ Same components across products
├─ Unified user experience
└─ Reduced cognitive load for users

Efficiency
├─ Faster design iteration
├─ Faster development
└─ Reduced design/dev time

Scalability
├─ Multiple teams using same system
├─ Single source of truth
└─ Easy to maintain and evolve

Quality
├─ Tested components
├─ Accessibility built-in
└─ Better user experience
```

---

## Design Tokens

### Token Categories

```
1. Color Tokens
   ├─ Brand colors (primary, secondary)
   ├─ Semantic colors (success, warning, error)
   ├─ Neutral colors (grays, blacks, whites)
   └─ Alias tokens (text-primary, bg-surface)

2. Typography Tokens
   ├─ Font families
   ├─ Font sizes (xs, sm, md, lg, xl)
   ├─ Font weights (regular, medium, bold)
   ├─ Line heights
   └─ Letter spacing

3. Spacing Tokens
   ├─ Base unit (4px or 8px)
   ├─ Scale (4, 8, 12, 16, 24, 32, etc.)
   └─ Component padding/margin

4. Shadow Tokens
   ├─ Elevation levels
   └─ Blur/offset variations

5. Border Tokens
   ├─ Border radius (xs, sm, md, lg)
   └─ Border widths

6. Duration Tokens
   ├─ Animation durations
   └─ Transition speeds
```

### Token Structure Example

```json
{
  "color": {
    "brand": {
      "primary": "#007AFF",
      "secondary": "#5AC8FA"
    },
    "semantic": {
      "success": "#34C759",
      "warning": "#FF9500",
      "error": "#FF3B30",
      "info": "#00B4DB"
    },
    "neutral": {
      "100": "#FFFFFF",
      "200": "#F9F9F9",
      "300": "#EFEFEF",
      "400": "#E0E0E0",
      "500": "#C0C0C0",
      "600": "#808080",
      "700": "#404040",
      "800": "#202020",
      "900": "#000000"
    }
  },
  "typography": {
    "fontFamily": {
      "body": "Inter, sans-serif",
      "heading": "Poppins, sans-serif"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "md": "16px",
      "lg": "20px",
      "xl": "24px",
      "2xl": "32px"
    },
    "fontWeight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px"
  }
}
```

### Token Usage in Code

```typescript
// CSS Variables
:root {
  --color-primary: #007AFF;
  --color-error: #FF3B30;
  --spacing-md: 16px;
  --font-size-lg: 20px;
  --duration-short: 150ms;
}

// SCSS Variables
$color-primary: #007AFF;
$spacing-scale: 4px;
$spacing-md: $spacing-scale * 4;

// JavaScript/TypeScript
const tokens = {
  colors: {
    primary: '#007AFF',
    error: '#FF3B30'
  },
  spacing: {
    md: '16px'
  }
};

// Tailwind Configuration
module.exports = {
  theme: {
    colors: {
      primary: '#007AFF',
      error: '#FF3B30'
    },
    spacing: {
      4: '16px',
      6: '24px'
    }
  }
}
```

---

## Color System Design

### Color Palette Structure

```
Brand Color
├─ 50 (lightest tint)
├─ 100
├─ 200
├─ 300
├─ 400
├─ 500 (base color)
├─ 600
├─ 700
├─ 800
└─ 900 (darkest shade)
```

### Semantic Color Mapping

```javascript
const colors = {
  // Semantic
  success: colors.green[500],
  warning: colors.yellow[500],
  error: colors.red[500],
  info: colors.blue[500],

  // UI
  background: colors.neutral[50],
  surface: colors.neutral[100],
  border: colors.neutral[200],
  disabled: colors.neutral[300],
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600],
    tertiary: colors.neutral[500],
    disabled: colors.neutral[400]
  }
};
```

### Accessible Color Contrast

**WCAG Standards:**
```
AA Standard:
- Normal text: 4.5:1 ratio minimum
- Large text: 3:1 ratio minimum

AAA Standard:
- Normal text: 7:1 ratio minimum
- Large text: 4.5:1 ratio minimum
```

**Check contrast:**
```javascript
// Using WCAG formula
function getContrastRatio(rgb1, rgb2) {
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Tools: WebAIM, Contrast Ratio
```

---

## Typography System

### Font Scale

```
Scale (typically 1.125 or 1.25x multiplier):

xs:  12px (for labels, captions)
sm:  14px
md:  16px (body text)
lg:  20px
xl:  24px
2xl: 32px (headings)
3xl: 40px
4xl: 48px (display)
```

### Line Height by Size

```
Small text (xs, sm):      1.5 (more space for readability)
Body text (md):           1.5-1.6
Large headings (lg+):     1.2-1.3 (tighter, more visual)
```

### Letter Spacing by Size

```
Large text:   normal (0)
Medium text:  normal (0)
Small text:   0.5px (add space for clarity)
Labels:       0.5px-1px
```

### Typography Tokens

```json
{
  "typography": {
    "body": {
      "font-family": "Inter, sans-serif",
      "font-size": "16px",
      "font-weight": 400,
      "line-height": "1.5"
    },
    "heading-1": {
      "font-family": "Poppins, sans-serif",
      "font-size": "32px",
      "font-weight": 700,
      "line-height": "1.3"
    },
    "heading-2": {
      "font-size": "24px",
      "font-weight": 700,
      "line-height": "1.3"
    },
    "label": {
      "font-size": "12px",
      "font-weight": 600,
      "letter-spacing": "0.5px"
    }
  }
}
```

---

## Spacing System

### The 4px/8px Grid

**Base Unit: 8px**
```
1x = 4px
2x = 8px
3x = 12px
4x = 16px
6x = 24px
8x = 32px
10x = 40px
12x = 48px
16x = 64px
```

### Component Spacing Rules

```
Button:
- Padding: 8px 16px (small)
- Padding: 12px 24px (medium)
- Padding: 16px 32px (large)

Card:
- Padding: 16px

Modal:
- Padding: 24px

Spacing between elements:
- Tight: 8px
- Normal: 16px
- Loose: 24px
```

---

## Component Architecture

### Component Anatomy

Every component has consistent structure:

```
Component
├─ Visual Layer (appearance)
│  ├─ Size (sm, md, lg)
│  ├─ Color/variant
│  └─ Shape (border radius)
│
├─ Interaction Layer
│  ├─ Hover state
│  ├─ Focus state
│  ├─ Active state
│  └─ Disabled state
│
├─ Content Layer
│  ├─ Icon
│  ├─ Text
│  ├─ Badge
│  └─ Sublabel
│
└─ Accessibility Layer
   ├─ ARIA attributes
   ├─ Keyboard navigation
   └─ Focus indicators
```

### Component States

```
All interactive components must support:
- Default
- Hover
- Focus
- Active/Pressed
- Disabled
- Loading (async operations)
- Error

Example Button States:
Button → Hover Button → Pressed Button → Disabled Button
```

---

## Component Documentation

### Storybook Example

```typescript
import { Button } from './Button';

export default {
  component: Button,
  title: 'Button',
  argTypes: {
    size: {
      options: ['sm', 'md', 'lg'],
      control: 'radio'
    },
    variant: {
      options: ['primary', 'secondary', 'tertiary'],
      control: 'radio'
    }
  }
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Click me'
  }
};

export const Loading = {
  args: {
    variant: 'primary',
    children: 'Click me',
    loading: true
  }
};

export const Disabled = {
  args: {
    disabled: true,
    children: 'Click me'
  }
};
```

---

## Design Tokens in Tailwind

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: {
        50: '#F0F7FF',
        100: '#E0EFFF',
        500: '#007AFF',
        900: '#000033'
      },
      semantic: {
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30'
      }
    },
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px'
    },
    borderRadius: {
      xs: '4px',
      sm: '6px',
      md: '8px',
      lg: '12px'
    },
    fontSize: {
      xs: ['12px', { lineHeight: '1.5' }],
      sm: ['14px', { lineHeight: '1.5' }],
      md: ['16px', { lineHeight: '1.6' }],
      lg: ['20px', { lineHeight: '1.3' }]
    }
  }
};
```

---

## Design System Documentation

### README Structure

```markdown
# Design System

## Overview
What is this system? Who uses it?

## Getting Started
How to use components in projects

## Design Tokens
- Colors
- Typography
- Spacing
- etc.

## Components
- Button
- Input
- Card
- Modal
- etc.

## Patterns
- Forms
- Tables
- Navigation
- etc.

## Guidelines
- Accessibility
- Responsive design
- Dark mode
- etc.

## Contributing
How to contribute new components

## Changelog
What's changed?
```

---

## Accessibility in Design Systems

### Color and Contrast

```
✅ DO:
- Maintain 4.5:1 contrast for text
- Don't rely on color alone (use icons, patterns)
- Test with accessibility tools
- Support dark mode

❌ DON'T:
- Low contrast text
- Color-only status indicators
- Overlapping text and colors
- Forget about colorblind users
```

### Interactive Components

```
All buttons, inputs, links must have:
- Visible focus indicator (2-3px outline)
- Keyboard accessible (Tab, Enter, Space)
- Clear labels (aria-label if needed)
- Descriptive link text
- Touch targets ≥ 44x44px
```

### ARIA in Components

```jsx
// Button
<button aria-label="Close dialog" onClick={close}>
  ✕
</button>

// Form field
<input aria-label="Email address" type="email" />

// Live region
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Skip link
<a href="#main-content" className="skip-link">
  Skip to content
</a>
```

---

## Dark Mode Support

### Token Strategy

```json
{
  "light": {
    "colors": {
      "background": "#FFFFFF",
      "text": "#000000",
      "border": "#E0E0E0"
    }
  },
  "dark": {
    "colors": {
      "background": "#1A1A1A",
      "text": "#FFFFFF",
      "border": "#404040"
    }
  }
}
```

### Implementation

```css
:root {
  --color-background: white;
  --color-text: black;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1a1a;
    --color-text: white;
  }
}

/* Usage */
body {
  background-color: var(--color-background);
  color: var(--color-text);
}
```

---

## Design System Checklist

- [ ] **Color palette** - Primary, secondary, semantic, neutral
- [ ] **Typography** - Font families, sizes, weights
- [ ] **Spacing scale** - Consistent sizing
- [ ] **Components** - Button, input, card, modal, etc.
- [ ] **States** - Default, hover, focus, active, disabled
- [ ] **Accessibility** - Contrast, ARIA, keyboard nav
- [ ] **Dark mode** - Support dark variant
- [ ] **Documentation** - Storybook or similar
- [ ] **Tokens** - Exported for design and code
- [ ] **Naming** - Consistent, semantic names

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Have unlimited colors (too many to maintain)
- Skip accessibility in components
- Design for one screen size only
- Duplicate components (Button1, Button2)
- Have unmaintained documentation
- Ignore dark mode support
- Not test accessibility

✅ **DO:**
- Limited, semantic color palette
- Accessible by default
- Responsive design
- Single source of truth
- Keep docs up-to-date
- Support light and dark
- Test with accessibility tools

---

## Related Skills

- `/ui-design-system` - Deeper design patterns
- `/tailwind-optimizer` - CSS implementation
- `/frontend-expert` - Component development
- `/performance-profiler` - Design system performance

