# /debugging-techniques

**Systematic debugging approaches, browser DevTools mastery, and performance profiling.**

Use this skill when diagnosing bugs, profiling performance, or troubleshooting applications.

---

## What This Skill Does

Teaches **debugging thinking**. Covers:
- 🔍 Systematic debugging methodology
- 🛠️ Browser DevTools mastery (Chrome, Firefox, Safari)
- 📊 Console logging best practices
- 🎯 Breakpoints and step debugging
- 🌐 Network debugging and API inspection
- ⚡ Performance profiling and bottlenecks
- 💾 Memory leaks detection
- 🎬 Error tracking and monitoring

---

## When to Use

✅ Diagnosing unexpected behavior
✅ Finding performance bottlenecks
✅ Tracking memory leaks
✅ Debugging network issues
✅ Profiling slow applications

❌ Specific tool documentation (use tool docs)

---

## The Debugging Methodology

### Step-by-Step Approach

```
1. Understand the problem
   ├─ What is the observed behavior?
   ├─ What is the expected behavior?
   └─ When does it occur?

2. Reproduce consistently
   ├─ Can you reproduce it every time?
   ├─ What are minimal steps?
   └─ Is it environment-specific?

3. Gather information
   ├─ Check error messages
   ├─ Review logs and network tabs
   ├─ Check browser console
   └─ Note any warnings or stack traces

4. Form hypothesis
   ├─ What could cause this?
   ├─ Is it frontend or backend?
   └─ What changed recently?

5. Test hypothesis
   ├─ Add strategic logging
   ├─ Use breakpoints
   ├─ Check state/data flow
   └─ Isolate the issue

6. Fix and verify
   ├─ Make minimal fix
   ├─ Verify it works
   ├─ Check for side effects
   └─ Add test to prevent regression
```

### Common Bug Categories

| Category | Symptoms | Tools |
|----------|----------|-------|
| **Logic Error** | Wrong behavior, correct type | Breakpoints, console.log |
| **Type Error** | "Cannot read property of undefined" | Types, console, DevTools |
| **Async Issue** | Race conditions, timing bugs | Network tab, logging timestamps |
| **State Issue** | Stale data, inconsistent state | Redux DevTools, app state inspector |
| **Performance** | Slow rendering, lag | Profiler, Lighthouse |
| **Memory Leak** | Increasing memory usage | Memory profiler, heap snapshots |
| **API Issue** | Wrong data, status codes | Network tab, API testing |

---

## Browser DevTools Mastery

### Console Techniques

```javascript
// Basic logging
console.log("Simple message");
console.info("Information");
console.warn("Warning");
console.error("Error message");

// Structured logging
console.log("User:", { id: 1, name: "John", email: "john@example.com" });

// Table formatting
const users = [
  { id: 1, name: "John", email: "john@example.com" },
  { id: 2, name: "Jane", email: "jane@example.com" }
];
console.table(users);

// Groups
console.group("API Calls");
console.log("GET /api/users");
console.log("POST /api/users");
console.groupEnd();

// Timing
console.time("render");
// ... slow operation
console.timeEnd("render");  // Outputs: render: 234.5ms

// Assertions
console.assert(value > 0, "Value must be positive");

// Stack trace
console.trace("Trace point");
```

### Sources Tab (Debugger)

**Setting Breakpoints:**
```javascript
// Line breakpoint
// Click line number in Sources tab

// Conditional breakpoint
// Right-click line → Add conditional breakpoint
// condition: user.id === 5

// DOM breakpoint
// Elements tab → Right-click element → Break on → attribute modifications

// Event listener breakpoint
// Sources → Event Listener Breakpoints → check "click"
```

**Debugging Actions:**
```
Step over (F10)        → Execute current line, skip function calls
Step into (F11)        → Enter function call
Step out (Shift+F11)   → Exit current function
Continue (F8)          → Resume execution
Restart frame          → Re-run current function with original state
```

**Watch Expressions:**
```javascript
// Add in DevTools Watch panel
user.id
user.profile.avatar
items.filter(i => i.active).length
// Updates as you step through
```

### Network Tab Debugging

**Common Issues:**

```
Status 404 → Resource not found
Status 401 → Unauthorized (check auth token)
Status 403 → Forbidden (permission issue)
Status 500 → Server error
Status 502 → Bad gateway (upstream error)
Status 503 → Service unavailable (maintenance/overload)

CORS Error → Cross-origin request blocked
Timeout → Request took too long
Content-Type Mismatch → Server returned different format
```

**Inspecting Requests:**
```
Headers tab
├─ Request headers (Host, Authorization, etc.)
├─ Response headers (Content-Type, Set-Cookie, etc.)
└─ Cookies

Payload/Request tab
└─ Body sent to server

Response tab
└─ Server's response body

Timing tab
└─ Breakdown: DNS, TCP, TLS, Request, Response, Rendering
```

**Network Conditions:**
```javascript
// Simulate slow network
DevTools → Network → Throttling
├─ Slow 3G
├─ Fast 3G
├─ 4G
└─ Custom
```

### Performance Profiler

**Recording Performance:**
```
1. Open DevTools → Performance tab
2. Click Record button
3. Interact with page (user actions)
4. Stop recording
5. Analyze timeline:
   - Blue: Loading
   - Yellow: Scripting (JavaScript)
   - Purple: Rendering
   - Green: Painting
```

**Identifying Bottlenecks:**
```javascript
// Look for:
- Long tasks (> 50ms)
- JavaScript execution time
- Layout thrashing
- Unnecessary renders
```

### Memory Profiler

**Finding Memory Leaks:**
```
1. DevTools → Memory tab
2. Heap snapshots approach:
   - Take initial snapshot
   - Interact with page
   - Take another snapshot
   - Compare: Delta > 0 means memory not released

3. Allocation timeline:
   - Record objects being allocated
   - Look for increasing jagged lines
   - Indicates objects not being garbage collected
```

**Common Memory Leak Patterns:**
```javascript
// Detached DOM nodes
const div = document.createElement('div');
element.appendChild(div);
element.removeChild(div);  // div still referenced somewhere?

// Event listeners not cleaned up
element.addEventListener('click', handler);
// Missing element.removeEventListener('click', handler);

// Circular references
obj1.ref = obj2;
obj2.ref = obj1;  // Both kept in memory even if unreferenced

// Closure retaining large object
function outer() {
  const largeData = new Array(1000000);
  return () => console.log(largeData.length);
}
// largeData kept in memory forever
```

---

## Breakpoint Strategies

### Divide and Conquer

```javascript
// Problem: User data not updating after API call

// 1. Break at API call
async function updateUser(id) {  // ← Breakpoint here
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
}

// Step through:
// - Did request send correctly?
// - What response came back?

// 2. Break at state update
setState(newData);  // ← Breakpoint here
// - Is setState receiving correct data?
// - Is new state different from old?

// 3. Break at render
return <div>{user.name}</div>;  // ← Breakpoint here
// - Is component re-rendering?
// - What is the current user value?
```

### Conditional Debugging

```javascript
// Only break when condition is true
// DevTools: Right-click breakpoint → Edit → Add condition

for (let i = 0; i < 1000; i++) {
  processItem(items[i]);  // ← Conditional breakpoint: i === 500
}

// Break only when you reach the problematic item
```

---

## Logging Best Practices

### Strategic Logging Points

```javascript
// 1. Entry and exit points
function calculateTotal(items) {
  console.log('calculateTotal called with:', items);
  // ... calculation
  console.log('calculateTotal returning:', result);
  return result;
}

// 2. State changes
setState(newState);
console.log('State changed:', { old: state, new: newState });

// 3. Async boundaries
try {
  console.log('Fetching users...');
  const users = await fetchUsers();
  console.log('Received users:', users);
} catch (error) {
  console.error('Failed to fetch users:', error);
}

// 4. Conditionals
if (user.isAdmin) {
  console.log('Admin user:', user.id);
} else {
  console.log('Regular user:', user.id);
}
```

### Log Formatting

```javascript
// ✅ Good: Structured, easy to parse
console.log('[UserService]', 'Fetching user', { userId: 123, attempt: 1 });

// ❌ Bad: Hard to read, scattered info
console.log('user');
console.log(123);
console.log('attempt 1');
```

### Conditional Logging

```javascript
// Only log in development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Debug flag
const DEBUG = true;
if (DEBUG) {
  console.log('Detailed trace:', state);
}

// Log level
const logger = {
  debug: (...args) => DEBUG && console.log('[DEBUG]', ...args),
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};
```

---

## Network Debugging

### API Testing Workflow

```
1. Identify endpoint
   └─ Network tab → Find the request

2. Inspect request
   ├─ Method (GET, POST, etc.)
   ├─ URL and query parameters
   ├─ Headers (Authorization, Content-Type)
   └─ Body (payload)

3. Check response
   ├─ Status code
   ├─ Response body
   ├─ Response headers
   └─ Cookies

4. Test alternative scenarios
   └─ Different query params, headers, or data
```

### CORS Debugging

```javascript
// CORS error: Access-Control-Allow-Origin
// Check:
1. Server includes: Access-Control-Allow-Origin: *
2. Credentials: Include credentials if needed
   fetch(url, { credentials: 'include' })
3. Headers: Check Access-Control-Allow-Headers
4. Methods: Check Access-Control-Allow-Methods

// Testing
fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify(data)
})
```

---

## Performance Profiling Checklist

- [ ] **Lighthouse audit** - Run baseline audit
- [ ] **Core Web Vitals** - Check LCP, INP, CLS
- [ ] **DevTools Profiler** - Record timeline, identify long tasks
- [ ] **Memory profiler** - Check for leaks
- [ ] **Network tab** - Optimize asset loading
- [ ] **Coverage** - Identify unused code
- [ ] **Bundle size** - Check for bloat
- [ ] **Rendering** - Look for layout thrashing

---

## Common Debugging Patterns

### Race Conditions

```javascript
// Problem: Race condition with API calls
let lastUserId = null;

async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}`);

  // ❌ If user2 call finishes after user1, we display user2 data
  // but lastUserId is 1 - mismatch!
  if (lastUserId === userId) {
    setUser(response.json());
  }
}

// ✅ Better: Cancel previous request
let abortController = null;

function fetchUser(userId) {
  abortController?.abort();  // Cancel previous
  abortController = new AbortController();

  fetch(`/api/users/${userId}`, { signal: abortController.signal })
    .then(r => r.json())
    .then(data => setUser(data));
}
```

### Null/Undefined Errors

```javascript
// "Cannot read property 'name' of undefined"
user.profile.name  // ← Error if user or profile is undefined

// ✅ Safe navigation
user?.profile?.name

// ✅ Nullish coalescing
const name = user?.profile?.name ?? 'Unknown';

// ✅ Type checking
if (user && user.profile) {
  return user.profile.name;
}
```

### Event Listener Leaks

```javascript
// ❌ Listener never removed
element.addEventListener('click', handler);
element.remove();  // But listener still in memory

// ✅ Clean up in cleanup function
useEffect(() => {
  const handler = () => console.log('clicked');
  element.addEventListener('click', handler);

  return () => {
    element.removeEventListener('click', handler);  // Cleanup
  };
}, []);
```

---

## Debugging Tools Reference

| Tool | Purpose | When |
|------|---------|------|
| **console.log** | Simple debugging | Quick diagnostics |
| **Breakpoints** | Pause execution | Understand flow |
| **Conditional breakpoints** | Break on condition | Isolate specific case |
| **Debugger statement** | Breakpoint in code | Permanent instrumentation |
| **Network tab** | API inspection | Debug API issues |
| **Performance profiler** | Timeline analysis | Find bottlenecks |
| **Memory profiler** | Heap analysis | Memory leaks |
| **Coverage tool** | Unused code | Tree-shaking opportunities |

---

## Debugging Checklist

- [ ] **Reproduce consistently** - Can you trigger it reliably?
- [ ] **Isolate the component** - Frontend or backend?
- [ ] **Check logs** - Browser console and server logs
- [ ] **Network tab** - API requests look correct?
- [ ] **Breakpoints** - Step through suspicious code
- [ ] **State inspection** - Is state what you expect?
- [ ] **Type check** - Is data the right type?
- [ ] **Recent changes** - What changed before issue?

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Use only console.log for debugging
- Leave breakpoints in production code
- Ignore stack traces
- Debug randomly without methodology
- Commit debug code
- Assume you know the problem before investigating

✅ **DO:**
- Use systematic approach
- Set strategic breakpoints
- Read error messages carefully
- Use appropriate tools
- Remove debug code before committing
- Form hypothesis before debugging

---

## Related Skills

- `/performance-profiler` - Deeper performance analysis
- `/devops-pipeline` - Monitoring in production
- `/typescript-expert` - Catching type errors
- `/test-engineer` - Preventing bugs with tests

