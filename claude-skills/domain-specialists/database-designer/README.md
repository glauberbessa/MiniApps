# /database-designer

**Database schema design, optimization, and ORM patterns for scalable applications.**

Use this skill when designing database schemas, choosing between SQL/NoSQL, planning migrations, or optimizing queries.

---

## What This Skill Does

Teaches database **design thinking**. Covers:
- 🗄️ SQL vs NoSQL decision framework
- 📊 Schema design principles
- 🔑 Relationships, normalization, indexing
- 🔄 ORM patterns (Prisma, TypeORM)
- 📈 Query optimization
- 🚀 Migration strategies
- 🛡️ Data integrity and constraints

---

## When to Use

✅ Designing database schema
✅ Choosing between SQL/NoSQL
✅ Planning data models
✅ Optimizing queries
✅ Setting up ORM (Prisma, TypeORM)
✅ Migration planning

❌ Specific Prisma syntax (use Prisma docs)
❌ Database administration (use admin tools)

---

## SQL vs NoSQL Decision Tree

```
What type of data are you modeling?
│
├── Structured, relational data
│   ├── Relationships important?
│   │   ├── Yes → Relational (PostgreSQL, MySQL)
│   │   └── No → Simple (SQLite)
│   │
│   └── Scale needs?
│       ├── Single server → PostgreSQL
│       ├── Global → Distributed SQL (CockroachDB)
│
├── Unstructured, document-like
│   ├── Frequent schema changes?
│   │   ├── Yes → Document DB (MongoDB)
│   │   └── No → Table storage (DynamoDB)
│   │
│   └── Real-time updates needed?
│       ├── Yes → Document DB with subscriptions
│       └── No → Any NoSQL option
│
├── Time-series data
│   ├── High throughput?
│   │   ├── Yes → Time-series DB (InfluxDB, TimescaleDB)
│   │   └── No → SQL with indexes
│
├── Search-heavy application
│   └── Search index needed (Elasticsearch)
│
├── Graph relationships
│   └── Graph DB (Neo4j)
│
└── Key-value / caching
    └── In-memory (Redis)
```

---

## Database Selection Comparison

| Database | Best For | Scalability | Consistency | Query Language |
|----------|----------|-------------|-------------|--------|
| **PostgreSQL** | Relational + JSON | Vertical | ACID | SQL |
| **MySQL** | General purpose | Vertical | ACID | SQL |
| **MongoDB** | Documents, schemas change | Horizontal | Eventual | Query API |
| **DynamoDB** | Serverless, key-value | Horizontal | Eventual | Query API |
| **Firebase** | Real-time, mobile | Managed | Eventual | Query API |
| **Redis** | Caching, sessions | Memory (cluster) | Fast | Commands |
| **Neo4j** | Graph relationships | Horizontal | ACID | Cypher |

---

## Relational Database Design Principles

### The ACID Guarantee

| Property | Meaning | Example |
|----------|---------|---------|
| **Atomicity** | Transaction all-or-nothing | Transfer funds: debit + credit both succeed or both fail |
| **Consistency** | Valid state always | User age can't be negative |
| **Isolation** | Concurrent transactions don't interfere | Two transactions can't conflict |
| **Durability** | Committed data persists | Even after crash |

### Normal Forms (Normalization)

**Goal:** Remove data redundancy, improve integrity

| Form | Rule | Benefit |
|------|------|---------|
| **1NF** | Atomic values only (no lists in cells) | No duplicate data |
| **2NF** | All non-key fields depend on entire key | Avoid partial dependencies |
| **3NF** | Non-key fields depend only on key | Remove transitive dependencies |
| **BCNF** | Stricter than 3NF | Remove anomalies |

### When to Denormalize

✅ **DO denormalize when:**
- Read performance critical (data warehouse)
- Joins are expensive (complex aggregates)
- Data rarely changes (cache-friendly)
- Reporting queries are heavy

❌ **DON'T denormalize when:**
- Data frequently updated (consistency issues)
- Relations are complex (hard to maintain)
- Storage cost high (wasted space)

### Entity Relationship (ER) Diagram Patterns

**1:1 Relationship**
```
User ──── Profile
(one user has one profile)
```

**1:N Relationship**
```
Team ──── Users
(one team has many users)
```

**M:N Relationship**
```
Students ──── Courses
(many students take many courses)
└─ StudentEnrollment (junction table)
```

---

## Schema Design Patterns

### Pattern 1: Simple User System

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Design decisions:**
- `@id` - Primary key (unique identifier)
- `@unique` - Email must be unique
- `@default(now())` - Auto-set creation time

### Pattern 2: Blog with Posts & Comments

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  posts     Post[]  // One user, many posts
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String
  authorId  Int     // Foreign key
  author    User    @relation(fields: [authorId], references: [id])
  comments  Comment[]
}

model Comment {
  id        Int     @id @default(autoincrement())
  text      String
  postId    Int
  post      Post    @relation(fields: [postId], references: [id])
}
```

**Relationships:**
- User → Post: 1:N (one author, many posts)
- Post → Comment: 1:N (one post, many comments)

### Pattern 3: Many-to-Many (Students & Courses)

```prisma
model Student {
  id        Int     @id @default(autoincrement())
  name      String
  courses   Enrollment[]
}

model Course {
  id        Int     @id @default(autoincrement())
  title     String
  students  Enrollment[]
}

model Enrollment {
  studentId Int
  courseId  Int
  grade     String?

  student   Student @relation(fields: [studentId], references: [id])
  course    Course  @relation(fields: [courseId], references: [id])

  @@id([studentId, courseId]) // Composite key
}
```

**Design decisions:**
- Junction table (Enrollment) connects students to courses
- `@@id` - Composite primary key (both fields together)
- Junction can store extra data (grade)

---

## Indexing Strategy

### When to Index

| Field | Index When |
|-------|-----------|
| **Primary Key** | Always (automatic) |
| **Foreign Keys** | Always (join performance) |
| **Frequently filtered** | High cardinality |
| **Rarely filtered** | No (wastes space) |
| **Boolean fields** | Rarely (poor selectivity) |
| **Low cardinality** | No (most rows match) |

### Index Types

| Type | Use | Trade-off |
|------|-----|-----------|
| **Single column** | Where clause on one field | Simple |
| **Composite** | Multiple fields in WHERE | Complex queries |
| **Full-text** | LIKE queries | Slower writes |
| **JSON** | Querying JSON fields | Storage overhead |

### Index Example

```prisma
model User {
  id        Int     @id
  email     String  @unique        // Auto-indexed
  name      String
  createdAt DateTime @default(now())

  @@index([createdAt])              // Index for filtering
  @@index([name, createdAt])        // Composite index
}
```

**When to query:**
- `WHERE email = ...` - ✅ Fast (unique)
- `WHERE name = ...` - ✅ Fast (indexed)
- `WHERE createdAt > ...` - ✅ Fast (indexed)
- `WHERE email LIKE ...` - ⚠️ Slow (pattern match)

---

## Query Optimization Patterns

### N+1 Problem (Common Mistake)

```javascript
// ❌ SLOW: N+1 queries
const users = await db.user.findAll();
for (const user of users) {
  const posts = await db.post.findByUserId(user.id); // N queries!
}

// ✅ FAST: Single query with join
const users = await db.user.findAll({
  include: { posts: true } // Eager load
});
```

### Pagination Pattern

```javascript
// Fetch page 2, 10 items per page
const pageSize = 10;
const page = 2;
const skip = (page - 1) * pageSize;

const users = await db.user.findMany({
  skip,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### Filtering & Sorting

```javascript
// Filter by status, sort by date
const users = await db.user.findMany({
  where: {
    status: 'active',
    createdAt: {
      gte: new Date('2025-01-01')
    }
  },
  orderBy: { createdAt: 'desc' },
  select: { id: true, email: true } // Only fetch needed fields
});
```

---

## Prisma ORM Patterns

### Basic Setup

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String
}
```

### Create & Read

```javascript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John'
  }
});

// Read one
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});

// Read many
const users = await prisma.user.findMany({
  where: { status: 'active' }
});
```

### Update & Delete

```javascript
// Update
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane' }
});

// Update many
const result = await prisma.user.updateMany({
  where: { status: 'inactive' },
  data: { status: 'deleted' }
});

// Delete
await prisma.user.delete({
  where: { id: 1 }
});
```

### Relationships

```javascript
// Create user with posts
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' }
      ]
    }
  },
  include: { posts: true } // Return related data
});

// Connect existing post
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    posts: {
      connect: { id: 5 }
    }
  }
});
```

---

## Data Integrity & Constraints

### NOT NULL Constraint

```prisma
model User {
  id    Int     @id
  email String  // Required (NOT NULL)
  name  String?   // Optional (nullable)
}
```

### UNIQUE Constraint

```prisma
model User {
  id       Int     @id
  email    String  @unique
  username String  @unique

  @@unique([email, username]) // Composite unique
}
```

### CHECK Constraint

```prisma
model User {
  id    Int
  age   Int     // No direct check in Prisma
  email String

  @@validate(age >= 18) // In database
}
```

### Foreign Key Constraints

```prisma
model Post {
  id       Int
  authorId Int
  author   User @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

**Cascade options:**
- `Cascade` - Delete post if user deleted
- `Restrict` - Can't delete user with posts
- `SetNull` - Set authorId to NULL if user deleted

---

## Migration Strategies

### Development Migrations

```bash
# Create migration
npx prisma migrate dev --name add_posts

# View pending
npx prisma migrate status

# Reset (dev only!)
npx prisma migrate reset
```

### Production Migrations

```bash
# Plan changes (don't apply yet)
npx prisma migrate resolve --rolled-back migration_name

# Apply migrations
npx prisma migrate deploy

# Verify
npx prisma db verify
```

### Safe Migration Patterns

✅ **DO:**
- Add columns as nullable first
- Deploy code that handles both old/new columns
- Then make non-nullable in separate migration
- Test migrations on production clone first

❌ **DON'T:**
- Rename columns (create new, migrate data, drop old)
- Drop columns immediately
- Add NOT NULL columns without defaults
- Assume migration order

---

## Backup & Recovery

### Backup Strategy

| Frequency | Method | Retention |
|-----------|--------|-----------|
| **Hourly** | Snapshots | 24 hours |
| **Daily** | Full backup | 30 days |
| **Weekly** | Archive | 90 days |
| **Monthly** | Long-term archive | 1 year |

### Recovery Test

**Before deploying:**
1. Backup current production
2. Restore to test environment
3. Run full test suite
4. Verify data integrity

---

## Database Design Checklist

- [ ] **Data model designed** - All entities and relationships mapped
- [ ] **Normalization reviewed** - Reduce redundancy
- [ ] **Indexing planned** - Foreign keys + frequently filtered columns
- [ ] **Constraints defined** - NOT NULL, UNIQUE, CHECK
- [ ] **Cascade behavior** - DELETE/UPDATE handling
- [ ] **Query patterns** - Avoid N+1
- [ ] **Pagination** - Handle large result sets
- [ ] **Backup strategy** - Regular, tested recoveries
- [ ] **Access control** - Row-level security if needed
- [ ] **Monitoring** - Slow query logs, connection pools

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Store arrays in single column (breaks normalization)
- Use GUID as primary key (slower than integers)
- Over-normalize (performance suffers)
- Add index to every column (slows writes)
- Store denormalized data without sync process
- Skip foreign key constraints
- Use timestamps without timezone awareness
- Put business logic in database

✅ **DO:**
- Use small, appropriate data types
- Index what you actually query
- Test performance before deploying
- Document relationships
- Version your schema
- Automate backups

---

## Common Database Patterns

### Pattern 1: Soft Deletes

```prisma
model User {
  id        Int
  email     String
  deletedAt DateTime?  // NULL = not deleted

  @@index([deletedAt])
}
```

**Query active users:**
```javascript
const users = await prisma.user.findMany({
  where: { deletedAt: null }
});
```

### Pattern 2: Audit Trail

```prisma
model User {
  id        Int
  email     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id        Int
  action    String    // "CREATE", "UPDATE", "DELETE"
  modelName String    // "User"
  modelId   Int
  changes   Json      // What changed
  timestamp DateTime  @default(now())
}
```

### Pattern 3: Polymorphic Relations

```prisma
model Comment {
  id          Int
  text        String

  // Can be on Post or Article
  targetType  String  // "Post" or "Article"
  targetId    Int

  @@index([targetType, targetId])
}
```

---

## Next Steps

1. **Define entities** - What data do you store?
2. **Map relationships** - How do they connect?
3. **Choose database** - SQL or NoSQL?
4. **Design schema** - Create Prisma schema
5. **Plan indexes** - What gets queried?
6. **Test performance** - Run queries at scale
7. **Plan migrations** - How to evolve safely?

---

## Related Skills

- `/backend-expert` - For API layer using database
- `/api-architect` - For API design around data
- `/test-engineer` - For database testing
- `/performance-profiler` - For query optimization
- `/security-auditor` - For data security
