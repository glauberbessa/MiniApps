# /frontend-expert

**Frontend architecture, design patterns, and framework selection for modern web applications.**

Use this skill when designing frontend architecture, choosing frameworks, planning component structure, or optimizing performance.

---

## What This Skill Does

Teaches frontend **thinking**, not copying. Covers:
- 🏗️ Frontend architecture patterns
- ⚡ Performance optimization strategies
- 🎨 Component organization
- 🔄 State management selection
- 📱 Responsive design principles
- ♿ Accessibility considerations
- 🧪 Testing strategies

---

## When to Use

✅ Choosing a frontend framework
✅ Planning component architecture
✅ Designing for performance
✅ Component composition strategies
✅ State management decisions
✅ Accessibility and UX review

❌ React hooks specifically (use `/react-expert`)
❌ CSS/styling strategies (use `/tailwind-optimizer`)
❌ Implementation code (ask for specific help)

---

## Frontend Framework Selection

### Decision Tree

```
What are you building?
│
├── Interactive Single-Page App
│   ├── Need type safety?
│   │   ├── Yes → React + TypeScript
│   │   └── No → Vue, Svelte
│   │
├── Content-focused Site / Blog
│   ├── Need interactivity?
│   │   ├── Yes → Next.js, SvelteKit
│   │   └── No → Astro, Hugo
│   │
├── Real-time App
│   ├── Simple → React + WebSocket
│   ├── Complex → Svelte, Vue
│   │
├── Desktop App
│   ├── Web-first → Electron
│   ├── Native → Tauri
│   │
├── Mobile App
│   └── TypeScript → React Native, Expo
│
└── Micro-frontend / Module Federation
    └── React, Vue, or Svelte
```

---

## Framework Comparison

| Factor | React | Vue | Svelte | Next.js | Astro |
|--------|-------|-----|--------|---------|-------|
| **Best for** | Large SPAs | Flexible | Performance | Full-stack | Static + Islands |
| **Learning curve** | Medium | Low | Low | Medium | Medium |
| **Ecosystem** | Largest | Growing | Growing | Excellent | Growing |
| **TypeScript** | Excellent | Good | Good | Excellent | Good |
| **Bundle size** | Medium | Small | Tiny | Large | Varies |
| **Rendering** | CSR | CSR/SSR | CSR | SSR/CSR | SSR/SSG |

---

## Frontend Architecture Principles

### Component Design Principles

| Principle | Meaning |
|-----------|---------|
| **Single Responsibility** | Each component does one thing |
| **Composition** | Build from small, focused parts |
| **Props Down, Events Up** | Unidirectional data flow |
| **Avoid Prop Drilling** | Use context for deep nesting |
| **Prefer Small Components** | Easier to understand, test, reuse |

### Component Types

| Type | Purpose | State | Reusable |
|------|---------|-------|----------|
| **Presentational** | Display UI | None (props only) | High |
| **Container** | Logic + state | Heavy state | Low |
| **Compound** | Parent-child coordination | Context | High |
| **Custom Hook** | Reusable logic | Any | High |

---

## Component Organization Strategies

### Strategy 1: Feature-Based

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
```

**When:** Large apps with distinct features
**Benefit:** Everything feature-related together

### Strategy 2: Layer-Based

```
src/
├── components/        # Presentational
├── containers/        # State/logic
├── hooks/             # Reusable logic
├── utils/             # Helpers
└── pages/             # Routes
```

**When:** Small to medium apps
**Benefit:** Clear separation of concerns

### Strategy 3: Flat with Index Files

```
src/
├── Button.tsx
├── Modal.tsx
├── Card.tsx
├── index.ts  ← exports all
```

**When:** Design system or component library
**Benefit:** Easy discoverability

---

## State Management Selection

### Decision Matrix

| Scope | Complexity | Solution |
|-------|-----------|----------|
| Single component | Simple | `useState` |
| Single component | Complex | `useReducer` |
| Parent → children | Shared | Lift state up |
| Subtree | Shared | Context |
| App-wide | Complex | Zustand, Redux |
| Server state | Any | TanStack Query, SWR |

### State Placement Decision

```
Are multiple components using this state?
│
├── No → useState in component
├── Yes → Is it in same parent?
│   ├── Yes → Lift to parent
│   └── No → Is it in same feature?
│       ├── Yes → Context Provider
│       └── No → Global store (Zustand)
└── Server data → TanStack Query
```

### Popular Solutions

| Library | Best For | Complexity |
|---------|----------|-----------|
| **useState** | Single component | Minimal |
| **Context** | Subtree sharing | Low |
| **Zustand** | Global state | Low |
| **Redux Toolkit** | Complex state | Medium |
| **Recoil** | Fine-grained state | Medium |
| **TanStack Query** | Server state | Medium |
| **SWR** | Server state (simple) | Low |

---

## Performance Optimization

### Identify Before Optimizing

✅ **DO:**
1. Measure with DevTools
2. Find the bottleneck
3. Apply targeted fix
4. Measure improvement

❌ **DON'T:**
- Optimize without measuring
- Premature optimization
- Optimize code you can't see is slow

### Common Performance Issues

| Problem | Signal | Fix |
|---------|--------|-----|
| **Slow renders** | Long blue bar in DevTools | Profile, find component |
| **Unnecessary re-renders** | Component re-renders when not needed | React.memo, useMemo, useCallback |
| **Large lists** | Scrolling is slow | Virtualization (React Window) |
| **Heavy calculations** | CPU usage high | useMemo, move to worker |
| **Blocking main thread** | Input lag | Use requestAnimationFrame |

### Optimization Techniques

| Technique | When | Trade-off |
|-----------|------|-----------|
| **React.memo** | Component unchanged props | Memory for speed |
| **useMemo** | Expensive calculation | Extra memory |
| **useCallback** | Stable reference needed | Extra memory |
| **Code splitting** | Large bundle | Complexity |
| **Lazy loading** | Off-screen images | Network requests |
| **Virtual scrolling** | Large lists | Complexity |

---

## Composition Patterns

### Pattern 1: Compound Components

**When:** Related components work together (Tabs, Dropdown, etc.)

```typescript
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>
```

**Benefits:**
- Self-documenting
- Flexible composition
- Shared context internally

### Pattern 2: Render Props

**When:** Component needs to provide render flexibility

```typescript
<DataFetcher
  url="/api/users"
  render={(data, loading, error) => (
    loading ? <Spinner /> : <UserList data={data} />
  )}
/>
```

**Benefits:**
- Flexible rendering
- Component controls when render happens

### Pattern 3: Higher-Order Component (HOC)

**When:** Logic needs to wrap multiple components

```typescript
const withAuth = (Component) => (props) => {
  const { user } = useAuth();
  return user ? <Component {...props} /> : <Login />;
};

const ProtectedDashboard = withAuth(Dashboard);
```

**Benefits:**
- Reusable wrapper logic
- Less prop drilling

---

## React-Specific Patterns

### Hook Rules (Critical)

✅ **DO:**
- Call hooks at top level (not in conditions)
- Use custom hooks for reusable logic
- Clean up subscriptions in effects

❌ **DON'T:**
```typescript
// Wrong - hook in conditional
if (condition) {
  const state = useState();
}

// Wrong - hook in loop
for (let i = 0; i < 10; i++) {
  useState();
}
```

### Custom Hooks Pattern

```typescript
// Reusable logic
function useLocalStorage(key: string) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  });

  const setStoredValue = (val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  };

  return [value, setStoredValue];
}

// Usage
const [theme, setTheme] = useLocalStorage('theme');
```

### Effect Dependencies

```typescript
// Runs once on mount
useEffect(() => {
  // fetch data
}, []);

// Runs when dependency changes
useEffect(() => {
  // re-run logic
}, [dependency]);

// Runs on every render (avoid!)
useEffect(() => {
  // re-run every time
});
```

---

## Responsive Design Strategy

### Mobile-First Approach

```typescript
// Start small, add complexity
const styles = {
  container: {
    padding: '16px', // mobile
    '@media (min-width: 768px)': {
      padding: '32px', // tablet
    },
    '@media (min-width: 1024px)': {
      padding: '48px', // desktop
    },
  },
};
```

### Responsive Breakpoints

| Device | Width | Breakpoint |
|--------|-------|-----------|
| Mobile | 0-640px | base |
| Tablet | 641-1024px | md |
| Desktop | 1025px+ | lg |

### Responsive Components

```typescript
function ResponsiveGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}
```

---

## Accessibility (a11y) Fundamentals

### Critical Checklist

- [ ] Semantic HTML (`<button>` not `<div>`)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels where needed (`aria-label`, `aria-describedby`)
- [ ] Color contrast (4.5:1 for text)
- [ ] Screen reader support
- [ ] Focus indicators (visible outline)

### Common Patterns

```typescript
// Good - semantic HTML
<button onClick={handleClick}>Click me</button>
<label htmlFor="name">Name:</label>
<input id="name" />

// Bad - div instead of button
<div onClick={handleClick}>Click me</div>

// Good - ARIA labels
<button aria-label="Close dialog">✕</button>

// Good - focus management
<Modal onOpen={() => firstInputRef.current?.focus()}>
```

---

## Testing Frontend Components

### Test Strategy

| Level | Purpose | Tools |
|-------|---------|-------|
| **Unit** | Component logic | Vitest, React Testing Library |
| **Integration** | Multiple components | React Testing Library |
| **E2E** | Full user flows | Playwright, Cypress |

### What to Test

✅ **High Value:**
- User interactions (clicks, input)
- Form submission
- Conditional rendering
- Error states

❌ **Low Value:**
- Implementation details
- Internal state
- Props type checking
- CSS classes

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('submits form with user data', () => {
  render(<LoginForm />);

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'user@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'user@example.com',
  });
});
```

---

## Frontend Architecture Checklist

Before finalizing:

- [ ] **Framework chosen** based on requirements?
- [ ] **Component strategy** defined? (feature/layer-based)
- [ ] **State management** appropriate for scope?
- [ ] **Performance** measured and optimized?
- [ ] **Responsive** design works on mobile/tablet/desktop?
- [ ] **Accessibility** checklist completed?
- [ ] **Testing** strategy defined?

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Create `<div>` buttons (use `<button>`)
- Global state for all data (use TanStack Query for server)
- Props drilling deeply (use Context)
- Optimize without measuring
- Use `index` as list key
- Complex components doing too much
- Ignoring accessibility

✅ **DO:**
- Use semantic HTML
- Choose state management based on scope
- Break into small components
- Profile before optimizing
- Use stable unique IDs for lists
- Single responsibility per component
- Accessibility from start

---

## Common Frontend Patterns

### Pattern 1: Container/Presentational

```typescript
// Container (logic)
export function UserListContainer() {
  const { data: users } = useQuery(['users'], fetchUsers);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <UserList
      users={users}
      selected={selectedId}
      onSelect={setSelectedId}
    />
  );
}

// Presentational (UI)
function UserList({ users, selected, onSelect }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onSelect(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

### Pattern 2: Custom Hook

```typescript
function useUser(id: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(id)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { user, loading, error };
}

// Usage
function UserProfile({ userId }) {
  const { user, loading } = useUser(userId);
  return loading ? <Spinner /> : <div>{user.name}</div>;
}
```

### Pattern 3: Compound Component

```typescript
function Accordion({ children }) {
  const [openId, setOpenId] = useState(null);

  return (
    <AccordionContext.Provider value={{ openId, setOpenId }}>
      <div>{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = function Item({ id, title, children }) {
  const { openId, setOpenId } = useContext(AccordionContext);
  return (
    <div>
      <button onClick={() => setOpenId(id)}>{title}</button>
      {openId === id && <div>{children}</div>}
    </div>
  );
};
```

---

## Next Steps

1. **Choose framework** - Use decision tree
2. **Plan component structure** - Feature or layer-based?
3. **Select state management** - Based on scope
4. **Design for performance** - Identify metrics
5. **Plan responsive design** - Mobile-first approach
6. **Accessibility** - Start from beginning
7. **Testing strategy** - What to test, tools

---

## Related Skills

- `/react-expert` - For React-specific patterns and hooks
- `/tailwind-optimizer` - For styling strategies
- `/ui-design-system` - For component design
- `/performance-profiler` - For optimization
- `/code-reviewer` - For validation
