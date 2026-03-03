# Claude Code Skills - Antigravity Kit Conversion

This is the converted version of the Antigravity Kit, originally a VSCode agent system, now optimized for Claude Code.

**Original System:** 20 Agents + 36 Skills + 11 Workflows
**Converted System:** 41+ Invocable Skills + Orchestration

---

## 🎯 Core Skills (Phase 1 - Foundation)

Start with these 4 essential skills:

### `/agent-orchestrator`
Multi-agent coordination system that chains skills together to solve complex problems.
- Breaks down tasks
- Coordinates between domain specialists
- Maintains context flow
- Validates outputs

### `/skill-loader`
Helps you discover and understand which skill to use for your specific need.
- Skill finder
- Content map navigation
- Recommendations based on your task

### `/plan-writer`
Structured task planning with clear breakdowns, dependencies, and verification criteria.
- Feature planning
- Bug fix breakdowns
- Refactoring strategies

### `/code-reviewer`
Code quality validation combining clean-code best practices and systematic review.
- Style checks
- Best practice validation
- Runs validation scripts
- Generates improvement suggestions

---

## 📚 Skills by Category

### Domain Specialists (Phase 2)
- `/api-architect` - REST, GraphQL, tRPC design
- `/backend-expert` - Node.js, async patterns, server architecture
- `/database-designer` - Schema design, Prisma, query optimization
- `/frontend-expert` - React, state management, component patterns
- `/react-expert` - React hooks, performance optimization
- `/nextjs-builder` - Next.js specific patterns, app router
- `/tailwind-optimizer` - Utility-first CSS strategies
- `/ui-design-system` - Component design, design tokens
- `/mobile-builder` - React Native, Flutter
- `/game-developer` - Game development patterns
- `/devops-pipeline` - CI/CD, deployment strategies
- `/test-engineer` - Testing strategies, TDD, test patterns
- `/security-auditor` - Vulnerability scanning, auth patterns
- `/performance-profiler` - Web Vitals, optimization metrics
- And 5 more specialized skills...

### Utilities & Tools (Phase 3)
- `/bash-toolkit` - Linux/shell commands and patterns
- `/powershell-toolkit` - Windows PowerShell
- `/typescript-expert` - Type-level programming, advanced TS
- `/python-patterns` - Python standards and best practices
- `/i18n-localization` - Internationalization strategies
- `/git-workflows` - Git best practices and workflows
- `/debugging-techniques` - Systematic debugging approaches
- `/design-system-pro` - UI/UX design tokens and patterns

### Scaffolding Skills (Phase 4)
Template generators for quick project start:
- `/scaffold-nextjs` - Full-stack Next.js app
- `/scaffold-saas` - SaaS with Stripe integration
- `/scaffold-fastapi` - Python FastAPI backend
- `/scaffold-express` - Node.js Express API
- `/scaffold-react-native` - Expo mobile app
- And 9 more templates...

---

## 🚀 Quick Start

1. **First time?** Use `/skill-loader` to find what you need
2. **Planning a feature?** Use `/plan-writer` to break it down
3. **Have code?** Use `/code-reviewer` to validate quality
4. **Complex problem?** Use `/agent-orchestrator` to coordinate multiple experts

---

## 📋 Common Workflows

### Plan & Build
```
1. /plan-writer → Create implementation plan
2. /skill-loader → Find relevant domain expert
3. /[domain-specialist] → Implement
4. /code-reviewer → Validate
```

### Debug & Fix
```
1. /debugging-techniques → Systematic debugging approach
2. /code-reviewer → Find issues
3. /[domain-specialist] → Fix
4. /test-engineer → Add tests
```

### Create New Project
```
1. /skill-loader → Find your stack
2. /scaffold-[template] → Generate project
3. /[domain-specialist] → Customize
4. /code-reviewer → Final checks
```

---

## 📦 Directory Structure

```
claude-skills/
├── README.md (this file)
├── infrastructure/              # Core 4 skills
│   ├── agent-orchestrator/
│   ├── skill-loader/
│   ├── plan-writer/
│   └── code-reviewer/
├── domain-specialists/          # 15 skills
├── utilities/                   # 8-10 skills
├── scaffolding/                 # 14 template skills
├── scripts/                     # Validation scripts (Python)
│   ├── api_validator.py
│   ├── security_scan.py
│   ├── ux_audit.py
│   └── ... (18 more)
└── templates/                   # Project templates
    ├── nextjs-fullstack/
    ├── nextjs-saas/
    ├── fastapi/
    └── ... (11 more)
```

---

## 🔄 How Skills Work Together

```
User Request
    ↓
/skill-loader (find relevant skill)
    ↓
/agent-orchestrator (if complex)
    ↓
/domain-specialist-1
    ↓
/domain-specialist-2 (if needed)
    ↓
/code-reviewer (validate)
    ↓
Result
```

---

## 🛠️ Implementation Status

- [x] Plan created
- [x] Directory structure prepared
- [ ] Phase 1: 4 Core skills (in progress)
- [ ] Phase 2: 15 Domain specialists
- [ ] Phase 3: 8-10 Utilities
- [ ] Phase 4: 14 Scaffolding skills
- [ ] Validation & Testing

---

## 📖 Original System Reference

The original `.agent` folder is preserved and contains:
- `agents/` - 20 specialized role definitions
- `skills/` - 36 knowledge domains with scripts
- `workflows/` - 11 composite workflows
- `rules/` - System behavior rules (GEMINI.md)

This conversion extracts the core knowledge and makes it accessible through Claude Code's native skill system.

---

## 🚦 Next Steps

1. Review `/agent-orchestrator` for complex task coordination
2. Try `/plan-writer` for breaking down your next project
3. Use `/code-reviewer` on existing code
4. Explore domain specialists based on your tech stack
