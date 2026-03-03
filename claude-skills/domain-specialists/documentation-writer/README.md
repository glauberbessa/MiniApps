# /documentation-writer

**Technical documentation, API documentation, and technical writing best practices.**

Use this skill when writing user guides, API docs, README files, or technical content.

---

## What This Skill Does

Teaches **technical writing thinking**. Covers:
- 📚 Documentation types and structure
- ✍️ Writing principles (clarity, conciseness)
- 📝 Markdown best practices
- 🔌 API documentation (OpenAPI/Swagger)
- 📖 README structure and content
- 📋 Changelog standards
- 💡 Code examples in documentation
- 📊 Visual documentation (diagrams, flows)

---

## When to Use

✅ Writing user documentation
✅ Creating API documentation
✅ Writing README files
✅ Creating changelogs
✅ Technical writing for blogs
✅ Internal knowledge base

❌ Specific tool tutorials (use tool docs)

---

## Documentation Types

### Type 1: Getting Started Guide

**Purpose:** Help new users get up and running quickly

**Structure:**
1. Prerequisites (what they need)
2. Installation steps (clear, numbered)
3. First example (simplest possible)
4. Common next steps
5. Troubleshooting (FAQ)

**Length:** 2-5 minutes read

### Type 2: User Guide / Tutorial

**Purpose:** Teach how to use the product

**Structure:**
1. Overview (what will they learn)
2. Concepts (terminology)
3. Step-by-step instructions
4. Real-world examples
5. Best practices
6. Common pitfalls

**Length:** 10-30 minutes read

### Type 3: API Documentation

**Purpose:** Reference for API endpoints

**Structure:**
1. Authentication
2. Endpoints (GET, POST, etc.)
3. Request/response examples
4. Error codes
5. Rate limits
6. SDK examples

**Length:** Varies by scope

### Type 4: Architecture Guide

**Purpose:** Explain how system works

**Structure:**
1. High-level overview (diagram)
2. Component descriptions
3. Data flow
4. Design decisions
5. Future plans

**Length:** 10-20 minutes read

### Type 5: Changelog

**Purpose:** Track version changes

**Structure:**
```
## [2.1.0] - 2025-03-03

### Added
- New feature X
- New feature Y

### Changed
- Updated API endpoint

### Fixed
- Bug fix #123

### Deprecated
- Old method (use X instead)

### Removed
- Removed legacy support

### Security
- Fixed XSS vulnerability
```

---

## Writing Principles

### Clarity

✅ **Clear:**
"Click the Settings button in the top-right corner."

❌ **Unclear:**
"Navigate to the configuration panel."

### Conciseness

✅ **Concise:**
"Run `npm install` to install dependencies."

❌ **Verbose:**
"In order to properly set up the dependencies for your project, you will need to execute the npm install command in your terminal."

### Audience

Know your audience:

| Audience | Adjust for |
|----------|-----------|
| **Beginners** | More explanation, less jargon |
| **Advanced** | Skip obvious steps, more details |
| **API users** | Reference format, examples |

### Active Voice

✅ **Active:**
"The server processes requests in order."

❌ **Passive:**
"Requests are processed by the server in order."

### Second Person

✅ **You/Your:**
"You can configure this in settings."

❌ **We/Our:**
"We allow configuration in settings."

---

## Markdown Best Practices

### Heading Hierarchy

```markdown
# H1: Page Title
## H2: Main Section
### H3: Subsection
#### H4: Details

Don't skip levels (H1 → H3)
```

### Code Blocks

```markdown
Use triple backticks with language:

```javascript
const name = 'value';
```

```bash
npm install
```

```
Plain code if no language specified
```
```

### Lists

```markdown
Use dashes for unordered lists:
- Item 1
- Item 2
  - Nested item
  - Another nested

Use numbers for ordered:
1. First
2. Second
3. Third
```

### Links

```markdown
[Display text](https://example.com)
[Internal link](./relative-path.md)
[Link with title](https://example.com "Hover text")
```

### Emphasis

```markdown
**Bold** for important
*Italic* for emphasis
`code` for inline code
~~strikethrough~~ for removed

Combine: ***bold italic***
```

---

## README Structure

### Perfect README

```markdown
# Project Name

Brief one-liner description.

## Features

- Key feature 1
- Key feature 2
- Key feature 3

## Installation

Step-by-step install instructions
```bash
npm install project-name
```

## Quick Start

Simplest usage example
```javascript
const lib = require('project-name');
lib.doSomething();
```

## Usage

More detailed usage examples and options

## API

Detailed API reference

## Contributing

How to contribute

## License

License type
```

---

## API Documentation

### OpenAPI/Swagger Format

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: API for managing users

servers:
  - url: https://api.example.com/v1

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
          description: Page number (1-indexed)
      responses:
        '200':
          description: User list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
      required:
        - id
        - email
        - name
```

### Endpoint Documentation Template

```markdown
## GET /api/users/:id

Retrieve a single user by ID.

### Authentication
Required: Bearer token

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | integer | Yes | User ID |

### Response

Success (200):
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

Errors:
- `404 Not Found`: User not found
- `401 Unauthorized`: Invalid token

### Example
```bash
curl https://api.example.com/v1/users/1 \
  -H "Authorization: Bearer token_123"
```
```

---

## Code Examples in Docs

### Good Example

```python
# Clear, simple, runnable
import requests

response = requests.get('https://api.example.com/users/1')
user = response.json()

print(f"User: {user['name']} ({user['email']})")
```

### Multiple Languages

```javascript
// JavaScript
const user = await fetch('/api/users/1').then(r => r.json());
```

```python
# Python
import requests
user = requests.get('/api/users/1').json()
```

```bash
# Shell
curl https://api.example.com/users/1
```

### Progressive Complexity

```markdown
### Basic Usage
[Simple example]

### Advanced Usage
[Complex example with options]

### Complete Example
[Full working application]
```

---

## Visual Documentation

### ASCII Diagrams

```
User Interface
     ↓
API Gateway
     ↓
Load Balancer
  ↙      ↘
Server 1  Server 2
     ↘      ↙
  Database
```

### Flowcharts

```
Start
  ↓
Check auth
  ↙ ↘
Fail  Success
  ↓     ↓
Error Return Data
  ↓     ↓
 End   End
```

### Sequence Diagrams

```
Client         Server      Database
  │              │             │
  │─ request ───→│             │
  │              │─ query ────→│
  │              │← response ───│
  │← response ───│             │
  │              │             │
```

---

## Documentation Tools

| Tool | Purpose | Best For |
|------|---------|----------|
| **Markdown** | Simple documentation | GitHub, blogs |
| **Swagger/OpenAPI** | API documentation | APIs |
| **Storybook** | Component docs | React components |
| **MkDocs** | Site documentation | Project documentation |
| **Docusaurus** | Blog + docs | Teams, products |
| **Confluence** | Team knowledge | Internal knowledge base |

---

## Changelog Best Practices

### Keep Changelog Format

```
## [Unreleased]

## [1.1.0] - 2025-03-03

### Added
- Feature X
- Feature Y

### Changed
- Updated behavior

### Fixed
- Bug #123

### Deprecated
- Old API method

### Removed
- Legacy support

### Security
- Fixed vulnerability CVE-2025-1234

## [1.0.0] - 2025-02-01

### Added
- Initial release
```

### Changelog Do's & Don'ts

✅ **DO:**
- Use dates (YYYY-MM-DD)
- Group by category
- Link to issues/PRs
- Be user-focused
- Include breaking changes

❌ **DON'T:**
- List every commit
- Include internal jargon
- Forget breaking changes
- Write in past tense inconsistently
- Forget security fixes

---

## Documentation Workflow

### 1. Plan
- What's the goal?
- Who's the audience?
- How long should it be?

### 2. Outline
- Main sections
- Key points per section
- Examples needed

### 3. Draft
- Write first, edit later
- Use simple language
- Include examples

### 4. Review
- Peer review
- Check for clarity
- Verify code examples work
- Test links

### 5. Publish
- Merge to main
- Deploy
- Announce

### 6. Maintain
- Update with changes
- Fix typos/errors
- Improve based on feedback

---

## Documentation Checklist

- [ ] **README** - Clear, includes getting started
- [ ] **API docs** - All endpoints documented
- [ ] **Installation** - Step-by-step setup
- [ ] **Usage examples** - Real-world cases
- [ ] **Troubleshooting** - Common issues
- [ ] **Architecture** - System overview
- [ ] **Changelog** - Version history
- [ ] **Contributing** - How to contribute
- [ ] **License** - Legal clarity
- [ ] **Code examples** - Tested and working

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Write for yourself (not audience)
- Assume too much knowledge
- Skip step-by-step details
- Outdated examples
- No table of contents
- No search capability
- Passive voice everywhere
- Jargon without explanation

✅ **DO:**
- Write for your audience
- Explain concepts
- Step-by-step clarity
- Test all examples
- Good navigation
- Search support
- Active voice
- Define terminology

---

## Next Steps

1. **Identify documentation** - What needs to be documented?
2. **Choose format** - Markdown, OpenAPI, etc.
3. **Create outline** - Main sections and flow
4. **Write draft** - Get ideas out
5. **Review & test** - Check examples work
6. **Publish** - Deploy documentation
7. **Maintain** - Keep updated with changes

---

## Related Skills

- `/api-architect` - For API design documentation
- `/backend-expert` - For implementation documentation
- `/frontend-expert` - For user interface documentation
- `/test-engineer` - For testing documentation
- `/devops-pipeline` - For deployment documentation
