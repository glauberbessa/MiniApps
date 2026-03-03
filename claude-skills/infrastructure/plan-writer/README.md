# /plan-writer

**Structured task planning with clear breakdowns, dependencies, and verification criteria.**

Use this skill when implementing features, refactoring code, fixing bugs, or any multi-step work that needs clear planning.

---

## What This Skill Does

Creates actionable plans that:
- Break complex work into 5-10 small tasks
- Define clear verification for each task
- Identify dependencies and parallel work
- Highlight critical path
- Match your specific project type

## When to Use

✅ Adding a new feature
✅ Fixing complex bugs
✅ Refactoring multiple files
✅ Setting up new project
✅ Migrating dependencies
❌ Single-line code changes
❌ Trivial documentation edits

---

## How It Works

1. You describe what you want to build/fix
2. Skill breaks it into concrete tasks
3. Each task includes verification criteria
4. Plan saved to project root as `{task-slug}.md`
5. You execute and mark tasks complete

---

## Example Output

**Input:** "Add dark mode toggle to my React app"

**Output Plan:**
```markdown
# Dark Mode Toggle Feature

## Goal
Add a dark mode toggle to the application settings that persists across sessions.

## Tasks
- [ ] Create theme context and provider → Verify: useTheme hook works
- [ ] Add dark mode styles with Tailwind → Verify: CSS classes apply
- [ ] Create toggle button component → Verify: Button renders and toggles state
- [ ] Add localStorage persistence → Verify: Refresh page, theme persists
- [ ] Test on multiple pages → Verify: Dark mode works everywhere
- [ ] Code review → Verify: No style conflicts

## Done When
- [x] Theme toggle works on all pages
- [x] Settings persists between sessions
- [x] Code passes review
- [x] No console errors
```

---

## Task Breakdown Principles

### 1. Small, Focused Tasks
Each task should:
- Take 2-5 minutes to implement
- Have one clear outcome
- Be independently verifiable

### 2. Clear Verification
For each task, specify:
- How do you know it's done?
- What can you test?
- What's the expected output?

### 3. Logical Ordering
- Dependencies identified upfront
- Parallel work highlighted
- Build from foundation up

### 4. Specific, Not Generic

❌ Wrong: "Add authentication"
✅ Right: "Create /api/auth/login endpoint with JWT validation"

❌ Wrong: "Style the UI"
✅ Right: "Add Tailwind classes to Header.tsx: grid layout with spacing"

---

## Plan File Naming

Plans are saved to project root as:
- `feature-name.md` - for new features
- `bugfix-issue-name.md` - for bug fixes
- `refactor-component.md` - for refactoring
- `migration-framework.md` - for migrations

Example: `dark-mode.md`, `fix-login-flow.md`, `refactor-auth.md`

---

## Using Generated Plans

1. **Read the plan** - understand overall goal
2. **Execute tasks sequentially** - one task at a time
3. **Mark complete** - change `[ ]` to `[x]`
4. **Follow verification** - check each task works
5. **Update as needed** - plans can evolve

---

## Best Practices

1. **Start with goal** - What are we building/fixing?
2. **Max 10 tasks** - If more, break into multiple plans
3. **Each task verifiable** - Clear "done" criteria
4. **Project-specific** - Not a generic template
5. **Update as you go** - Mark tasks complete immediately

---

## Related Skills

- `/agent-orchestrator` - For coordinating complex multi-domain tasks
- `/code-reviewer` - To validate completed work
- `/[domain-specialist]` - For specific implementation guidance
