# Next.js Best Practices

## Prefer Server Components

- Default to Server Components
- Add `"use client"` only when using state, effects, or browser APIs
- Keep the client bundle small

## Navigation and Routing

- Use `next/navigation` (not `next/router`) for App Router
- Use `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`
- No `window.location` for routing; use `next/navigation`

## Images

- Use `next/image` (never raw `<img>`)
- Configure `images.remotePatterns` for external URLs
- Provide `sizes` for responsive images

## Route Conventions

- Use `loading.tsx` for route-level loading states
- Use `error.tsx` for route-level error boundaries
- Use `not-found.tsx` for 404
- Export `metadata` from layouts/pages

## Head and Links

- No manual `<head>` element; use metadata API
- Use `<Link>` from `next/link` for internal links
- No `<a>` for same-origin navigation
