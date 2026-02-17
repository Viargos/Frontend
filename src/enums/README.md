# Enums Directory

Central location for all application enums organized by domain.

## Directory Structure

```
/enums
  /api          - API-related enums (HttpMethod, etc.)
  /common       - Shared/common enums used across multiple domains
  /journey      - Journey domain enums (PlaceType, JourneyMediaType)
  /post         - Post domain enums (MediaType, PostType)
  /chat         - Chat domain enums (future)
  /user         - User domain enums (future)
  index.ts      - Central export for all enums
```

## Usage

Always import enums from the root `@/enums` path:

```typescript
// ✅ Correct
import { HttpMethod, PlaceType, PostType } from '@/enums';

// ❌ Incorrect - Don't import from subdirectories
import { HttpMethod } from '@/enums/api/http-method.enum';
```

## Guidelines

### 1. Naming Convention

- **File naming**: `kebab-case.enum.ts`
  - Example: `http-method.enum.ts`, `place-type.enum.ts`

- **Enum naming**: `PascalCase`
  - Example: `HttpMethod`, `PlaceType`, `PostType`

- **Enum value naming**: `SCREAMING_SNAKE_CASE`
  - Example: `HttpMethod.GET`, `PlaceType.ACTIVITY`

### 2. Organization

- **Domain-specific enums**: Place in respective domain folder
  - Journey-specific → `/journey`
  - Post-specific → `/post`
  - API-specific → `/api`

- **Shared enums**: Place in `/common` folder
  - Used across 3+ domains
  - No domain ownership
  - Examples: Status, Priority, Role

### 3. Creating New Enums

1. Create the enum file in the appropriate domain folder
2. Export from domain's `index.ts`
3. Domain index is auto-exported via root `index.ts`
4. Always import from `@/enums`

Example:
```typescript
// 1. Create: /enums/journey/difficulty.enum.ts
export enum JourneyDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  HARD = 'hard',
}

// 2. Export: /enums/journey/index.ts
export * from './difficulty.enum';

// 3. Use: anywhere in the app
import { JourneyDifficulty } from '@/enums';
```

### 4. Migration from Types

When extracting enums from type files:
1. Move enum to appropriate domain folder
2. Re-export from original type file for backward compatibility
3. Update new code to import from `@/enums`

Example:
```typescript
// types/journey.types.ts (backward compatibility)
export { PlaceType } from '@/enums/journey/place-type.enum';

// New code should use
import { PlaceType } from '@/enums';
```

## Benefits

✅ **Single Source of Truth** - All enums in one place
✅ **Type Safety** - Consistent enum values across app
✅ **Discoverability** - Easy to find all available enums
✅ **Maintainability** - Clear organization by domain
✅ **No Circular Dependencies** - Enums don't import types
✅ **Tree Shaking** - Unused enums not bundled

## Examples

### API Layer
```typescript
import { HttpMethod } from '@/enums';

httpClient.request('/api/endpoint', {
  method: HttpMethod.POST,
  body: data
});
```

### Journey Domain
```typescript
import { PlaceType, JourneyMediaType } from '@/enums';

const place: CreateJourneyPlace = {
  type: PlaceType.ACTIVITY,
  name: 'Museum Visit',
  media: [{
    type: JourneyMediaType.IMAGE,
    url: 'photo.jpg'
  }]
};
```

### Post Domain
```typescript
import { PostType, MediaType } from '@/enums';

const post = {
  type: PostType.JOURNEY_LINKED,
  media: [{
    type: MediaType.IMAGE,
    url: 'cover.jpg'
  }]
};
```
