# /backend-expert

**Node.js backend development with principles-based decision-making for architecture, patterns, and best practices.**

Use this skill when designing server architecture, choosing frameworks, building APIs, or optimizing backend performance.

---

## What This Skill Does

Teaches backend development **thinking**, not copying. Covers:
- 🏗️ Framework selection (Hono, Fastify, Express, NestJS)
- 🎯 Architecture principles (layered, domain-driven)
- ⚡ Async patterns and performance
- 🔐 Security hardening
- 🧪 Testing strategies
- 🚀 Error handling and logging
- 📊 Validation and data integrity

---

## When to Use

✅ Choosing a Node.js framework
✅ Designing backend architecture
✅ Building API endpoints
✅ Optimizing async performance
✅ Planning error handling strategy
✅ Security hardening review

❌ API design decisions (use `/api-architect`)
❌ Database design (use `/database-designer`)
❌ Implementation code (ask for specific code help)

---

## Framework Selection Decision Tree

```
What are you building?
│
├── Edge/Serverless (Cloudflare Workers, Vercel Edge)
│   └── Hono (zero-dependency, ultra-fast cold starts)
│       └── When: <100ms cold start critical, stateless
│
├── High Performance API
│   └── Fastify (2-3x faster than Express)
│       └── When: Throughput/latency critical, streaming
│
├── Enterprise/Team familiarity
│   └── NestJS (structured, DI, decorators)
│       └── When: Large team, existing TypeScript monorepo
│
├── Legacy/Stable/Largest ecosystem
│   └── Express (mature, most middleware)
│       └── When: Existing codebase, team experience
│
└── Full-stack with frontend
    └── Next.js API Routes or tRPC
        └── When: Monorepo, type-safe backend needed
```

---

## Framework Comparison

| Factor | Hono | Fastify | Express | NestJS | Next.js API |
|--------|------|---------|---------|--------|-------------|
| **Best for** | Edge, serverless | Performance | Learning, legacy | Enterprise | Full-stack TS |
| **Cold start** | <50ms | Fast | Moderate | Moderate | Fast |
| **Ecosystem** | Growing | Good | Largest | Good | Good |
| **TypeScript** | Native | Excellent | Good | Excellent | Excellent |
| **Learning curve** | Low | Medium | Low | Medium | Low |
| **Bundle size** | Tiny (3KB) | Small | Small | Large | Varies |
| **Use middleware?** | Yes | Yes | Yes | Decorators | Yes |

---

## Framework Selection Checklist

Ask before deciding:

1. **What's the deployment target?**
   - Edge functions → Hono
   - Traditional server → Express/Fastify
   - Enterprise monorepo → NestJS

2. **Is cold start time critical?**
   - Yes → Hono < Fastify < Express < NestJS
   - No → Choose for DX and ecosystem

3. **Does team have existing experience?**
   - Yes → Use familiar (usually Express)
   - No → Consider learning curve (Fastify, Hono)

4. **Is there legacy code to maintain?**
   - Yes → Express (largest ecosystem for old packages)
   - No → Choose modern approach

5. **Need type-safe full stack?**
   - Yes → Next.js API + tRPC or Fastify + TypeScript
   - No → Any option

---

## Runtime & Module System

### Node.js Version Considerations

| Version | Feature | Recommendation |
|---------|---------|-----------------|
| **20 LTS** | Stable, mature | Production baseline |
| **22 LTS** | Native TypeScript (`--strip-types`) | New projects |
| **Latest** | Experimental features | Bleeding edge only |

### Module System Decision

| System | When |
|--------|------|
| **ESM** (import/export) | New projects, modern |
| **CommonJS** (require) | Legacy, backward compat |

### TypeScript Options

**Compiled to JavaScript:**
```bash
tsc src/** --outDir dist
node dist/index.js
```

**Direct execution (Node 22+):**
```bash
node --experimental-strip-types src/index.ts
```

**Bundled with esbuild:**
```bash
esbuild src/index.ts --bundle --outfile=dist/bundle.js
```

---

## Layered Architecture

Recommended structure for growing applications:

```
Request Flow:
│
├── Route/Controller Layer
│   ├── Handle HTTP specifics
│   ├── Parse query/body/params
│   ├── Input validation (boundary)
│   └── Call service layer
│
├── Service Layer
│   ├── Business logic
│   ├── Framework-agnostic
│   ├── Orchestrate repositories
│   └── Return domain models
│
└── Repository/Data Layer
    ├── Data access only
    ├── ORM/query builder interactions
    ├── Return raw data
    └── No business logic
```

### Why Layers Matter

| Benefit | Why |
|---------|-----|
| **Testability** | Mock layers independently |
| **Flexibility** | Swap database without touching logic |
| **Clarity** | Each layer has single responsibility |
| **Maintainability** | Changes isolated to right layer |

### When to Simplify

| Scenario | Approach |
|----------|----------|
| Small scripts | Single file OK |
| MVP/prototype | Less structure acceptable |
| Growing app | Add layers incrementally |

---

## Error Handling Strategy

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage
throw new AppError(
  'VALIDATION_ERROR',
  'Email is required',
  400,
  { field: 'email' }
);
```

### Centralized Error Handling

```
Route Handler
  → throws error
    │
    Error Middleware (catches all)
    │
    ├── Log full error (stack, context)
    ├── Format response (user-friendly)
    └── Send status + message
```

### Error Response Format

**Client sees:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

**Logs contain:**
```
[2025-03-03 10:00:00] ERROR VALIDATION_ERROR
Email is required
Stack: ...
User ID: 123
Request ID: req_abc123
```

---

## HTTP Status Code Selection

| Situation | Status | When |
|-----------|--------|------|
| Success | 200 | GET, PUT, PATCH successful |
| Created | 201 | POST created resource |
| No content | 204 | DELETE successful |
| **Client Error** | | |
| Bad input | 400 | Client sent invalid data |
| Unauthorized | 401 | Missing/invalid credentials |
| Forbidden | 403 | Valid auth, no permission |
| Not found | 404 | Resource doesn't exist |
| Conflict | 409 | Duplicate/state conflict |
| Unprocessable | 422 | Schema valid, business rules fail |
| Too many requests | 429 | Rate limited |
| **Server Error** | | |
| Server error | 500 | Our fault, log everything |

---

## Async Patterns & Performance

### Pattern Selection

| Pattern | Use When |
|---------|----------|
| **async/await** | Sequential operations |
| **Promise.all** | Parallel independent operations |
| **Promise.allSettled** | Parallel where some can fail |
| **Promise.race** | First response wins/timeout |

### Event Loop Awareness

**I/O-bound (async helps):**
- Database queries
- HTTP requests
- File system operations
- Network calls

**CPU-bound (async doesn't help):**
- Crypto operations
- Image processing
- Complex calculations
- Regex matching

### Blocking vs Non-blocking

❌ **DON'T:**
```typescript
fs.readFileSync('./data.json');  // Blocks event loop
crypto.pbkdfSync(...);             // CPU-intensive
```

✅ **DO:**
```typescript
await fs.promises.readFile('./data.json');  // Non-blocking
await crypto.pbkdf2(...);                    // Non-blocking
```

---

## Input Validation

### Validate at Boundaries

```
Where to validate:
├── API entry point (request body/params)
├── Before database operations
├── External data (API responses, file uploads)
└── Environment variables (startup)
```

### Validation Library Selection

| Library | Best For |
|---------|----------|
| **Zod** | TypeScript-first, inference |
| **Valibot** | Smaller bundle (tree-shakeable) |
| **ArkType** | Performance critical |
| **Yup** | Existing form library usage |

### Validation Pattern

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
  name: z.string().min(1),
});

// In route handler
const body = userSchema.parse(req.body);
// TypeScript knows body is valid
```

---

## Security Checklist

Before deploying, verify:

- [ ] **Input validation** - All inputs validated
- [ ] **Parameterized queries** - No SQL string concatenation
- [ ] **Password hashing** - bcrypt or argon2
- [ ] **JWT verification** - Always verify signature + expiry
- [ ] **Rate limiting** - Protect from abuse
- [ ] **Security headers** - Helmet.js or equivalent
- [ ] **HTTPS** - Enforced everywhere in production
- [ ] **CORS** - Properly configured
- [ ] **Secrets** - Environment variables only (never in code)
- [ ] **Dependencies** - Regularly audited (`npm audit`)

### Security Mindset

Trust **nothing**, validate **everything**:

```
Query params → validate ✓
Request body → validate ✓
Headers → verify ✓
Cookies → validate ✓
File uploads → scan ✓
External APIs → validate response ✓
```

---

## Testing Strategy

### Test Types & Purpose

| Type | Purpose | Tools |
|------|---------|-------|
| **Unit** | Business logic | node:test, Vitest |
| **Integration** | API endpoints | Supertest |
| **E2E** | Full user flows | Playwright, Cypress |

### What to Test (Priority Order)

1. **Critical paths** - Auth, payments, core business
2. **Edge cases** - Empty inputs, boundaries, NULL
3. **Error handling** - What happens when things fail?
4. **NOT worth testing** - Framework code, trivial getters

### Built-in Test Runner (Node 22+)

```bash
node --test src/**/*.test.ts
```

Advantages:
- Zero external dependency
- Good coverage reporting
- Watch mode available
- Good integration with TypeScript

---

## Async Best Practices

### Sequential Operations

```typescript
// ❌ Slow - waits for each one
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// ✅ Fast - parallel
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id),
]);
```

### Error Handling in Parallel

```typescript
// Fail on first error
Promise.all(promises);

// Continue on all errors
Promise.allSettled(promises).then(results => {
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      console.log(result.value);
    } else {
      console.log(result.reason);
    }
  });
});
```

### Timeout Handling

```typescript
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

const result = await withTimeout(fetch(url), 5000);
```

---

## Logging Best Practices

### What to Log

**Log these (high value):**
- Errors with context
- Authentication events
- External API calls
- Long-running operations
- Unusual business events

**Don't log (noisy):**
- Every GET request
- Debug variables
- User personal data
- Passwords/tokens

### Log Format

```typescript
logger.info('User login', {
  userId: user.id,
  method: 'oauth',
  timestamp: new Date().toISOString(),
  requestId: req.id,
});
```

---

## Backend Architecture Checklist

Before finalizing design:

- [ ] **Framework chosen** based on context?
- [ ] **Layered structure** planned? (routes → services → data)
- [ ] **Error handling** consistent? (custom errors, status codes)
- [ ] **Validation** at boundaries? (Zod/Valibot)
- [ ] **Security checklist** reviewed? (auth, rate limits, headers)
- [ ] **Async patterns** optimized? (Promise.all for parallel)
- [ ] **Testing strategy** defined? (unit/integration/e2e)
- [ ] **Logging approach** planned? (what to log, format)

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Use Express for new edge projects (use Hono)
- Use sync methods in production (`fs.readFileSync`)
- Put business logic in route handlers
- Skip input validation
- Hardcode secrets in code
- Trust external data without validation
- Block event loop with CPU work
- Default to same framework every time

✅ **DO:**
- Choose framework based on context
- Ask user for preferences when unclear
- Use layered architecture for growing projects
- Validate all inputs at boundaries
- Use environment variables for secrets
- Profile before optimizing
- Make decisions context-aware, not habitual

---

## Common Backend Patterns

### Pattern 1: Express with Middleware

```typescript
import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(authenticateToken);

// Routes
app.get('/users/:id', async (req, res) => {
  const user = await db.user.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  res.json(user);
});
```

### Pattern 2: Layered Express

```typescript
// Route
router.get('/users/:id', controllers.user.getById);

// Controller
async function getById(req, res) {
  const user = await userService.getById(req.params.id);
  res.json(user);
}

// Service
async function getById(id: number) {
  return userRepository.findUnique(id);
}

// Repository
async function findUnique(id: number) {
  return db.user.findUnique({ where: { id } });
}
```

### Pattern 3: Fastify for Performance

```typescript
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/users/:id', async (req, reply) => {
  const user = await db.user.findUnique({
    where: { id: req.params.id },
  });
  return user;
});

await fastify.listen({ port: 3000 });
```

---

## Next Steps

1. **Check deployment target** - Edge, traditional, or monorepo?
2. **Choose framework** - Use decision tree
3. **Plan architecture** - Layered or simple?
4. **Define error handling** - Custom errors + middleware
5. **Identify validation points** - Where to validate input
6. **Set up logging** - What to log, format
7. **Plan testing** - Unit, integration, e2e coverage

---

## Related Skills

- `/api-architect` - For API design decisions
- `/database-designer` - For data models and queries
- `/test-engineer` - For testing strategy and coverage
- `/security-auditor` - For security deep-dive
- `/performance-profiler` - For optimization
- `/code-reviewer` - For validation
