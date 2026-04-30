# Contributing Guide

Welcome! This guide will help you contribute to the project.

## Development Setup

### Prerequisites

- Node.js 22.9.0 or higher
- npm 10.8.3 or higher
- Git

### Initial Setup

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd next-js-boilerplate
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and fill in your values
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Verify setup:**
   - Open http://localhost:3000
   - Check that pages load correctly
   - Verify hot reload works

## Code Standards

### TypeScript

- Use strict mode (already configured in `tsconfig.json`)
- No `any` types (use `unknown` if truly needed)
- No type assertions/casting (use type guards instead)
- Prefer `type` over `interface` for objects
- No need for explicit return types (let compiler infer)

**Example:**
```typescript
// ✅ GOOD
export type User = {
  id: string;
  name: string;
};

function getUser(id: string): Promise<User> {
  // Return type explicit for clarity
}

// ❌ BAD
export type User = {
  id: string;
  name: string;
};

function getUser(id: string): Promise<any> {
  // Never use 'any'
}
```

### React Components

- Server Components by default (no 'use client' unless needed)
- Add `'use client'` only when using hooks, events, or browser APIs
- Props accessed via `props.foo` (not destructured in signature)
- Inline props type when not reused
- Named exports only (no default exports except pages)

**Example:**
```typescript
// ✅ GOOD - Server Component
export const Card = (props: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  );
};

// ✅ GOOD - Client Component (needs interactivity)
'use client';

export const Button = (props: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};

// ❌ BAD - Unnecessary destructuring
export const Card = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return <div>{title}{children}</div>;
};
```

### Imports

- Use `@/` alias for all imports
- Import from barrel exports only (module index.ts)
- No relative imports outside same directory
- Sort imports: external → internal → types

**Example:**
```typescript
import type { User } from '@/modules/common/types';
// ✅ GOOD
import { useState } from 'react';
import { getMessage } from '@/modules/common';
import { CounterWidget } from '@/modules/counter';

import { getMessage } from '../../../modules/common/helpers/message.helper';
// ❌ BAD
import { CounterWidget } from '../../modules/counter/components/CounterWidget';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CounterWidget` |
| Files | Match export | `CounterWidget.tsx` |
| Hooks | camelCase, `use` prefix | `useCounter` |
| Services | PascalCase, `Service` suffix | `CounterService` |
| Functions | camelCase | `getMessage` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types | PascalCase | `CounterResponse` |
| Folders | kebab-case | `user-profile/` |

### JSDoc

Document all public APIs:

```typescript
/**
 * Fetches the current counter value from the API.
 * Falls back to mock data when API URL is not configured.
 *
 * @param options - Fetch options including cache configuration
 * @returns Promise resolving to counter response
 * @throws {ApiError} When API request fails
 */
async getCounter(options?: RequestInit): Promise<CounterResponse> {
  // Implementation
}
```

## Git Workflow

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Tooling, configs, dependencies
- `perf`: Performance improvements
- `style`: Code style (formatting, not CSS)

**Examples:**
```
feat(counter): add reset button
fix(api): correct validation error message
docs(architecture): update module guidelines
refactor(error): simplify error handling
test(counter): add service layer tests
chore(deps): upgrade Next.js to 16.1.0
```

### Branch Naming

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/name` - New features
- `fix/name` - Bug fixes
- `docs/name` - Documentation
- `refactor/name` - Refactoring

**Examples:**
```
feature/user-authentication
fix/counter-validation-bug
docs/add-deployment-guide
refactor/simplify-api-client
```

### Pull Request Process

1. **Create branch from `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat(module): add new feature"
   ```

3. **Push and create PR:**
   ```bash
   git push -u origin feature/my-feature
   # Open PR on GitHub targeting 'develop'
   ```

4. **PR Requirements:**
   - Clear description of changes
   - All tests passing
   - No ESLint warnings
   - Code review approved
   - Up to date with `develop`

5. **Merge:**
   - Squash merge to `develop`
   - Delete branch after merge

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Writing Tests

**Test file naming:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.e2e.ts` (in `tests/e2e/`)

**Test structure:**
```typescript
import { describe, expect, it } from 'vitest';

describe('CounterService', () => {
  describe('getCounter', () => {
    it('returns counter data from API', async () => {
      // Arrange
      const expected = { count: 5 };

      // Act
      const result = await CounterService.getCounter();

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
```

**Test naming:**
- `describe` - Subject only (noun or route)
- `it` - Action in present tense, third person
- No "should", "works", "handles", "tests", "checks"
- State intention, not implementation

**Examples:**
```typescript
// ✅ GOOD
describe('CounterService', () => {
  describe('getCounter', () => {
    it('returns counter data from API', () => {});

    it('uses mock data when API URL not configured', () => {});

    it('throws error when API request fails', () => {});
  });
});

// ❌ BAD
describe('CounterService', () => {
  it('should work correctly', () => {}); // Too vague

  it('tests the getCounter method', () => {}); // Don't say "tests"

  it('handles errors properly', () => {}); // Don't say "handles"
});
```

## Creating New Modules

Use the module generator:

```bash
./scripts/create-module.sh my-feature
```

This creates:
```
src/modules/my-feature/
├── components/
│   └── index.ts
├── services/
│   └── index.ts
├── types/
│   └── index.ts
├── validations/
│   └── index.ts
├── index.ts
└── README.md
```

Then:

1. **Create components:**
   ```typescript
   // src/modules/my-feature/components/MyComponent.tsx
   export const MyComponent = (props: {
     title: string;
   }) => {
     return <div>{props.title}</div>;
   };
   ```

2. **Export from barrel:**
   ```typescript
   // src/modules/my-feature/components/index.ts
   export * from './MyComponent';
   ```

3. **Update module index:**
   ```typescript
   // src/modules/my-feature/index.ts
   export * from './components';
   export * from './services';
   export * from './types';
   ```

## Code Review Guidelines

### As a Reviewer

- Be respectful and constructive
- Explain *why* something should change
- Suggest alternatives when requesting changes
- Approve when code meets standards (don't be overly picky)
- Focus on: correctness, readability, maintainability, performance

### As an Author

- Respond to all comments
- Don't take feedback personally
- Push fixes in response to review
- Ask questions if unclear
- Mark conversations as resolved when addressed

## Pre-commit Hooks

Lefthook runs automatically on commit:

- **Lint:** ESLint checks code quality
- **Type check:** TypeScript validates types
- **Format:** Prettier formats code
- **Tests:** Runs tests for changed files

If hooks fail, fix the issues before committing.

**Bypass hooks (emergency only):**
```bash
git commit --no-verify -m "emergency fix"
```

## Common Tasks

### Add a New Dependency

```bash
# Install
npm install <package>

# If it's a dev dependency
npm install -D <package>

# Update imports if needed
# Restart dev server
```

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update all (minor versions)
npm update

# Update specific package
npm install <package>@latest

# Run tests after updating
npm run test
```

### Fix Linting Errors

```bash
# Auto-fix what's possible
npm run lint:fix

# Check remaining issues
npm run lint

# Manually fix issues shown
```

### Check Bundle Size

```bash
# Analyze bundle
npm run build-stats

# Review .next/analyze/ folder
# Look for large dependencies
# Consider code splitting if needed
```

## Getting Help

1. **Check documentation:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - [DEPLOYMENT.md](./DEPLOYMENT.md)

2. **Search existing issues:**
   - Check if someone already asked

3. **Open new issue:**
   - Clear title and description
   - Steps to reproduce (if bug)
   - Expected vs actual behavior
   - Environment details

4. **Ask in discussions:**
   - For questions not specific to bugs
   - For architectural discussions

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev)
- [Playwright](https://playwright.dev)

Thank you for contributing! 🎉
