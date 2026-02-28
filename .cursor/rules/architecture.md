# Architecture Rules

## Three-Layer Structure

1. **app** — Routes, layouts, pages. Orchestrates modules.
2. **modules** — Feature logic. Components, hooks, services, DTOs.
3. **lib** — Shared infra (API client, auth, config).

## Cross-Layer Import Rules

- `lib` MUST NOT import from `modules`
- `modules` MUST NOT import from `app`
- `app` may import from `modules` via public API (`@/modules/<feature>`)
- `app` may import from `lib`

## Component and Service Rules

- Components MUST NOT import services directly
- Components MUST use hooks or PageView wrappers for data/actions
- Hooks MAY import and call services
- No service calls inside UI components (tsx/jsx in `components/`)

## DTO and Data Flow

- Use DTOs at boundaries (API ↔ services ↔ components)
- No DTO bypass: do not pass raw API responses to UI
- Use mappers to transform DTOs to domain/UI types

## Enforcement

- `guard:arch` (check-architecture.js) enforces these rules on every commit.
