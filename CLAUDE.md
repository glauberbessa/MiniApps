# CLAUDE.md - MiniApps Repository Guide

This file provides guidance for AI assistants working with this codebase.

## Project Overview

**MiniApps** is a monorepo application serving as a launcher/hub for multiple mini-applications. The main apps include:

- **Main Launcher** (port 3000) - Central hub and navigation
- **YTPlaylistManagerProWeb** (port 3001) - YouTube playlist management
- **ScanQRCodeBar** (port 3002) - QR code and barcode scanner with OCR

## Technology Stack

**Core:**
- Next.js 14.2.35 (App Router)
- React 18.2.0
- TypeScript 5.9.3
- Tailwind CSS 3.4.1

**State & Data:**
- Zustand 4.5.1 (global state)
- TanStack Query 5.24.0 (server state)
- React Hook Form 7.50.1 + Zod 3.22.4 (forms)

**Backend:**
- NextAuth.js 5.0.0-beta.25 (authentication)
- Prisma 6.4.1 (ORM)
- PostgreSQL via Neon (serverless)
- Google OAuth + YouTube API

**UI:**
- Radix UI primitives
- shadcn/ui component patterns
- Lucide React icons

## Project Structure

```
MiniApps/
├── app/                      # Next.js App Router (main launcher)
│   ├── api/                  # API routes
│   ├── ytpm/                 # YTPM sub-app routes
│   │   ├── (dashboard)/      # Protected dashboard layout
│   │   └── api/              # YTPM-specific API routes
│   ├── scanner/              # Scanner app routes
│   └── globals.css
├── src/
│   ├── components/
│   │   ├── ui/               # Radix UI wrappers (shadcn style)
│   │   ├── layout/           # Layout components
│   │   ├── channels/         # Channel components
│   │   └── playlists/        # Playlist components
│   ├── lib/                  # Services & utilities
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── youtube.ts        # YouTubeService class
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── quota.ts          # Quota management
│   │   └── logger.ts         # Structured logging
│   ├── hooks/                # Custom React hooks
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript definitions
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # DB migrations
├── scripts/                  # Utility scripts
├── YTPlaylistManagerProWeb/  # Standalone YTPM app
├── ScanQRCodeBar/            # Standalone Scanner app
├── middleware.ts             # NextAuth PKCE cookie handling
└── next.config.js            # Rewrites for sub-apps
```

## Common Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Run launcher only (port 3000)
npm run dev:all          # Run all 3 apps concurrently

# Build & Production
npm run build            # Generate Prisma + build Next.js
npm start                # Production server

# Code Quality
npm run lint             # ESLint check

# Database
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
```

## Code Conventions

### File Naming
- **Components:** PascalCase (`Header.tsx`, `DashboardShell.tsx`)
- **Utilities:** camelCase (`youtube.ts`, `utils.ts`)
- **Types:** lowercase (`filter.ts`, `playlist.ts`)

### Import Paths
Use the `@/` alias for clean imports:
```typescript
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/stores/filterStore'
```

### Component Patterns
- Functional components with hooks
- Server components by default, `"use client"` when needed
- Radix UI primitives wrapped in shadcn-style components
- Props typed with interfaces or inferred

### State Management
- **Global state:** Zustand (`useFilterStore`)
- **Server state:** TanStack Query (`useQuery`, `useMutation`)
- **Form state:** React Hook Form + Zod validation

### Error Handling
- Try-catch in async functions
- `Logger.error()` calls with context
- `NextResponse.json()` with appropriate status codes
- User-facing messages in Portuguese (pt-BR locale)

### Utility Functions
- `cn()` - Tailwind class merging (clsx + twMerge)
- Duration formatting: seconds to "HH:MM:SS"
- View count formatting: 1234567 to "1.2M"
- Dates/numbers formatted for pt-BR locale

## Authentication Architecture

**System:** NextAuth.js v5 with JWT strategy
**Provider:** Google OAuth with YouTube API scopes

**Session Flow:**
1. User signs in with Google
2. Fetch YouTube channel ID from API
3. Store in `User.youtubeChannelId`
4. JWT stores userId, email, accessToken
5. Session reconstructed via multiple fallback strategies

**Key Files:**
- `src/lib/auth.ts` - NextAuth configuration
- `middleware.ts` - PKCE cookie cleanup

## Database Schema (Prisma)

**Core Models:**
- `User` - User profile with `youtubeChannelId`
- `Account` - OAuth account info with refresh tokens
- `Session` - Session tokens with expiration
- `PlaylistConfig` - User playlist preferences
- `ChannelConfig` - User channel preferences
- `QuotaHistory` - YouTube API quota tracking

## API Routes

**Main patterns:**
- `/api/auth/[...nextauth]` - NextAuth handlers
- `/api/channels` - Subscribed channels
- `/api/channels/[id]/videos` - Channel videos
- `/api/playlists` - User playlists
- `/api/playlists/[id]/items` - Playlist items
- `/api/playlists/transfer` - Transfer videos
- `/api/quota` - Quota usage

## YouTube API Service

Located at `src/lib/youtube.ts`:

```typescript
// Key methods
YouTubeService.getPlaylists(accessToken)
YouTubeService.getPlaylistItems(accessToken, playlistId)
YouTubeService.getSubscribedChannels(accessToken)
YouTubeService.getChannelVideos(accessToken, channelId)
YouTubeService.addVideoToPlaylist(accessToken, playlistId, videoId)
YouTubeService.removeVideoFromPlaylist(accessToken, itemId)
YouTubeService.transferVideos(accessToken, sourcePlaylistId, targetPlaylistId, videoIds)
```

**Quota Awareness:**
- `getChannelVideos`: 100 units per call (search + video details)
- Other operations: 1-4 units per call
- Track with `QuotaHistory` model

## Environment Variables

Required for operation:
```
AUTH_SECRET=           # NextAuth secret
NEXTAUTH_URL=          # Base URL for auth
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
DATABASE_URL=          # PostgreSQL connection string
```

## Deployment

**Strategy:** Monorepo with separate Vercel projects

**Architecture:**
- Main launcher: `https://main-domain.vercel.app/`
- YTPM: Proxied via `/ytpm` rewrite
- Scanner: Proxied via `/scanner` rewrite

**Configuration:** `vercel.json` handles rewrites

## Working with Sub-Apps

### YTPlaylistManagerProWeb
- Full YouTube playlist management
- See `YTPlaylistManagerProWeb/DOCUMENTATION.md`
- See `YTPlaylistManagerProWeb/YTPM_WEB_SPEC.md`

### ScanQRCodeBar
- QR/barcode scanning with camera
- OCR capabilities via tesseract.js
- Progressive zoom feature
- See `ScanQRCodeBar/README.md`

## Logging

Structured logger at `src/lib/logger.ts`:

```typescript
import { Logger, LogCategory } from '@/lib/logger'

Logger.info(LogCategory.YOUTUBE_API, 'Fetching playlists', { userId })
Logger.error(LogCategory.AUTH, 'Token refresh failed', { error })
```

**Categories:** `AUTH`, `YOUTUBE_API`, `DATABASE`, `API_ROUTE`, `SESSION`, `GENERAL`

## Important Technical Decisions

1. **JWT over DB sessions** - Better serverless compatibility
2. **PKCE disabled** - State-only auth to avoid cookie loss in cold starts
3. **Middleware for cleanup** - Removes stale PKCE cookies
4. **Multiple session recovery** - Fallbacks: userId → email → recent user
5. **Neon serverless PostgreSQL** - Edge runtime support

## Testing Considerations

- No test framework currently configured
- Manual testing via `scripts/` directory utilities
- `scripts/test-youtube-api.js` for API testing
- `scripts/check-auth-db.js` for auth verification

## Common Tasks

### Adding a New API Route
1. Create route in `app/api/` or `app/ytpm/api/`
2. Use `getServerSession(authOptions)` for auth
3. Return `NextResponse.json()` with status codes
4. Add logging with appropriate category

### Adding a New Component
1. Create in appropriate `src/components/` subdirectory
2. Use `"use client"` directive if client-side features needed
3. Follow shadcn/ui patterns for UI components
4. Use `cn()` for Tailwind class merging

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run `npm run db:push` for development
3. Create migration for production: `npx prisma migrate dev`

## Related Documentation

- `/docs/DEPLOY_VERCEL.md` - Deployment guide
- `/docs/CONFIGURACAO_VERCEL.md` - Vercel configuration
- `/.env.example` - Environment template

### Starting Large Tasks

When exiting plan mode with an accepted plan: 1.**Create Task Directory**:
mkdir -p ~/git/project/dev/active/[task-name]/

2.**Create Documents**:

- `[task-name]-plan.md` - The accepted plan
- `[task-name]-context.md` - Key files, decisions
- `[task-name]-tasks.md` - Checklist of work

3.**Update Regularly**: Mark tasks complete immediately

### Continuing Tasks

- Check `/dev/active/` for existing tasks
- Read all three files before proceeding
- Update "Last Updated" timestamps