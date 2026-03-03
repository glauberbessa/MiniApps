# /code-reviewer

**Systematic code quality validation combining clean-code best practices and comprehensive review checklist.**

Use this skill to validate code quality, find bugs, and suggest improvements before shipping.

---

## What This Skill Does

Comprehensive code review including:
- **Code Quality** - Clean code principles, readability
- **Best Practices** - Framework conventions, patterns
- **Performance** - Optimization opportunities
- **Security** - Vulnerability detection
- **Testing** - Test coverage gaps
- **Accessibility** - a11y compliance

---

## When to Use

✅ Before merging pull requests
✅ Reviewing your own code
✅ Validating refactored code
✅ Finding performance issues
✅ Security audit of critical code
❌ Incomplete/work-in-progress code

---

## How It Works

1. You provide code (file path or content)
2. Skill reviews across multiple dimensions
3. Runs optional validation scripts
4. Reports findings with severity
5. Suggests specific improvements

---

## Review Checklist

### Code Quality
- [ ] Variable names are clear and descriptive
- [ ] Functions are single-responsibility
- [ ] No deep nesting (max 3 levels)
- [ ] Comments explain *why*, not *what*
- [ ] DRY principle - no duplication
- [ ] Error handling present
- [ ] No console.log/debug code

### Best Practices (Project-Type Specific)
**React/TypeScript:**
- [ ] Props properly typed
- [ ] No inline function definitions
- [ ] Proper hook dependencies
- [ ] Component memoization where needed
- [ ] No missing key in lists

**Backend/API:**
- [ ] Input validation on all endpoints
- [ ] Proper HTTP status codes
- [ ] Error messages are helpful
- [ ] Rate limiting considered
- [ ] No hardcoded credentials

**Database:**
- [ ] Indexes on query fields
- [ ] No N+1 queries
- [ ] Migrations created
- [ ] Data types appropriate

### Performance
- [ ] No unnecessary re-renders (React)
- [ ] Bundle size considered
- [ ] Database queries optimized
- [ ] No blocking operations
- [ ] Image optimization

### Security
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens if needed
- [ ] Secrets not hardcoded
- [ ] Rate limiting implemented

### Testing
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases covered
- [ ] Mocks appropriate
- [ ] Test coverage > 70%

### Accessibility
- [ ] Semantic HTML
- [ ] ARIA labels where needed
- [ ] Color contrast adequate
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## Example Review Output

```markdown
# Code Review: UserAuth.tsx

## Summary
✅ Good code structure and testing
⚠️ 2 security considerations
❌ 1 performance issue

## Issues

### Critical
❌ **Hardcoded API key on line 45**
- Risk: Credential exposure
- Fix: Move to environment variable
- Example: `const apiKey = process.env.NEXT_PUBLIC_API_KEY`

### Warnings
⚠️ **Missing input validation on login form**
- Line: 23-28
- Impact: XSS vulnerability
- Fix: Add zod validation schema

⚠️ **N+1 query in getUserWithPosts**
- Line: 67
- Impact: Database performance
- Fix: Use `.include({ posts: true })` in Prisma

### Suggestions
💡 **Extract magic number 3600 to constant**
- Line: 45
- Improvement: `const TOKEN_EXPIRY = 3600 // seconds`

## Verification Scripts (Optional)
Run these for detailed validation:
```bash
# Security scan
python scripts/security_scan.py src/auth/

# Performance check
npm run lighthouse

# Type checking
npx tsc --noEmit
```

## Pass Criteria
- [ ] All critical issues fixed
- [ ] All warnings addressed
- [ ] Type checking passes
- [ ] Tests pass
```

---

## Validation Scripts Available

The skill can run optional validation using:

- `api_validator.py` - REST API validation
- `security_scan.py` - Vulnerability detection
- `performance_audit.py` - Performance issues
- `ux_audit.py` - UX/Accessibility
- `accessibility_checker.py` - a11y compliance
- `database_validator.py` - Schema validation

Specify which scripts to run when invoking the skill.

---

## Common Review Scenarios

### Scenario 1: Before Pull Request
```
/code-reviewer
Files: src/auth/LoginForm.tsx, src/lib/auth.ts
Focus: Security, performance
Scripts: security_scan.py
```

### Scenario 2: Refactoring Validation
```
/code-reviewer
Files: src/components/Dashboard.tsx
Focus: Code quality, testing
Scripts: api_validator.py
```

### Scenario 3: Performance Audit
```
/code-reviewer
Files: src/pages/
Focus: Performance
Scripts: performance_audit.py, lighthouse
```

---

## Tips for Best Results

1. **Be specific** - Say which files to review
2. **Set focus** - What aspect matters most?
3. **Run scripts** - Automated validation catches more
4. **Fix together** - Review findings together
5. **Learn** - Understand *why* things need fixing

---

## Related Skills

- `/plan-writer` - Plan refactoring if issues found
- `/test-engineer` - Improve test coverage
- `/security-auditor` - Deep security review
- `/performance-profiler` - Detailed performance analysis
- `/[domain-specialist]` - Domain-specific improvements
