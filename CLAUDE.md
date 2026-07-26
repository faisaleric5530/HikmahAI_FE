# HikmahAI — Claude Code Reference

Islamic knowledge platform: AI chat, Q&A channels, and scholar-authored blogs.

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
    channelsApi.ts        # fetchChannels, fetchQuestions, postQuestion
    blogsApi.ts           # fetchBlogs, fetchBlogById, createBlog, updateBlog, deleteBlog
    chatApi.ts            # sendChatMessage
    mockData.ts           # All mock data (channels, blogs, chat replies)
  services/
    apiService.ts         # useApiService() hook — React-aware HTTP layer (useMemo, token, 401 nav)
  components/
    BackButton/           # Shared back-navigation button
    BlogCard/             # Blog card (regular + featured variant)
    ChatBubble/           # Individual chat message bubble
    Footer/               # App footer (HikmahLogoIcon + copyright)
    Header/               # Sticky top nav (logo, nav links, theme toggle, auth actions)
    Icons/
      HikmahLogoIcon.tsx  # SVG logo: mosque dome + crescent + star + open book (teal)
      MosqueIcon.tsx      # SVG mosque silhouette for Channels nav icon
    QuestionThread/       # Q&A thread with replies
    Skeletons/            # GridSkeleton, ListSkeleton loading states
  hooks/
    useAuth.ts
    useBlogs.ts
    useChannels.ts        # useChannels() + useChannelDetail()
    useChat.ts
    useSessionIntegrity.ts
  i18n/
    en.json               # All UI strings
  pages/
    Auth/                 # SignIn, SignUp — split-panel auth layout
    Blogs/
      BlogList/           # Featured hero card + color-accented grid
      BlogDetail/
      BlogEditor/         # Editorial sticky-topbar card layout
    Channels/
      ChannelsLayout.tsx  # Split-panel parent route (sidebar + <Outlet>)
      ChannelsLayout.scss
      ChannelDetail/      # Right-panel: join gate → WhatsApp-style Q&A input
      ChannelList/        # Standalone list page (unused in routing, kept)
      AskQuestion/        # Right-panel question form
    Chat/                 # AI chat with collapsible history sidebar
    Home/                 # Landing page
    ScholarApplication/   # Scholar credential submission (hero + steps + form card)
  store/
    useAuthStore.ts       # AuthUser (id, name, email, role, accessToken?), isAuthenticated, logout
    useUIStore.ts         # theme: 'light' | 'dark', toggleTheme()
    useChatStore.ts       # sessions[], activeSessionId, newSession/loadSession/deleteSession
    useBlogStore.ts
    useChannelStore.ts
  styles/
    index.scss            # Global utilities, button classes, semantic tokens
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
// App.tsx — nested routes
<Route path="/"                    element={<Home />} />
<Route path="/sign-in"             element={<SignIn />} />
<Route path="/sign-up"             element={<SignUp />} />
<Route path="/chat"                element={<Chat />} />

// Channels: split-panel layout (WhatsApp-style)
<Route path="/channels"            element={<ChannelsLayout />}>
  <Route path=":id"                element={<ChannelDetail />} />
  <Route path=":id/ask"            element={<AskQuestion />} />
</Route>

<Route path="/blogs"               element={<BlogList />} />
<Route path="/blogs/new"           element={<BlogEditor />} />
<Route path="/blogs/:id"           element={<BlogDetail />} />
<Route path="/scholar-application" element={<ScholarApplication />} />
```

### Footer visibility — `App.tsx`

Footer is hidden on full-height pages AND auth pages:

```ts
const isFullHeight = location.pathname === '/chat' || location.pathname.startsWith('/channels')
const isAuthPage   = location.pathname === '/sign-in' || location.pathname === '/sign-up'

// in JSX:
{!isFullHeight && !isAuthPage && <Footer />}
```

- `isFullHeight` routes: no footer, `main` gets `overflow: hidden; minHeight: 0`.
- `isAuthPage` routes: no footer, auth layout fills viewport with `height: calc(100dvh - 60px)`.

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

```tsx
// App.tsx — applies/removes class on <html>
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}, [theme])
```

Tailwind v4 `@theme {}` compiles to `:root` — overriding with `html.dark {}` is the correct pattern. Do NOT invert Tailwind's own variables directly.

---

## Key Components

### Header (`src/components/Header/Header.tsx`)

- Grid layout: `grid-template-columns: 1fr auto 1fr` — logo left, nav center, actions right.
- Logo: `HikmahLogoIcon` (30px) + "Hikmah AI" text.
- Nav (desktop, ≥640px): Chat · Hikmah Channels · Blogs — shown only when authenticated.
- Channels nav icon: custom `MosqueIcon` SVG.
- Actions: theme toggle (Sun/Moon), user button (→ scholar application), sign-out, mobile hamburger.
- Mobile menu: slides down from top, closes on route change / Escape.

### Footer (`src/components/Footer/Footer.tsx`)

- Simple one-line footer: `HikmahLogoIcon` (26px) + "Hikmah AI" left, copyright text right.
- Hidden on `/chat`, `/channels/*`, `/sign-in`, and `/sign-up`.

### HikmahLogoIcon (`src/components/Icons/HikmahLogoIcon.tsx`)

SVG inline component. Props: `size` (default 32), `className`.  
Shapes: teal mosque dome (`#1BA09A`), white crescent moon (evenodd fill), white 4-pointed star, teal open book pages, dark spine (`#0D8077`).  
Also used as `public/favicon.svg`.

### MosqueIcon (`src/components/Icons/MosqueIcon.tsx`)

Lucide-style stroke SVG. Props: `size`, `className`. Used in Channels nav link and ChannelsLayout sidebar header.

---

## Auth Pages (`/sign-in`, `/sign-up`)

**Two-column split layout** — left branding panel (hidden <860px) + right scrollable form panel.

### Left branding panel (`.auth-panel`)

Dark green gradient: `linear-gradient(150deg, #0D2B1E → #1B4332 → #2D6A4F → #3D8A68)` — always hardcoded, never inverts with theme.

Layers (z-index order):
1. `.auth-panel-deco` — dot grid texture (absolute, z:0)
2. `.auth-panel-glow` — radial gradient glow blobs (absolute, z:0)
3. `.auth-panel-content` — all readable content (relative, z:1)

Content structure inside `.auth-panel-content`:
```tsx
<div className="auth-panel-brand">      // horizontal: logo tile + name/tagline stack
  <div className="auth-panel-logo">     // 48px glass tile with HikmahLogoIcon
  <div>
    <h2 className="auth-panel-name">    // Montserrat 1.25rem 800 white
    <p className="auth-panel-tagline">  // Inter 0.75rem uppercase letter-spaced white/50
<div className="auth-panel-headline">
  <h3 className="auth-panel-headline-text">  // 2rem/800 white
  <p className="auth-panel-headline-sub">    // Poppins 0.9375rem white/60
<ul className="auth-panel-features">
  <li className="auth-panel-feature">
    <span className="auth-panel-feature-check">  // 20px circle with Check icon
    feature text
<blockquote className="auth-panel-quote">   // italic with left accent border
```

### Right form panel (`.auth-form-panel`)

- `flex: 1; overflow-y: auto` — scrolls internally if card is taller than viewport.
- Contains `.auth-card` (max-width: 24rem, border-radius: 24px, surface bg + shadow).
- `.auth-back-home` — HikmahLogoIcon + "Hikmah AI" link, visible only on mobile (<860px).

### Auth layout sizing

```scss
.auth-layout {
  height: calc(100dvh - 60px);  // exactly fills viewport minus header
  overflow: hidden;              // prevents layout overflow
}
```

---

## Chat Page (`/chat`)

Split layout: collapsible left sidebar + right chat panel.

**Sidebar (260px):**
- Header row: `PanelLeft` toggle button (leftmost) + "HISTORY" label + "New Chat" button.
- Scrollable session list (title + relative date + delete button).
- Desktop collapse: `width: 0; border-right-color: transparent` (smooth transition).
- Initial state from `window.matchMedia('(min-width: 860px)').matches`.

**Sidebar toggle behavior:**
- Toggle button lives in the sidebar header — always visible when sidebar is open.
- When sidebar is closed, a fixed `.chat-mobile-open-btn` appears at `top: 72px; left: 12px` on ALL screen sizes (not just mobile). This is the only way to reopen the sidebar.
- `handleNewChat` / `handleLoadSession` only close the sidebar on mobile (checked via `window.matchMedia`).

**Chat main:**
- Empty state with suggestion chips (4 Islamic topics)
- `ChatBubble` messages (user right, AI left)
- Typing indicator (3 animated dots)
- Auto-growing textarea, Enter to send / Shift+Enter for newline

**Session persistence (`useChatStore`):**
- Max 20 sessions in `localStorage` key `hikmah-chat-sessions`
- Auto-title from first user message (≤50 chars)
- `newSession()` saves current before clearing
- `loadSession(id)` restores messages from stored session

---

## Channels Section (`/channels/*`)

**WhatsApp Web-style split panel** implemented via React Router nested routes.

### ChannelsLayout (parent route)

Left sidebar (320px fixed, scrollable):
- "Hikmah Channels" header + `MosqueIcon` + channel count badge
- Search input — filters by name or description
- `ChannelCard` list using `NavLink` (active state highlights selected channel)

Right panel (flex: 1):
- `/channels` → "Select a Channel" empty state
- `/channels/:id` → `<ChannelDetail />` via `<Outlet />`
- `/channels/:id/ask` → `<AskQuestion />` via `<Outlet />`

Mobile (≤859px):
- At `/channels`: full-screen sidebar, panel hidden
- At `/channels/:id`: sidebar hidden, full-screen panel + "← All Channels" button

### ChannelCard (`src/components/ChannelCard/ChannelCard.tsx`)

Uses `NavLink` (not `Link`) — active class `channel-row-active` applied when channel is selected.

Layout (WhatsApp row style):
```
[52px avatar circle]  [Name (bold, top row)       ]
                      [Description (gray)  [count●]]
```
Count badge is a colored pill, bottom-right — mimics WhatsApp unread count.
6 color variants: green · blue · amber · purple · orange · teal.

### ChannelDetail (right panel)

**Join gate**: users see a join screen before they can post. Join state is persisted per-channel in `localStorage` key `hikmah-joined-channels`.

- **Not joined**: renders `.channel-join-screen` — `MosqueIcon` icon tile + title + desc + green "Join Channel" button (`UserPlus` icon). On join: saves ID to localStorage, sets `isJoined = true`, shows toast.
- **Joined**: full panel with:
  - `.channel-detail-head` — channel name + desc + "Ask Question" button
  - `.channel-detail-body` — scrollable `questions-list`
  - `.channel-detail-input-area` — bottom input bar (pill textarea + circular send button)

Input bar matches WhatsApp style: `border-radius: 24px` textarea, circular `border-radius: 50%` send button with gradient background.

### AskQuestion (right panel)

- `ask-panel-back` button → `navigate('/channels/:id')` (returns to detail panel).
- Formik form: title + body fields with Yup validation.

---

## Blogs Page (`/blogs`)

**Editorial magazine layout** — max-width 80rem.

First article → **featured hero card** (full width):
- 6px left green accent bar
- Large title (1.625rem, 800 weight)
- 3-line excerpt at 0.9375rem
- "Featured Article" badge (pill with BookOpen icon)
- 32px author avatar

Remaining articles → **color-accented grid** (2→3→4 col):
- Each card has a 4px top color bar cycling through 6 accent colors
- `--card-accent` CSS variable set per-card via inline style

```ts
// BlogList.tsx
const [featured, ...rest] = blogs
// rest[i] gets ACCENT_COLORS[i % ACCENT_COLORS.length]
```

### Blog Detail (`/blogs/:id`)

- `.blog-article-body` has `overflow-wrap: break-word; word-break: break-word` to prevent horizontal scroll from long unbroken strings.

### Blog Editor (`/blogs/new`)

**Editorial layout** with sticky topbar + centered card:

- **Topbar** (`position: sticky`): `grid-template-columns: 1fr auto 1fr` — back button left, "New Article" title center, empty right.
- **Card** (`.blog-editor-card`): surface bg, border, border-radius: 20px.
  - `.blog-editor-title-input` — large Montserrat 1.375rem borderless input for article title.
  - Separator line.
  - `.blog-editor-body-input` — Poppins 0.9375rem tall textarea, min-height: 24rem.
- **Bottom actions bar**: note text left + Publish button right.

---

## Scholar Application (`/scholar-application`)

**Three-section layout**: back button → hero banner → process steps → form card.

### Hero banner (`.scholar-hero`)

Dark green gradient matching auth panel (`#0D2B1E → #1B4332 → #2D6A4F`), dot-grid deco overlay, glass icon tile (58px), title + description.

### Process steps (`.scholar-steps`)

Horizontal flex row of 3 steps: **Apply → Review → Verified**.

Each step: circular icon (primary-light bg), step number label, step title, step description. Connector lines between steps via `.scholar-step-connector` (absolute positioned 1px line).

### Form card (`.scholar-form-card`)

Surface bg card with titled header (card title + desc, separated by border-bottom) and the Formik form inside. Form footer: note text left + "Submit Application" button right.

Back button uses `navigate(-1)` (not hardcoded path).

---

## Form Styles (`src/styles/form.scss`)

Globally imported via `src/styles/index.scss` → `src/index.css`. Applies to all pages.

Key patterns:

```scss
.form-field {
  background-color: var(--color-input-bg);   // warm off-white in light, dark green in dark
  border: 1.5px solid var(--color-border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);  // subtle depth vs card
  border-radius: 10px;
}

.form-field-pass-wrap {
  position: relative;
  width: 100%;                               // must be 100% to anchor eye toggle correctly
  .form-field { padding-right: 2.75rem; }   // make room for toggle
}

.form-pass-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
}
```

Dark mode focus ring uses `rgba(82, 183, 136, 0.15)` (not the light-mode `rgba(45, 106, 79, 0.12)`).

Autofill override trick: `-webkit-box-shadow: 0 0 0 1000px var(--color-input-bg) inset !important` prevents browser yellow autofill background.

---

## Global SCSS Utilities (`src/styles/index.scss`)

Key reusable classes:

```scss
.page-head          /* flex row, icon + title + desc */
.page-head-row      /* space-between row for page head + action button */
.page-head-icon     /* colored icon in page header */
.page-head-title    /* Montserrat 1.5rem 700 */
.page-head-desc     /* Poppins 0.875rem secondary */

.btn-primary        /* inline-flex green button — flex-wrap:nowrap, white-space:nowrap, svg{flex-shrink:0} */
.btn-primary-sm     /* small green button with icon */
.btn-secondary      /* outlined secondary button */
.btn-ghost          /* transparent ghost button */
.btn-fresh          /* no-style base button reset */

.empty-state        /* centered empty state with icon + title + desc */
.empty-state-icon

.badge-green / .badge-amber / .badge-blue / .badge-purple   /* role/topic badges */

.card               /* surface card with border, border-radius: 16px, hover shadow */
.section-divider    /* 1px subtle horizontal rule */
```

**`.btn-primary` arrow wrapping prevention:**
```scss
.btn-primary {
  display: inline-flex;
  flex-wrap: nowrap;       // never wrap to second line
  white-space: nowrap;     // never wrap text content
  svg { flex-shrink: 0; } // prevent SVG icons from shrinking/wrapping
}
```

### Btn-primary hover shadow

Uses `color-mix()` for theme-aware shadow (works in both light and dark modes):
```scss
box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 40%, transparent);
```

---

## Home Page (`/`)

### Feature cards (`.home-feature-card`)

Title and arrow icon are in a shared flex row — **do not** separate them:

```tsx
<div className="home-feature-title-row">   // display:flex, align-items:center, justify-content:space-between
  <h3 className="home-feature-title">{title}</h3>
  <ArrowRight size={15} className="home-feature-arrow" />
</div>
```

### Hero CTA + CTA footer buttons

Both use `.btn-primary` which has `flex-wrap: nowrap` and `svg { flex-shrink: 0 }` to keep text and `ArrowRight` icon on the same row at all viewport sizes.

---

## Animations

Defined in `src/styles/index.scss` and component SCSS:

| Name | Usage |
|---|---|
| `fadeInUp` | Chat empty state, typing indicator entrance |
| `typing-bounce` | Chat typing indicator dots |
| `spin` | Chat send button spinner, blog editor publish spinner |
| `bounce-cta` | Home page hero CTA button (pauses on hover) |

---

## i18n Keys (`src/i18n/en.json`)

Key translations relevant to features built:

```json
{
  "nav.chat":       "Hikmah AI Chat",
  "nav.channels":   "Hikmah Channels",
  "nav.blogs":      "Blogs",
  "nav.signIn":     "Sign In",
  "nav.signUp":     "Sign Up",
  "chat.title":     "Hikmah AI Chat",
  "chat.welcome":   "...",
  "chat.placeholder": "Ask a question...",
  "channels.title": "Hikmah Channels",
  "channels.askQuestion": "Ask Question",
  "channels.noQuestions": "No questions yet",
  "blogs.title":    "Blogs",
  "blogs.newPost":  "New Post",
  "blogs.noBlogs":  "No articles yet"
}
```

---

## API Service Layer

### Architecture overview

Two complementary layers handle all HTTP:

| Layer | File | Context | Use for |
|---|---|---|---|
| Module-level instance | `src/api/axiosInstance.ts` | Any (non-hook) | Domain API files, one-off calls outside React |
| React hook | `src/services/apiService.ts` | Hook / component only | Components and custom hooks needing 401 navigation |

### `useApiService` hook (`src/services/apiService.ts`)

Mirrors the CRM's `CustomApiServices()` pattern. Must be called inside a React component or hook.

```ts
const { getRequest, postRequest, putRequest, patchRequest, deleteRequest } = useApiService()
```

Internals:
- **`useMemo`** — Axios instance is re-created only when `user?.accessToken` changes.
- **Request interceptor** — attaches `Authorization: Bearer <accessToken>` from Zustand auth store.
- **Response interceptor** — on 401: calls `logout()` then `navigate('/sign-in')`.
- All methods are **TypeScript generic**: `getRequest<Channel[]>('/channels')` returns `Promise<Channel[]>`.

```ts
// Full method signatures
getRequest<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>
postRequest<T>(endpoint: string, data?: unknown): Promise<T>
putRequest<T>(endpoint: string, data?: unknown): Promise<T>
patchRequest<T>(endpoint: string, data?: unknown): Promise<T>
deleteRequest<T>(endpoint: string): Promise<T>
```

### `axiosInstance` (`src/api/axiosInstance.ts`)

Module-level singleton. Token is injected via `useAuthStore.getState()` (Zustand's escape hatch — works outside React). On 401, it fires `window.dispatchEvent(new CustomEvent('auth:unauthorized'))` instead of navigating (navigation requires a hook).

### Domain API files (`src/api/`)

Each domain file (`authApi.ts`, `channelsApi.ts`, `blogsApi.ts`, `chatApi.ts`) uses a single flag:

```ts
const USE_MOCK = !import.meta.env.VITE_API_BASE_URL
```

- **`VITE_API_BASE_URL` not set** → uses mock data with `setTimeout` delays (development default).
- **`VITE_API_BASE_URL` set** → makes real HTTP calls via `axiosInstance`. Token is injected automatically.

No code changes needed to switch between mock and real — just set the env var.

### API endpoints (real mode)

| Domain file | Method | Endpoint |
|---|---|---|
| `authApi` | POST | `/auth/login` |
| `authApi` | GET | `/auth/me` |
| `authApi` | POST | `/auth/scholar-application` |
| `channelsApi` | GET | `/channels` |
| `channelsApi` | GET | `/channels/:id/questions` |
| `channelsApi` | POST | `/channels/:id/questions` |
| `blogsApi` | GET | `/blogs` |
| `blogsApi` | GET | `/blogs/:id` |
| `blogsApi` | POST | `/blogs` |
| `blogsApi` | PUT | `/blogs/:id` |
| `blogsApi` | DELETE | `/blogs/:id` |
| `chatApi` | POST | `/chat/message` |

### Auth token flow

`AuthUser` in `useAuthStore` carries an optional `accessToken?: string`. When real login is implemented, store the JWT there:

```ts
setUser({ id, name, email, role, accessToken: jwt })
```

Both `axiosInstance` and `useApiService` pick it up automatically — no extra wiring needed.

### Environment variables

```
VITE_API_BASE_URL=https://your-api.com    # set to enable real HTTP; omit for mock mode
```

---

## Coding Conventions

- **SCSS over Tailwind** for all component-level styles. Tailwind used only for utility classes in JSX and the `@theme` token block.
- **CSS variables** for all colors — never hardcode hex in component SCSS (exception: brand gradients that must always be green regardless of theme, e.g. auth panel, scholar hero, channel join button).
- **BEM-inspired naming**: `.component-element`, `.component-element-modifier`.
- **No `!important`** except in Tailwind overrides and the autofill hack in form.scss.
- **No comments** in code unless the WHY is non-obvious.
- **No max-width** on panel-embedded components — the layout controls width.
- Icon-only buttons always have `aria-label`.
- Form fields always have visible `<label>` — no placeholder-only labels.
- Password fields always use `.form-field-pass-wrap` (position: relative, width: 100%) wrapping the input and `.form-pass-toggle` (position: absolute) for the eye toggle.

---

## Do Not

- Do not add `max-width` to components rendered inside `ChannelsLayout`'s right panel — the panel handles its own width.
- Do not render `<Footer />` on `/chat`, `/channels/*`, `/sign-in`, or `/sign-up` routes — controlled by `isFullHeight` and `isAuthPage` in `App.tsx`.
- Do not use `height: calc(100dvh - 60px)` in full-height pages like Chat/Channels — use `height: 100%` and let `App.tsx` set `100dvh` on the wrapper. Auth layout is the exception (it uses `calc(100dvh - 60px)` intentionally).
- Do not use `Link` in `ChannelCard` — it must be `NavLink` for active state highlighting in the sidebar.
- Do not add dark mode colors by hardcoding hex — add a token pair to `:root {}` and `html.dark {}` in `index.css`.
- Do not set `background-color: white` or `background-color: var(--color-surface)` on form fields — use `var(--color-input-bg)` so they're visually distinct from card backgrounds.
- Do not omit `flex-wrap: nowrap` / `svg { flex-shrink: 0 }` from buttons that contain an icon — arrows will wrap to a new line without it.
- Do not render the ChannelDetail input bar for users who haven't joined — check the `hikmah-joined-channels` localStorage key first.
- Do not call `useApiService()` outside a React component or hook — use `axiosInstance` directly for module-level API calls.
- Do not hardcode auth tokens or set `Authorization` headers manually in domain API files — `axiosInstance` injects the token automatically via its request interceptor.
- Do not add new API endpoints to `axiosInstance.ts` — that file is infrastructure only. All endpoint logic belongs in the domain API files under `src/api/`.
