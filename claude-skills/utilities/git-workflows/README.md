# /git-workflows

**Git workflow strategies, branching patterns, and collaborative development practices.**

Use this skill when designing branching strategies, managing pull requests, or handling version control in teams.

---

## What This Skill Does

Teaches **Git workflow thinking**. Covers:
- 🌳 Workflow strategies (Git Flow, GitHub Flow, trunk-based)
- 🔀 Branching patterns and naming conventions
- 📝 Commit message best practices
- 🔀 Rebasing vs merging philosophy
- ♻️ Conflict resolution strategies
- 📋 Pull request workflows
- 🗑️ History cleanup and rewriting
- 🏷️ Tagging and releases

---

## When to Use

✅ Designing team workflows
✅ Setting up CI/CD integration
✅ Managing feature branches
✅ Handling merge conflicts
✅ Cleaning up git history

❌ Specific git command tutorials (use git docs)

---

## Workflow Decision Tree

```
What's your team size and release pattern?
│
├── Solo developer or small team
│   └── GitHub Flow (recommended for simplicity)
│       - main branch (production)
│       - feature branches
│       - Pull requests
│       - Deploy on merge
│
├── Medium team with frequent releases
│   └── Git Flow
│       - main (releases)
│       - develop (integration)
│       - feature/* branches
│       - hotfix/* branches
│       - More structure, more complexity
│
├── Large team with continuous deployment
│   └── Trunk-Based Development
│       - Single main branch
│       - Short-lived feature branches (< 1 day)
│       - Feature flags for incomplete features
│       - Continuous integration
│
└── Enterprise with strict versioning
    └── Calendar Versioning + Git Flow
        - main (releases)
        - develop (integration)
        - Version tags (2025.01, 2025.02, etc.)
```

---

## Git Flow Workflow

### Branch Structure

```
main (production)
  ├─ release-1.0.0 (release branch)
  └─ hotfix-1.0.1 (hotfix branch)

develop (integration)
  ├─ feature/user-auth
  ├─ feature/api-v2
  └─ feature/dashboard
```

### Git Flow Lifecycle

**Feature Development:**
```bash
# Start feature
git checkout -b feature/user-auth develop

# Make commits
git commit -m "Add login form"
git commit -m "Add authentication service"

# Create pull request to develop
git push origin feature/user-auth

# After PR approval and merge
git checkout develop
git pull origin develop
git branch -d feature/user-auth
```

**Release Preparation:**
```bash
# Create release branch from develop
git checkout -b release-1.0.0 develop

# Bump version
# npm version patch (or 1.0.0)
git commit -m "Bump version to 1.0.0"

# Create tag and merge to main
git checkout main
git merge --no-ff release-1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"

# Merge back to develop
git checkout develop
git merge --no-ff release-1.0.0
git branch -d release-1.0.0
```

**Hotfix:**
```bash
# Create hotfix from main
git checkout -b hotfix-1.0.1 main

# Fix bug
git commit -m "Fix critical security bug"

# Merge to main and tag
git checkout main
git merge --no-ff hotfix-1.0.1
git tag -a v1.0.1 -m "Hotfix 1.0.1"

# Merge to develop too!
git checkout develop
git merge --no-ff hotfix-1.0.1
git branch -d hotfix-1.0.1
```

---

## GitHub Flow Workflow

### Simple and Effective

```
main (always deployable)
  ├─ feature/dark-mode
  ├─ feature/api-pagination
  ├─ bugfix/header-alignment
  └─ docs/api-guide
```

### Process

```bash
# 1. Create feature branch
git checkout -b feature/dark-mode

# 2. Make commits
git commit -m "Add dark mode toggle"
git commit -m "Update component styles for dark mode"

# 3. Push and create PR
git push origin feature/dark-mode
# Create PR on GitHub

# 4. Review and discussion
# (Team reviews, tests run automatically)

# 5. Merge on GitHub
# (Delete branch after merge)

# 6. Pull and clean up locally
git checkout main
git pull origin main
git branch -d feature/dark-mode
```

---

## Trunk-Based Development

### Ultra-Fast Feedback Loop

```
main (single branch)
  └─ Always deployable, always tested
```

### Process

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Create short-lived feature branch (< 1 day)
git checkout -b feature/add-button

# 3. Make small, focused commit
git commit -m "Add submit button to form"

# 4. Push immediately (CI runs)
git push origin feature/add-button

# 5. Quick PR and merge (< 30 mins)
# Use feature flags for incomplete features
if (featureFlags.showNewButton) {
  // Show button
}

# 6. Delete branch
git branch -d feature/add-button
```

**Key Principles:**
- Feature branches last < 24 hours
- Commits are small and focused
- Feature flags hide incomplete work
- CI pipeline is fast and reliable

---

## Branch Naming Conventions

### Recommended Pattern

```
<type>/<description>

Examples:
feature/user-authentication
feature/api-v2-endpoints
bugfix/header-overflow
docs/installation-guide
chore/update-dependencies
refactor/extract-auth-service
hotfix/security-vulnerability
release/1.0.0
```

### Rules

- **Lowercase** - Easier to type
- **Hyphens for spaces** - Not underscores
- **Descriptive** - What is it about?
- **Short-lived** - Delete after merge
- **Type prefix** - Feature, bugfix, docs, etc.

---

## Commit Message Best Practices

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

**Simple commit:**
```
feat(auth): add password reset functionality

Allow users to reset forgotten passwords via email link.

Closes #123
```

**Fix with breaking change:**
```
fix(api): update authentication endpoint

BREAKING CHANGE: /api/login now requires 'provider' field
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style (formatting, semicolons)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `chore` - Build, deps, config

### Message Guidelines

✅ **Good:**
```
feat(payment): integrate stripe checkout

- Add Stripe API integration
- Update payment form for new flow
- Add error handling for declined cards

Closes #456
```

❌ **Bad:**
```
fixed stuff

Updated code and fixed bugs
```

**Rules:**
- Use imperative mood ("add", not "added")
- Capitalize first letter
- No period at end of subject
- Limit subject to 50 characters
- Explain WHAT and WHY, not HOW

---

## Rebasing vs Merging

### Decision Matrix

| Scenario | Approach | Why |
|----------|----------|-----|
| Feature branch (GitHub Flow) | Squash + Merge | Clean history, single commit per feature |
| Long-running branch (Git Flow) | Merge commit | Preserve branch history |
| Integrate main into branch | Rebase | Linear history, easier to read |
| Published commits | Don't rebase | Avoid conflicts for others |

### Squash and Merge

```bash
# Before: multiple commits on feature branch
* 3c5f8a2 Add password reset tests
* 2b4e1f9 Add email service
* 1a9d2f3 Add password reset form

# After squash merge to main
* 7x9k2m1 feat(auth): add password reset functionality
```

**On GitHub:** Use "Squash and merge" button in PR

### Rebase for Updating Feature Branch

```bash
# Feature branch is behind main
# Rebase feature on top of main

git checkout feature/user-auth
git rebase main

# If conflicts occur
# Fix conflicts in editor
git add .
git rebase --continue

# Force push to update PR
git push origin feature/user-auth --force-with-lease
```

**Key:** Use `--force-with-lease` instead of `--force`

---

## Conflict Resolution

### Common Conflict Scenarios

**Scenario 1: Simple merge conflict**
```
<<<<<<< HEAD (current branch)
function greet(name: string) {
  return `Hello, ${name}!`;
}
=======
function greet(name: string) {
  console.log(`Hello, ${name}!`);
}
>>>>>>> feature/logging
```

**Resolution:**
```bash
# Option 1: Keep current
git checkout --ours filename.ts

# Option 2: Keep incoming
git checkout --theirs filename.ts

# Option 3: Manually edit and merge
# Fix the file, then:
git add filename.ts
git rebase --continue  # or git merge --continue
```

**Scenario 2: Delete/modify conflict**
```bash
# One branch deletes file, other modifies it
git status
# Choose: -o (our version) or -t (their version)
git rm filename.ts  # or git add filename.ts

git rebase --continue
```

**Best Practices:**
- Communicate with teammates before rebasing
- Pull latest main before pushing feature branch
- Use `--force-with-lease` not `--force`
- Review changes after resolving conflicts

---

## Pull Request Workflow

### PR Template (GitHub)

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Related Issue
Closes #123

## Testing Done
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Edge cases tested

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No new warnings generated
- [ ] Documentation updated
```

### Review Process

```
1. Author: Push feature branch
   └─ Triggers CI (tests, linting)

2. Reviewer: Review code
   └─ Request changes or approve

3. Author: Address feedback
   └─ Make commits addressing feedback

4. Merge: Squash and merge on GitHub
   └─ Deletes branch after merge

5. Local: Update local main
   └─ git pull origin main
```

### Reviewing Code

✅ **Look for:**
- Tests for new code
- Error handling
- Performance implications
- Security vulnerabilities
- Code style consistency

---

## History Cleanup and Rewriting

### Amend Last Commit

```bash
# Forgot to include a file
git add forgotten-file.ts
git commit --amend --no-edit

# Fix commit message
git commit --amend -m "New message"
```

**Rule:** Only amend unpushed commits

### Interactive Rebase

```bash
# Rewrite last 3 commits
git rebase -i HEAD~3

# Editor opens with:
# pick 1a9d2f3 Add password reset form
# pick 2b4e1f9 Add email service
# pick 3c5f8a2 Add password reset tests

# Change 'pick' to:
# r - reword commit
# s - squash into previous
# d - delete commit
# x - execute shell command

# Save and continue through prompts
```

### Cherry-Pick Specific Commits

```bash
# Apply specific commit to current branch
git cherry-pick abc1234

# Apply multiple
git cherry-pick abc1234 def5678

# Continue after conflict
git cherry-pick --continue
```

---

## Tagging and Releases

### Version Tags

```bash
# Create lightweight tag
git tag v1.0.0

# Create annotated tag (recommended)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Show tag details
git show v1.0.0

# List tags
git tag
git tag -l "v1.*"

# Push tags
git push origin v1.0.0    # Single tag
git push origin --tags    # All tags
```

### Semantic Versioning

```
v<major>.<minor>.<patch>

v1.0.0  - Major release (breaking changes)
v1.1.0  - Minor release (new features)
v1.1.1  - Patch release (bug fixes)
```

### GitHub Releases

```bash
# Create release from tag
# GitHub UI: Releases → "Create release from tag"

# Or via API
gh release create v1.0.0 --title "Version 1.0.0" --notes "Changes..."
```

---

## Common Workflow Commands Reference

```bash
# Start feature
git checkout -b feature/name

# Update with latest main (rebase)
git fetch origin
git rebase origin/main

# Stash and pop changes
git stash
git pull origin main
git stash pop

# View commit history
git log --oneline -10
git log --graph --decorate --oneline

# Show what's in PR before merging
git log main..feature/name

# Undo last commit (unpushed)
git reset --soft HEAD~1

# Clean up local branches
git branch -d feature/name        # Safe delete
git branch -D feature/name        # Force delete
git branch -vv | grep gone        # Find deleted remote branches
git remote prune origin           # Clean stale tracking branches
```

---

## Git Workflows Checklist

- [ ] **Workflow chosen** - Git Flow, GitHub Flow, or trunk-based
- [ ] **Naming convention** - Consistent branch names
- [ ] **Commit messages** - Conventional commits format
- [ ] **PR template** - Guide for contributors
- [ ] **Branch protection** - Require reviews and CI
- [ ] **CI/CD integrated** - Tests run on PR
- [ ] **Merge strategy** - Squash or merge commits
- [ ] **Cleanup** - Delete merged branches
- [ ] **Tagging** - Semantic versioning

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Commit to main directly
- Force push to shared branches
- Leave long-running branches
- Have cryptic commit messages
- Skip code reviews
- Ignore CI failures
- Use `--force` instead of `--force-with-lease`

✅ **DO:**
- Use feature branches
- Have clear branch naming
- Keep branches short-lived
- Write descriptive commits
- Require peer reviews
- Fix failing CI before merge
- Use safe force options

---

## Related Skills

- `/bash-toolkit` - Shell commands for git automation
- `/devops-pipeline` - Git integration with CI/CD
- `/test-engineer` - Testing before merging
- `/code-reviewer` - Code quality during reviews

