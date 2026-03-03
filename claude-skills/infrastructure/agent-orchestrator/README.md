# /agent-orchestrator

**Multi-agent coordination system that intelligently chains skills together to solve complex, multi-domain problems.**

Use this skill when you have a complex task that spans multiple domains (e.g., "Build a full-stack authentication system").

---

## What This Skill Does

The orchestrator:
1. **Understands your goal** - Full picture of what you want
2. **Plans the work** - Breaks down across domains
3. **Sequences tasks** - Identifies dependencies
4. **Coordinates specialists** - Calls appropriate domain skills in order
5. **Maintains context** - Passes state between skills
6. **Validates outputs** - Ensures quality at each step
7. **Provides guidance** - Explains decision rationale

---

## When to Use

✅ Full-stack features (backend + frontend + database)
✅ Architecture decisions (spanning multiple domains)
✅ Complex refactoring (affecting multiple systems)
✅ Performance optimization (requires holistic analysis)
✅ Security audits (need breadth + depth)
✅ Project migrations (multiple components involved)

❌ Single-domain tasks (use specific skill)
❌ Simple bug fixes (use debugger + domain skill)
❌ Syntax questions (use specific skill)

---

## How It Works

### Step 1: Understand Goal
You describe your challenge. Orchestrator identifies:
- **Primary domain** - Main area of work
- **Secondary domains** - Areas that depend on primary
- **Critical path** - Minimum work needed
- **Risks** - Potential blockers

### Step 2: Create Plan
Orchestrator generates:
- **Task sequence** - Order of work
- **Skill assignments** - Which skill handles what
- **Handoff points** - Where skills coordinate
- **Validation gates** - Quality checks between steps

### Step 3: Coordinate Execution
For each task:
1. Invoke appropriate skill
2. Capture output and learnings
3. Pass context to next skill
4. Track progress
5. Adjust if needed

### Step 4: Validate & Integrate
After all skills complete:
1. Run comprehensive review
2. Check interactions work
3. Verify success criteria
4. Document decisions

---

## Example: Building Authentication System

**Your Request:**
"Add JWT-based authentication to my Next.js app with email/password login"

**Orchestrator Breakdown:**

```markdown
# Authentication System Implementation

## Analysis
- Primary: Backend (NextAuth.js setup, database schema)
- Secondary: Database (User model), Frontend (login form)
- Critical Path: Database → API → Frontend
- Risks: Password hashing security, token refresh

## Skill Sequence

### Phase 1: Foundation (Database)
**Skill:** /database-designer
Task: Design User table with password fields
- user_id, email, password_hash, created_at, updated_at
Delivers: Schema changes, migration

### Phase 2: Backend (Authentication API)
**Skill:** /backend-expert
Task: Implement JWT login/logout endpoints
- POST /api/auth/login → returns JWT
- POST /api/auth/logout → clears session
- Middleware for token validation
Depends on: Phase 1 ✓
Delivers: API endpoints, security patterns

### Phase 3: Security Check
**Skill:** /security-auditor
Task: Validate auth security
- Password hashing (bcrypt)
- Token expiry
- CORS headers
- Rate limiting
Depends on: Phase 2 ✓
Delivers: Security audit, improvements

### Phase 4: Frontend (Login UI)
**Skill:** /react-expert
Task: Build login form component
- Email/password inputs
- Form validation
- Loading states
- Error handling
Depends on: Phase 2 ✓
Delivers: LoginForm component

### Phase 5: Integration
**Skill:** /nextjs-builder
Task: Wire everything together
- Routes configuration
- Middleware setup
- Environment variables
- Testing flow
Depends on: Phase 2, 4 ✓
Delivers: Working auth system

### Phase 6: Testing & Validation
**Skill:** /code-reviewer
Task: Comprehensive review
- Security check ✓
- Performance ✓
- Tests coverage ✓
- TypeScript ✓
Delivers: Sign-off

## Success Criteria
- [ ] JWT tokens issued on login
- [ ] Tokens valid for 7 days
- [ ] Refresh token workflow works
- [ ] Logout clears session
- [ ] Rate limiting prevents brute force
- [ ] Passwords hashed with bcrypt
- [ ] All tests pass
- [ ] No security warnings
```

---

## Coordination Patterns

### Pattern 1: Sequential Dependencies
Task B requires output from Task A
```
Task A (Skill 1) → Output
                    ↓
                Task B (Skill 2) → Output
                                    ↓
                                Task C (Skill 3)
```
**Example:** Schema → API → Frontend

### Pattern 2: Parallel Work
Tasks are independent, can run simultaneously
```
Task A (Skill 1)
            → Merge
Task B (Skill 2)
```
**Example:** API design (backend-expert) + UI design (ui-design-system)

### Pattern 3: Hub & Spoke
Central task with multiple dependent tasks
```
        Task B
         ↑
Task A ← Center → Task C
         ↓
        Task D
```
**Example:** Core feature with frontend + backend + database

### Pattern 4: Iterative Refinement
Task repeated with feedback loop
```
Task A → Review → Issues → Fix → Task A (refined)
```
**Example:** Architecture design with security review

---

## Context Passing Between Skills

Orchestrator maintains a context document that includes:

```markdown
# Execution Context

## Goals
- [Original request from user]

## Decisions Made
- Technology choice: Next.js
- Auth library: NextAuth.js
- Database: Prisma + PostgreSQL

## Phase Outputs
- Phase 1 (DB): Schema file location, migrations
- Phase 2 (API): Endpoint URLs, token structure
- Phase 3 (Security): Issues found, fixes applied
- Phase 4 (UI): Component file location
- Phase 5 (Integration): Wiring details

## Current Issues
- [Any blockers encountered]

## Next Steps
- [What to work on]
```

---

## When Orchestrator Invokes Skills

| Situation | Action |
|-----------|--------|
| "Need to design an API" | → `/api-architect` |
| "Code needs validation" | → `/code-reviewer` |
| "Performance is slow" | → `/performance-profiler` |
| "Security concerns" | → `/security-auditor` |
| "React implementation" | → `/react-expert` |
| "Database design needed" | → `/database-designer` |
| "Testing strategy" | → `/test-engineer` |
| "Unsure which skill" | → `/skill-loader` |

---

## Tips for Complex Workflows

1. **Start with goal** - Be clear about success criteria
2. **Trust sequencing** - Don't skip phases
3. **Share context** - Each skill needs previous output
4. **Watch handoffs** - Ensure output of one = input of next
5. **Validate early** - Don't wait until end
6. **Document decisions** - Why did you choose this approach?
7. **Be specific** - "Build auth" is vague, "JWT auth for Next.js app" is clear

---

## Real-World Examples

### Example 1: Full-Stack Feature
**Request:** "Add user profiles with avatar upload"
**Domains:** Backend (API), Database (schema), Frontend (UI), Cloud (image storage)
**Skills:** database-designer → backend-expert → aws-expert → react-expert → code-reviewer
**Duration:** 2-3 sessions

### Example 2: Performance Optimization
**Request:** "Site is slow, optimize it"
**Domains:** Frontend (rendering), Backend (API), Database (queries)
**Skills:** performance-profiler → react-expert → backend-expert → database-designer → code-reviewer
**Duration:** 2-3 sessions

### Example 3: Security Hardening
**Request:** "Audit and improve security"
**Domains:** API, Database, Frontend, Deployment
**Skills:** security-auditor → backend-expert → database-designer → devops-pipeline → code-reviewer
**Duration:** 3-4 sessions

### Example 4: Architecture Migration
**Request:** "Migrate from REST to GraphQL"
**Domains:** Backend (new API), Frontend (client update), Database (changes), Testing
**Skills:** api-architect → backend-expert → database-designer → react-expert → test-engineer → code-reviewer
**Duration:** 4-5 sessions

---

## Orchestrator Decision Making

The orchestrator makes decisions about:

| Decision | Factors |
|----------|---------|
| **Skill sequence** | Dependencies, critical path |
| **Parallel work** | Independence of tasks |
| **Early validation** | Risk areas, security, performance |
| **Context sharing** | What does next skill need |
| **Success criteria** | How to measure completion |
| **Rollback points** | Where you can reverse if needed |

---

## When to Use Other Skills Instead

- **Single domain task** → Use `/skill-loader` to find specific skill
- **Quick question** → Use domain skill directly
- **Code review only** → Use `/code-reviewer`
- **Planning only** → Use `/plan-writer`
- **Unsure what to do** → Use `/skill-loader`

---

## Tips for Success

1. **Provide full context** - What are you building?
2. **State constraints** - Time, resources, tech stack
3. **Clarify success** - How do you know it's done?
4. **Share decisions** - What matters most?
5. **Be patient** - Complex work takes multiple steps
6. **Document learning** - Keep context document updated
7. **Ask questions** - If a step doesn't make sense

---

## Related Skills

- `/skill-loader` - Find individual specialist skills
- `/plan-writer` - Create detailed task plans
- `/code-reviewer` - Validate work quality
- `/[any-domain-specialist]` - Specific domain expertise
