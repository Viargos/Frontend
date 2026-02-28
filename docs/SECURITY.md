# Security Considerations

This document outlines security best practices and considerations for this Next.js boilerplate.

## Table of Contents

- [Security Headers](#security-headers)
- [Content Security Policy](#content-security-policy)
- [Rate Limiting](#rate-limiting)
- [Environment Variables](#environment-variables)
- [Input Validation](#input-validation)
- [XSS Prevention](#xss-prevention)
- [CSRF Protection](#csrf-protection)
- [Error Handling](#error-handling)
- [Authentication & Authorization](#authentication--authorization)
- [Dependencies](#dependencies)
- [Monitoring & Incident Response](#monitoring--incident-response)

## Security Headers

All security headers are configured in `next.config.ts`:

### Implemented Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for 2 years |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | Enables browser XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricts browser features |
| `Content-Security-Policy` | See CSP section | Mitigates XSS and injection attacks |

### Verification

Test headers after deployment:
```bash
curl -I https://yourdomain.com | grep -i "x-frame-options\|strict-transport\|content-security"
```

Or use: https://securityheaders.com/

## Content Security Policy

CSP is configured in `next.config.ts` to prevent XSS attacks.

### Current Policy

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' *.posthog.com *.vercel-insights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data: https:;
font-src 'self' data:;
connect-src 'self' *.posthog.com *.sentry.io *.vercel-insights.com;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

### Why `unsafe-inline` and `unsafe-eval`?

- **PostHog** requires inline scripts
- **React** uses inline styles
- **Next.js** development mode uses eval

### Production Hardening

For stricter CSP in production:

1. Remove `unsafe-inline` for scripts
2. Use nonces for inline scripts
3. Implement CSP reporting:

```typescript
// Add to CSP header
report-uri https://yourdomain.com/api/csp-report;
```

### CSP Violations

Monitor violations in Sentry or dedicated CSP reporting endpoint.

## Rate Limiting

This boilerplate is frontend-only and relies on external APIs.

### API Server Recommendations

Implement rate limiting on your API server:

**Option 1: API Gateway**
- CloudFlare (free tier available)
- AWS WAF
- Kong Gateway
- Nginx rate limiting

**Option 2: Application Level**
```javascript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

app.use('/api/', limiter);
```

### Client-Side Considerations

- **Don't** expose API keys in client code
- **Do** use Server Actions to proxy sensitive requests
- **Do** implement request deduplication
- **Do** use optimistic updates to reduce API calls

Example:
```typescript
// ❌ BAD - API key exposed
const API_KEY = 'sk_live_xxx'; // Visible in client bundle

// ✅ GOOD - Server Action hides key
'use server';
async function callAPI() {
  const API_KEY = process.env.SECRET_API_KEY; // Server-only
  // Call API
}
```

## Environment Variables

### Rules

1. **Never commit** `.env.local` or `.env.production.local`
2. **Always** use `.env.example` as template
3. **Validate** all env vars in `src/libs/Env.ts`

### Public vs Private

| Prefix | Access | Use For | Example |
|--------|--------|---------|---------|
| `NEXT_PUBLIC_*` | Client & Server | Public config | `NEXT_PUBLIC_APP_URL` |
| No prefix | Server only | Secrets | `DATABASE_URL` |

### Security Checklist

- [ ] `.env.local` in `.gitignore`
- [ ] All secrets use no prefix (server-only)
- [ ] Public variables don't contain secrets
- [ ] Environment variables validated with Zod
- [ ] Different values for staging/production

### Common Mistakes

❌ **Wrong:**
```bash
NEXT_PUBLIC_API_KEY=sk_live_xxx  # Secret exposed to client!
```

✅ **Correct:**
```bash
API_KEY=sk_live_xxx  # Server-only, not exposed
```

## Input Validation

All user input must be validated.

### Client-Side Validation

Use Zod for type-safe validation:

```typescript
import { z } from 'zod';

export const CounterValidation = z.object({
  increment: z.number().min(1).max(3),
});

// In component
const validated = CounterValidation.parse(userInput);
```

### Server-Side Validation

**Always validate in Server Actions:**

```typescript
'use server';
export async function incrementAction(input: unknown) {
  // Validate input (don't trust client)
  const validated = CounterValidation.parse(input);

  // Safe to use
  await incrementCounter(validated.increment);
}
```

### Validation Rules

1. **Validate all user input** (forms, URL params, cookies)
2. **Whitelist, don't blacklist** (define what's allowed, not what's forbidden)
3. **Validate on server** (client validation is for UX only)
4. **Sanitize output** (escape HTML, SQL, etc.)

### Common Patterns

```typescript
// Email
z.string().email();

// URL
z.string().url();

// Enum
z.enum(['option1', 'option2']);

// Number range
z.number().min(0).max(100);

// String length
z.string().min(3).max(50);

// Custom validation
z.string().refine(val => !val.includes('<script>'), {
  message: 'Invalid input',
});
```

## XSS Prevention

Cross-Site Scripting (XSS) is prevented through multiple layers.

### React's Built-in Protection

React automatically escapes JSX:

```typescript
// ✅ SAFE - React escapes automatically
const userInput = '<script>alert("xss")</script>';
<div>{userInput}</div>
// Renders as text, not executed
```

### Dangerous APIs

**Never use these without sanitization:**

```typescript
// ❌ EXTREMELY DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - Sanitize first
import DOMPurify from 'isomorphic-dompurify';
const clean = DOMPurify.sanitize(userInput);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

### URL Injection

```typescript
// ❌ DANGEROUS
<a href={userInput}>Link</a>

// ✅ SAFE - Validate URL
const validated = z.string().url().parse(userInput);
<a href={validated}>Link</a>
```

### Event Handlers

```typescript
// ❌ DANGEROUS
<button onClick={() => eval(userInput)}>Click</button>

// ✅ SAFE - Never use eval with user input
<button onClick={handleClick}>Click</button>
```

## CSRF Protection

Cross-Site Request Forgery protection is built into Next.js Server Actions.

### How It Works

1. **Server Actions** automatically include CSRF tokens
2. **Tokens** are validated on each request
3. **Origin checks** ensure requests come from your domain

### Best Practices

```typescript
// ✅ GOOD - Server Actions have CSRF protection
'use server';
export async function deleteUser(userId: string) {
  // Protected by CSRF token
  await db.user.delete(userId);
  revalidatePath('/users');
}

// ❌ BAD - Direct API calls need manual CSRF protection
fetch('/api/delete-user', {
  method: 'POST',
  body: JSON.stringify({ userId }),
});
```

### Manual CSRF Protection

If using API routes instead of Server Actions:

```typescript
// Generate CSRF token
import { randomBytes } from 'node:crypto';

const csrfToken = randomBytes(32).toString('hex');

// Validate in API route
if (req.headers['x-csrf-token'] !== expectedToken) {
  return res.status(403).json({ error: 'Invalid CSRF token' });
}
```

## Error Handling

Proper error handling prevents information leakage.

### Error Sanitization

```typescript
import { getSafeErrorMessage } from '@/modules/common';

try {
  await riskyOperation();
} catch (error) {
  // ❌ BAD - Exposes internals
  setError(error.message);

  // ✅ GOOD - Sanitized message
  setError(getSafeErrorMessage(error));
}
```

### Error Messages

**Development:**
```
Error: Database connection failed at connection.ts:42
```

**Production:**
```
Service temporarily unavailable. Please try again later.
```

### Stack Traces

- **Never** show stack traces to users
- **Always** log full errors to Sentry
- **Use** error boundaries to catch React errors

### Sentry Configuration

```typescript
// sentry.client.config.ts
beforeSend(event) {
  // Remove sensitive data
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers?.Authorization;
  }
  return event;
}
```

## Authentication & Authorization

This boilerplate is frontend-only. For authentication:

### Recommended Approach

1. **Use external auth service:**
   - Clerk (easiest)
   - Auth0
   - Supabase Auth
   - Firebase Auth

2. **Store tokens securely:**
   - Use httpOnly cookies (not localStorage)
   - Set SameSite=Strict
   - Use Secure flag (HTTPS only)

3. **Check auth in Server Actions:**
   ```typescript
   'use server';
   export async function protectedAction() {
     const user = await getServerUser();
     if (!user) {
       throw new Error('Unauthorized');
     }
     // Proceed with action
   }
   ```

### What NOT to do

❌ Store JWT in localStorage (vulnerable to XSS)
❌ Trust client-side checks (always verify server-side)
❌ Expose user roles in client code
❌ Use predictable user IDs

## Dependencies

Keep dependencies updated and secure.

### Audit Dependencies

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# View details
npm audit --audit-level=moderate
```

### Update Strategy

1. **Weekly:** Check for updates
   ```bash
   npm outdated
   ```

2. **Monthly:** Update dependencies
   ```bash
   npm update
   ```

3. **Quarterly:** Update major versions
   ```bash
   npm install <package>@latest
   ```

### Automated Tools

Use Dependabot (GitHub) or Renovate to auto-create PRs for dependency updates.

### Security Advisories

Monitor:
- GitHub Security Advisories
- npm security advisories
- Sentry/Snyk alerts

## Monitoring & Incident Response

### Error Monitoring

All errors logged to Sentry with:
- Stack traces
- User context (if authenticated)
- Request details
- Environment info

### Security Monitoring

Monitor for:
- Spike in 4xx/5xx errors
- Failed authentication attempts
- Unusual API usage patterns
- CSP violations
- Rate limit hits

### Incident Response Plan

1. **Detect** - Automated alerts via Sentry/monitoring
2. **Assess** - Determine severity and impact
3. **Contain** - Rollback deployment or disable feature
4. **Eradicate** - Fix vulnerability
5. **Recover** - Deploy fix
6. **Document** - Write postmortem

### Security Contacts

Create `public/.well-known/security.txt`:

```
Contact: mailto:security@yourdomain.com
Preferred-Languages: en
Canonical: https://yourdomain.com/.well-known/security.txt
Policy: https://yourdomain.com/security-policy
```

## Security Checklist

Before production deployment:

### Configuration
- [ ] All security headers enabled
- [ ] CSP configured correctly
- [ ] HTTPS enforced
- [ ] Environment variables secure

### Code
- [ ] No secrets in code
- [ ] Input validation on all user input
- [ ] Output sanitization
- [ ] Error messages sanitized

### Dependencies
- [ ] No critical vulnerabilities (`npm audit`)
- [ ] Dependencies up to date
- [ ] Only necessary dependencies installed

### Monitoring
- [ ] Sentry configured
- [ ] Error alerting setup
- [ ] Security monitoring active
- [ ] Incident response plan documented

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Content Security Policy](https://content-security-policy.com/)
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com.

**Do NOT** open a public GitHub issue for security vulnerabilities.
