# /performance-profiler

**Web performance optimization, profiling, and Core Web Vitals measurement.**

Use this skill when optimizing app performance, profiling bottlenecks, or meeting performance targets.

---

## What This Skill Does

Teaches **performance thinking**. Covers:
- 📊 Core Web Vitals (LCP, FID, CLS)
- 🔍 Browser profiling tools
- ⚡ Network optimization
- 📦 Bundle optimization
- 🖼️ Image optimization strategies
- 🔀 Code splitting and lazy loading
- 💾 Caching strategies
- 📈 Performance monitoring

---

## When to Use

✅ Profiling slow app
✅ Optimizing Core Web Vitals
✅ Reducing bundle size
✅ Image optimization
✅ Performance monitoring
✅ Performance budgets

❌ Specific tool configuration (use tool docs)

---

## Core Web Vitals (2024)

### Largest Contentful Paint (LCP)

**Measures:** When largest content element is visible

| Target | Time |
|--------|------|
| ✅ Good | < 2.5s |
| ⚠️ Needs Work | 2.5s - 4s |
| ❌ Poor | > 4s |

**Optimization:**
- Minimize CSS/JS blocking render
- Optimize images and fonts
- Server-side caching
- Content Delivery Network (CDN)

### Interaction to Next Paint (INP)

**Measures:** Latency of interactions (click, tap, keyboard)

| Target | Time |
|--------|------|
| ✅ Good | < 200ms |
| ⚠️ Needs Work | 200-500ms |
| ❌ Poor | > 500ms |

**Optimization:**
- Break long tasks (> 50ms)
- Optimize JavaScript execution
- Use requestAnimationFrame for animations

### Cumulative Layout Shift (CLS)

**Measures:** Unexpected layout shifts during page load

| Target | Score |
|--------|-------|
| ✅ Good | < 0.1 |
| ⚠️ Needs Work | 0.1 - 0.25 |
| ❌ Poor | > 0.25 |

**Optimization:**
- Reserve space for late-loaded content
- Avoid inserting content above existing
- Use CSS `aspect-ratio` or explicit dimensions
- Avoid animations that cause layout shifts

---

## Performance Profiling Tools

### Lighthouse

**What:** Browser-based performance audit

```bash
# Run Lighthouse
npx lighthouse https://example.com --view

# Output:
# - Performance: 92/100
# - Accessibility: 98/100
# - Best Practices: 100/100
# - SEO: 95/100
```

### Chrome DevTools

**Profiling JavaScript:**
1. Open DevTools → Performance tab
2. Click record
3. Interact with page
4. Stop recording
5. Analyze flame chart

**Key metrics:**
- **FCP**: First Contentful Paint
- **LCP**: Largest Contentful Paint
- **FID**: First Input Delay
- **INP**: Interaction to Next Paint

### Web Vitals Library

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // CLS
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

---

## Network Optimization

### Network Waterfall Analysis

```
Document: 200ms
CSS: 500ms (after DOM)
JS (render-blocking): 800ms
Image (lazy): 1200ms (after scroll)
```

**Optimization:**
- ✅ CSS inline (critical) or async (non-critical)
- ✅ JS async/defer when possible
- ✅ Images lazy-loaded
- ✅ Fonts optimized (preload critical)

### Image Optimization

| Strategy | When | Impact |
|----------|------|--------|
| **WebP format** | Always | -25-35% smaller |
| **AVIF format** | Modern browsers | -40-50% smaller |
| **Compression** | All images | -10-20% smaller |
| **Lazy loading** | Below the fold | Faster initial load |
| **Responsive** | Mobile/desktop | Smaller on mobile |

### Image Example

```typescript
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/photo.jpg"
  alt="Photo"
  width={400}
  height={400}
  priority={isCritical}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ Unoptimized
<img src="/photo.jpg" alt="Photo" />
```

---

## Bundle Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build

# Then view with source-map-explorer
npx source-map-explorer 'dist/**/*.js'
```

**Output shows:**
- Package sizes
- Unused code
- Duplicate packages

### Code Splitting

```typescript
// ✅ Split per route
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  );
}
```

### Dynamic Imports

```typescript
// Load only when needed
async function handleClick() {
  const module = await import('./heavy-module');
  module.doSomething();
}
```

---

## JavaScript Optimization

### Long Task Detection

```typescript
// Tasks > 50ms block main thread
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Long task:', entry.duration);
  }
});

observer.observe({ entryTypes: ['longtask'] });
```

### Break Long Tasks

```typescript
// ❌ Blocking
for (let i = 0; i < 1000000; i++) {
  process.data[i] = complexCalculation();
}

// ✅ Non-blocking
async function processData() {
  for (let i = 0; i < 1000000; i++) {
    process.data[i] = complexCalculation();

    if (i % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

### Worker Threads

```typescript
// Move CPU-intensive work to worker
const worker = new Worker('processor.worker.js');

worker.postMessage({ data: largeArray });
worker.onmessage = (e) => {
  const result = e.data;
};
```

---

## Caching Strategies

### Browser Cache

```typescript
// Cache headers in API responses
res.setHeader('Cache-Control', 'public, max-age=3600');
// Cache for 1 hour

// Immutable assets
res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
// Cache for 1 year
```

### Service Worker Caching

```typescript
// cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

### Conditional Requests

```typescript
// Only download if changed
const response = await fetch(url, {
  headers: {
    'If-None-Match': etag, // ETag from previous response
  }
});

if (response.status === 304) {
  // Use cached version
} else {
  // New content
}
```

---

## Font Optimization

### Font Loading Strategy

```css
/* Reduce layout shift */
@font-face {
  font-family: 'MyFont';
  font-display: swap;
}
```

### Preload Critical Fonts

```html
<link rel="preload" as="font" href="/font.woff2" type="font/woff2" crossorigin>
```

### Subsetting

```typescript
// Only load fonts needed for current language
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&subset=latin" rel="stylesheet">
```

---

## Database Query Optimization

### N+1 Problem

```typescript
// ❌ SLOW: N+1 queries
const users = await db.user.findAll();
for (const user of users) {
  user.posts = await db.post.findByUserId(user.id);
}

// ✅ FAST: Single query with join
const users = await db.user.findAll({
  include: { posts: true }
});
```

### Query Optimization

```typescript
// Add indexes on frequently queried columns
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_user_id ON posts(user_id);

// Use EXPLAIN to analyze
EXPLAIN SELECT * FROM posts WHERE user_id = 123;
```

---

## Performance Budget

### Set Targets

| Metric | Target | Monitor |
|--------|--------|---------|
| **LCP** | < 2.5s | Lighthouse |
| **INP** | < 200ms | Web Vitals |
| **CLS** | < 0.1 | Web Vitals |
| **Bundle** | < 100KB | Webpack |
| **FCP** | < 1.8s | Lighthouse |

### Monitor in CI/CD

```yaml
# .github/workflows/performance.yml
name: Performance Check

on: [pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: npx lighthouse-ci autorun
```

---

## Performance Checklist

- [ ] **Core Web Vitals** - LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] **Bundle size** - < 100KB gzipped
- [ ] **Images optimized** - WebP/AVIF, lazy loading
- [ ] **Code splitting** - Per-route bundles
- [ ] **Caching** - Browser + Server caching configured
- [ ] **Fonts** - Optimized and preloaded
- [ ] **Long tasks** - None > 50ms
- [ ] **Database** - Queries optimized, indexes added
- [ ] **Monitoring** - Real User Monitoring in place
- [ ] **Performance budget** - Set and monitored

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Ignore Web Vitals
- Load all images eagerly
- No code splitting
- Skip image optimization
- Ignore database queries
- Long tasks blocking
- No caching strategy

✅ **DO:**
- Measure with real data
- Lazy load off-screen content
- Code split by route
- Compress and format images
- Optimize database queries
- Break long tasks
- Implement caching

---

## Next Steps

1. **Measure baseline** - Run Lighthouse, Web Vitals
2. **Identify bottlenecks** - Profile with DevTools
3. **Prioritize fixes** - Core Web Vitals first
4. **Optimize** - Images, code splitting, caching
5. **Monitor** - Set up real-user monitoring
6. **Budget** - Maintain performance targets

---

## Related Skills

- `/frontend-expert` - For component optimization
- `/nextjs-builder` - For Next.js performance features
- `/backend-expert` - For API response optimization
- `/database-designer` - For query optimization
- `/tailwind-optimizer` - For CSS optimization
