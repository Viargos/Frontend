# Architecture Overview

## Philosophy

This boilerplate follows a **domain-driven modular architecture** optimized for:
- Frontend-only applications
- External API integration
- Team scalability (5-20 developers)
- Feature isolation and parallel development

## Core Principles

1. **Modules are independent** - Each feature is a self-contained module
2. **Server Components by default** - Use client components only when needed
3. **Type safety everywhere** - Strict TypeScript, runtime validation with Zod
4. **Explicit over implicit** - Clear imports, no magic, obvious structure

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Route group for public pages
│   │   ├── loading.tsx     # Loading state
│   │   ├── error.tsx       # Error boundary
│   │   └── page.tsx        # Public pages
│   ├── layout.tsx          # Root layout
│   ├── loading.tsx         # Global loading state
│   ├── error.tsx           # Global error boundary
│   ├── global-error.tsx    # Fallback error boundary
│   └── not-found.tsx       # 404 page
│
├── modules/                # Feature modules
│   ├── common/             # Shared utilities & components
│   │   ├── components/     # Reusable UI components
│   │   ├── helpers/        # Utility functions
│   │   ├── services/       # Shared services (API client)
│   │   ├── types/          # Shared TypeScript types
│   │   ├── constants/      # App-wide constants
│   │   ├── validations/    # Shared Zod schemas
│   │   └── index.ts        # Barrel export
│   │
│   └── counter/            # Example feature module
│       ├── components/     # Counter-specific components
│       ├── services/       # Counter API calls
│       ├── types/          # Counter domain types
│       ├── validations/    # Zod schemas
│       └── index.ts        # Barrel export
│
├── libs/                   # Third-party lib configs
│   └── Env.ts              # Environment variable validation
│
├── templates/              # Page layout templates
│   └── BaseTemplate.tsx    # Base page layout
│
└── styles/                 # Global styles
    └── global.css          # Tailwind + global CSS
```

## Module Guidelines

### When to Create a New Module

Create a new module when:
- Feature is domain-specific (not shared across app)
- Has 3+ components or complex logic
- Will be worked on by a dedicated team member
- Needs isolation for testing

Keep in `common/` when:
- Used in 3+ other modules
- Is a pure utility (no business logic)
- Is a design system component

### Module Structure

Each module **MUST** have:
- `index.ts` - Barrel export of public API
- `components/` - UI components
- `types/` - TypeScript types (if needed)

Each module **MAY** have:
- `services/` - API calls
- `validations/` - Zod schemas
- `helpers/` - Domain-specific utils
- `constants/` - Module-specific constants

### Import Rules

✅ **GOOD:**
```typescript
import { ApiClient, getMessage } from '@/modules/common';
import { CounterWidget } from '@/modules/counter';
```

❌ **BAD:**
```typescript
import { getMessage } from '@/modules/common/helpers/message.helper';
import { CounterWidget } from '@/modules/counter/components/CounterWidget';
```

**Always import from barrel exports.**

## Data Fetching Strategy

### Server Components (Preferred)

Use for initial data loading:

```typescript
// app/(marketing)/counter/page.tsx
async function CounterData() {
  const data = await CounterService.getCounter({
    next: { revalidate: 60 }, // ISR - revalidate every 60 seconds
  });

  return <CounterWidget initialCount={data.count} />;
}

export default function CounterPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <CounterData />
    </Suspense>
  );
}
```

### Server Actions (Mutations)

Use for data mutations:

```typescript
// app/(marketing)/counter/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function incrementCounterAction(input: number) {
  // Validate input
  const validated = CounterValidation.parse({ increment: input });

  // Call external API
  const response = await CounterService.incrementCounter(validated.increment);

  // Revalidate cache
  revalidatePath('/counter');

  return { success: true, count: response.count };
}
```

### Client Components (Interactivity)

Use for user interactions:

```typescript
// modules/counter/components/CounterWidget.tsx
'use client';

import { useState, useTransition } from 'react';

export const CounterWidget = (props: {
  initialCount: number;
}) => {
  const [count, setCount] = useState(props.initialCount);
  const [isPending, startTransition] = useTransition();

  const handleIncrement = async (value: number) => {
    // Optimistic update
    setCount(prev => prev + value);

    startTransition(async () => {
      const result = await incrementCounterAction(value);

      if (!result.success) {
        // Revert on error
        setCount(prev => prev - value);
      }
    });
  };

  return <CounterForm onIncrement={handleIncrement} />;
};
```

## Caching Strategy

| Route Type | Cache Config | Use Case | Example |
|------------|--------------|----------|---------|
| Static page | `dynamic = 'force-static'`, `revalidate = false` | About, legal pages | `/about` |
| ISR page | `revalidate = 3600` | Blog, portfolio | `/portfolio` |
| Dynamic page | `dynamic = 'force-dynamic'` | User dashboard | `/dashboard` |
| API calls | `next: { revalidate: 60 }` | External APIs | Counter API |

## API Client Architecture

All API calls go through the centralized `ApiClient`:

```typescript
// modules/common/services/api.service.ts
export class ApiClient {
  async get<T>(path: string, options?: RequestInit): Promise<T>;
  async post<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  async put<T>(path: string, body: unknown, options?: RequestInit): Promise<T>;
  async delete<T>(path: string, options?: RequestInit): Promise<T>;
}

// Singleton instance
export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL);
```

**Benefits:**
- Centralized error handling
- Easy to add retry logic
- Type-safe responses
- Consistent request configuration

## Error Handling

Three layers of error boundaries:

1. **Global Error (`global-error.tsx`)** - Fallback for catastrophic errors
2. **Root Error (`error.tsx`)** - Catches errors in root layout
3. **Route Error (`(marketing)/error.tsx`)** - Catches errors in route groups

All errors are:
- Logged to Sentry in production
- Logged to console in development
- Sanitized before showing to users (via `getSafeErrorMessage`)

## Testing Strategy

- **Unit tests** - Services, helpers, validations (Vitest)
- **Component tests** - UI components with React Testing Library
- **E2E tests** - Critical user flows (Playwright)
- **Visual tests** - Screenshot regression (Playwright)

**Target: 80% coverage for business logic.**

## Performance Optimizations

1. **Font Optimization** - `next/font` for zero layout shift
2. **Image Optimization** - `next/image` with AVIF/WebP formats
3. **Bundle Analysis** - `@next/bundle-analyzer` to track size
4. **Code Splitting** - Dynamic imports for heavy components
5. **Analytics** - Lazy loaded PostHog (100ms delay)
6. **ISR** - Incremental Static Regeneration for semi-static content
7. **React Compiler** - Enabled in production for automatic optimizations

## Security

- **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- **Input Validation** - Zod schemas on all user input
- **Error Sanitization** - No sensitive data in user-facing errors
- **No PII in Sentry** - `sendDefaultPii: false`
- **HTTPS Only** - Forced in production

## Deployment

Optimized for:
- **Vercel** (zero config, recommended)
- **Netlify** (works out of box)
- **Docker** (use `output: 'standalone'` in next.config)

## Scaling to 20+ Modules

The architecture is designed to scale:

1. **No circular dependencies** - Enforced by module structure
2. **Clear boundaries** - Each module is independent
3. **Consistent patterns** - New developers onboard quickly
4. **Parallel development** - Teams can work on different modules

**Module creation:**
```bash
./scripts/create-module.sh feature-name
```

## Migration Guide

### Adding a New Feature Module

1. Run module generator:
   ```bash
   ./scripts/create-module.sh my-feature
   ```

2. Create your components:
   ```typescript
   // src/modules/my-feature/components/MyComponent.tsx
   export const MyComponent = () => { ... };
   ```

3. Export from barrel:
   ```typescript
   // src/modules/my-feature/components/index.ts
   export * from './MyComponent';
   ```

4. Use in pages:
   ```typescript
   // src/app/(marketing)/my-feature/page.tsx
   import { MyComponent } from '@/modules/my-feature';
   ```

### Adding a New Page

1. Create page file:
   ```typescript
   // src/app/(marketing)/new-page/page.tsx
   export default function NewPage() {
     return <div>Content</div>;
   }
   ```

2. Add cache config:
   ```typescript
   export const dynamic = 'force-static'; // or revalidate
   ```

3. Add metadata:
   ```typescript
   export const metadata = {
     title: 'Page Title',
     description: 'Page description',
   };
   ```

## Questions?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review [CONTRIBUTING.md](./CONTRIBUTING.md)
- Open an issue on GitHub
