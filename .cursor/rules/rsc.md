# Server Component (RSC) Rules

## Default to Server Component

- Files inside `src/app/` default to Server Components
- No `"use client"` at the top unless justified
- Server Components are async; can await data, use `cookies()`, `headers()`, etc.

## When to Use Client

- `"use client"` is allowed only when necessary:
  - `useState`, `useEffect`, or other React hooks
  - Browser APIs (e.g. `window`, `document`)
  - Event handlers (`onClick`, `onChange`, etc.)
  - Third-party client-only libraries
- Error boundaries (`error.tsx`) and providers (`providers.tsx`) are valid client exceptions

## Server-Only Imports

- Client components MUST NOT import server-only modules:
  - `server-only`
  - `next/headers`
  - `next/cache`
  - `next/server` (route handlers, etc.)
  - Prisma/database clients (unless via API)
- Import `"server-only"` in server-only files to fail fast if imported in client

## Page-Level Routes

- Page routes (`page.tsx`) should remain Server Components when possible
- Use client wrappers (PageView, etc.) only for interactive sections
- Do not mark entire page as client if only a small part needs interactivity
