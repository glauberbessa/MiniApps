# /test-engineer

**Testing strategies, TDD principles, and quality assurance frameworks for production code.**

Use this skill when planning test strategy, writing tests, or evaluating test coverage and quality.

---

## What This Skill Does

Teaches **testing thinking**. Covers:
- 🎯 Test strategy selection
- 🧪 Unit, integration, E2E testing
- 🔄 TDD (Test-Driven Development)
- 🛠️ Mocking and stubbing
- 📊 Coverage measurement
- ⚡ Performance testing
- ♿ Accessibility testing

---

## When to Use

✅ Planning test strategy
✅ Writing unit tests
✅ Testing APIs and functions
✅ Coverage evaluation
✅ TDD implementation
✅ Testing edge cases

❌ Specific framework API (use tool docs)
❌ Infrastructure testing (use DevOps guide)

---

## Test Strategy Selection

### Decision Tree

```
What are you testing?
│
├── Individual functions/classes
│   └── Unit Tests
│       └── When: Logic-heavy, complex algorithms
│       └── Tools: Vitest, Jest, node:test
│
├── Multiple units working together
│   └── Integration Tests
│       └── When: API endpoints, database queries
│       └── Tools: Supertest, Testing Library
│
├── User workflows end-to-end
│   └── E2E Tests
│       └── When: Critical user paths
│       └── Tools: Playwright, Cypress
│
├── Performance/load
│   └── Performance Tests
│       └── When: Large scale, critical endpoints
│       └── Tools: K6, Artillery
│
└── Visual/accessibility
    └── Visual + A11y Tests
        └── Tools: axe-core, Percy, Lighthouse
```

---

## Test Type Comparison

| Type | Focus | Speed | Cost | Tools |
|------|-------|-------|------|-------|
| **Unit** | Single function | Very fast | Low | Vitest, Jest |
| **Integration** | Multiple units | Fast | Medium | Supertest, TL |
| **E2E** | Full workflow | Slow | High | Playwright, Cypress |
| **Performance** | Speed/scale | Medium | High | K6, Artillery |
| **A11y** | Accessibility | Fast | Low | axe-core |

---

## Unit Testing

### Basic Test Structure

```typescript
// sum.test.ts
import { describe, it, expect } from 'vitest';
import { sum } from './sum';

describe('sum', () => {
  it('adds two numbers', () => {
    expect(sum(2, 3)).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });

  it('handles zero', () => {
    expect(sum(0, 5)).toBe(5);
  });
});
```

### Assertion Examples

```typescript
// Equality
expect(value).toBe(5);                    // Exact equality
expect(object).toEqual({ id: 1 });       // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(4).toBeGreaterThan(3);
expect(value).toBeCloseTo(0.3, 5);

// Strings
expect(message).toContain('error');
expect(email).toMatch(/^[^\s@]+@[^\s@]+$/);

// Arrays
expect(list).toContain(item);
expect(list).toHaveLength(3);
expect(list).toEqual(expect.arrayContaining([1, 2]));

// Functions
expect(() => riskyFunction()).toThrow();
expect(mockFn).toHaveBeenCalledWith(arg);
```

---

## Integration Testing

### API Endpoint Testing

```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from './app';

describe('POST /users', () => {
  it('creates a user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'test@example.com',
        name: 'John'
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        email: 'test@example.com'
      })
    );
  });

  it('validates email format', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'invalid-email',
        name: 'John'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });
});
```

### Database Integration

```typescript
import { beforeEach, afterEach, it, expect } from 'vitest';
import db from './db';

describe('UserService', () => {
  let userId: number;

  beforeEach(async () => {
    // Setup: Create test user
    const user = await db.user.create({
      data: { email: 'test@example.com' }
    });
    userId = user.id;
  });

  afterEach(async () => {
    // Teardown: Clean up
    await db.user.deleteMany();
  });

  it('finds user by email', async () => {
    const user = await db.user.findUnique({
      where: { email: 'test@example.com' }
    });

    expect(user?.id).toBe(userId);
  });
});
```

---

## E2E Testing (Playwright)

### Page Object Model

```typescript
// tests/pages/LoginPage.ts
export class LoginPage {
  constructor(private page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('input[name="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('input[name="password"]', password);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('.error-message');
  }

  async isLoggedIn() {
    return await this.page.isVisible('[data-testid="dashboard"]');
  }
}
```

### E2E Test

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('User authentication', () => {
  test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail('user@example.com');
    await loginPage.fillPassword('password123');
    await loginPage.submit();

    expect(await loginPage.isLoggedIn()).toBe(true);
  });

  test('shows error on invalid password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail('user@example.com');
    await loginPage.fillPassword('wrong');
    await loginPage.submit();

    const error = await loginPage.getErrorMessage();
    expect(error).toContain('Invalid credentials');
  });
});
```

---

## Mocking & Stubbing

### Mock Functions

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('EmailService', () => {
  it('calls email API', async () => {
    const mockSendEmail = vi.fn().mockResolvedValue({ id: '123' });

    const result = await mockSendEmail('user@example.com');

    expect(mockSendEmail).toHaveBeenCalledWith('user@example.com');
    expect(mockSendEmail).toHaveBeenCalledOnce();
    expect(result).toEqual({ id: '123' });
  });
});
```

### Mock Modules

```typescript
// services/__mocks__/stripe.ts
export const stripe = {
  charges: {
    create: vi.fn().mockResolvedValue({
      id: 'ch_123',
      amount: 1000
    })
  }
};
```

```typescript
// Use in tests
import { vi } from 'vitest';
vi.mock('../services/stripe');

import { stripe } from '../services/stripe';
import { createCharge } from './payment';

it('creates charge', async () => {
  const charge = await createCharge(1000);
  expect(stripe.charges.create).toHaveBeenCalledWith({ amount: 1000 });
});
```

---

## Test-Driven Development (TDD)

### TDD Cycle (Red-Green-Refactor)

```
1. RED: Write failing test
   └─ Test doesn't exist yet
   └─ Implementation is missing

2. GREEN: Write minimal code to pass
   └─ Implementation is quick/dirty
   └─ Just make test pass

3. REFACTOR: Improve without breaking
   └─ Optimize code
   └─ All tests still pass
```

### TDD Example

```typescript
// Step 1: RED - Write test first
describe('fibonacci', () => {
  it('returns 0 for 0', () => {
    expect(fibonacci(0)).toBe(0);
  });

  it('returns 1 for 1', () => {
    expect(fibonacci(1)).toBe(1);
  });

  it('returns 8 for 6', () => {
    expect(fibonacci(6)).toBe(8);
  });
});

// Step 2: GREEN - Minimal implementation
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Step 3: REFACTOR - Optimize
function fibonacci(n: number): number {
  const cache: Record<number, number> = {};

  function fib(num: number): number {
    if (num in cache) return cache[num];
    if (num <= 1) return num;

    cache[num] = fib(num - 1) + fib(num - 2);
    return cache[num];
  }

  return fib(n);
}
```

---

## Coverage Measurement

### Coverage Types

| Type | Measures | Target |
|------|----------|--------|
| **Line** | Each line executed | >80% |
| **Branch** | If/else paths | >75% |
| **Function** | Each function called | >80% |
| **Statement** | Each statement | >80% |

### Check Coverage

```bash
# Run tests with coverage
npm test -- --coverage

# Output:
# ├─ Lines: 85%
# ├─ Statements: 85%
# ├─ Branches: 75%
# └─ Functions: 85%
```

### Coverage Config

```javascript
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

---

## Accessibility Testing

### axe-core Integration

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
  // Fails if violations found
});
```

### Manual A11y Checklist

- [ ] **Keyboard navigation** - Tab through all elements
- [ ] **Focus indicators** - Visible focus outline
- [ ] **Color contrast** - Text readable (WCAG AA)
- [ ] **Form labels** - All inputs labeled
- [ ] **Alt text** - Images have descriptive alt
- [ ] **Semantic HTML** - Proper heading hierarchy
- [ ] **ARIA labels** - Complex widgets labeled
- [ ] **Screen reader** - Test with screen reader

---

## Performance Testing

### Lighthouse in Playwright

```typescript
import { test, expect } from '@playwright/test';

test('page meets performance standards', async ({ page }) => {
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      timeToFirstByte: navigation.responseStart - navigation.requestStart,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
    };
  });

  expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2500);
});
```

---

## Test Priorities

### What to Test (Priority Order)

1. **Critical paths** - Auth, payments, core features
   - Highest impact if broken
   - Most pain if bugs

2. **Edge cases** - Empty inputs, null values, boundaries
   - Easy to overlook
   - Common bugs

3. **Error handling** - What happens when things fail?
   - Network errors
   - Invalid data
   - Server errors

4. **NOT worth testing** - Framework code, trivial getters
   - Just introduces brittle tests
   - Low value

### Testing Pyramid

```
        E2E Tests (slow, expensive)
           ↑
           ↑ 10-15 tests
           ↑
        Integration Tests (medium speed)
           ↑
           ↑ 50-100 tests
           ↑
        Unit Tests (fast, cheap)
           ↑
           ↑ 300-500 tests
           ↑
```

---

## Common Testing Pitfalls

### ❌ Testing Implementation Details

```typescript
// DON'T: Test internal state
it('sets state', () => {
  const { result } = renderHook(() => useCounter());
  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(1); // Testing implementation
});

// DO: Test behavior
it('increments when button clicked', () => {
  render(<Counter initialCount={0} />);
  fireEvent.click(screen.getByRole('button', { name: 'Increment' }));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### ❌ Flaky Tests

```typescript
// DON'T: Depend on timing
it('shows loading', async () => {
  render(<DataFetcher />);
  await new Promise(r => setTimeout(r, 500)); // arbitrary wait
  expect(screen.getByText('Loading')).toBeInTheDocument();
});

// DO: Wait for specific condition
it('shows loading', async () => {
  render(<DataFetcher />);
  expect(await screen.findByText('Loading')).toBeInTheDocument();
});
```

---

## Test Strategy Checklist

- [ ] **Test type chosen** - Unit, integration, E2E
- [ ] **Critical paths identified** - What must work
- [ ] **Edge cases documented** - Null, empty, boundary
- [ ] **Coverage target set** - Realistic percentage
- [ ] **Mocking strategy** - Database, APIs
- [ ] **Performance baseline** - Acceptable response times
- [ ] **A11y tests** - Accessibility checks
- [ ] **CI integration** - Tests run on commit

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Test implementation details
- Write flaky timing-dependent tests
- Test framework code
- Ignore edge cases
- Skip error testing
- Don't test critical paths
- Use brittle selectors (avoid HTML structure changes)

✅ **DO:**
- Test behavior and output
- Use proper wait mechanisms
- Focus on business logic
- Test boundaries and errors
- Test critical paths thoroughly
- Use stable, semantic selectors

---

## Next Steps

1. **Identify critical paths** - What breaks if wrong?
2. **Choose tools** - Vitest, Playwright, etc.
3. **Set coverage target** - Realistic percentage
4. **Start with unit tests** - Build foundation
5. **Add integration tests** - Test APIs
6. **Add E2E tests** - User workflows
7. **Continuous improvement** - Measure, improve

---

## Related Skills

- `/backend-expert` - For API testing
- `/frontend-expert` - For component testing
- `/react-expert` - For React testing patterns
- `/nextjs-builder` - For Next.js integration tests
- `/performance-profiler` - For performance testing
