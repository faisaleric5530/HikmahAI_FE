# Hikmah AI — Frontend Development Plan (MVP)
# Hikmah AI — Frontend Development Plan (MVP)

> Scope: **Frontend only.** Backend already exists separately and is consumed via API.
> AI chat responses are **mocked** for this phase — real model wiring happens once a backend proxy exists (never expose model API keys in frontend code).

---

## 1. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React (Vite recommended for speed over CRA) + TypeScript |
| State | Zustand |
| Styling | SCSS (per attached Sketchbox design system) + Bootstrap 5 grid |
| Forms | Formik + Yup (matches existing pattern) |
| i18n / RTL | react-i18next (English/Arabic, RTL support — matches existing pattern, and is genuinely relevant given multilingual chat) |
| Auth | **Clerk** (free tier, drop-in components, custom `role` metadata field: `user` / `scholar` / `admin`) — issues JWT your existing backend verifies |
| API layer | Axios instance with interceptors |
| Sanitization | DOMPurify (for blog/channel user-generated content) |
| Routing | React Router v6 |
| Notifications | react-toastify (matches existing pattern) |

---

## 2. Auth: Clerk Integration Plan

**Why Clerk for this MVP:** free tier is generous, has ready React components (`<SignIn/>`, `<SignUp/>`, `<UserButton/>`), and supports **custom public metadata** — perfect for storing `role: 'user' | 'scholar' | 'admin'` without building your own auth backend.

**Flow:**
1. Normal users self-register via Clerk's sign-up flow → default role `user` (set via metadata on creation, e.g. through a Clerk webhook or a first-login backend call).
2. Scholars **do not get the `scholar` role at signup.** They register as a normal user, then submit a verification request (credentials form) through the app → an admin manually approves → backend updates their Clerk metadata (or your own DB role, whichever your backend already tracks) to `scholar`.
3. Frontend reads `role` from the Clerk session/JWT claims on every load — **but never trusts this alone for anything sensitive** (like allowing a "post verified answer" action). The backend must independently check the role on every write, since a client-side role flag is only a UX convenience, not a security boundary.

**What to build in frontend:**
- `useAuth()` hook wrapping Clerk's `useUser()` / `useAuth()`, normalized into your own shape: `{ user, role, isScholar, isLoading, logout }`
- Route guards: `<PrivateRoute>` (must be logged in) and `<RoleRoute allow={['scholar']}>` (role-gated UI, not real security)
- A "Become a Verified Scholar" application form (Formik + Yup) for the credential-submission flow

---

## 3. Session Handling & "Checksum" Logic (Recommended Approach)

**Important framing for your team:** in a frontend-only architecture, this can only be a tamper-*evidence* mechanic, not real security. The backend must always re-validate role/permissions on every request — this logic exists purely to catch obvious client-side tampering early and improve UX (auto-logout/refresh), never to authorize anything by itself.

**Implementation:**
1. On successful login, cache a minimal session object in memory (Zustand, non-persisted store): `{ userId, role, issuedAt }`
2. Compute a simple hash of that object (e.g. SHA-256 via `crypto.subtle`) and store the hash alongside it in `sessionStorage` (not `localStorage` — cleared on tab close, smaller attack window)
3. On every app load / route change into a protected route, recompute the hash of the cached object and compare:
   - Match → proceed
   - Mismatch (someone hand-edited storage to escalate role, for example) → clear session, force re-login, silently re-fetch fresh session from Clerk/backend
4. Actual auth token (JWT) itself should live in memory where possible (Clerk handles this internally) — avoid manually persisting raw tokens in localStorage if Clerk's SDK already manages it securely.

```ts
// useSessionIntegrity.ts (sketch)
async function computeChecksum(session: SessionShape): Promise<string> {
  const data = new TextEncoder().encode(JSON.stringify(session));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}
```

---

## 4. Frontend Security Checklist (Basic, Frontend-Achievable)

- [ ] Sanitize all user-generated content (blog posts, channel questions/replies) with DOMPurify before rendering — never use raw `dangerouslySetInnerHTML`
- [ ] All API calls over HTTPS only; Axios instance should reject non-HTTPS base URLs outside local dev
- [ ] No API keys or secrets in frontend bundle — AI model key strictly server-side later
- [ ] Role-based UI hiding (`RoleRoute`) is UX only — every sensitive action's real check happens on the backend response, and frontend should gracefully handle a 403 even if the UI "shouldn't" have shown the option
- [ ] Rate-limit-friendly UX: disable submit buttons during in-flight requests to avoid accidental duplicate posts
- [ ] CSP headers / dependency audit are backend/hosting concerns — flag to your backend team, not solvable purely in frontend code

---

## 5. Folder Structure

```
src/
  api/
    axiosInstance.ts        // base config, interceptors (attach token, handle 401/403)
    authApi.ts
    channelsApi.ts
    blogsApi.ts
    chatApi.ts               // mocked for now
  assets/
    fonts/
    images/
  components/
    Header/
      Header.tsx
      Header.scss
    PrivateRoute/
    RoleRoute/
    ChatBubble/
    ChannelCard/
    QuestionThread/
    BlogCard/
    Skeletons/
  hooks/
    useAuth.ts
    useSessionIntegrity.ts
    useChannels.ts
    useBlogs.ts
    useChat.ts
    useRTL.ts
  store/
    useAuthStore.ts
    useChatStore.ts
    useChannelStore.ts
    useBlogStore.ts
    useUIStore.ts
  pages/
    Home/
    Chat/
    Channels/
      ChannelList/
      ChannelDetail/
      AskQuestion/
    Blogs/
      BlogList/
      BlogDetail/
      BlogEditor/
    ScholarApplication/
  styles/
    index.scss              // global resets, imports form.scss + fonts
    form.scss
    _variables.scss          // color tokens, breakpoints (from design system)
  i18n/
    en.json
    ar.json
    config.ts
  App.tsx
  main.tsx
```

---

## 6. Zustand Stores (Skeletons)

```ts
// store/useAuthStore.ts
interface AuthState {
  user: { id: string; name: string; role: 'user' | 'scholar' | 'admin' } | null;
  isLoading: boolean;
  setUser: (user: AuthState['user']) => void;
  logout: () => void;
}

// store/useChatStore.ts
interface ChatState {
  messages: { id: string; role: 'user' | 'assistant'; content: string; lang: string }[];
  isSending: boolean;
  sendMessage: (text: string) => Promise<void>; // mocked
}

// store/useChannelStore.ts
interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  questions: Question[];
  fetchChannels: () => Promise<void>;
  postQuestion: (channelId: string, body: string) => Promise<void>;
}

// store/useBlogStore.ts
interface BlogState {
  blogs: Blog[];
  fetchBlogs: () => Promise<void>;
  createBlog: (title: string, body: string) => Promise<void>;
}
```

---

## 7. Pages & Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Home — platform details, CTA to sign up/login |
| `/sign-in`, `/sign-up` | Public | Clerk auth components |
| `/chat` | Authenticated | AI chat (mock responses for now) |
| `/channels` | Authenticated | Channel list |
| `/channels/:id` | Authenticated | Question thread + ask question |
| `/blogs` | Authenticated | Blog feed |
| `/blogs/:id` | Authenticated | Blog detail |
| `/blogs/new` | Authenticated | Blog editor (any user role) |
| `/scholar-application` | Authenticated (role: user) | Submit credentials to request scholar verification |

**Header nav (post-auth):** AI Chat · Channels · Blogs · Profile/session menu (matches your spec — these three sections in header once authenticated)

---

## 8. AI Chat — Mock Mode Plan

- Simple chat-only UI: message list + input, no channel/thread complexity
- `chatApi.ts` returns a mocked async response (simulate latency with `setTimeout`) echoing back a canned multilingual-aware reply based on detected input language (can stub language detection client-side for now, e.g. via a lightweight library, real logic moves server-side later)
- Structure the mock response shape **exactly** as the real API will eventually return it, so swapping mock → real later is a one-line change in `chatApi.ts`, not a UI rewrite:
```ts
interface ChatResponse {
  reply: string;
  detectedLang: string;
  sources?: { type: 'quran' | 'hadith'; reference: string }[]; // empty for mock
}
```

---

## 9. Channels — "End to End" Flow (MVP scope)

1. User browses channel list (`GET /channels` from existing backend)
2. User opens a channel, sees question feed (`GET /channels/:id/questions`)
3. User posts a question (`POST /channels/:id/questions`)
4. Question detail view shows verified answers (tagged, top) + community discussion (below), per your earlier spec — frontend just renders what backend returns, tagged by `is_verified_answer` and `madhab_tag`
5. Scholar-only accounts see an "Answer as Verified Ulama" option, gated by `RoleRoute` (UX only — backend enforces the real check)

---

## 10. Blogs — Any User Can Publish

- Simple flow: list → detail → editor (title + rich text or markdown body)
- All authenticated users (regardless of role) can create/edit their own blogs
- Sanitize rendered blog body with DOMPurify before display
- No moderation queue in MVP scope — flag as a known gap if asked ("Phase 2: add admin review/flagging for published blogs")

---

## 11. Design System Application (from attached Sketchbox guide)

Reuse directly, adapted to Hikmah AI's context:

- **Fonts**: Montserrat (headings), Inter (forms/labels/prices-equivalent like metadata), Poppins (body/descriptions) — keep the same font-weight scale (400/500/600/700)
- **Component pattern**: `ComponentName.tsx` + co-located `ComponentName.scss`, imported inside the TSX file
- **RTL support**: reuse `i18n.dir() === 'rtl'` conditional class pattern — critical here since Arabic content is a real use case, not just decorative
- **Color palette**: adapt tokens rather than copy literally (e-commerce reds/greens may not fit a religious platform's tone) — recommend keeping the **structure** (primary/accent/status colors, dark/light backgrounds) but choosing a calmer palette (e.g., deep green/teal primary, muted neutrals) — happy to propose a specific adapted palette if useful
- **Responsive breakpoints**: reuse as-is (320–600px mobile, 768px tablet, 992px+ desktop, etc.)
- **Cards, buttons, form controls**: reuse the exact SCSS patterns documented (`.card_section`, `.custom_form_control`, button variants) for consistency and speed

---

## 12. Build Phases (Suggested Order)

| Phase | Deliverable |
|---|---|
| 1 | Project scaffold: Vite + TS + SCSS + Bootstrap + routing + folder structure |
| 2 | Clerk auth integration, `useAuth`, route guards, session checksum logic |
| 3 | Global layout: Header (Chat/Channels/Blogs nav), Home page, i18n/RTL wiring |
| 4 | AI Chat (mocked), matching final response shape |
| 5 | Channels: list → detail → ask question → verified/community answer split rendering |
| 6 | Blogs: list → detail → editor |
| 7 | Scholar application form + role-gated UI |
| 8 | Security pass: DOMPurify on all UGC, checksum edge cases, loading/error states, polish |

---

## 13. Open Items to Confirm With Backend Team

- Exact API response shapes for channels/questions/replies/blogs (so frontend types match)
- Whether backend verifies Clerk JWTs directly or expects a custom exchange step
- Where scholar role updates get written after admin approval (Clerk metadata vs. backend DB) — affects whether frontend re-reads role from Clerk or from a `/me` backend endpoint
