# /devops-pipeline

**CI/CD pipeline design, containerization, and deployment strategies.**

Use this skill when setting up CI/CD, containerizing applications, or planning infrastructure.

---

## What This Skill Does

Teaches **DevOps thinking**. Covers:
- 🔄 CI/CD pipeline design
- 🐳 Docker containerization
- ☸️ Kubernetes basics
- 🏗️ Infrastructure as Code
- 📋 Environment management
- 🔐 Secrets management
- 📊 Monitoring and logging
- 🚀 Deployment strategies

---

## When to Use

✅ Setting up CI/CD pipeline
✅ Containerizing application
✅ Planning deployment
✅ Infrastructure setup
✅ Secrets management
✅ Monitoring strategy

❌ Specific tool tutorials (use tool docs)

---

## CI/CD Pipeline Design

### Pipeline Stages

```
Code Push
  ↓
1. Build (Compile, test)
  ↓
2. Test (Unit, integration, E2E)
  ↓
3. Quality (Lint, security scan)
  ↓
4. Deploy to Staging
  ↓
5. Smoke Tests
  ↓
6. Approval (Manual step)
  ↓
7. Deploy to Production
```

### Pipeline Tools Comparison

| Tool | Best For | Pricing |
|------|----------|---------|
| **GitHub Actions** | GitHub repos, free tier | Free for public/self-hosted |
| **GitLab CI** | GitLab repos, self-hosted | Free tier available |
| **CircleCI** | Any git repo | Free tier available |
| **Jenkins** | Self-hosted, complex workflows | Free (open source) |
| **AWS CodePipeline** | AWS deployments | Pay per pipeline |

---

## GitHub Actions Workflows

### Basic Workflow

```yaml
name: Build & Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### Matrix Testing

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

### Deployment Workflow

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - name: Deploy to Vercel
        run: |
          npx vercel --prod \
            --token ${{ secrets.VERCEL_TOKEN }}
```

---

## Docker Containerization

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://db/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Environment Management

### Three-Environment Setup

```
Development (Local)
├── Code changes tested locally
├── Hot reload enabled
└── Debug logging on

Staging (Pre-production)
├── Code deployed to staging
├── Tests run in production-like environment
├── Manual testing
└── Performance profiling

Production
├── User-facing
├── Automated backups
├── Monitoring enabled
└── Zero-downtime deployments
```

### Environment Variables

```bash
# .env.local (dev only)
DATABASE_URL=postgresql://localhost/myapp
DEBUG=true

# .env.production (deployed)
DATABASE_URL=postgresql://prod-db.example.com/myapp
DEBUG=false
NODE_ENV=production
```

### Environment-Specific Configs

```typescript
const config = {
  development: {
    apiUrl: 'http://localhost:8000',
    logLevel: 'debug',
  },
  staging: {
    apiUrl: 'https://api-staging.example.com',
    logLevel: 'info',
  },
  production: {
    apiUrl: 'https://api.example.com',
    logLevel: 'warn',
  },
};

export default config[process.env.NODE_ENV];
```

---

## Secrets Management

### Store Secrets Securely

❌ **DON'T:**
```javascript
const apiKey = 'sk_live_abc123'; // In code!
```

✅ **DO:**
```typescript
// Environment variables
const apiKey = process.env.STRIPE_API_KEY;

// Secrets manager
const secret = await secretsManager.get('stripe-key');

// .env file (git-ignored)
STRIPE_API_KEY=sk_live_abc123
```

### Secrets Tools

| Tool | Purpose | When |
|------|---------|------|
| **dotenv** | Local development | Dev only |
| **GitHub Secrets** | CI/CD variables | GitHub Actions |
| **AWS Secrets Manager** | Cloud storage | Production |
| **HashiCorp Vault** | Team secrets | Enterprise |

### Secret Rotation

```bash
# Regular rotation schedule
1. Generate new secret
2. Update in secrets manager
3. Redeploy services
4. Invalidate old secret
```

---

## Kubernetes Basics

### When to Use Kubernetes

✅ **Use Kubernetes when:**
- Multiple services
- High availability needed
- Complex deployments
- Team of DevOps engineers

❌ **Use Docker Compose/Serverless when:**
- Single service
- Low traffic
- Simple deployments
- Small team

### Kubernetes Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app

spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app

  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: app
          image: myapp:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

---

## Infrastructure as Code

### Terraform Example

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}

resource "aws_s3_bucket" "app_assets" {
  bucket = "my-app-assets"

  versioning {
    enabled = true
  }
}
```

---

## Deployment Strategies

### Blue-Green Deployment

```
Blue (Current)
↓
Deploy Green (New)
↓
Test Green
↓
Switch traffic Blue → Green
↓
Keep Blue as fallback
```

**Advantages:**
✅ Zero downtime
✅ Easy rollback
✅ Test before switching

### Canary Deployment

```
1% traffic → New version
  ↓ (Monitor for issues)
10% traffic → New version
  ↓ (Monitor)
50% traffic → New version
  ↓ (Monitor)
100% traffic → New version
```

**Advantages:**
✅ Gradual rollout
✅ Risk mitigation
✅ Real-world testing

### Rolling Deployment

```
Pod 1: Old → New
Pod 2: Old → New
Pod 3: Old → New
```

**Advantages:**
✅ Resource efficient
✅ No downtime
⚠️ Complex rollback

---

## Monitoring & Logging

### Application Metrics

```typescript
import prom from 'prom-client';

// Create metrics
const httpRequestDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
});

// Measure
const end = httpRequestDuration.startTimer();
await handleRequest();
end();
```

### Centralized Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

logger.info('Application started', { port: 3000 });
```

### Monitoring Stack

| Component | Purpose |
|-----------|---------|
| **Prometheus** | Metrics collection |
| **Grafana** | Visualization |
| **ELK Stack** | Log aggregation |
| **Sentry** | Error tracking |
| **PagerDuty** | Alerting |

---

## Deployment Checklist

- [ ] **CI/CD pipeline** - Build, test, deploy automated
- [ ] **Containerization** - Docker images, docker-compose
- [ ] **Environment separation** - Dev, staging, production
- [ ] **Secrets management** - Secure credential storage
- [ ] **Monitoring** - Metrics and logs
- [ ] **Alerting** - Notifications for issues
- [ ] **Backups** - Database and configuration
- [ ] **Disaster recovery** - Restore procedures
- [ ] **Load testing** - Validate performance
- [ ] **Security scanning** - Dependency and code scanning

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Manual deployments
- Secrets in code
- No environment separation
- Failing builds ship to production
- No monitoring
- No rollback strategy
- No automated tests

✅ **DO:**
- Automated CI/CD
- Secure secrets management
- Separate environments
- All builds pass tests
- Comprehensive monitoring
- Easy rollback
- Extensive automated testing

---

## Next Steps

1. **Set up repository** - With git hooks
2. **Create CI/CD pipeline** - Build and test automation
3. **Containerize app** - Docker + docker-compose
4. **Set environment variables** - Dev, staging, production
5. **Secure secrets** - Use secrets manager
6. **Set up monitoring** - Metrics and logs
7. **Plan deployments** - Blue-green or canary
8. **Disaster recovery** - Backup and restore procedures

---

## Related Skills

- `/backend-expert` - For application architecture
- `/database-designer` - For database migration strategies
- `/security-auditor` - For security scanning
- `/performance-profiler` - For performance monitoring
- `/test-engineer` - For automated testing
