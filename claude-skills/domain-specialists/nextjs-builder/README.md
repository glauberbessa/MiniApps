# /nextjs-builder

**Next.js 14+ architecture, patterns, and best practices for production applications.**

Use this skill when building Next.js apps, choosing routing strategies, optimizing performance, or planning deployments.

---

## What This Skill Does

Teaches Next.js **architecture thinking**. Covers:
- 🚀 App Router vs Pages Router
- 🎯 Server vs Client components
- 📂 File-based routing strategy
- 🔌 API routes and middleware
- 📈 Static generation, SSR, ISR
- 🖼️ Image and font optimization
- 🛫 Deployment strategies

---

## When to Use

✅ Building new Next.js application
✅ Choosing routing approach
✅ Planning server vs client split
✅ Optimizing build and performance
✅ Planning static vs dynamic content
✅ Setting up API endpoints

❌ Specific Next.js API syntax (use Next.js docs)
❌ React patterns (use `/react-expert`)

---

## App Router vs Pages Router Decision

### Decision Tree

```
What's your priority?
│
├── Modern app (new project)
│   └── App Router (Next.js 13+) ✅ Recommended
│       └── Better: Streaming, Server Components, Layouts
│
├── Existing Pages Router
│   ├── Performance critical?
│   │   ├── Yes → Migrate selectively
│   │   └── No → Keep Pages Router (valid choice)
│   │
└── Team stability
    ├── Prefer stable API → Pages Router
    └── OK with innovation → App Router
```

### Feature Comparison

| Feature | App Router | Pages Router |
|---------|-----------|-------------|
| **Server Components** | ✅ Native | ❌ Via getServerSideProps |
| **Layouts** | ✅ Native hierarchy | ❌ Manual wrapping |
| **Streaming** | ✅ Automatic | ❌ Not supported |
| **Middleware** | ✅ First-class | ⚠️ Limited |
| **TypeScript** | ✅ Excellent | ✅ Good |
| **Community packages** | ⚠️ Growing | ✅ Mature |
| **Learning curve** | Medium | Low |

---

## File-Based Routing (App Router)

### Directory Structure

```
app/
├── layout.tsx           # Root layout (all pages)
├── page.tsx             # Home page (/)
├── dashboard/
│   ├── layout.tsx       # Dashboard layout (shared)
│   ├── page.tsx         # /dashboard
│   ├── [id]/
│   │   └── page.tsx     # /dashboard/123
│   └── settings/
│       └── page.tsx     # /dashboard/settings
├── api/
│   ├── users/
│   │   └── route.ts     # GET/POST /api/users
│   └── users/
│       └── [id]/
│           └── route.ts # GET/POST /api/users/123
└── middleware.ts        # Global middleware
```

### Dynamic Routes

```typescript
// app/users/[id]/page.tsx
export default function UserPage({ params }: { params: { id: string } }) {
  return <div>User {params.id}</div>;
}

// Multi-segment
// app/[category]/[item]/page.tsx
export default function ItemPage({
  params: { category, item }
}: {
  params: { category: string; item: string };
}) {
  return <div>{category}/{item}</div>;
}
```

### Catch-all Routes

```typescript
// app/docs/[...slug]/page.tsx - matches /docs/a, /docs/a/b, /docs/a/b/c
export default function DocsPage({ params }: { params: { slug: string[] } }) {
  return <div>Path: {params.slug.join('/')}</div>;
}
```

---

## Server vs Client Components

### Decision Tree

```
Should this be server or client?
│
├── Data fetching from API?
│   ├── Server DB access?
│   │   └── Server Component (async + fetch)
│   │
│   └── Client-side fetch?
│       └── Client Component (useEffect + state)
│
├── User interactivity?
│   ├── Click handlers, forms?
│   │   └── Client Component ("use client")
│   │
│   └── Display only?
│       └── Server Component
│
├── Sensitive data (API keys, secrets)?
│   └── Server Component (safe)
│
└── Real-time updates (WebSocket)?
    └── Client Component (interactive)
```

### Server Components (Default)

```typescript
// app/products/page.tsx - Server Component
import { db } from '@/lib/db';

export default async function ProductsPage() {
  // ✅ Direct database access (server-only)
  const products = await db.product.findMany();

  // ✅ Fetch with auth headers
  const trending = await fetch(
    'https://api.example.com/trending',
    {
      headers: { 'X-API-Key': process.env.API_KEY }
    }
  );

  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
```

**Benefits:**
- Direct database access
- Keep secrets safe (API keys, DB creds)
- Reduce JavaScript bundle
- Better SEO (pre-rendered)

### Client Components

```typescript
// "use client" - Marks boundary
'use client';

import { useState, useEffect } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Fetch from /api endpoint
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(setResults);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {results.map(r => (
        <div key={r.id}>{r.name}</div>
      ))}
    </div>
  );
}
```

**When needed:**
- User interactions (clicks, forms)
- Real-time updates
- Client-only libraries (charts, animations)
- Local state

### Composition Pattern

```typescript
// ✅ Server Component fetches, Client Component displays
// app/dashboard/page.tsx (Server)
import DashboardClient from '@/components/DashboardClient';

async function DashboardPage() {
  const data = await fetchDashboardData();

  return <DashboardClient data={data} />;
}

// components/DashboardClient.tsx (Client)
'use client';

export default function DashboardClient({ data }) {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      {data.map(item => (
        <div key={item.id} onClick={() => setSelected(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

---

## Layouts & Nesting

### Shared Layouts

```
app/
├── layout.tsx           # Root (<html>, <body>)
├── dashboard/
│   ├── layout.tsx       # Shared dashboard layout
│   ├── page.tsx         # /dashboard
│   ├── users/
│   │   └── page.tsx     # /dashboard/users
│   └── settings/
│       └── page.tsx     # /dashboard/settings
```

### Layout Code

```typescript
// app/layout.tsx - Root layout
export const metadata = {
  title: 'My App',
  description: 'Generated by Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx - Dashboard layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

**Benefits:**
- Shared UI (navbar, sidebar)
- Persisted state across navigation
- Efficient re-renders (only children)

---

## API Routes

### Basic API Endpoint

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users
export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Dynamic Route

```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: parseInt(params.id) }
  });
  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const user = await db.user.update({
    where: { id: parseInt(params.id) },
    data: body
  });
  return NextResponse.json(user);
}
```

### Error Handling

```typescript
export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
```

---

## Static Generation vs Dynamic Rendering

### Static Generation (Default)

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // Build-time: generate pages for these slugs
  const posts = await db.post.findMany();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPage({
  params
}: {
  params: { slug: string };
}) {
  const post = await db.post.findUnique({
    where: { slug: params.slug }
  });

  return <article>{post.content}</article>;
}
```

**Benefits:**
- Pre-rendered at build time
- Instant (cached by CDN)
- Best performance
- Good for blogs, docs

### Server-Side Rendering (Dynamic)

```typescript
// app/dashboard/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds (ISR)

export default async function DashboardPage() {
  // Renders on every request (or based on revalidate)
  const data = await fetchUserData();

  return <Dashboard data={data} />;
}
```

### Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 3600; // Regenerate every hour

export default async function Page() {
  // Static at build time
  // Regenerated in background if stale
  const data = await fetchData();
  return <div>{data}</div>;
}
```

---

## Middleware

### Global Middleware

```typescript
// middleware.ts - runs for all requests
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /old to /new
  if (request.nextUrl.pathname === '/old') {
    return NextResponse.redirect(new URL('/new', request.url));
  }

  // Add header
  const response = NextResponse.next();
  response.headers.set('X-Custom', 'header');
  return response;
}

// Apply to specific routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
};
```

### Authentication Middleware

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');

  // Protect routes
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

---

## Image & Font Optimization

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/profile.png"
  alt="Profile"
  width={400}
  height={400}
  priority // Load immediately
/>

// ❌ Unoptimized (slower)
<img src="/profile.png" alt="Profile" />
```

**Benefits:**
- Automatic format selection (WebP)
- Responsive sizes
- Lazy loading
- Avoids layout shift

### Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Benefits:**
- Loads from CDN
- Prevents font swapping
- Optimized subsets

---

## Data Fetching Patterns

### Pattern 1: Fetch on Server

```typescript
// app/page.tsx (Server Component)
async function HomePage() {
  const posts = await fetch('https://api.example.com/posts').then(
    r => r.json()
  );

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

### Pattern 2: Fetch on Client

```typescript
// app/search/page.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';

export default function SearchPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function search(query: string) {
      const res = await fetch(`/api/search?q=${query}`);
      const data = await res.json();
      setResults(data);
    }

    search('initial');
  }, []);

  return <div>{/* render results */}</div>;
}
```

### Pattern 3: Form Actions (Server)

```typescript
'use client';

export default function CreateUserForm() {
  async function handleSubmit(formData: FormData) {
    'use server';

    const name = formData.get('name');
    const email = formData.get('email');

    await db.user.create({ data: { name, email } });
    revalidatePath('/users');
  }

  return (
    <form action={handleSubmit}>
      <input name="name" />
      <input name="email" type="email" />
      <button type="submit">Create</button>
    </form>
  );
}
```

---

## Deployment Strategies

### Vercel (Recommended)

```bash
# Push to main/production branch
git push origin main

# Automatic:
# 1. Build optimized
# 2. Deploy to edge
# 3. Automatic rollback on error
```

### Self-Hosted

```bash
# Build for production
npm run build

# Start server
npm start

# Or use PM2/Docker
pm2 start npm --name "nextjs" -- start
```

### Environment Setup

```bash
# .env.local (development)
DATABASE_URL=postgresql://localhost/mydb
API_KEY=dev_key_123

# .env.production (production)
DATABASE_URL=postgresql://prod.db.com/mydb
API_KEY=prod_key_456
```

---

## Next.js Performance Checklist

- [ ] **Images optimized** - Using next/image
- [ ] **Fonts optimized** - Using next/font
- [ ] **Dynamic routes planned** - Server vs Client
- [ ] **Static generation** - For static content
- [ ] **API routes** - Authenticated, error handling
- [ ] **Middleware** - Auth, redirects
- [ ] **Environment variables** - Secrets protected
- [ ] **Error handling** - Custom error.tsx
- [ ] **Loading states** - loading.tsx for UX
- [ ] **Built size** - Check `npm run build`

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Fetch in Server Components without caching
- Overuse Client Components ("use client" everywhere)
- Store secrets in client code
- Skip ISR revalidation planning
- Ignore Image optimization
- Use dynamic routes for everything

✅ **DO:**
- Fetch on server when possible
- Keep Client Components small
- Use middleware for cross-cutting concerns
- Plan caching strategy early
- Optimize images and fonts
- Use static generation for stable content

---

## Next Steps

1. **Choose routing strategy** - App Router recommended
2. **Plan static vs dynamic** - What changes frequently?
3. **Design components** - Server components by default
4. **Set up API routes** - Structure /api folder
5. **Add middleware** - Auth, redirects, headers
6. **Optimize images** - Use next/image
7. **Plan deployment** - Vercel vs self-hosted

---

## Related Skills

- `/frontend-expert` - For component architecture
- `/api-architect` - For API design
- `/tailwind-optimizer` - For styling
- `/react-expert` - For interactive features
- `/database-designer` - For data fetching
- `/performance-profiler` - For optimization
