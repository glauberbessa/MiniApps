# /security-auditor

**Security vulnerability identification, mitigation, and hardening strategies for web applications.**

Use this skill when auditing code for vulnerabilities, planning security measures, or implementing authentication/authorization.

---

## What This Skill Does

Teaches **security thinking**. Covers:
- 🛡️ OWASP Top 10 vulnerabilities
- 🔐 Authentication & authorization patterns
- 📝 Input validation and sanitization
- 🔒 Secrets management
- 🚫 XSS, CSRF, SQL injection prevention
- 🔄 Rate limiting strategies
- 📦 Dependency vulnerability scanning
- 🚀 Security deployment checklist

---

## When to Use

✅ Auditing code for vulnerabilities
✅ Planning authentication system
✅ Implementing authorization
✅ Reviewing API security
✅ Database security hardening
✅ Secrets management strategy

❌ Specific tool setup (use tool docs)
❌ Cryptography algorithms (use crypto guide)

---

## OWASP Top 10 (2023)

### 1. Broken Access Control

**Problem:** Users can access resources they shouldn't

**Examples:**
- API endpoint returns all users, not filtered by permission
- User can modify other users' data via URL ID
- Admin routes accessible without admin check

**Prevention:**
```typescript
// ❌ VULNERABLE: No permission check
app.get('/api/users/:id', (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.params.id } });
  res.json(user); // Anyone can see any user
});

// ✅ SECURE: Check permission
app.get('/api/users/:id', async (req, res) => {
  const user = await getServerSession(req);

  const requestedUser = await db.user.findUnique({
    where: { id: req.params.id }
  });

  // Only own data or admin
  if (user.id !== requestedUser.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(requestedUser);
});
```

### 2. Cryptographic Failures

**Problem:** Sensitive data exposed (no encryption)

**Examples:**
- Passwords stored in plain text
- Credit cards not encrypted
- API keys in version control
- Unencrypted database connection

**Prevention:**
```typescript
// ❌ VULNERABLE: Plain text password
const user = {
  email: 'user@example.com',
  password: 'secretpassword123' // NEVER!
};

// ✅ SECURE: Hash with bcrypt
import bcrypt from 'bcryptjs';

const hashedPassword = await bcrypt.hash(password, 12);
const user = {
  email: 'user@example.com',
  password: hashedPassword
};

// Verify
const isValid = await bcrypt.compare(inputPassword, user.password);
```

### 3. Injection

**Problem:** Untrusted data inserted into commands

**Types:**
- SQL Injection
- NoSQL Injection
- OS Command Injection

**Prevention:**
```typescript
// ❌ VULNERABLE: String concatenation
const user = await db.query(`
  SELECT * FROM users WHERE email = '${req.body.email}'
`);
// Attacker: email: "'; DROP TABLE users; --"

// ✅ SECURE: Parameterized queries
const user = await db.user.findUnique({
  where: { email: req.body.email }
});

// Or ORM with prepared statements
const result = db.query(
  'SELECT * FROM users WHERE email = ?',
  [req.body.email]
);
```

### 4. Insecure Design

**Problem:** Missing security controls in architecture

**Prevention:**
- Threat modeling
- Authentication from start
- Rate limiting planned
- Input validation designed

### 5. Security Misconfiguration

**Problem:** Default configs, debug mode on, unnecessary features

**Prevention:**
```javascript
// ❌ VULNERABLE: Debug mode in production
process.env.DEBUG = true;

// ❌ VULNERABLE: Default credentials
db.connect({ user: 'admin', password: 'admin' });

// ✅ SECURE: Configuration via environment
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  throw new Error('DB_PASSWORD not set');
}

process.env.NODE_ENV === 'production' && console.log('Debug disabled');
```

### 6. Vulnerable & Outdated Components

**Problem:** Using old packages with known CVEs

**Prevention:**
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm audit fix

# Regular updates
npm update

# Check specific packages
npx npm-check-updates
```

### 7. Authentication Failures

**Problem:** Weak password policies, no 2FA, session hijacking

**Prevention:**
```typescript
// ✅ Password policy
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
// Min 12 chars, upper, lower, number, special

// ✅ 2FA (two-factor authentication)
const totp = speakeasy.generateSecret({ name: 'MyApp' });
await user.update({ twoFactorSecret: totp.base32 });

// ✅ Session expiration
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 minutes
});
```

### 8. Software & Data Integrity Failures

**Problem:** Unsigned updates, untrusted dependencies

**Prevention:**
- Sign releases
- Verify checksums
- Use private npm registry
- Lock dependency versions

### 9. Logging & Monitoring Failures

**Problem:** No audit trail, can't detect attacks

**Prevention:**
```typescript
// Log security events
logger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  timestamp: new Date(),
  success: true
});

logger.warn('Failed login', {
  email: req.body.email,
  attempts: loginAttempts,
  ip: req.ip
});

logger.error('SQL injection attempt detected', {
  payload: req.body,
  ip: req.ip
});
```

### 10. SSRF (Server-Side Request Forgery)

**Problem:** App fetches URLs from user input

**Prevention:**
```typescript
// ❌ VULNERABLE: User-controlled URL
const response = await fetch(req.body.url);

// ✅ SECURE: Validate URL
import { URL } from 'url';

const userUrl = new URL(req.body.url);

// Only allow public domains
if (userUrl.hostname === 'localhost' || userUrl.hostname === '127.0.0.1') {
  return res.status(400).json({ error: 'Invalid URL' });
}

// Whitelist specific domains
const allowedDomains = ['api.example.com', 'cdn.example.com'];
if (!allowedDomains.includes(userUrl.hostname)) {
  return res.status(400).json({ error: 'Domain not allowed' });
}

const response = await fetch(userUrl.toString());
```

---

## Input Validation & Sanitization

### Validation vs Sanitization

| Approach | Purpose | When |
|----------|---------|------|
| **Validate** | Check if input is correct | Always first |
| **Sanitize** | Remove/escape dangerous parts | If validation fails |

### Zod Validation Example

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  age: z.number().min(18),
  website: z.string().url().optional(),
});

// In API route
app.post('/register', (req, res) => {
  try {
    const data = userSchema.parse(req.body);
    // data is guaranteed safe
  } catch (error) {
    return res.status(400).json({ error: error.errors });
  }
});
```

### Escaping for XSS Prevention

```typescript
// ❌ VULNERABLE: Render user input directly
<div>{userInput}</div>

// ✅ SAFE: React escapes by default
import DOMPurify from 'dompurify';

// If HTML needed:
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

---

## Secrets Management

### Never in Code

```javascript
// ❌ WRONG: Hardcoded secrets
const apiKey = 'sk_live_abc123def456';
const dbPassword = 'mySecretPassword';

// ✅ RIGHT: Environment variables
const apiKey = process.env.STRIPE_API_KEY;
const dbPassword = process.env.DB_PASSWORD;

// In .env (git-ignored)
STRIPE_API_KEY=sk_live_abc123def456
DB_PASSWORD=mySecretPassword
```

### Secrets Tools

| Tool | Purpose |
|------|---------|
| **dotenv** | Load .env files locally |
| **AWS Secrets Manager** | Store secrets in cloud |
| **HashiCorp Vault** | Enterprise secret management |
| **1Password** | Team secrets sharing |

---

## CSRF Prevention

**Problem:** Attacker tricks user into making unwanted request

```html
<!-- ❌ VULNERABLE: User visits attacker.com -->
<img src="bank.com/transfer?amount=1000&to=attacker" />
<!-- User's browser sends authenticated request -->

<!-- ✅ SECURE: CSRF token required -->
<form action="/transfer" method="POST">
  <input type="hidden" name="csrfToken" value="token123..." />
  <input name="amount" />
  <button type="submit">Transfer</button>
</form>
```

### Prevention

```typescript
import csrf from 'csurf';
import session from 'express-session';

app.use(session({ secret: 'keyboard cat' }));
app.use(csrf({ cookie: false }));

// Generate token
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// Verify token
app.post('/transfer', (req, res) => {
  // Middleware automatically verifies
  const amount = req.body.amount;
  // Process transfer
});
```

---

## Rate Limiting

### Protection Against Brute Force

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts',
  standardHeaders: true, // Return rate limit info
  legacyHeaders: false,
});

app.post('/login', loginLimiter, (req, res) => {
  // Handle login
});

// Stricter for critical endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 attempts
});

app.post('/admin/users', authLimiter, (req, res) => {
  // Handle
});
```

---

## Security Headers

### Set Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());

// Or manually
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HSTS - Force HTTPS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  // CSP - Control script sources
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' trusted.cdn.com"
  );

  next();
});
```

---

## CORS Configuration

```typescript
import cors from 'cors';

// ❌ VULNERABLE: Allow all origins
app.use(cors());

// ✅ SECURE: Whitelist origins
const allowedOrigins = [
  'https://example.com',
  'https://app.example.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Dependency Security Scanning

### Check for Vulnerabilities

```bash
# Check for issues
npm audit

# Auto-fix where possible
npm audit fix

# Deep scan with multiple tools
npm audit
npx snyk test

# Check outdated packages
npm outdated

# Update with confidence
npm update
```

### In CI/CD

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm audit
      - run: npm run lint
```

---

## Security Deployment Checklist

- [ ] **Authentication** - Secure login, password hashing
- [ ] **Authorization** - Role-based access control
- [ ] **Secrets** - Environment variables, not in code
- [ ] **Validation** - All inputs validated
- [ ] **HTTPS** - Enforced in production
- [ ] **Headers** - Security headers set
- [ ] **CORS** - Whitelist origins
- [ ] **Rate limiting** - Auth endpoints protected
- [ ] **Dependencies** - No known vulnerabilities
- [ ] **Logging** - Security events logged
- [ ] **Error messages** - No sensitive info exposed
- [ ] **SQL injection** - Parameterized queries
- [ ] **XSS** - Output escaped, CSP set
- [ ] **CSRF tokens** - For state-changing requests
- [ ] **Session security** - HttpOnly, Secure cookies

---

## Security Audit Methodology

### 1. Code Review
- Scan for common vulnerabilities
- Check input validation
- Verify authentication/authorization

### 2. Dependency Check
```bash
npm audit --audit-level=moderate
```

### 3. Security Headers
```bash
curl -I https://example.com | grep -i "X-Frame\|X-Content\|Strict-Transport"
```

### 4. OWASP Scan
- Use OWASP ZAP
- Run burp suite
- Test manually

### 5. Penetration Testing
- Hire security firm
- Attempt to break in
- Document findings

---

## Anti-Patterns to Avoid

❌ **DON'T:**
- Hardcode secrets
- Trust user input
- Use default credentials
- Ignore security headers
- Store passwords in plain text
- Use deprecated crypto
- Log sensitive data
- Skip updates

✅ **DO:**
- Use environment variables
- Validate everything
- Strong passwords/hashing
- Set security headers
- Hash + salt passwords
- Use modern crypto (bcrypt, argon2)
- Sanitize logs
- Keep dependencies updated

---

## Next Steps

1. **Run security audit** - `npm audit`
2. **Check dependencies** - Update and fix vulnerabilities
3. **Implement auth** - Secure login with 2FA
4. **Add validation** - Zod or similar on all inputs
5. **Set headers** - Use helmet.js
6. **Rate limiting** - Protect auth endpoints
7. **Monitoring** - Log security events
8. **Regular scans** - Automated vulnerability checks

---

## Related Skills

- `/backend-expert` - For server security
- `/api-architect` - For API security
- `/database-designer` - For database hardening
- `/test-engineer` - For security testing
- `/devops-pipeline` - For secure deployment
