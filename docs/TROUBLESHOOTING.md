# Troubleshooting Guide

Common issues and their solutions.

## Build Errors

### Module not found

**Error:**
```
Module not found: Can't resolve '@/modules/counter'
```

**Solutions:**
1. Check import path uses `@/` alias
2. Verify file is exported from barrel export (`index.ts`)
3. Restart dev server: `npm run dev`
4. Clear `.next` directory: `rm -rf .next`
5. Reinstall dependencies: `rm -rf node_modules && npm install`

### Type error in build

**Error:**
```
Type error: Property 'foo' does not exist on type 'Bar'
```

**Solutions:**
1. Run `npm run typecheck` locally to see full errors
2. Fix type errors shown
3. Ensure all props are properly typed
4. Check for missing imports

### ESLint errors blocking build

**Error:**
```
ESLint: error - Build failed because of ESLint errors
```

**Solutions:**
1. Run `npm run lint` to see all errors
2. Run `npm run lint:fix` to auto-fix what's possible
3. Manually fix remaining issues
4. Commit and push again

## Runtime Errors

### fetch failed in development

**Error:**
```
TypeError: fetch failed
```

**Causes & Solutions:**

1. **API URL not configured:**
   - Check `.env.local` has `NEXT_PUBLIC_API_BASE_URL`
   - Value should not have trailing slash
   - Restart dev server after changing env vars

2. **CORS error:**
   - External API must allow requests from `localhost:3000`
   - Check API CORS configuration
   - In dev, API should allow `http://localhost:3000`

3. **API is down:**
   - Verify API is running and accessible
   - Test API directly with `curl` or Postman
   - Check API health endpoint

4. **Network error:**
   - Check internet connection
   - Try accessing API URL in browser
   - Check firewall settings

### Hydration mismatch

**Error:**
```
Hydration failed because the initial UI does not match what was rendered on the server
```

**Causes & Solutions:**

1. **Using browser APIs in Server Components:**
   ```typescript
   // ❌ BAD
   export const Component = () => {
     const theme = localStorage.getItem('theme'); // Server doesn't have localStorage
     return <div>{theme}</div>;
   };

   // ✅ GOOD
   'use client';
   export const Component = () => {
     const [theme, setTheme] = useState('');
     useEffect(() => {
       setTheme(localStorage.getItem('theme') || '');
     }, []);
     return <div>{theme}</div>;
   };
   ```

2. **Date/time rendering:**
   ```typescript
   // ❌ BAD - server and client times differ
   <div>{new Date().toString()}</div>

   // ✅ GOOD - suppress hydration warning or use client component
   <div suppressHydrationWarning>{new Date().toString()}</div>
   ```

3. **Random values:**
   ```typescript
   // ❌ BAD - different on server and client
   <div>{Math.random()}</div>

   // ✅ GOOD - generate client-side only
   'use client';
   const [random, setRandom] = useState(0);
   useEffect(() => {
     setRandom(Math.random());
   }, []);
   ```

### Infinite re-render

**Error:**
```
Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

**Causes & Solutions:**

1. **setState in render:**
   ```typescript
   // ❌ BAD
   const Component = () => {
     const [count, setCount] = useState(0);
     setCount(1); // Causes infinite loop
     return <div>{count}</div>;
   };

   // ✅ GOOD
   const Component = () => {
     const [count, setCount] = useState(0);
     useEffect(() => {
       setCount(1);
     }, []); // Only runs once
     return <div>{count}</div>;
   };
   ```

2. **useEffect missing dependencies:**
   ```typescript
   // ❌ BAD
   useEffect(() => {
     fetchData();
   }); // No dependency array - runs every render

   // ✅ GOOD
   useEffect(() => {
     fetchData();
   }, []); // Empty array - runs once
   ```

3. **Props creating new objects:**
   ```typescript
   // ❌ BAD
   <Component config={{ foo: 'bar' }} /> // New object every render

   // ✅ GOOD
   const config = useMemo(() => ({ foo: 'bar' }), []);
   <Component config={config} />
   ```

## Performance Issues

### Slow page load

**Diagnosis:**
1. Run Lighthouse audit: `npm run lighthouse` (after implementing)
2. Check bundle size: `npm run build-stats`
3. Check Network tab in DevTools

**Solutions:**

1. **Large bundle size:**
   - Use dynamic imports for heavy components
   - Check for large dependencies in bundle analyzer
   - Tree-shake unused code

2. **Too many API calls:**
   - Use ISR to cache data: `export const revalidate = 60`
   - Batch API calls
   - Use Server Components to fetch on server

3. **Images not optimized:**
   - Use `next/image` component
   - Ensure images are in WebP/AVIF format
   - Set appropriate sizes

### Slow build times

**Solutions:**
1. Clear build cache: `rm -rf .next`
2. Update dependencies: `npm update`
3. Check for large dependencies
4. Use `experimental.turbotrace` in next.config (if available)

### Client bundle too large

**Diagnosis:**
```bash
npm run build-stats
```

**Solutions:**
1. Identify large dependencies in analyzer
2. Use dynamic imports:
   ```typescript
   const Heavy = dynamic(() => import('./Heavy'), {
     loading: () => <LoadingSkeleton />,
   });
   ```
3. Tree-shake unused code
4. Consider lighter alternatives to heavy libraries

## Development Issues

### Hot reload not working

**Solutions:**
1. Restart dev server
2. Check file is in `src/` directory
3. Clear `.next` directory
4. Check for syntax errors in file

### Port already in use

**Error:**
```
Port 3000 is already in use
```

**Solutions:**
1. Kill process on port 3000:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or use different port:
   ```bash
   PORT=3001 npm run dev
   ```

### Environment variables not loading

**Solutions:**
1. Restart dev server after changing `.env.local`
2. Check file is named `.env.local` (not `.env`)
3. Check variables start with `NEXT_PUBLIC_` for client access
4. Verify no trailing spaces in `.env.local`

## Testing Issues

### Tests failing after changes

**Diagnosis:**
```bash
npm run test -- --reporter=verbose
```

**Solutions:**
1. Read error messages carefully
2. Check if mocks need updating
3. Ensure test data matches new structure
4. Update snapshots if UI changed: `npm run test -- -u`

### Playwright tests timing out

**Solutions:**
1. Increase timeout in `playwright.config.ts`:
   ```typescript
   timeout: 60000, // 60 seconds
   ```

2. Wait for elements properly:
   ```typescript
   await page.waitForSelector('[data-testid="foo"]');
   ```

3. Check if app is actually running on test port

### Coverage not reaching threshold

**Check what's not covered:**
```bash
npm run test -- --coverage
# Open coverage/lcov-report/index.html
```

**Solutions:**
1. Add tests for uncovered lines
2. Or adjust thresholds in `vitest.config.mts`

## Deployment Issues

### Vercel build failing

**Check build logs in Vercel dashboard**

**Common issues:**
1. **Environment variables missing:**
   - Add them in Vercel project settings
   - Check spelling and values

2. **Build command wrong:**
   - Should be `npm run build`
   - Check Vercel project settings

3. **Node version mismatch:**
   - Vercel uses Node 18 by default
   - Update if needed in Vercel settings

### 404 on deployed site

**Causes:**
1. Route doesn't exist
2. File not in `src/app` directory
3. Build didn't include the page

**Solutions:**
1. Check page exists in source code
2. Verify build succeeded
3. Check deployment logs
4. Redeploy

### Environment variables not working in production

**Causes:**
1. Variables not set in hosting platform
2. Variables don't start with `NEXT_PUBLIC_` (for client access)
3. Build cache using old values

**Solutions:**
1. Set variables in hosting platform (Vercel, Netlify, etc.)
2. Ensure client variables have `NEXT_PUBLIC_` prefix
3. Clear build cache and redeploy

## Database/API Issues

### API calls failing in production

**Diagnosis:**
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check Sentry for server errors

**Solutions:**
1. **CORS error:**
   - API must allow requests from production domain
   - Check API CORS configuration

2. **Wrong API URL:**
   - Check `NEXT_PUBLIC_API_BASE_URL` in production
   - Should be HTTPS URL
   - No trailing slash

3. **API rate limiting:**
   - Check if API has rate limits
   - Implement retries with backoff
   - Cache responses when possible

## Error Monitoring

### Sentry not receiving errors

**Checks:**
1. `NEXT_PUBLIC_SENTRY_DSN` is set
2. Sentry is not disabled: `NEXT_PUBLIC_SENTRY_DISABLED` should not be `true`
3. Errors are actually occurring (check console)
4. Source maps uploaded (check Sentry releases)

**Test Sentry:**
```typescript
import * as Sentry from '@sentry/nextjs';

// Trigger test error
Sentry.captureException(new Error('Test error'));
```

### PostHog not tracking events

**Checks:**
1. `NEXT_PUBLIC_POSTHOG_KEY` is set
2. PostHog script loaded (check Network tab)
3. Ad blocker not blocking PostHog
4. Check PostHog dashboard for recent events

**Test PostHog:**
```typescript
if (typeof window !== 'undefined' && window.posthog) {
  window.posthog.capture('test_event');
}
```

## Getting Help

### Before asking for help

1. **Search existing issues:**
   - Check GitHub issues
   - Search discussions

2. **Check documentation:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [CONTRIBUTING.md](./CONTRIBUTING.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

3. **Try debugging:**
   - Add `console.log` statements
   - Check browser console
   - Check Network tab
   - Read error messages carefully

### When opening an issue

Include:
1. **Clear description** of the problem
2. **Steps to reproduce:**
   ```
   1. Go to /counter
   2. Click increment button
   3. See error in console
   ```
3. **Expected behavior** vs **actual behavior**
4. **Environment:**
   - Next.js version: `npm list next`
   - Node version: `node -v`
   - OS: macOS/Windows/Linux
   - Browser: Chrome/Firefox/Safari
5. **Error messages** (full stack trace)
6. **Screenshots** if relevant

## Common Error Messages

### Error: EADDRINUSE

**Meaning:** Port is already in use

**Fix:** Kill process or use different port (see above)

### Error: MODULE_NOT_FOUND

**Meaning:** Import path is wrong or package not installed

**Fix:** Check import path, run `npm install`

### Error: Cannot find module '@/...'

**Meaning:** Path alias not working

**Fix:** Check `tsconfig.json` has path mapping, restart dev server

### Error: Unexpected token '<'

**Meaning:** JavaScript file contains HTML (usually from API error)

**Fix:** Check API response, might be returning error page instead of JSON

### Warning: Each child in a list should have a unique "key" prop

**Meaning:** Missing `key` prop in list

**Fix:**
```typescript
// ❌ BAD
{items.map(item => <div>{item}</div>)}

// ✅ GOOD
{items.map(item => <div key={item.id}>{item}</div>)}
```

## Still stuck?

Open an issue on GitHub with all the details above.
