# Production Readiness Checklist

Complete this checklist before deploying to production.

## Code Quality

- [ ] All tests passing (`npm run test`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Test coverage > 80% (`npm run test -- --coverage`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Code reviewed and approved
- [ ] No `console.log` statements in production code
- [ ] No `// TODO` or `// FIXME` comments for critical functionality

## Performance

- [ ] Lighthouse score > 90 for all categories
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90
- [ ] Core Web Vitals pass:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Images optimized (using next/image with AVIF/WebP)
- [ ] Fonts optimized (using next/font)
- [ ] Bundle size < 500KB JavaScript
- [ ] ISR configured on appropriate pages
- [ ] Server Components used for data fetching

## Security

- [ ] All environment variables configured
- [ ] No secrets in client code
- [ ] `NEXT_PUBLIC_*` variables don't contain secrets
- [ ] Security headers configured in next.config.ts:
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Strict-Transport-Security
  - [ ] Content-Security-Policy
  - [ ] Referrer-Policy
  - [ ] Permissions-Policy
- [ ] HTTPS enforced in production
- [ ] Dependencies audited (`npm audit` - no high/critical vulns)
- [ ] Input validation with Zod on all forms
- [ ] Error messages sanitized (no stack traces to users)
- [ ] CORS configured correctly on external API

## Monitoring

- [ ] Sentry configured and receiving test errors
  - [ ] DSN set: `NEXT_PUBLIC_SENTRY_DSN`
  - [ ] Organization set: `SENTRY_ORGANIZATION`
  - [ ] Project set: `SENTRY_PROJECT`
  - [ ] Auth token set: `SENTRY_AUTH_TOKEN`
  - [ ] Source maps uploading
  - [ ] Test error sent and visible in dashboard
- [ ] PostHog tracking events
  - [ ] Key set: `NEXT_PUBLIC_POSTHOG_KEY`
  - [ ] Host set: `NEXT_PUBLIC_POSTHOG_HOST`
  - [ ] Page views tracking
  - [ ] Custom events working
- [ ] Vercel Analytics active (or alternative)
- [ ] Uptime monitoring configured for critical pages (UptimeRobot, Pingdom, etc.)
- [ ] Alerts configured for critical errors

## Configuration

- [ ] All environment variables set in hosting platform
  - [ ] `NEXT_PUBLIC_APP_URL`
  - [ ] `NEXT_PUBLIC_API_BASE_URL`
  - [ ] `NEXT_PUBLIC_SENTRY_DSN`
  - [ ] `NEXT_PUBLIC_POSTHOG_KEY`
  - [ ] `SENTRY_AUTH_TOKEN`
  - [ ] (Add others as needed)
- [ ] Environment variables different for prod/staging
- [ ] API URLs point to production API
- [ ] Logging level set to `warn` or `info` (not `debug`)
- [ ] `NODE_ENV=production`
- [ ] Sentry not disabled (`NEXT_PUBLIC_SENTRY_DISABLED` not set)

## External Services

- [ ] External API is production-ready
  - [ ] CORS allows production domain
  - [ ] Rate limiting configured
  - [ ] Proper error responses
  - [ ] Health check endpoint
  - [ ] SLA defined
- [ ] CDN configured (if using)
- [ ] SSL certificate valid
- [ ] DNS configured correctly
- [ ] Email service configured (if using)

## Build & Deployment

- [ ] Production build succeeds (`npm run build`)
- [ ] Build size is acceptable (check `.next/` size)
- [ ] No build warnings
- [ ] Static pages generated correctly
- [ ] ISR pages configured with appropriate revalidation times
- [ ] CI/CD pipeline configured
  - [ ] Runs on every PR
  - [ ] Deploys automatically on merge to main
  - [ ] Runs all tests
  - [ ] Checks bundle size
- [ ] Deployment platform configured:
  - [ ] Correct build command: `npm run build`
  - [ ] Correct start command: `npm run start`
  - [ ] Node version specified (22.x)
  - [ ] Auto-deploy enabled

## Documentation

- [ ] README updated with:
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] Environment variables list
  - [ ] Deployment instructions
- [ ] ARCHITECTURE.md exists and accurate
- [ ] API documentation current
- [ ] Runbook created for common operations
- [ ] Incident response plan documented

## SEO

- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Metadata on all pages:
  - [ ] Title tags unique and descriptive
  - [ ] Description meta tags
  - [ ] Open Graph tags
  - [ ] Twitter Card tags
- [ ] Canonical URLs set
- [ ] 404 page exists and branded
- [ ] No broken internal links

## Accessibility

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Alt text on all images
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast ratios meet WCAG AA
- [ ] Screen reader tested (VoiceOver/NVDA)

## Legal & Compliance

- [ ] Privacy policy page (if collecting data)
- [ ] Terms of service page
- [ ] Cookie consent (if in EU)
- [ ] GDPR compliance (if applicable):
  - [ ] Data processing documented
  - [ ] User data deletion process
  - [ ] Privacy settings
- [ ] security.txt file created (`/public/.well-known/security.txt`)

## Mobile

- [ ] Responsive design on all pages
- [ ] Touch targets > 48x48px
- [ ] No horizontal scrolling
- [ ] Viewport meta tag set
- [ ] Tested on iOS Safari
- [ ] Tested on Android Chrome
- [ ] PWA manifest (optional but recommended)

## Browser Support

- [ ] Tested on latest Chrome
- [ ] Tested on latest Firefox
- [ ] Tested on latest Safari
- [ ] Tested on latest Edge
- [ ] No console errors in any browser
- [ ] Polyfills added if needed

## Data

- [ ] Database migrations run (if applicable)
- [ ] Seed data loaded (if applicable)
- [ ] Backup strategy defined
- [ ] Data retention policy documented

## Post-Deployment

- [ ] Smoke tests run on production:
  - [ ] Home page loads
  - [ ] Counter page works
  - [ ] All critical flows tested
  - [ ] Health check responds
- [ ] Analytics tracking verified
- [ ] Error monitoring verified
- [ ] Performance metrics baseline captured
- [ ] SSL certificate verified
- [ ] HTTPS redirect working
- [ ] DNS propagated fully

## Rollback Plan

- [ ] Previous deployment tagged/saved
- [ ] Rollback procedure documented
- [ ] Database rollback plan (if schema changed)
- [ ] Team knows how to rollback

## Team

- [ ] Team trained on new features
- [ ] On-call rotation established (if needed)
- [ ] Incident response contacts listed
- [ ] Access controls reviewed:
  - [ ] Production access limited
  - [ ] Secrets access limited
  - [ ] Admin accounts secured

## Final Checks

- [ ] Load testing performed (if high traffic expected)
- [ ] Security scan performed (OWASP ZAP, etc.)
- [ ] Penetration test done (for sensitive apps)
- [ ] Legal review complete (if required)
- [ ] Stakeholder approval received
- [ ] Launch communications prepared
- [ ] Support team briefed
- [ ] Status page ready (if using)

## Day of Launch

- [ ] Backup taken immediately before deployment
- [ ] Team available for first 2 hours post-launch
- [ ] Monitoring dashboards open
- [ ] Status page updated
- [ ] Social media posts scheduled
- [ ] Email announcements ready

## First 24 Hours

- [ ] Monitor error rates every hour
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Watch for traffic spikes
- [ ] Verify all integrations working
- [ ] Check uptime monitoring

## First Week

- [ ] Daily error report reviewed
- [ ] Performance trends analyzed
- [ ] User feedback collected
- [ ] Hot fixes deployed if needed
- [ ] Team retrospective held
- [ ] Documentation updated with learnings

---

## Sign-Off

Once all items are checked:

**Prepared by:** _________________
**Date:** _________________

**Reviewed by:** _________________
**Date:** _________________

**Approved for deployment:** _________________
**Date:** _________________

---

## Notes

Use this space for deployment-specific notes, known issues, or special considerations:

```
[Add notes here]
```

---

**Remember:** It's better to delay launch and do it right than to rush and have issues.

Good luck with your deployment! 🚀
