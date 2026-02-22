# Viargos Frontend – Store Layer

## What is this folder?

The **store** folder holds **Zustand** stores: client-side state containers used across the app. They keep UI and domain state in one place so many components can read and update it without prop drilling.

**Why we need it:**

- **Single source of truth** – Auth, profile, journeys, chat live in one store each.
- **Shared state** – Any component can `useAuthStore()`, `useProfileStore()`, etc.
- **Persistence** – Some stores use `persist` so filters/tabs survive refresh.
- **Separation from API** – Stores call services/APIs and then update state; they don’t replace the API layer.

---

## Store files overview

| File | Purpose | Persisted? |
|------|---------|------------|
| `auth.store.ts` | Logged-in user and session init state | No |
| `auth-modal.store.ts` | Which auth modal is open (login/signup/OTP) | No |
| `profile.store.ts` | Current user profile, stats, recent journeys/posts, tab | Yes (partial) |
| `journey.store.ts` | User journeys, filters, search, CRUD, detailed journey | Yes (partial) |
| `chat.store.ts` | Conversations, messages, selected chat, WebSocket status | Yes (partial) |

---

## 1. `auth.store.ts` – Authentication state

**Purpose:** Holds the **current user** and **initialization** flag for cookie-based auth. No tokens (cookies are used).

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `user` | `AuthUser \| null` | Logged-in user (from signin or `/api/user/me`). `null` = not logged in. |
| `isInitializing` | `boolean` | `true` until app has checked session (e.g. called `/api/user/me`). |

**Actions:**

- `setUser(user)` – Set user after login/OTP.
- `clearUser()` – Clear user on logout.
- `setInitializing(value)` – Set init flag after rehydration.

**Used by:** Layout, nav, profile page, protected routes, login/signup flows.

**Hook:** `useIsAuthenticated()` – returns `user !== null`.

---

## 2. `auth-modal.store.ts` – Auth modal UI

**Purpose:** Controls **which auth modal** is open (login, signup, OTP). Keeps modal state separate from auth data.

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `activeModal` | `'none' \| 'login' \| 'signup' \| 'otp'` | Current modal; `'none'` = all closed. |
| `signupEmail` | `string` | Email passed into OTP modal after signup. |

**Actions:**

- `openLogin()` – Show login modal.
- `openSignup()` – Show signup modal.
- `openOtp(email)` – Show OTP modal and set email.
- `closeAllModals()` – Close all.
- `setSignupEmail(email)` – Set email for OTP flow.

**Used by:** Header/nav “Log in” / “Sign up”, auth modal component.

---

## 3. `profile.store.ts` – Profile page state

**Purpose:** Everything the **profile page** needs: current user profile, stats, recent journeys/posts, active tab, image upload state, and actions to load/update them.

**State (from `ProfileState`):**

| Field | Type | Description |
|-------|------|-------------|
| `profile` | `UserProfile \| null` | Full profile (id, username, email, images, etc.). |
| `stats` | `UserStats \| null` | Counts: posts, journeys, followers, following. |
| `recentJourneys` | `RecentJourney[]` | Recent journeys for profile. |
| `recentPosts` | `RecentPost[]` | Recent posts for profile. |
| `profileImageUrl` / `bannerImageUrl` | `string \| null` | Current image URLs. |
| `isLoading` / `isStatsLoading` / `isImageUploading` | `boolean` | Loading flags. |
| `error` | `string \| null` | Error message to show. |
| `activeTab` | `'journey' \| 'post' \| 'map'` | Active profile tab. |

**Actions:**

- **Load:** `loadProfileAndStats()`, `loadProfile()`, `loadStats()` – fetch from API using `UserApi`.
- **Update:** `updateProfile(data)`, `uploadProfileImage(file)`, `uploadBannerImage(file)`, `deleteProfileImage()`, `deleteBannerImage()`.
- **Journey:** `deleteJourney(journeyId)` – delete from profile and update stats.
- **UI:** `setActiveTab(tab)`, `clearError()`, `setLoading()`, `reset()`.

**Persisted:** Only `activeTab` (and any other `partialize`d fields) so tab choice survives refresh.

**Used by:** Profile page, profile header, tabs, journey cards, posts grid.

---

## 4. `journey.store.ts` – Journeys and planning

**Purpose:** Holds **journeys** (list + current + detailed), **filters**, **search**, and all **journey CRUD** and “detailed journey” (days, activities, banner) actions. Used on profile, discover, plan-your-journey, etc.

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `journeys` | `Journey[]` | List (e.g. “my journeys”). |
| `currentJourney` | `Journey \| null` | Single journey in focus. |
| `detailedJourney` | `DetailedJourney \| null` | Full journey with days/activities/banner. |
| `stats` | `JourneyStats \| null` | Aggregated journey stats. |
| `filters` | `JourneyFilters` | sortBy, sortOrder, limit, offset. |
| `searchQuery` | `string` | Search text. |
| `isLoading` / `isCreating` / `isUpdating` / `isDeleting` / `isLoadingStats` / `isLoadingDetailed` | `boolean` | Loading flags. |
| `error` | `string \| null` | Error message. |

**Actions:**

- **List:** `loadMyJourneys(filters?)`, `loadAllJourneys(filters?)`, `loadJourney(id)` – use `JourneyApi`.
- **CRUD:** `createJourney(data)`, `updateJourney(id, data)`, `deleteJourney(id)`, `duplicateJourney(id, newTitle?)`.
- **Detailed:** `loadDetailedJourney(id)`, `updateJourneyBanner()`, `addDayToJourney()`, `removeDayFromJourney()`, `addActivityToDay()`, `updateActivity()`, `removeActivity()`, `reorderActivities()`.
- **Other:** `loadStats(userId?)`, `searchJourneys(query)`.
- **UI:** `setFilters()`, `resetFilters()`, `setSearchQuery()`, `setCurrentJourney()`, `setDetailedJourney()`, `clearError()`, `reset()`.

**Persisted:** Only `filters` and `searchQuery` (via `partialize`).

**Used by:** Profile (My Journeys), discover, plan-your-journey, journey detail/edit, forms that need “my journeys”.

---

## 5. `chat.store.ts` – Chat and messaging

**Purpose:** Holds **conversations**, **messages** for the selected chat, **selected user**, and **WebSocket** connection status. Also runs API/WebSocket calls (fetch conversations, fetch messages, send message, connect/disconnect).

**State (from `ChatState` + store):**

| Field | Type | Description |
|-------|------|-------------|
| `conversations` | `ChatConversation[]` | All conversations (with last message, user). |
| `selectedChat` | `ChatUser \| null` | User we’re chatting with. |
| `messages` | `ChatMessage[]` | Messages in the current conversation. |
| `isConnected` | `boolean` | WebSocket connected or not. |
| `isLoading` / `isLoadingMessages` | `boolean` | Loading conversations / messages. |
| `error` | `string \| null` | Error message. |

**Actions:**

- **Conversations:** `setConversations()`, `addConversation()`, `updateConversation()`, `removeConversation()`, `fetchConversations()`, `createConversation(userId)`.
- **Messages:** `setMessages()`, `addMessage()`, `updateMessage()`, `markMessageAsRead()`, `markConversationAsRead()`, `fetchMessages(conversationId)`.
- **Selection:** `setSelectedChat(chat)`.
- **WebSocket:** `connect()`, `disconnect()`, `sendMessage(data)`, `joinChatRoom(conversationId)`, `leaveChatRoom(conversationId)`.
- **UI:** `setConnectionStatus()`, `setLoading()`, `setLoadingMessages()`, `setError()`, `clearError()`, `reset()`, `clearConversations()`.

**Persisted:** Subset of state (e.g. conversations/selection) via `persist` `partialize`; messages often not persisted.

**Used by:** Chat page, conversation list, message list, send box, WebSocket lifecycle.

---

## Summary

- **Stores** = Zustand state + actions; they don’t replace the API, they call it and then update state.
- **auth** = who is logged in and whether we’re still initializing.
- **auth-modal** = which auth modal is open.
- **profile** = profile data, stats, recent content, tab, and profile/journey actions for the profile page.
- **journey** = journey list, current/detailed journey, filters, search, and all journey CRUD/detailed actions.
- **chat** = conversations, messages, selected chat, and WebSocket/API for chat.

Use the right store in the right screen (e.g. profile page → `useProfileStore` + `useJourneyStore`; chat page → `useChatStore`; layout → `useAuthStore` + `useAuthModalStore`).
