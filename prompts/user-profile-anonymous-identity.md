# User Profile & Anonymous Identity — Implementation Plan

**Scope:** Profile page + "Hash My Identity" toggle for channel anonymity + auto-reveal on scholar approval.

---

## Current State

| What | Status |
|---|---|
| `GET /auth/profile` | Done — returns `{ id, name, email, role }` |
| User model | Missing `hash_identity` column |
| Questions/Replies | `author_id` FK stored; `authorName` resolved via JOIN at read time |
| Profile page | Missing |
| Identity toggle | Missing |
| Scholar approval auto-reveal | Missing |

---

## Full Workflow

```
USER visits /profile
  → sees name, email, role
  → if role === 'user': sees "Hash My Identity" toggle
  → toggles ON → PATCH /users/me/preferences { hashIdentity: true }
  → future channel questions/replies show as "Anon#<4-char hash>"
  → toggle OFF → real name restored for all future reads

ADMIN approves scholar application
  → hash_identity reset to false automatically in same DB transaction
  → user's name revealed in all channels going forward

SCHOLAR visits /profile
  → no toggle shown (scholars always show real identity)
  → sees "Verified Scholar" badge
```

**Identity masking is read-time:** The backend checks `author.hash_identity` when
building the question/reply response. Changing the toggle instantly affects ALL
past and future posts (no data migration needed — name is always resolved from the
live user record via JOIN).

**Display format:** `"Anon#" + first 4 chars of SHA-1(user public_id)` — e.g. `Anon#3f9a`.
Deterministic so the same user is consistently identifiable across posts without
revealing who they are.

---

## Part 1 — Backend (HikmahAI_Server)

### 1.1 Migration — add `hash_identity` column

**File:** `database/migrations/20260726100007-add-hash-identity-to-user.js`

```js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'hash_identity', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('user', 'hash_identity');
  },
};
```

> Run: `npm run migrate`

### 1.2 Update user Sequelize model

**File:** `database/models/user.js`

```js
hash_identity: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
```

Add after `preferred_language`.

### 1.3 Include `hashIdentity` in auth profile response

**File:** wherever `toPublicUser` / profile mapper is defined (auth service or controller)

```js
// Add to the user object returned by GET /auth/profile and POST /auth/login:
hashIdentity: user.hash_identity ?? false,
```

### 1.4 New user preferences service

**File:** `server/services/user-service.js` (create if not exists)

```js
const { user: UserModel } = require('../../database');
const { APIError, ServiceErrorHandler } = require('../exceptions');

const updatePreferences = async ({ userPublicId, hashIdentity }) => {
  try {
    const user = await UserModel.findOne({ where: { public_id: userPublicId } });
    if (!user) throw APIError.NotFound('User not found');

    await user.update({ hash_identity: hashIdentity });
    return { hashIdentity: user.hash_identity };
  } catch (err) {
    if (err instanceof APIError) throw err;
    throw new ServiceErrorHandler(err, 'UserService::updatePreferences');
  }
};

module.exports = { updatePreferences };
```

### 1.5 New user preferences controller + route

**File:** `server/controllers/user-controller.js`

```js
static updatePreferences = async (req, res) => {
  try {
    const response = await userService.updatePreferences({
      userPublicId: req.user.publicId,
      hashIdentity: req.body.hashIdentity,
    });
    return sendResponse(res, 'success', { message: 'Preferences updated', data: response });
  } catch (err) {
    return throwErrorResponse(req, res, err);
  }
};
```

**Route:** `PATCH /users/me/preferences` (auth required, any role)

Zod schema:
```js
body: z.object({ hashIdentity: z.boolean() })
```

### 1.6 Mask author name in questions/replies service

**File:** `server/services/channel-service.js` (or wherever questions are fetched)

When building the question/reply response, check `author.hash_identity`:

```js
// Utility — add at top of file:
const crypto = require('crypto');
const maskName = (user) => {
  if (!user.hash_identity) return user.name;
  const hash = crypto.createHash('sha1').update(user.public_id).digest('hex');
  return `Anon#${hash.slice(0, 4)}`;
};

// Use in toPublicQuestion / toPublicReply:
authorName: maskName(question.author),
```

The Sequelize query already includes `{ model: UserModel, as: 'author', attributes: ['name', 'public_id', 'hash_identity', 'role'] }` (add `hash_identity` and `public_id` to the attributes list).

### 1.7 Auto-reveal on scholar approval

**File:** `server/services/scholar-application-service.js`

In the `review()` function, when `status === 'approved'`, add the reset:

```js
if (status === 'approved') {
  await UserModel.update(
    { role: 'scholar', hash_identity: false },   // ← add hash_identity: false
    { where: { public_id: application.user_id }, transaction }
  );
}
```

---

## Part 2 — Frontend API Layer (HikmahAI_FE)

### 2.1 Update `AuthUser` type

**File:** `src/store/useAuthStore.ts`

```ts
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  hashIdentity?: boolean   // ← add
  accessToken?: string
}
```

### 2.2 Update `authApi.ts` to carry `hashIdentity`

**File:** `src/api/authApi.ts`

```ts
interface AuthResponse {
  token: string
  user: { id: string; name: string; email: string; role: AuthUser['role']; hashIdentity?: boolean }
}

function toAuthUser(res: AuthResponse): AuthUser {
  return {
    id: res.user.id,
    name: res.user.name,
    email: res.user.email,
    role: res.user.role,
    hashIdentity: res.user.hashIdentity ?? false,
    accessToken: res.token,
  }
}
```

Also update `fetchCurrentUser()` to map `hashIdentity` from the profile response.

### 2.3 New `src/api/userApi.ts`

```ts
import axiosInstance from './axiosInstance'

export async function updatePreferences(hashIdentity: boolean): Promise<void> {
  await axiosInstance.patch('/users/me/preferences', { hashIdentity })
}
```

---

## Part 3 — Profile Page (HikmahAI_FE)

### 3.1 New route

**File:** `src/App.tsx`

```tsx
import { Profile } from '@/pages/Profile/Profile'

<Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
```

### 3.2 Header link

**File:** `src/components/Header/Header.tsx`

Change the user button: make the name/avatar a link to `/profile` instead of `/scholar-application`:

```tsx
// Desktop user button — change `to` destination:
<Link to="/profile" className="header-user-btn">
  <div className="header-avatar">{user?.name?.[0]?.toUpperCase()}</div>
  <span className="header-user-name">{user?.name}</span>
  {user?.role === 'scholar' && <span className="header-scholar-tag">Scholar</span>}
  {user?.role === 'admin' && <span className="header-scholar-tag">Admin</span>}
</Link>

// Mobile menu — add a "Profile" link:
<Link to="/profile" className="mobile-nav-link">
  <User size={16} />
  <span>Profile</span>
</Link>
```

Remove the separate "Become a Scholar" mobile link — move that CTA into the profile page instead.

### 3.3 New page: `src/pages/Profile/`

**Files to create:**
- `Profile.tsx`
- `Profile.scss`

#### Layout

```
┌──────────────────────────────────────────────────────┐
│  [User icon]  Profile                                │
│  Manage your account and privacy settings            │
├─────────────────────────────────────────────────────-│
│  ┌──────────────────────────────────────────────┐   │
│  │ [Avatar 48px]  Faisal Ahmed                  │   │
│  │                faisal@email.com              │   │
│  │                [USER badge]                  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌── Account Details ───────────────────────────┐   │
│  │  Name     Faisal Ahmed                       │   │
│  │  Email    faisal@email.com                   │   │
│  │  Role     User                               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌── Privacy ───────────────────────────────────┐   │  ← only for role === 'user'
│  │  Hash My Identity in Channels                │   │
│  │  Your posts appear as "Anon#xxxx" instead    │   │
│  │  of your real name in all channels.          │   │
│  │                           [ toggle ON/OFF ]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌── Scholar Application ───────────────────────┐   │  ← only for role === 'user'
│  │  Become a Verified Scholar →                 │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

#### Component structure

```tsx
export function Profile() {
  const { user, setUser } = useAuth()
  const [hashIdentity, setHashIdentity] = useState(user?.hashIdentity ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async () => {
    const next = !hashIdentity
    setIsUpdating(true)
    try {
      await updatePreferences(next)
      setHashIdentity(next)
      // Update cached user in store so toggle persists across nav:
      setUser({ ...user!, hashIdentity: next })
      toast.success(next ? 'Identity hidden in channels.' : 'Identity restored in channels.')
    } catch {
      toast.error('Failed to update preference.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="page-head">...</div>
      <ProfileCard user={user} />
      <AccountDetails user={user} />
      {user?.role === 'user' && (
        <>
          <PrivacySection
            hashIdentity={hashIdentity}
            onToggle={handleToggle}
            isUpdating={isUpdating}
          />
          <ScholarCTA />
        </>
      )}
      {user?.role === 'scholar' && <ScholarBadgeSection />}
    </div>
  )
}
```

#### Toggle design

```
┌─────────────────────────────────────────────────────┐
│  Hash My Identity in Channels                       │
│  Your posts appear as "Anon#xxxx" instead of        │
│  your real name. Changing this affects all past      │
│  and future posts instantly.                         │
│                                ┌──────────┐         │
│                                │ ●  ON    │         │ ← pill toggle, green when ON
│                                └──────────┘         │
└─────────────────────────────────────────────────────┘
```

- Toggle: `<button role="switch" aria-checked={hashIdentity}>` — CSS pill toggle, green when ON, border-only when OFF
- Disabled + spinner while `isUpdating`

---

## Part 4 — Styling Notes

Follow existing patterns:

- `.profile-page`: `max-width: 40rem`, centered, same padding as `ScholarApplication.scss`
- `.profile-card`: surface bg, border, border-radius 16px — avatar tile (48px, green gradient) + name + email + role badge
- `.profile-section`: surface bg, border, border-radius 16px, `padding: 1.25rem 1.5rem`, title row (`font-size: 0.875rem, font-weight: 700`) + content
- `.profile-toggle-row`: `display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem`
- `.profile-toggle`: pill button — `width: 44px; height: 24px; border-radius: 12px` — `background: var(--color-primary)` when ON, `border: 1.5px solid var(--color-border)` when OFF
- `.profile-toggle-knob`: `width: 18px; height: 18px; border-radius: 50%; background: white` — `transform: translateX(20px)` when ON, `translateX(2px)` when OFF
- Role badge: reuse `.badge .badge-green` for scholar, `.badge .badge-amber` for user, `.badge .badge-blue` for admin

---

## Full Execution Order

| # | Task | Where |
|---|---|---|
| 1 | Add `hash_identity` migration | `HikmahAI_Server` |
| 2 | Update user model | `HikmahAI_Server` |
| 3 | Add `hashIdentity` to auth/login/profile responses | `HikmahAI_Server` |
| 4 | Create user preferences service + controller + route | `HikmahAI_Server` |
| 5 | Mask author name in questions/replies at read time | `HikmahAI_Server` |
| 6 | Auto-reset `hash_identity` on scholar approval | `HikmahAI_Server` (scholar-application-service) |
| 7 | Add `hashIdentity` to `AuthUser` type | `HikmahAI_FE` |
| 8 | Update `authApi.ts` to carry `hashIdentity` | `HikmahAI_FE` |
| 9 | Create `src/api/userApi.ts` | `HikmahAI_FE` |
| 10 | Build `Profile.tsx` + `Profile.scss` | `HikmahAI_FE` |
| 11 | Add `/profile` route to `App.tsx` | `HikmahAI_FE` |
| 12 | Update Header user button → link to `/profile` | `HikmahAI_FE` |
| 13 | Smoke test: toggle ON → post question → see Anon#xxxx | Both |
| 14 | Smoke test: approve → identity auto-revealed | Both |

---

## API Reference

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| `GET` | `/auth/profile` | any | — (response now includes `hashIdentity`) |
| `PATCH` | `/users/me/preferences` | any | `{ hashIdentity: boolean }` |

---

## Key Design Decisions

| Decision | Reason |
|---|---|
| Read-time masking (not write-time) | Toggle change affects ALL past posts instantly — no DB backfill needed |
| Deterministic hash `Anon#xxxx` | Same user is consistently identifiable across posts without revealing identity |
| Scholars never see toggle | Scholars are verified — anonymity contradicts the trust model |
| Auto-reset on approval | Scholar identity must be real — remove the toggle silently when role upgrades |
| Profile page owns the scholar CTA | Cleans up the header user button (no more role-conditional `to` prop) |
