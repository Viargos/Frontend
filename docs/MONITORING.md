# Monitoring & Observability

This guide covers monitoring your application in production.

## Overview

The boilerplate includes three layers of observability:

1. **Error Monitoring** - Sentry (errors and exceptions)
2. **Analytics** - PostHog (user behavior)
3. **Performance** - Vercel Analytics (Core Web Vitals)

## Error Monitoring (Sentry)

### Setup

1. Create account at https://sentry.io
2. Create new project (platform: Next.js)
3. Get DSN from project settings
4. Set environment variables:
   ```bash
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_ORGANIZATION=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=sntrys_xxx
   ```

### What's Monitored

- JavaScript errors (client-side)
- Server errors (Server Components, Server Actions)
- Unhandled promise rejections
- API errors
- Performance issues

### Accessing Sentry

Dashboard: https://sentry.io/organizations/your-org/issues/

### Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Error Rate | % of sessions with errors | < 1% |
| Crash-Free Sessions | % sessions without crashes | > 99% |
| Mean Time to Resolution | Avg time to fix issues | < 24h |

### Alerts

Configure in Sentry dashboard:

1. **Critical Alerts (PagerDuty/Slack):**
   - Error rate > 5%
   - New error type affecting > 100 users
   - Performance regression > 50%

2. **Warning Alerts (Slack):**
   - Error rate > 1%
   - API errors > 10/min
   - Slow transactions > 3s (p95)

### Error Filtering

Errors are filtered before sending to Sentry:

```typescript
// sentry.client.config.ts
beforeSend(event, hint) {
  // Ignore network errors (user's internet issue)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return null;
  }

  // Ignore canceled requests
  if (event.exception?.values?.[0]?.value?.includes('AbortError')) {
    return null;
  }

  return event;
}
```

Add more filters as needed for your use case.

### Session Replay

Sentry captures session replays when errors occur:

- Sample rate: 10% of normal sessions
- Error rate: 100% of sessions with errors
- Privacy: All text masked, all media blocked

View replays in Sentry issues to see exactly what user did.

### Source Maps

Source maps are automatically uploaded during build via Sentry webpack plugin.

To disable for local builds:
```bash
NEXT_PUBLIC_SENTRY_DISABLED=true npm run build
```

## Analytics (PostHog)

### Setup

1. Create account at https://posthog.com
2. Create new project
3. Get project key
4. Set environment variables:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   ```

### What's Tracked

- Page views (automatic)
- User sessions
- Custom events (via `posthog.capture()`)
- Feature flag usage

### Accessing PostHog

Dashboard: https://app.posthog.com

### Key Metrics

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Active Users | Users in last 30 days | DAU * 30 |
| Session Duration | Avg session length | Total time / Sessions |
| Pages per Session | Avg pages viewed | Page views / Sessions |
| Bounce Rate | % single-page sessions | Bounces / Total sessions |

### Custom Events

Track custom events for your features:

```typescript
// Example: Track counter increment
if (typeof window !== 'undefined' && window.posthog) {
  window.posthog.capture('counter_increment', {
    value: incrementValue,
    timestamp: Date.now(),
  });
}
```

### Dashboards

Create dashboards in PostHog for:

1. **User Overview:**
   - Total users
   - New vs returning
   - Top pages
   - User journey

2. **Feature Usage:**
   - Counter increments
   - Most used features
   - Feature adoption rate

3. **Conversion Funnels:**
   - Sign-up flow
   - Purchase flow
   - Feature discovery

### Feature Flags

PostHog supports feature flags for gradual rollouts:

```typescript
import { featureFlags } from '@/libs/feature-flags';

if (featureFlags.isEnabled('new-counter-design')) {
  return <NewCounterWidget />;
}
return <CounterWidget />;
```

## Performance Monitoring (Vercel Analytics)

### Setup

Automatically enabled on Vercel deployments.

For local testing:
```bash
npm install @vercel/speed-insights @vercel/analytics
```

Already added to `layout.tsx`.

### What's Measured

- **Core Web Vitals:**
  - LCP (Largest Contentful Paint)
  - FID (First Input Delay)
  - CLS (Cumulative Layout Shift)
  - FCP (First Contentful Paint)
  - TTFB (Time to First Byte)

- **Page Performance:**
  - Load time
  - Time to Interactive
  - Total Blocking Time

### Accessing Analytics

Dashboard: https://vercel.com/[your-team]/[your-project]/analytics

### Performance Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |
| TTFB | < 800ms | 800ms - 1800ms | > 1800ms |

### Performance Budgets

Set in CI to prevent regressions:

```javascript
// lighthouse.config.js
budgets: [{
  resourceSizes: [{
    resourceType: 'script',
    budget: 500, // 500 KB
  }, {
    resourceType: 'total',
    budget: 1000, // 1 MB
  }],
  timings: [{
    metric: 'interactive',
    budget: 3000, // 3 seconds
  }],
}],
```

## Health Checks

### Frontend-Only Architecture

This boilerplate follows a **frontend-only architecture** with no backend API routes. Instead of traditional health check endpoints, monitor your application's availability by:

1. **Page Availability**: Monitor critical pages (home, about, counter)
2. **SSR Rendering**: Verify Server Components are rendering correctly
3. **External API Health**: If you use external APIs, monitor those separately

### Uptime Monitoring

Use external monitoring services to check page availability:

1. **UptimeRobot** (https://uptimerobot.com)
   - Monitor your homepage or critical pages
   - Check every 5 minutes
   - Alert if down > 1 minute

2. **Pingdom** (https://www.pingdom.com)
   - HTTP check on your main domain
   - Expect 200 status code
   - Monitor response time

3. **Checkly** (https://www.checklly.com)
   - Browser-based monitoring
   - Multi-region checks
   - End-to-end testing

### Configure Alerts

Send alerts to:
- Email
- Slack
- PagerDuty (for critical apps)
- Discord webhook

## Log Aggregation

### Client-Side Logging

All console errors are captured by Sentry.

For additional logging:

```typescript
// modules/common/helpers/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NEXT_PUBLIC_LOGGING_LEVEL !== 'silent') {
      console.log(message, meta);
    }
  },

  error: (message: string, error?: Error) => {
    console.error(message, error);
    // Also send to Sentry
    if (process.env.NODE_ENV === 'production') {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.captureException(error || new Error(message));
      });
    }
  },
};
```

### Server-Side Logging

For production, consider log aggregation service:

1. **Vercel Log Drains:**
   - Send logs to external service
   - Configure in Vercel dashboard

2. **Logtail (https://logtail.com):**
   - Real-time log streaming
   - Search and filtering

3. **DataDog (https://www.datadoghq.com):**
   - Comprehensive monitoring
   - APM and logs in one place

## Monitoring Dashboard

Create a single dashboard combining all metrics:

### Recommended Tools

1. **Datadog** - All-in-one (paid)
2. **Grafana** - Open source, flexible
3. **Custom Dashboard** - Embed iframes from Sentry/PostHog/Vercel

### Key Metrics to Display

1. **System Health:**
   - Uptime %
   - Error rate
   - Response time (p50, p95, p99)

2. **User Metrics:**
   - Active users (DAU/MAU)
   - New signups
   - Session duration

3. **Business Metrics:**
   - Counter increments (example metric)
   - Feature usage
   - Conversion rates

4. **Performance:**
   - Core Web Vitals scores
   - Page load times
   - API latency

## Alerts Configuration

### Critical (Wake me up)

- Site is down (uptime check fails)
- Error rate > 5%
- Database connection lost
- API returning 5xx errors > 50/min

Send to: PagerDuty, Phone, Slack

### High Priority (Check within 1 hour)

- Error rate > 1%
- Performance regression > 30%
- New error type affecting > 100 users
- Slow API responses (p95 > 3s)

Send to: Slack, Email

### Medium Priority (Check next day)

- Bundle size increased > 10%
- Test failures in CI
- Security vulnerability in dependency

Send to: Email, GitHub issue

## Weekly Review Checklist

Every Monday, review:

- [ ] Error trends (increasing/decreasing?)
- [ ] New error types introduced
- [ ] Performance metrics (any regressions?)
- [ ] User growth numbers
- [ ] Feature usage patterns
- [ ] Top pages visited
- [ ] Conversion funnel metrics

Create Notion/Linear tasks for any issues found.

## Monthly Review

Once a month:

- [ ] Review all dashboards
- [ ] Update alert thresholds
- [ ] Check for unused features (consider removing)
- [ ] Analyze user churn
- [ ] Plan performance optimizations
- [ ] Review security audit logs
- [ ] Update documentation

## Incident Response

When an incident occurs:

1. **Acknowledge** - Let team know you're investigating
2. **Assess** - Check Sentry, logs, uptime monitors
3. **Mitigate** - Rollback or hotfix
4. **Communicate** - Update status page, notify users
5. **Resolve** - Fix root cause
6. **Document** - Write postmortem

### Postmortem Template

```markdown
# Incident Postmortem: [Title]

**Date:** 2025-01-01
**Duration:** 30 minutes
**Severity:** High
**Impact:** 50% of users unable to access site

## Timeline

- 10:00 AM - Alert triggered (error rate spike)
- 10:05 AM - Investigation started
- 10:15 AM - Root cause identified (API timeout)
- 10:20 AM - Fix deployed
- 10:30 AM - Incident resolved

## Root Cause

Describe technical cause...

## Resolution

Describe how it was fixed...

## Action Items

- [ ] Add timeout to API calls
- [ ] Improve monitoring for this scenario
- [ ] Update runbook

## Lessons Learned

What we learned...
```

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [PostHog Documentation](https://posthog.com/docs)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals/)
