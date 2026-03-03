# /scaffold-nextjs

**Full-stack Next.js application template with database, authentication, and API.**

Use this skill when starting a new full-stack Next.js project with real-world patterns.

---

## What This Scaffold Provides

A production-ready Next.js monorepo with:
- 🔷 Next.js 14+ (App Router)
- 🗄️ Database (PostgreSQL + Prisma)
- 🔐 Authentication (NextAuth.js)
- 🎨 UI Framework (shadcn/ui + Tailwind)
- ⚡ TypeScript + ESLint
- 🧪 Testing setup (Jest + React Testing Library)
- 📦 Package management (pnpm)
- 🚀 Deployment ready (Vercel)

---

## Getting Started

### 1. Installation

\`\`\`bash
git clone <your-template-repo>
cd nextjs-fullstack
pnpm install
\`\`\`

### 2. Environment Variables

\`\`\`bash
cp .env.example .env.local
# Configure your database, auth, and other services
\`\`\`

### 3. Database Setup

\`\`\`bash
pnpm prisma:push
pnpm prisma:migrate
\`\`\`

### 4. Start Development

\`\`\`bash
pnpm dev
# Open http://localhost:3000
\`\`\`

---

## Key Features Included

- ✅ Authentication (NextAuth.js with JWT)
- ✅ Database (PostgreSQL + Prisma ORM)
- ✅ API Routes (RESTful endpoints)
- ✅ UI Components (shadcn/ui + Tailwind)
- ✅ Form Validation (Zod + React Hook Form)
- ✅ Testing (Jest + React Testing Library)
- ✅ Code Quality (ESLint + Prettier)
- ✅ Deployment (Vercel)

---

## Common Customizations

See full documentation for:
- Adding Stripe integration
- Setting up email service
- File upload handling
- Performance optimization
- Security headers

---

## Related Skills

- `/nextjs-builder` - Deep dive into Next.js patterns
- `/backend-expert` - API design patterns
- `/database-designer` - Database schema optimization

