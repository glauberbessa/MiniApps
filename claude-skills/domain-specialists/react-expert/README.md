# /react-expert

**Deep dive into React patterns, hooks, performance optimization, and advanced compositions.**

Use this skill when working with React-specific patterns, optimizing component behavior, or solving React-related architectural challenges.

---

## What This Skill Does

Teaches **React thinking and patterns**. Covers:
- 🪝 Hook patterns and rules
- 🎯 State management with hooks
- ⚡ Performance optimization (memo, useMemo, useCallback)
- 🔄 Advanced composition patterns
- 🎨 React 19 new features
- 🧪 Testing React components
- 🛡️ Error boundaries and recovery

---

## When to Use

✅ Working with React hooks
✅ Optimizing React component performance
✅ Advanced state management patterns
✅ Custom hook design
✅ React 19 features and compiler

❌ Frontend architecture (use `/frontend-expert`)
❌ CSS/styling (use `/tailwind-optimizer`)
❌ Full-stack app setup (use `/nextjs-builder`)

---

## Fundamental Hook Rules

### The Rules (Non-Negotiable)

✅ **DO:**
```typescript
// Hooks at top level
function Component() {
  const [state, setState] = useState(0);      // ✓
  const [theme] = useContext(ThemeContext);  // ✓
  return <div>{state}</div>;
}

// Same order every render
function Component({ id }) {
  const [state1] = useState();
  const [state2] = useState();
  // Always same order, both always called
}
```

❌ **DON'T:**
```typescript
// Hook in condition
function Component({ show }) {
  if (show) {
    const [state] = useState();  // ❌ WRONG
  }
}

// Hook in loop
function Component() {
  for (let i = 0; i < 5; i++) {
    const [state] = useState();  // ❌ WRONG
  }
}

// Hook in event handler
function Component() {
  const onClick = () => {
    const [state] = useState();  // ❌ WRONG
  };
}
```

### Why These Rules Matter

React tracks hooks by **call order**, not by name.

```typescript
// First render
useState(0)    // Hook 0
useState('a')  // Hook 1
useEffect()    // Hook 2

// Next render - React expects SAME order
// If condition changed the order, React gets confused!
```

---

## State Management with Hooks

### useState - Simple State

```typescript
// Single value
const [count, setCount] = useState(0);
setCount(count + 1);

// Object state
const [user, setUser] = useState({ name: '', email: '' });
setUser({ ...user, name: 'John' });

// Function to compute initial state
const [state, setState] = useState(() => expensiveComputation());
```

### useReducer - Complex State

When state updates depend on previous state:

```typescript
const initialState = { count: 0, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <button onClick={() => dispatch({ type: 'INCREMENT' })}>
      Count: {state.count}
    </button>
  );
}
```

### useContext - Shared State

When multiple components need same data:

```typescript
// Create context
const ThemeContext = createContext();

// Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer
function Component() {
  const { theme, setTheme } = useContext(ThemeContext);
  return <button onClick={() => setTheme('dark')}>{theme}</button>;
}
```

### useCallback vs useMemo

| Hook | Purpose | Returns |
|------|---------|---------|
| **useCallback** | Stable function reference | Function |
| **useMemo** | Expensive computation result | Value |

```typescript
// useMemo - expensive calculation
const expensiveResult = useMemo(() => {
  return data.filter(...).map(...).reduce(...);
}, [data]);

// useCallback - stable function
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);

// Pass stable function to optimized child
<OptimizedChild onClick={handleClick} />
```

### When to Optimize with useCallback/useMemo

❌ **DON'T optimize:**
```typescript
// Simple string concatenation
const name = useMemo(() => `${firstName} ${lastName}`, [firstName, lastName]);

// Simple calculation
const total = useMemo(() => count + 1, [count]);

// Small arrays
const items = useMemo(() => [1, 2, 3], []);
```

✅ **DO optimize:**
```typescript
// Expensive calculation
const filtered = useMemo(() => {
  return largeArray.filter(predicate).map(transform).reduce(aggregate);
}, [largeArray]);

// Function passed to optimized component
const handleSubmit = useCallback((data) => {
  api.post('/submit', data);
}, []);

// Complex object with child's PropTypes
const config = useMemo(() => ({ theme, colors, sizes }), [theme]);
```

---

## Custom Hooks Pattern

### Guidelines for Creating Hooks

| Guideline | Why |
|-----------|-----|
| Start with `use` prefix | Signals it's a hook |
| Keep focused | One job per hook |
| Return what's useful | State, functions, or values |
| Manage subscriptions | Always clean up effects |

### Common Custom Hooks

**useLocalStorage**
```typescript
function useLocalStorage(key: string, initialValue?: unknown) {
  const [storedValue, setStoredValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setValue = (value) => {
    setStoredValue(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

**useDebounce**
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  // Only runs every 500ms of inactivity
  fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

**useFetch**
```typescript
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch(url)
      .then(res => res.json())
      .then(data => mounted && setData(data))
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data: user, loading, error } = useFetch('/api/user/1');
```

**usePrevious**
```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Usage
const prev = usePrevious(count);
if (prev !== count) {
  // Value changed
}
```

---

## useEffect Patterns

### Effect Dependencies Deep Dive

| Dependencies | Runs When |
|--------------|-----------|
| None (omitted) | Every render (usually wrong) |
| `[]` | Once on mount |
| `[dependency]` | When dependency changes |
| `[dep1, dep2]` | When either changes |

### Common Patterns

**Fetch on Mount**
```typescript
useEffect(() => {
  fetchData();
}, []); // Empty array = run once
```

**Fetch on Param Change**
```typescript
useEffect(() => {
  fetchData(userId);
}, [userId]); // Run when userId changes
```

**Subscribe and Unsubscribe**
```typescript
useEffect(() => {
  const unsubscribe = eventEmitter.on('change', handleChange);

  return () => {
    unsubscribe(); // Cleanup!
  };
}, []);
```

**Sync with External System**
```typescript
useEffect(() => {
  // Connect
  const connection = api.connect(roomId);

  // Cleanup - disconnect
  return () => {
    connection.disconnect();
  };
}, [roomId]);
```

### Missing Dependency Warnings

```typescript
// ❌ WARNING: Missing dependency 'userId'
useEffect(() => {
  fetchUser(userId); // Uses userId but not in deps!
}, []);

// ✅ CORRECT: Include all used values
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

---

## Performance Optimization

### When to Optimize

**Profile first:**
```typescript
// Use React DevTools Profiler tab
// Find the slow component
// Then optimize that specific component
```

### React.memo - Prevent Re-renders

```typescript
// Without memo - rerenders if parent rerenders
function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// With memo - only rerenders if props change
export default React.memo(UserCard);

// With custom comparison
export default React.memo(UserCard, (prevProps, nextProps) => {
  return prevProps.user.id === nextProps.user.id;
});
```

### useMemo - Cache Computation

```typescript
// ❌ Recalculates every render
const sorted = data.sort((a, b) => a.name.localeCompare(b.name));

// ✅ Only recalculates when data changes
const sorted = useMemo(
  () => data.sort((a, b) => a.name.localeCompare(b.name)),
  [data]
);
```

### useCallback - Cache Function

```typescript
// ❌ New function every render
<Child onDelete={(id) => deleteItem(id)} />

// ✅ Same function unless deps change
const handleDelete = useCallback((id) => {
  deleteItem(id);
}, []);

<Child onDelete={handleDelete} />
```

### Virtualization for Large Lists

```typescript
import { FixedSizeList } from 'react-window';

function LargeList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={35}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

---

## Advanced Patterns

### Compound Components

When parent and children need tight coordination:

```typescript
const TabsContext = createContext();

function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(null);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function List({ children }) {
  return <div className="tab-list">{children}</div>;
};

Tabs.Trigger = function Trigger({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'active' : ''}
    >
      {children}
    </button>
  );
};

Tabs.Content = function Content({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div>{children}</div> : null;
};

// Usage
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
    <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="a">Content A</Tabs.Content>
  <Tabs.Content value="b">Content B</Tabs.Content>
</Tabs>
```

### Render Props

When component needs to be flexible about what to render:

```typescript
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);

  return children({ data, loading, error });
}

// Usage
<DataFetcher url="/api/users">
  {({ data, loading, error }) =>
    loading ? <Spinner /> :
    error ? <Error /> :
    <UserList users={data} />
  }
</DataFetcher>
```

### Higher-Order Component (HOC)

When logic needs to wrap components:

```typescript
function withAuth(Component) {
  return function AuthComponent(props) {
    const { user, loading } = useAuth();

    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;

    return <Component {...props} user={user} />;
  };
}

const ProtectedDashboard = withAuth(Dashboard);
```

---

## React 19 Features

### useActionState (Form Submission)

```typescript
function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      const result = await loginUser({
        email: formData.get('email'),
        password: formData.get('password'),
      });
      return result;
    },
    { error: null }
  );

  return (
    <form action={formAction}>
      <input name="email" />
      <input name="password" type="password" />
      <button disabled={isPending}>
        {isPending ? 'Logging in...' : 'Login'}
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

### useOptimistic (Optimistic Updates)

```typescript
function CommentForm({ addComment }) {
  const [comments, setComments] = useState([]);
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, newComment) => [...state, newComment]
  );

  const handleSubmit = async (formData) => {
    const text = formData.get('comment');

    // Show optimistic update immediately
    addOptimisticComment({ id: null, text });

    // Actually submit to server
    const result = await submitComment(text);

    // Update with real ID
    setComments([...comments, result]);
  };

  return (
    <form action={handleSubmit}>
      <input name="comment" />
      <button>Post</button>
      {optimisticComments.map(c => (
        <div key={c.id}>{c.text}</div>
      ))}
    </form>
  );
}
```

### use() Hook (Unwrap Resources)

```typescript
function UserProfile({ userPromise }) {
  // Can await promise directly in render!
  const user = use(userPromise);

  return <div>{user.name}</div>;
}
```

---

## Error Boundaries

### Creating Error Boundary

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

### Using Error Boundary

```typescript
<ErrorBoundary>
  <Dashboard>
    <UserList /> {/* Error here is caught */}
  </Dashboard>
</ErrorBoundary>
```

### What Error Boundaries Catch

✅ Render errors
✅ Lifecycle method errors
✅ Constructor errors

❌ Event handler errors (use try-catch)
❌ Async errors (use Promise.catch)

---

## Testing React Components

### Testing Philosophy

Test **behavior**, not implementation:

```typescript
// ❌ Bad - testing implementation
it('sets state to true', () => {
  const { getByTestId } = render(<Toggle />);
  fireEvent.click(getByTestId('toggle'));
  expect(getByTestId('toggle')).toHaveAttribute('data-state', 'true');
});

// ✅ Good - testing behavior
it('toggles when clicked', () => {
  render(<Toggle />);
  expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
});
```

### Common Testing Patterns

```typescript
// Test user interaction
it('submits form', () => {
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Login' }));

  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
});

// Test conditional rendering
it('shows error when empty', () => {
  render(<Input required />);
  fireEvent.blur(screen.getByRole('textbox'));
  expect(screen.getByText('Required')).toBeInTheDocument();
});

// Test hooks
it('increments count', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

---

## React Anti-Patterns

❌ **DON'T:**
- Put hooks in conditions
- Use index as list key
- Prop drilling deep (use Context)
- Optimize without measuring
- useCallback on all functions
- Fetch in rendering (breaks suspense)
- Ignore error boundaries

✅ **DO:**
- Use stable unique IDs for lists
- Extract hooks early
- Use Context for shared state
- Profile before optimizing
- Keep dependencies accurate
- Fetch in effects
- Use error boundaries

---

## Next Steps

1. **Understand hook rules** - Non-negotiable
2. **Practice custom hooks** - Core skill
3. **Learn composition patterns** - Compound, render props, HOC
4. **Profile for performance** - Measure first
5. **Master effects** - Dependencies are important
6. **Try React 19 features** - useActionState, useOptimistic

---

## Related Skills

- `/frontend-expert` - For overall architecture
- `/nextjs-builder` - For Next.js + React
- `/tailwind-optimizer` - For styling React components
- `/test-engineer` - For testing strategies
- `/performance-profiler` - For optimization
