# API and Data Fetching Rules

## All Client Calls Via lib/api

- All HTTP requests from client code MUST go through `lib/api` (http-client)
- Components and hooks MUST NOT use raw `fetch` directly
- Use module services that call `lib/api` under the hood

## No Direct Fetch in Client

- Raw `fetch()` is forbidden in client components and client hooks
- `fetch` is allowed only in:
  - `app/api/` (Route Handlers)
  - `app/**` Server Components (page, layout, etc.)
  - `lib/**` (e.g. http-client implementation)
  - `*.server.ts` (server-only modules)

## No Axios Outside lib/api

- `axios` is allowed ONLY in `src/lib/api/`
- Everywhere else must use the project's http-client from `lib/api`

## No DTO Bypass

- Do not pass raw API responses or DTOs directly to UI
- Use mappers to transform DTOs → domain/UI types
- App routes must not import DTOs, schemas, or module internals directly
- Use feature public API or PageView components

## Module Services

- Data fetching and mutations live in `modules/<feature>/services/`
- Services import and use `lib/api` http-client
- Hooks call services; components use hooks
