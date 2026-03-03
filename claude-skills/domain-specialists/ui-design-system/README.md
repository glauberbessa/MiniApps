# /ui-design-system

**Design system architecture, component libraries, and design-to-code workflows.**

Use this skill when building design systems, creating component libraries, or establishing design consistency.

---

## What This Skill Does

Teaches **design system thinking**. Covers:
- 🎨 Design system fundamentals and benefits
- 🧩 Component library architecture
- 🎯 Token system design (colors, spacing, typography)
- 📐 Design patterns and best practices
- 🔄 Design-to-code workflow
- 📚 Documentation and handoff
- ♿ Accessibility standards
- 📈 Scaling and maintenance

---

## When to Use

✅ Building design system
✅ Creating component library
✅ Establishing design tokens
✅ Documenting components
✅ Design-to-development handoff
✅ Scaling component architecture

❌ Specific design tool usage (Figma, Adobe XD)
❌ Graphic design (use design guides)

---

## Design System Fundamentals

### What is a Design System?

A design system is a set of **standards, components, and patterns** that enable consistency:

| Aspect | Purpose |
|--------|---------|
| **Visual Language** | Consistent look and feel |
| **Component Library** | Reusable UI components |
| **Tokens** | Design decisions (colors, spacing) |
| **Patterns** | Common solutions (forms, modals) |
| **Documentation** | How to use everything |

### Benefits

✅ **Consistency** - All products look the same
✅ **Speed** - Build faster with components
✅ **Collaboration** - Designers and developers aligned
✅ **Scalability** - Easy to scale across teams
✅ **Maintenance** - Update once, everywhere

---

## Token System Design

### What are Design Tokens?

Design tokens are **named design decisions** stored as data:

```json
{
  "colors": {
    "primary": "#3B82F6",
    "primary-dark": "#1E40AF",
    "success": "#10B981"
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "2rem"
  },
  "typography": {
    "heading-1": {
      "fontSize": "2rem",
      "fontWeight": "bold",
      "lineHeight": "2.5rem"
    }
  }
}
```

### Token Categories

| Category | Examples | Usage |
|----------|----------|-------|
| **Colors** | Primary, secondary, neutral | All colored elements |
| **Spacing** | 4px, 8px, 16px, 32px | Margins, padding, gaps |
| **Typography** | Font families, sizes, weights | Text styling |
| **Shadows** | Elevation levels | Depth perception |
| **Border Radius** | 4px, 8px, 12px | Cornering elements |
| **Breakpoints** | 640px, 768px, 1024px | Responsive design |

### Color Palette Organization

```
Semantic Colors (What does it mean?)
├── Primary - Main brand color
├── Success - Positive action/state
├── Warning - Alert/caution
├── Error - Danger/failure
└── Neutral - Background/borders

Semantic Aliases (How is it used?)
├── Button Background → Primary
├── Button Hover → Primary-Dark
├── Text → Neutral-900
├── Border → Neutral-200
└── Background → Neutral-50
```

### Spacing Scale

```
Consistent 4px base unit:
├── xs: 4px (0.25rem)
├── sm: 8px (0.5rem)
├── md: 16px (1rem)
├── lg: 32px (2rem)
├── xl: 64px (4rem)
└── 2xl: 128px (8rem)

Benefits:
✅ Easy to calculate
✅ Consistent rhythm
✅ Scalable
```

---

## Component Library Architecture

### Atomic Design Approach

| Level | Definition | Examples |
|-------|-----------|----------|
| **Atoms** | Smallest units | Button, Input, Badge |
| **Molecules** | Atom combinations | Form group, Card header |
| **Organisms** | Molecule combinations | Form, Modal, Navigation |
| **Templates** | Organism layouts | Login page template |
| **Pages** | Real templates with data | Actual login page |

### Component Structure

```
Button (Component)
├── Visual Variants
│   ├── Primary
│   ├── Secondary
│   └── Danger
├── Sizes
│   ├── Small
│   ├── Medium
│   └── Large
├── States
│   ├── Default
│   ├── Hover
│   ├── Disabled
│   └── Loading
└── Props
    ├── label: string
    ├── onClick: function
    └── icon: ReactNode
```

### Documentation Template

```markdown
# Button

Primary action button for forms and interactions.

## Visual Variants
- **Primary**: Main action (brand color)
- **Secondary**: Alternative action (neutral)
- **Danger**: Destructive action (red)

## Sizes
- **Small**: Inline actions (32px height)
- **Medium**: Standard (40px height)
- **Large**: Prominent (48px height)

## Usage
```typescript
<Button variant="primary" size="md">
  Click me
</Button>
```

## States
- Hover: 10% darker
- Disabled: 50% opacity
- Loading: Shows spinner

## Accessibility
- Keyboard: Tab to focus, Enter to activate
- Screen reader: Button label read aloud
- Color: Not only color indicates state
```

---

## Design-to-Code Workflow

### Step 1: Handoff from Designer

Designers prepare:
- ✅ Component specs in Figma
- ✅ Design tokens exported as JSON
- ✅ Color accessibility approved
- ✅ Responsive behavior documented
- ✅ States and interactions defined

### Step 2: Developer Implementation

Developer creates:
- ✅ React components matching spec
- ✅ TypeScript prop types
- ✅ Storybook stories
- ✅ Tests for interactions
- ✅ Accessibility audit

### Step 3: Validation

QA checks:
- ✅ Visual match with spec
- ✅ Responsive behavior
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Performance (< 50ms render)

### Tools for Handoff

| Tool | Purpose |
|------|---------|
| **Figma** | Design files + specs |
| **Storybook** | Component showcase |
| **Zeroheight** | Design documentation |
| **GitHub** | Code repository |

---

## Scaling Design Systems

### Stage 1: Foundation (0-10 components)

Focus:
- ✅ Core components (Button, Input, Card)
- ✅ Define tokens clearly
- ✅ Establish guidelines
- ✅ Basic documentation

Timeline: 2-4 weeks

### Stage 2: Expansion (10-50 components)

Add:
- ✅ Form components (Select, Checkbox, Radio)
- ✅ Layout components (Grid, Flex, Sidebar)
- ✅ Feedback (Toast, Modal, Dialog)
- ✅ Advanced patterns

Timeline: 2-3 months

### Stage 3: Maturation (50+ components)

Maintain:
- ✅ Deprecation policy for old components
- ✅ Versioning strategy
- ✅ Community feedback process
- ✅ Documentation tools

Timeline: Ongoing

---

## Accessibility in Design Systems

### Color Contrast

```
WCAG AA Standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

Check with:
- WebAIM Contrast Checker
- Figma A11y plugin
- axe DevTools
```

### Focus States

```css
/* Clear, visible focus indicators */
button:focus {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

### Semantic HTML

```typescript
// DO: Use semantic elements
<button onClick={handleClick}>Click me</button>
<nav>Navigation</nav>
<main>Main content</main>

// DON'T: Use div for everything
<div role="button" onClick={handleClick}>
  Click me
</div>
```

### ARIA Labels

```typescript
// Icons need labels
<button aria-label="Close dialog">✕</button>

// Complex widgets need ARIA
<div role="slider" aria-label="Volume" aria-valuenow={50} />
```

---

## Component API Design

### Prop Strategy

```typescript
// DO: Clear, specific props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  children: ReactNode;
}

// DON'T: Too many boolean props
interface ButtonProps {
  primary?: boolean;
  secondary?: boolean;
  danger?: boolean;
  small?: boolean;
  // ...
}
```

### Composition over Props

```typescript
// DO: Composable components
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// DON'T: Props for everything
<Card
  headerTitle="Title"
  headerIcon={icon}
  headerActions={actions}
  bodyContent={content}
  footerActions={actions}
/>
```

---

## Documentation Best Practices

### Component Documentation

Include:
- ✅ **Purpose**: What is this component for?
- ✅ **Usage**: Code example
- ✅ **Props**: Table of prop names and types
- ✅ **Variants**: Visual variations
- ✅ **States**: Interactive states
- ✅ **Accessibility**: a11y considerations
- ✅ **Related**: Links to related components

### Storybook Stories

```typescript
import { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};

export const Disabled: Story = {
  args: {
    ...Primary.args,
    disabled: true,
  },
};
```

---

## Token Export Formats

### JSON Format

```json
{
  "tokens": {
    "color": {
      "primary": {
        "value": "#3B82F6",
        "type": "color"
      }
    }
  }
}
```

### CSS Variables

```css
:root {
  --color-primary: #3B82F6;
  --color-primary-dark: #1E40AF;
  --spacing-md: 1rem;
  --typography-heading-1-font-size: 2rem;
}
```

### JavaScript/TypeScript

```typescript
export const tokens = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
  },
  spacing: {
    md: '1rem',
    lg: '2rem',
  },
};
```

### Tools for Token Management

| Tool | Purpose |
|------|---------|
| **Figma Tokens** | Export tokens from Figma |
| **Style Dictionary** | Generate multi-format tokens |
| **Tokens Studio** | Organize and version tokens |

---

## Design System Checklist

- [ ] **Purpose defined** - Why do we need this?
- [ ] **Core tokens** - Colors, spacing, typography
- [ ] **Foundation components** - Button, Input, Card (5-10)
- [ ] **Accessibility** - WCAG AA compliance
- [ ] **Documentation** - Components documented with examples
- [ ] **Storybook** - Interactive component showcase
- [ ] **Design tokens** - Exported in multiple formats
- [ ] **Versioning** - Semantic versioning strategy
- [ ] **Maintenance** - Process for updates and deprecation

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Design system with 100+ components upfront (too much to maintain)
- Ignore accessibility (catches up later)
- One-off variations (add to system instead)
- No versioning strategy (breaking changes hidden)
- Component prop explosion (use composition)
- No designer-developer collaboration (misalignment)

✅ **DO:**
- Start small, expand thoughtfully
- Accessibility from day one
- Establish clear approval process
- Semantic versioning (MAJOR.MINOR.PATCH)
- Simple component APIs
- Designer and developer partnership

---

## Next Steps

1. **Define core tokens** - Colors, spacing, typography
2. **Create foundation** - 5-10 essential components
3. **Build Storybook** - Interactive showcase
4. **Document** - Component usage and specs
5. **Test accessibility** - WCAG AA compliance
6. **Version** - Track changes over time
7. **Iterate** - Gather feedback, improve

---

## Related Skills

- `/tailwind-optimizer` - For CSS utility approach
- `/frontend-expert` - For component architecture
- `/react-expert` - For component patterns
- `/accessibility-auditor` - For a11y compliance
- `/performance-profiler` - For component performance
