# HikmahAI Frontend — Claude Code Reference

Islamic knowledge platform: AI chat, Q&A channels, scholar-authored blogs, and direct messaging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | SCSS modules + Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v6 (nested routes) |
| Forms | Formik + Yup |
| Icons | Lucide React + custom SVG components |
| i18n | react-i18next |
| Notifications | react-toastify |
| HTTP | Axios |
| Fonts | Inter · Montserrat · Poppins (Google Fonts) |

---

## Project Structure

```
src/
  api/
    axiosInstance.ts      # Module-level Axios instance (token injected via Zustand .getState())
    authApi.ts            # login, fetchCurrentUser, applyForScholar — mock or real HTTP
    channelsApi.ts        # fetchChannels, fetchQuestions, postQuestion, postReply, markReplyVerified
    blogsApi.ts           # fetchBlogs, fetchBlogById, createBlog, updateBlog, deleteBlog
    chatApi.ts            # sendChatMessage
    dmApi.ts              # startConversation, listConversations, listMessages, sendDmMessage, markConversationRead
    userApi.ts            # updatePreferences (hashIdentity)
    mockData.ts           # All mock data (channels, blogs, chat replies)
  services/
    apiService.ts         # useApiService() hook — React-aware HTTP layer (useMemo, token, 401 nav)
  components/
    AdminGuard.tsx        # Role guard: redirects non-admins to /
    BackButton/           # Shared back-navigation button
    BlogCard/             # Blog card (regular + featured variant)
    ChatBubble/           # Individual chat message bubble (with channel suggestion + DM button)
    Footer/               # App footer (HikmahLogoIcon + copyright)
    Header/               # Sticky top nav (logo, nav links, theme toggle, auth actions, unread badge)
    Icons/
      HikmahLogoIcon.tsx  # SVG logo: mosque dome + crescent + star + open book (teal)
      MosqueIcon.tsx      # SVG mosque silhouette for Channels nav icon
    QuestionThread/       # Q&A thread with replies, reply form, verify button, Message Scholar button
    Skeletons/            # GridSkeleton, ListSkeleton loading states
  hooks/
    useAuth.ts
    useBlogs.ts
    useChannels.ts        # useChannels() + useChannelDetail() — includes submitReply, verifyReply
    useChat.ts
    useDm.ts              # useConversations() (30s poll) + useConversationMessages() (10s poll)
    useSessionIntegrity.ts
  i18n/
    en.json               # All UI strings
  pages/
    Admin/
      ScholarApplications/ # Admin review UI — filter tabs, approve/reject modal with reviewer note
    Auth/                 # SignIn (always redirects to /chat), SignUp — split-panel auth layout
    Blogs/
      BlogList/           # Featured hero card + color-accented grid
      BlogDetail/
      BlogEditor/         # Editorial sticky-topbar card layout
    Channels/
      ChannelsLayout.tsx  # Split-panel parent route (sidebar + <Outlet>)
      ChannelDetail/      # Right-panel: join gate → Q&A input + reply threads
      ChannelList/        # Standalone list page (unused in routing, kept)
      AskQuestion/        # Right-panel question form
    Chat/                 # AI chat with collapsible history sidebar + channel suggestion chips
    Home/                 # Landing page
    Messages/
      MessagesLayout.tsx  # Split-panel DM layout (sidebar + <Outlet>), polls conversations every 30s
      MessageDetail/      # Conversation view — message bubbles + input bar, polls every 10s
    Profile/              # User profile card + Hash My Identity toggle (users) + scholar badge
    ScholarApplication/   # 3-branch: pending view | rejected view (re-apply) | fresh form
  store/
    useAuthStore.ts       # AuthUser (id, name, email, role, hashIdentity?, accessToken?), isAuthenticated
    useUIStore.ts         # theme: 'light' | 'dark', toggleTheme()
    useChatStore.ts       # sessions[], activeSessionId, newSession/loadSession/deleteSession
    useBlogStore.ts
    useChannelStore.ts    # channels[], questions[], Reply has authorPublicId
    useDmStore.ts         # conversations[], totalUnread (derived sum of unreadCount)
  styles/
    index.scss            # Global utilities, button classes, semantic tokens (.btn-danger, .badge-red added)
    form.scss             # Form field styles (globally imported)
  App.tsx                 # Root layout + route definitions
  main.tsx
  index.css               # Tailwind @theme block + :root tokens + html.dark overrides
public/
  favicon.svg             # Hikmah logo icon (mosque dome + crescent + book)
```

---

## Routing

```tsx
// App.tsx — nested routes (all protected by RequireAuth unless noted)
<Route path="/"                         element={<Home />} />           // public
<Route path="/sign-in"                  element={<SignIn />} />          // public
<Route path="/sign-up"                  element={<SignUp />} />          // public
<Route path="/chat"                     element={<Chat />} />

// Channels: split-panel layout (WhatsApp-style)
<Route path="/channels"                 element={<ChannelsLayout />}>
  <Route path=":id"                     element={<ChannelDetail />} />
  <Route path=":id/ask"                 element={<AskQuestion />} />
</Route>

// Direct Messages: split-panel layout (mirrors Channels)
<Route path="/messages"                 element={<MessagesLayout />}>
  <Route path=":conversationId"         element={<MessageDetail />} />
</Route>

<Route path="/blogs"                    element={<BlogList />} />
<Route path="/blogs/new"               element={<BlogEditor />} />
<Route path="/blogs/:id"               element={<BlogDetail />} />
<Route path="/profile"                 element={<Profile />} />
<Route path="/scholar-application"     element={<ScholarApplication />} />
<Route path="/admin/scholar-applications" element={<AdminGuard><AdminScholarApplications /></AdminGuard>} />
```

### Footer / full-height logic — `App.tsx`

```ts
const isFullHeight =
  location.pathname === '/chat' ||
  location.pathname.startsWith('/channels') ||
  location.pathname.startsWith('/messages')

const isAuthPage = location.pathname === '/sign-in' || location.pathname === '/sign-up'
```

- `isFullHeight` routes: no footer, `main` gets `overflow: hidden; minHeight: 0`.
- `isAuthPage` routes: no footer, auth layout fills viewport with `height: calc(100dvh - 60px)`.
- After login, always navigates to `/chat` (no "from" redirect).

---

## Design System

### CSS Custom Properties

All design tokens live in `src/index.css`.

**Light mode** defaults in `:root {}`.
**Dark mode** overrides in `html.dark {}` (class toggled on `document.documentElement`).

Key tokens:

```css
/* Backgrounds */
--color-bg              /* page background: #FAF8F5 / dark: #0F1812 */
--color-surface         /* card / sidebar: #FFFFFF / dark: #162018 */
--color-surface-hover   /* hover state for surface items */
--color-header-bg       /* frosted glass header */

/* Text */
--color-text-primary
--color-text-secondary
--color-text-tertiary
--color-text-muted
--color-text-placeholder

/* Brand */
--color-primary         /* forest green: #2D6A4F light / #52B788 dark */
--color-primary-dark
--color-primary-light   /* tinted bg for badges / active states */
--color-primary-xlight

/* Borders */
--color-border
--color-border-subtle
--color-border-hover

/* Semantic */
--color-danger          /* #C44545 light / #E07070 dark */

/* Form inputs — DISTINCT from card surface */
--color-input-bg        /* #F5F2EE light / #1C2E22 dark — warm off-white vs white card */
--color-input-bg-focus  /* #F9F7F4 light / #203426 dark */

/* Channel card color pairs (bg + count-bg × 6 variants) */
--channel-green-bg, --channel-green-count-bg
--channel-blue-bg,  --channel-blue-count-bg
--channel-amber-bg, --channel-amber-count-bg
--channel-purple-bg, --channel-purple-count-bg
--channel-orange-bg, --channel-orange-count-bg
--channel-teal-bg,  --channel-teal-count-bg
```

### Typography

| Family | Usage |
|---|---|
| `"Montserrat"` | Headings, logo text, page titles |
| `"Inter"` | Body text, labels, nav links, meta |
| `"Poppins"` | Descriptions, subtitles, excerpts |

### Dark Mode

Theme state lives in `useUIStore`. Toggle button in the header.

```ts
// useUIStore.ts — persists to localStorage as 'hikmah-theme'
// Reads system preference via prefers-color-scheme on first load
```

Tailwind v4 `@theme {}` compiles to `:root` — overriding with `html.dark {}` is the correct pattern.

---

## Key Components

### Header (`src/components/Header/Header.tsx`)

- Grid layout: `grid-template-columns: 1fr auto 1fr` — logo left, nav center, actions right.
- Nav (desktop ≥640px): Chat · Channels · **Messages** (with red unread badge) · Blogs
- Messages badge reads `useDmStore(s => s.totalUnread)` — shown as red pill on nav link.
- `.nav-link-badge` — small red circle, `var(--color-danger)` background.
- User button always navigates to `/profile`.
- Admin users see "Applications" link → `/admin/scholar-applications`.

### AdminGuard (`src/components/AdminGuard.tsx`)

Wraps admin-only routes. Redirects to `/` if `user.role !== 'admin'`.

### QuestionThread (`src/components/QuestionThread/QuestionThread.tsx`)

Props: `question`, `onReply`, `onVerify`.

- Renders question body + meta + all replies.
- **Reply form** (collapsible, hidden for question authors — `user.id === question.authorPublicId`).
- **Verify button** — shown to scholars/admins on unverified replies.
- **Message Scholar button** — shown only when:
  1. Current user is not a scholar/admin
  2. Reply author is a scholar
  3. `user.id === question.authorPublicId` (only the question asker can DM)
  - Calls `startConversation(reply.authorPublicId)` → navigates to `/messages/:id`

### ChatBubble (`src/components/ChatBubble/ChatBubble.tsx`)

- Renders user/assistant message bubbles.
- For assistant messages with `suggestedChannel`: renders channel suggestion button.
  - Reads `hikmah-joined-channels` from localStorage to determine label:
    - **Already joined** → `MessageSquare` icon + "Ask in #ChannelName"
    - **Not joined** → `UserPlus` icon + "Join #ChannelName"
  - On click: writes `hikmah-channel-prefill` to sessionStorage, then navigates.

---

## Chat → Channel Prefill Flow

When AI recommends a channel, the user's query is carried across navigation via sessionStorage.

**Key:** `hikmah-channel-prefill`
**Shape:** `{ channelId: string, query: string }`

Flow:
1. `ChatBubble` writes to sessionStorage on channel button click
2. `ChannelDetail` reads on mount (`useEffect([id])`) — verifies `channelId` matches
3. Already joined → `autoPostQuery()` fires immediately
4. Not joined → join screen shown; after join, `useEffect([isJoined, pendingQuery])` fires `autoPostQuery()`
5. `autoPostQuery` calls `submitQuestion` → on failure, pre-fills textarea + focus

---

## Channels Section (`/channels/*`)

### ChannelDetail

**Join gate** — join state in `localStorage` key `hikmah-joined-channels` (array of channel UUIDs).

After joining, shows:
- Questions list (each as `QuestionThread`)
- Bottom input bar for posting new questions

**Author name fix:** `useChannelDetail.loadQuestions` replaces `authorName` with real name for the current user's own questions/replies (backend may return hashed name for `hash_identity` users).

### Question / Reply data shape

```ts
interface Question {
  id, channelId, title, body, authorName, authorPublicId?, createdAt, isVerifiedAnswer, replies: Reply[]
}

interface Reply {
  id, questionId, body, authorName, authorPublicId?, authorRole: 'user'|'scholar', isVerifiedAnswer, createdAt
}
```

`authorPublicId` is the backend `public_id` of the author. Used for:
- "Message Scholar" gate: `user.id === question.authorPublicId`
- Self-reply gate: `user.id !== question.authorPublicId`
- Own name display: `r.authorPublicId === user.id → r.authorName = user.name`

---

## Direct Messages (`/messages/*`)

Split panel identical in structure to Channels.

### State

- `useDmStore` — `conversations[]`, `totalUnread` (derived from sum of `unreadCount`)
- `useConversations()` — polls every 30s, updates store
- `useConversationMessages(conversationId)` — polls every 10s, auto marks-read on load

### DmConversation shape

```ts
{
  id, otherUserId, otherUserName, otherUserRole: 'user'|'scholar',
  lastMessage: string|null, lastMessageAt: string, unreadCount: number
}
```

### DmMessage shape

```ts
{ id, conversationId, senderId, body, isRead, createdAt }
```

`senderId` is the backend `public_id` — compared against `user.id` to determine bubble alignment.

### Entry point

"Message Scholar" button in `QuestionThread` → `startConversation(reply.authorPublicId)` → navigate to `/messages/:conversationId`.

---

## User Profile (`/profile`)

- Profile card: avatar initial, name, email, role badge.
- **Hash My Identity toggle** (users only): calls `PATCH /users/me/preferences { hashIdentity }` — when enabled, the user's name appears as `Anon#xxxx` in all channel questions/replies (SHA-1 of their public_id, first 4 hex chars). Masking is applied at read time on the backend so toggling immediately affects all posts.
- Scholar application CTA (users only) / Verified badge (scholars).
- Scholar users cannot toggle hash identity — if they had it enabled before approval, it resets on approval.

---

## Scholar Application (`/scholar-application`)

**3-branch render based on existing application status:**

1. **`ScholarPendingView`** — amber hero, shows submitted date, "Under Review" state.
2. **`ScholarRejectedView`** — red hero, shows `reviewerNote` in amber blockquote, pre-filled resubmit form.
3. **`ScholarFormView`** — standard fresh application form.

---

## Admin (`/admin/scholar-applications`)

- Filter tabs: All / Pending / Approved / Rejected
- Application cards with left color border by status
- Approve button → `PATCH /scholar-applications/:id { status: 'approved' }`
- Reject → modal with textarea (max 500 chars) → sends `reviewerNote`

---

## Auth Pages

**Login always redirects to `/chat`** — `from` redirect is intentionally ignored.

---

## API Service Layer

### Architecture

| Layer | File | Use for |
|---|---|---|
| Module-level | `src/api/axiosInstance.ts` | Domain API files, outside React |
| React hook | `src/services/apiService.ts` | Components/hooks needing 401 navigation |

### `USE_MOCK` pattern

All domain API files have:
```ts
const USE_MOCK = !import.meta.env.VITE_API_BASE_URL
```
Set `VITE_API_BASE_URL` to enable real HTTP — no code changes needed.

### Response unwrapping

Backend wraps responses as `{ status, message, data }`. API files unwrap:
```ts
return (response.data as any).data ?? response.data
```

---

## localStorage Keys

| Key | Contents |
|---|---|
| `hikmah-auth-user` | Serialized `AuthUser` including `accessToken` |
| `hikmah-theme` | `'light'` \| `'dark'` |
| `hikmah-chat-sessions` | Array of chat sessions (max 20) |
| `hikmah-joined-channels` | Array of channel UUIDs the user has joined |

## sessionStorage Keys

| Key | Contents | Lifetime |
|---|---|---|
| `hikmah-channel-prefill` | `{ channelId, query }` | Written on channel button click, read + cleared on ChannelDetail mount |

---

## Coding Conventions

- **SCSS over Tailwind** for all component-level styles.
- **CSS variables** for all colors — never hardcode hex in component SCSS (exception: brand gradients).
- **BEM-inspired naming**: `.component-element`, `.component-element-modifier`.
- **No `!important`** except in Tailwind overrides and the autofill hack.
- **No comments** unless the WHY is non-obvious.
- **No `max-width`** on panel-embedded components — the layout controls width.
- Icon-only buttons always have `aria-label`.
- Form fields always have visible `<label>`.

---

## Do Not

- Do not add `max-width` to components inside `ChannelsLayout` or `MessagesLayout` right panels.
- Do not render `<Footer />` on `/chat`, `/channels/*`, `/messages/*`, `/sign-in`, `/sign-up`.
- Do not use `height: calc(100dvh - 60px)` in full-height pages — use `height: 100%`. Auth layout is the only exception.
- Do not use `Link` in `ChannelCard` — it must be `NavLink`.
- Do not hardcode hex colors in SCSS — add token pairs to `:root` and `html.dark`.
- Do not set `background-color: var(--color-surface)` on form fields — use `var(--color-input-bg)`.
- Do not call `useApiService()` outside a React component or hook.
- Do not show "Message Scholar" button to scholars or to users who didn't ask the question.
- Do not show the reply form for the question's own author (`user.id === question.authorPublicId`).
- Do not redirect to `location.state.from` after login — always go to `/chat`.
