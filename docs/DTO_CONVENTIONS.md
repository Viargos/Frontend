# DTO Conventions

DTOs represent backend contracts. They are **type-only** (interfaces/types); no runtime validation.

## Naming and location

| Kind | Naming | Location | Example |
|------|--------|----------|---------|
| Response (list) | `XxxListResponseDto` or `GetXxxResponseDto` | `lib/dtos/{domain}/` | `GetConversationsResponseDto`, `JourneyListResponseDto` |
| Response (single) | `XxxResponseDto` | same | `UserProfileResponseDto`, `SigninResponseDto` |
| Request body | `XxxRequestDto` | same | `SigninRequestDto`, `VerifyOtpRequestDto` |
| Error | `ApiErrorDto` | `lib/dtos/common/` | Already present |

- One DTO per backend contract (one response shape per endpoint).
- Align with NestJS backend DTO names where possible; keep frontend suffix `ResponseDto` / `RequestDto`.

## Where DTOs are allowed

- **API layer**: Return types and request body types.
- **Store / hook boundary**: Variable typing when calling API (e.g. `const response: GetConversationsResponseDto = await ChatApi.getConversations();`).
- **Route handlers**: Typing response body when normalizing.

## Where DTOs are NOT allowed

- **UI**: Pages and components must never import from `@/lib/dtos`. Use only `@/types`, stores, hooks.
- **Store state type**: State must use domain types (e.g. `ChatConversation[]`), not DTO types.

## Domain vs DTO

- **Domain types** live in `@/types` (e.g. `Journey`, `ChatConversation`, `Post`). UI and store state use domain types.
- **DTOs** live in `lib/dtos/{domain}/` and describe API request/response shapes. API returns DTOs; stores/hooks unwrap and set domain.

---

## Architecture verification checklist

Use this checklist after changes to API, stores, or UI to ensure the layered architecture is respected.

- [ ] All API service methods return `Promise<XxxDto>` or `Promise<void>`; no union return types.
- [ ] No unwrap/fallback logic in API layer (no `response?.data ?? response`, no branching on `data` vs raw).
- [ ] Route handlers normalize list/single responses to one shape per endpoint.
- [ ] Store state types use only domain types (from `@/types`); no DTO in state.
- [ ] Stores set state from DTO by reading a field (e.g. `response.data`, `response.conversations`) or mapping DTO to domain.
- [ ] No `@/lib/dtos` import in any file under `app/**/*.tsx` or `components/**/*.tsx`.
- [ ] DTOs are type-only (no runtime validation).
