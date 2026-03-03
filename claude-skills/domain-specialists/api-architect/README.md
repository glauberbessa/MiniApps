# /api-architect

**Design REST, GraphQL, and tRPC APIs with clear decision-making principles.**

Use this skill when designing new APIs, choosing between API styles, or planning API evolution strategies.

---

## What This Skill Does

This skill teaches API design **thinking**, not copying. It covers:
- 🎯 Choosing between REST, GraphQL, and tRPC
- 📐 API design principles and consistency
- 🔄 Versioning strategies
- 🔐 Authentication and rate limiting
- 📝 Documentation best practices
- 🛡️ Security considerations
- ✅ API validation and testing

---

## When to Use

✅ Designing new API endpoints
✅ Choosing between REST/GraphQL/tRPC
✅ Planning API evolution and versioning
✅ Designing for multiple clients
✅ API security review
✅ Response format standardization

❌ Implementing (use `/backend-expert`)
❌ Quick syntax question (use specific docs)

---

## API Style Selection Decision Tree

```
Who are the API consumers?
│
├── Public API / Multiple platforms / Mobile
│   └── REST + OpenAPI (widest compatibility)
│       └── Use when: JavaScript, Python, mobile clients need flexibility
│
├── Complex data needs / Multiple frontends / Strongly typed
│   └── GraphQL (flexible queries)
│       └── Use when: Complex relationships, over/under-fetching problems
│
├── TypeScript frontend + backend (monorepo)
│   └── tRPC (end-to-end type safety)
│       └── Use when: Full control, type safety critical, no external clients
│
├── Real-time / Event-driven / Streaming
│   └── WebSocket + AsyncAPI
│       └── Use when: Live updates, notifications, server push needed
│
└── Internal microservices / Performance critical
    └── gRPC (performance) or REST (simplicity)
        └── Use when: High throughput, internal only, latency critical
```

---

## API Comparison Matrix

| Factor | REST | GraphQL | tRPC |
|--------|------|---------|------|
| **Best for** | Public APIs, mobile | Complex apps, flexibility | TS monorepos |
| **Learning curve** | Low | Medium | Low (if TS) |
| **Over/under fetching** | Common | Solved | Solved |
| **Type safety** | Manual (OpenAPI) | Schema-based | Automatic |
| **Caching** | HTTP native (easy) | Complex | Client-based |
| **Ecosystem** | Largest | Growing | Emerging |
| **Browser support** | Excellent | Good | Good |

---

## Key Selection Questions

Before choosing an API style, ask:

1. **Who are the API consumers?**
   - Public / internal?
   - Single platform or multiple?
   - Web / mobile / both?

2. **Is the frontend TypeScript?**
   - Yes → Consider tRPC
   - Partially → GraphQL
   - No → REST

3. **How complex are the data relationships?**
   - Simple → REST fine
   - Complex → GraphQL better
   - Moderate → tRPC if monorepo

4. **Is caching critical?**
   - Yes → REST (HTTP caching)
   - No → Any option
   - Real-time needed → WebSocket

5. **Public or internal API?**
   - Public → REST (OpenAPI, widest compatibility)
   - Internal → Any (choose for developer DX)

---

## REST API Design Principles

### Resource Naming

✅ **DO:**
```
GET /users
GET /users/123
GET /users/123/posts
POST /users
PUT /users/123
DELETE /users/123
```

❌ **DON'T:**
```
GET /getUsers
GET /user/get/123
POST /createUser
GET /getUserPosts
```

### HTTP Method Usage

| Method | Purpose | Body | Idempotent |
|--------|---------|------|-----------|
| **GET** | Retrieve resource | No | Yes |
| **POST** | Create resource | Yes | No |
| **PUT** | Replace entire resource | Yes | Yes |
| **PATCH** | Update partial resource | Yes | Yes |
| **DELETE** | Remove resource | No | Yes |

### Status Code Selection

| Code | When | Example |
|------|------|---------|
| **200** | Request succeeded | GET/PUT/PATCH successful |
| **201** | Resource created | POST successful |
| **204** | No content | DELETE successful |
| **400** | Bad request | Client sent invalid data |
| **401** | Unauthorized | Missing/invalid credentials |
| **403** | Forbidden | Valid auth, no permission |
| **404** | Not found | Resource doesn't exist |
| **409** | Conflict | Duplicate/state conflict |
| **422** | Unprocessable entity | Schema valid, business rules fail |
| **429** | Too many requests | Rate limited |
| **500** | Server error | Our fault |

---

## Response Format (Envelope Pattern)

### Success Response

```json
{
  "data": {
    "id": 123,
    "name": "John",
    "email": "john@example.com"
  },
  "meta": {
    "timestamp": "2025-03-03T10:00:00Z"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "issue": "Email must be valid"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-03-03T10:00:00Z",
    "requestId": "req_123abc"
  }
}
```

### List Response with Pagination

```json
{
  "data": [
    { "id": 1, "name": "User 1" },
    { "id": 2, "name": "User 2" }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "pageCount": 5
  },
  "meta": {
    "timestamp": "2025-03-03T10:00:00Z"
  }
}
```

---

## GraphQL Fundamentals

### When GraphQL Shines

✅ Multiple frontend clients with different data needs
✅ Complex, interconnected data structures
✅ Over/under-fetching problems in REST
✅ Real-time subscriptions needed
✅ Mobile clients with bandwidth constraints

### GraphQL Basics

```graphql
# Query (read)
query {
  user(id: 1) {
    id
    name
    posts {
      title
      publishedAt
    }
  }
}

# Mutation (write)
mutation {
  createPost(title: "New Post") {
    id
    title
  }
}

# Subscription (real-time)
subscription {
  postCreated {
    id
    title
    author
  }
}
```

### GraphQL Security Concerns

- **Query complexity**: Prevent deeply nested queries
- **Depth limiting**: Max nesting depth
- **Rate limiting**: Per-operation costs
- **Authentication**: Always verify tokens
- **Authorization**: Check field-level permissions

---

## tRPC for TypeScript Monorepos

### When tRPC is Best

✅ Frontend and backend both TypeScript
✅ Monorepo or full-stack project
✅ Full end-to-end type safety desired
✅ No external API consumers needed
✅ Complex business logic with type safety

### tRPC Example

```typescript
// Backend router
export const appRouter = router({
  user: {
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.user.findUnique({ where: { id: input.id } });
      }),
  },
});

// Frontend (full type safety!)
const user = await trpc.user.getById.query({ id: 1 });
// ^^ TypeScript knows the shape
```

### tRPC Benefits

| Benefit | Impact |
|---------|--------|
| **End-to-end typing** | Impossible to pass wrong types |
| **Refactoring safety** | Compiler catches breaking changes |
| **Autocomplete** | Full IDE support across boundary |
| **No schema duplicates** | Single source of truth |

---

## API Versioning Strategies

### Strategy 1: URI Versioning (Most Common)

```
GET /v1/users
GET /v2/users
```

**Pros:**
- Clear separation
- Easy to deprecate
- Cache-friendly

**Cons:**
- Duplicated endpoints
- URL pollution

### Strategy 2: Header Versioning

```
GET /users
Headers: API-Version: 2
```

**Pros:**
- Clean URLs
- Backwards compatible

**Cons:**
- Less visible
- Testing harder

### Strategy 3: Content Negotiation

```
GET /users
Headers: Accept: application/vnd.company.v2+json
```

**Pros:**
- RESTful purist approach

**Cons:**
- Complex
- Less common

### Versioning Principles

- Plan breaking changes upfront
- Support only 2-3 versions max
- Set deprecation timeline
- Notify clients 6+ months before removal
- Consider feature flags instead

---

## Authentication Patterns

### Pattern 1: JWT (Token-based)

**Best for:** Stateless APIs, microservices

```
POST /auth/login
→ Returns: { token: "jwt..." }

Subsequent requests:
Headers: Authorization: Bearer jwt...
```

### Pattern 2: OAuth 2.0 (Delegation)

**Best for:** Third-party access, social login

```
User → Redirects to OAuth provider
← Provider returns authorization code
Backend exchanges code for token
Stores token for future requests
```

### Pattern 3: API Keys

**Best for:** Server-to-server, webhooks

```
Headers: X-API-Key: sk_live_123abc
```

---

## Rate Limiting Strategy

### Token Bucket Algorithm (Recommended)

```
├── Bucket capacity: N requests
├── Refill rate: N requests per minute
├── User makes request
├── ├── If tokens available: Grant, decrement tokens
├── └── If no tokens: Reject with 429
```

### Implementation

```
Headers in response:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

---

## API Documentation Best Practices

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema: { type: integer }
      responses:
        '200':
          description: User list
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserList' }
```

### Documentation Should Include

✅ Clear endpoint descriptions
✅ Request/response examples
✅ Error cases and codes
✅ Authentication requirements
✅ Rate limits
✅ Pagination info
✅ Deprecation notices

---

## API Design Checklist

Before finalizing design:

- [ ] **Chosen API style based on context?** (REST/GraphQL/tRPC)
- [ ] **Consistent response formats?** (Envelope pattern used)
- [ ] **Versioning strategy defined?** (URI/header)
- [ ] **Authentication method chosen?** (JWT/OAuth/API Key)
- [ ] **Rate limiting planned?** (Token bucket limits)
- [ ] **Error handling consistent?** (Status codes standardized)
- [ ] **Documentation complete?** (OpenAPI spec ready)
- [ ] **Security reviewed?** (Auth, input validation, rate limits)
- [ ] **Pagination design considered?** (Limit/offset or cursor)

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Default to REST for everything
- Use verbs in REST endpoints (`/getUsers`)
- Return inconsistent response formats
- Expose internal errors to clients
- Skip rate limiting
- Hardcode credentials in requests
- Use GET for state-changing operations

✅ **DO:**
- Choose API style based on context
- Use nouns and HTTP methods for REST
- Standardize response structure
- Log detailed errors, show friendly messages
- Implement rate limiting from start
- Use headers for credentials
- Use POST/PUT/PATCH/DELETE for mutations

---

## Validation Scripts

Optional automation for API validation:

**Script:** `api_validator.py`
**Purpose:** Validate REST endpoints
**Usage:** `python scripts/api_validator.py <project_path>`

Checks:
- Endpoint naming consistency
- Status code appropriateness
- Response format standardization
- Missing documentation
- Security issues

---

## Common API Patterns By Use Case

### E-Commerce API
- **Style:** REST
- **Response:** Paginated product listings
- **Auth:** JWT tokens
- **Rate limit:** Per-user quotas
- **Versioning:** URI versioning

### Real-time Chat API
- **Style:** WebSocket for messages, REST for setup
- **Auth:** JWT with room-level authorization
- **Rate limit:** Per-user per-minute
- **Caching:** Minimal (real-time priority)

### Internal Microservice API
- **Style:** gRPC or REST
- **Auth:** Mutual TLS or API keys
- **Rate limit:** High (internal)
- **Versioning:** Minimal (controlled environment)

### Mobile App Backend
- **Style:** REST or GraphQL
- **Auth:** OAuth + refresh tokens
- **Rate limit:** Per-user IP
- **Optimization:** Smaller payloads, compression

---

## Next Steps

1. **Define your API consumers** - Who will use this?
2. **Choose API style** - Use decision tree
3. **Sketch endpoints** - What data flows?
4. **Design responses** - What's the shape?
5. **Plan authentication** - How to secure?
6. **Set rate limits** - What's reasonable?
7. **Document** - OpenAPI spec
8. **Validate** - Use `/code-reviewer`

---

## Related Skills

- `/backend-expert` - For implementation details
- `/database-designer` - For data models
- `/security-auditor` - For security deep-dive
- `/code-reviewer` - For validation
