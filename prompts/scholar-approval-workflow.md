# Scholar Approval Workflow — Implementation Plan

**Scope:** Admin review screen + scholar status/resubmit screen + backend `reviewer_note` support.

---

## Current State

| What | Status |
|---|---|
| `POST /scholar-applications` | Done — user submits application |
| `GET /scholar-applications/me` | Done — scholar checks own status |
| `GET /scholar-applications?status=` | Done — admin lists all applications |
| `PATCH /scholar-applications/:id` | Done — admin approves/rejects (`status` only) |
| `reviewer_note` (rejection reason) | **Missing** — no column in DB, not in service |
| Admin review UI | **Missing** |
| Scholar status/resubmit UI | **Partial** — current page shows form only, no status check |
| Re-submission flow | **Partial** — backend allows it (no pending = can resubmit), FE doesn't expose it |

---

## Full Workflow

```
USER submits application via /scholar-application
          ↓
  status = 'pending'
          ↓
ADMIN opens /admin/scholar-applications
  → sees pending list
  → clicks Approve → status = 'approved', user.role → 'scholar'
  → clicks Reject  → modal asks for reason → status = 'rejected' + reviewer_note stored
          ↓
USER revisits /scholar-application
  [pending]  → "Under Review" status card — no form
  [rejected] → rejection reason shown + pre-filled form to resubmit
  [approved] → page guard redirects (role is no longer 'user')
```

---

## Part 1 — Backend Changes (HikmahAI_Server)

### 1.1 New migration — add `reviewer_note` column

**File:** `database/migrations/XXXXXX-add-reviewer-note-to-scholar-application.js`

```js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('scholar_application', 'reviewer_note', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('scholar_application', 'reviewer_note');
  },
};
```

> Run: `npm run migrate`

### 1.2 Update `toPublicApplication` mapper

**File:** `server/services/scholar-application-service.js`

```js
const toPublicApplication = (application) => ({
  id:           application.public_id,
  fullName:     application.full_name,
  qualifications: application.qualifications,
  ijazah:       application.ijazah,
  status:       application.status,
  reviewerNote: application.reviewer_note ?? null,   // ← add this
  reviewedAt:   application.reviewed_at,
  createdAt:    application.created_at,
  updatedAt:    application.updated_at,
});
```

### 1.3 Update `review` service to store `reviewer_note`

**File:** `server/services/scholar-application-service.js`

```js
// Change signature:
const review = async ({ applicationId, reviewerPublicId, status, reviewerNote }) => {
  // ...
  await application.update(
    {
      status,
      reviewed_by:   reviewerPublicId,
      reviewed_at:   new Date(),
      reviewer_note: reviewerNote ?? null,   // ← add this
    },
    { transaction }
  );
  // rest unchanged
};
```

### 1.4 Update `review` controller to pass `reviewerNote`

**File:** `server/controllers/scholar-application-controller.js`

```js
static review = async (req, res) => {
  try {
    const response = await scholarApplicationService.review({
      applicationId:    req.params.applicationId,
      reviewerPublicId: req.user.publicId,
      status:           req.body.status,
      reviewerNote:     req.body.reviewerNote ?? null,   // ← add this
    });
    return sendResponse(res, 'success', { message: 'Application reviewed successfully', data: response });
  } catch (err) {
    return throwErrorResponse(req, res, err);
  }
};
```

### 1.5 Update Zod review schema

**File:** `server/schema/scholar-applications/` (find the review schema file)

```js
// Add optional reviewerNote field:
reviewerNote: z.string().max(500).optional(),
```

### 1.6 Update `scholar_application` Sequelize model

**File:** `database/models/scholar_application.js`

```js
reviewer_note: { type: DataTypes.TEXT, allowNull: true },
```

---

## Part 2 — Frontend API Layer (HikmahAI_FE)

### 2.1 Update `src/api/scholarApplicationApi.ts`

Add `reviewerNote` to the `ScholarApplication` type and add the two missing API functions:

```ts
export interface ScholarApplication {
  id:             string
  fullName:       string
  qualifications: string
  ijazah?:        string
  status:         'pending' | 'approved' | 'rejected'
  reviewerNote:   string | null     // ← add
  reviewedAt:     string | null
  createdAt:      string
  updatedAt:      string
  // present only in admin list response:
  applicant?: {
    id:    string
    name:  string
    email: string
  }
}

// Admin: list all applications (optionally filtered by status)
export async function fetchAllScholarApplications(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ScholarApplication[]> {
  const params = status ? { status } : {}
  const response = await axiosInstance.get<ScholarApplication[]>('/scholar-applications', { params })
  return response.data
}

// Admin: approve or reject an application
export async function reviewScholarApplication(
  id: string,
  status: 'approved' | 'rejected',
  reviewerNote?: string
): Promise<ScholarApplication> {
  const response = await axiosInstance.patch<ScholarApplication>(
    `/scholar-applications/${id}`,
    { status, reviewerNote }
  )
  return response.data
}
```

---

## Part 3 — Admin Screen (HikmahAI_FE)

### 3.1 New route

**File:** `src/App.tsx`

```tsx
import { AdminScholarApplications } from '@/pages/Admin/ScholarApplications/AdminScholarApplications'

// Add inside routes, protected:
<Route path="/admin/scholar-applications" element={<AdminScholarApplications />} />
```

### 3.2 Admin nav link in Header

**File:** `src/components/Header/Header.tsx`

```tsx
// Add to header-actions, visible only for admin:
{user?.role === 'admin' && (
  <Link to="/admin/scholar-applications" className="header-sign-in header-sign-in-desktop">
    Applications
  </Link>
)}
```

Also add to the mobile menu nav links for admin:
```tsx
{user?.role === 'admin' && (
  <Link to="/admin/scholar-applications" className="mobile-nav-link">
    <GraduationCap size={16} />
    <span>Scholar Applications</span>
  </Link>
)}
```

### 3.3 New page: `src/pages/Admin/ScholarApplications/`

**Files to create:**
- `AdminScholarApplications.tsx`
- `AdminScholarApplications.scss`

#### Layout

```
┌─────────────────────────────────────────────────────┐
│  [GraduationCap icon]  Scholar Applications          │
│  Review and manage scholar credential requests       │
├─────────────────────────────────────────────────────┤
│  [ All ] [ Pending (n) ] [ Approved ] [ Rejected ]  │  ← filter tabs
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │ [Avatar]  Faisal Ahmed          [PENDING]    │   │  ← application card
│  │           faisal@email.com                   │   │
│  │           "I studied at Al-Azhar for 5..."   │   │
│  │           Submitted: 26 Jul 2026             │   │
│  │           [ ✓ Approve ]  [ ✗ Reject ]        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### Component structure

```tsx
export function AdminScholarApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<ScholarApplication[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; applicationId: string | null }>({
    open: false, applicationId: null
  })
  const [rejectNote, setRejectNote] = useState('')
  const [isActing, setIsActing] = useState(false)

  // Guard: admin only
  if (user?.role !== 'admin') return <Navigate to="/" />

  // Load on tab change
  useEffect(() => { loadApplications() }, [activeTab])

  const loadApplications = async () => { ... }
  const handleApprove = async (id: string) => { ... }
  const handleReject = async () => { ... }  // uses rejectModal.applicationId + rejectNote

  return (
    <div className="admin-applications-page">
      <div className="page-head"> ... </div>
      <div className="admin-app-tabs"> ... </div>
      {isLoading ? <ListSkeleton /> : (
        applications.length === 0
          ? <div className="empty-state">No applications</div>
          : applications.map(app => <ApplicationCard key={app.id} ... />)
      )}
      {rejectModal.open && <RejectModal ... />}
    </div>
  )
}
```

#### Application card states

| Status | Actions shown |
|---|---|
| `pending` | "Approve" (green) + "Reject" (red outline) buttons |
| `approved` | Green "Approved" badge — no actions |
| `rejected` | Red "Rejected" badge + reviewer note shown — no actions |

#### Reject modal

```
┌──────────────────────────────────────┐
│  Reject Application                  │
│  ─────────────────────────────────── │
│  Reason for rejection (optional)     │
│  ┌────────────────────────────────┐  │
│  │ textarea (max 500 chars)       │  │
│  └────────────────────────────────┘  │
│            [ Cancel ] [ Reject ]     │
└──────────────────────────────────────┘
```

- Uses `.form-field` + `.form-textarea` for the textarea (matches existing form styles)
- Modal backdrop: `position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1100`
- Modal card: `var(--color-surface)` background, `border-radius: 16px`, max-width 28rem
- Reject button: `.btn-danger` (new class needed — `background: var(--color-danger); color: #fff`)

---

## Part 4 — Scholar Status / Resubmit Screen (HikmahAI_FE)

Update the existing `src/pages/ScholarApplication/ScholarApplication.tsx`.

### 4.1 Logic change

On mount, call `fetchMyScholarApplication()` and branch on the result:

```
fetchMyScholarApplication()
         ↓
  null or no data → show submission form (first time)
         ↓
  status = 'pending' → show "Under Review" card
         ↓
  status = 'rejected' → show rejection reason + pre-filled resubmit form
         ↓
  status = 'approved' → handled by existing role guard (redirects away)
```

### 4.2 "Under Review" state

```
┌──────────────────────────────────────────────────────┐
│  [Clock icon — amber]                                │
│  Your application is under review                    │
│  Submitted on 26 Jul 2026                            │
│                                                      │
│  ─── Your submitted details ───                      │
│  Full Name:        Faisal Ahmed                      │
│  Qualifications:   "I studied at Al-Azhar for 5..."  │
│  Ijazah:           "Ijazah in Quran recitation"      │
│                                                      │
│  We'll notify you once a decision has been made.     │
└──────────────────────────────────────────────────────┘
```

- Use amber/warning color for the Clock icon tile (same glass tile style as hero icon)
- No form, no submit button — read-only display of submitted data

### 4.3 "Rejected — Resubmit" state

```
┌──────────────────────────────────────────────────────┐
│  [XCircle icon — red]                                │
│  Your application was not approved                   │
│  Reviewed on 26 Jul 2026                             │
│                                                      │
│  Admin feedback:                                     │
│  "Please provide more detail about your ijazah..."   │
│                                                      │
│  ─── Update and resubmit ───                         │
│  [Full Name field — pre-filled]                      │
│  [Qualifications textarea — pre-filled]              │
│  [Ijazah textarea — pre-filled]                      │
│                               [ Resubmit Application ]│
└──────────────────────────────────────────────────────┘
```

- Red XCircle icon tile in the hero section
- Reviewer note shown in a styled blockquote (amber left border, italic)
- Formik form pre-filled with previous application values
- On submit: calls `applyForScholar()` (same `POST /scholar-applications` endpoint — backend allows resubmit when no pending exists)
- After success: re-fetch `fetchMyScholarApplication()` to show the new pending state

### 4.4 State management in the component

```tsx
export function ScholarApplication() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [existingApp, setExistingApp] = useState<ScholarApplication | null>(null)
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'user') {
      fetchMyScholarApplication()
        .then(setExistingApp)
        .finally(() => setAppLoading(false))
    } else {
      setAppLoading(false)
    }
  }, [user])

  // role guard (non-user) — existing
  if (!user || user.role !== 'user') { ... }

  if (appLoading) return <div className="scholar-page"><GridSkeleton count={2} /></div>

  // Branch on existingApp status
  if (existingApp?.status === 'pending') return <ScholarPendingView app={existingApp} />
  if (existingApp?.status === 'rejected') return <ScholarRejectedView app={existingApp} onResubmit={...} />

  // Default: show form (first time or after approved and re-registered somehow)
  return <ScholarFormView user={user} onSuccess={...} />
}
```

Split into three sub-views (can be in the same file as internal components):
- `ScholarPendingView` — read-only status card
- `ScholarRejectedView` — rejection reason + pre-filled Formik form
- `ScholarFormView` — original form (extracted from current implementation)

---

## Part 5 — Routing Guard Utility

Create a small guard component to avoid duplicating the admin check:

**File:** `src/components/AdminGuard.tsx`

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user?.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}
```

Use in App.tsx:
```tsx
<Route
  path="/admin/scholar-applications"
  element={<AdminGuard><AdminScholarApplications /></AdminGuard>}
/>
```

---

## Full Execution Order

| # | Task | Where | Notes |
|---|---|---|---|
| 1 | Add `reviewer_note` migration | `HikmahAI_Server` | Run `npm run migrate` after |
| 2 | Update `scholar_application` model | `HikmahAI_Server` | Add `reviewer_note` field |
| 3 | Update `toPublicApplication` mapper | `HikmahAI_Server` | Include `reviewerNote` in output |
| 4 | Update `review` service + controller | `HikmahAI_Server` | Accept + store `reviewerNote` |
| 5 | Update Zod review schema | `HikmahAI_Server` | Add optional `reviewerNote` |
| 6 | Update `scholarApplicationApi.ts` | `HikmahAI_FE` | Add type field + 2 new functions |
| 7 | Create `AdminGuard` component | `HikmahAI_FE` | Reusable role guard |
| 8 | Build `AdminScholarApplications` page + SCSS | `HikmahAI_FE` | Tabs + cards + reject modal |
| 9 | Add admin route to `App.tsx` | `HikmahAI_FE` | Wrapped in `AdminGuard` |
| 10 | Add "Applications" link in `Header` | `HikmahAI_FE` | Desktop + mobile, admin only |
| 11 | Refactor `ScholarApplication.tsx` | `HikmahAI_FE` | Add status check on mount, 3 branches |
| 12 | Smoke test full cycle | Both | Submit → pending → reject → resubmit → approve |

---

## API Reference (all endpoints used by this feature)

| Method | Endpoint | Auth | Body / Params |
|---|---|---|---|
| `POST` | `/scholar-applications` | user | `{ fullName, qualifications, ijazah? }` |
| `GET` | `/scholar-applications/me` | user | — |
| `GET` | `/scholar-applications` | admin | `?status=pending\|approved\|rejected` |
| `PATCH` | `/scholar-applications/:id` | admin | `{ status: 'approved'\|'rejected', reviewerNote? }` |

---

## Styling Notes

Follow existing patterns from `ScholarApplication.scss` and `index.scss`:

- Filter tabs: pill buttons, active tab uses `var(--color-primary)` bg + white text
- Application card: `.card` base class + `border-left: 4px solid` colored by status (amber = pending, green = approved, red = rejected)
- Status badge: reuse `.badge-green` / `.badge-amber` for approved/pending; add `.badge-red` mirroring badge-amber pattern with `var(--color-danger)` colors
- Reject modal: same surface + border pattern as `.blog-editor-card`
- Pending/rejected hero icons in ScholarApplication: use `amber` and `danger` colors from CSS tokens — never hardcode hex
- `.btn-danger`: `background: var(--color-danger); color: #fff` — add to `index.scss` alongside existing button classes
