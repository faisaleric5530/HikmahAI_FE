# Chat → Channel Auto-Prefill Workflow

**Scope:** When Hikmah AI suggests a channel, clicking "Join Channel" carries the user's
original query into that channel and pre-fills (then auto-posts) it after joining.

---

## Current State

| What | Status |
|---|---|
| AI emits `[[CHANNEL: slug]]` tag | Done |
| `ChatBubble` renders "Join Channel" button | Done — navigates to `/channels/:id` |
| `ChannelDetail` join gate (join → Q&A) | Done |
| User query carried across navigation | **Missing** |
| Auto-prefill input after join | **Missing** |
| Auto-post after join | **Missing** |

---

## Full Workflow

```
USER sends message in AI chat
        ↓
AI responds with [[CHANNEL: marriage-family]]
        ↓
ChatBubble renders "Join Channel" button
        ↓
USER clicks button
  → save { channelId, query: userMessage } to sessionStorage
  → navigate('/channels/:id')
        ↓
ChannelDetail mounts
  reads sessionStorage → finds pending query for this channel
        ↓
  [already joined] → pre-fill input with query + banner + auto-submit
        ↓
  [not yet joined] → show join screen
        → user clicks "Join Channel"
        → handleJoin() runs
        → THEN auto-submit the saved query
        ↓
Query posted as a question in the channel
sessionStorage key cleared
```

---

## Part 1 — State Transfer (sessionStorage)

**Key:** `hikmah-channel-prefill`

**Shape:**
```ts
interface ChannelPrefill {
  channelId: string   // channel public_id — used to verify we're on the right channel
  query: string       // the user's original AI chat message
}
```

Write before navigating, read on mount in `ChannelDetail`, clear after use.

Why sessionStorage (not URL params, not Zustand):
- URL params expose the query in the address bar and complicate deep-linking
- Zustand resets on page refresh; sessionStorage survives the navigation cleanly
- Single tab scope — exactly right for this hand-off

---

## Part 2 — Changes to `ChatBubble`

**File:** `src/components/ChatBubble/ChatBubble.tsx`

### 2.1 Add `userQuery` prop

```tsx
interface ChatBubbleProps {
  message: ChatMessage
  userQuery?: string   // ← add: content of the user message just before this one
}
```

### 2.2 Write sessionStorage on channel button click

```tsx
onClick={() => {
  if (userQuery) {
    sessionStorage.setItem(
      'hikmah-channel-prefill',
      JSON.stringify({ channelId: message.suggestedChannel!.id, query: userQuery })
    )
  }
  navigate(`/channels/${message.suggestedChannel!.id}`)
}}
```

---

## Part 3 — Changes to `Chat.tsx`

**File:** `src/pages/Chat/Chat.tsx`

Pass the preceding user message content as `userQuery` to each assistant `ChatBubble`:

```tsx
{messages.map((msg, i) => (
  <ChatBubble
    key={msg.id}
    message={msg}
    userQuery={
      msg.role === 'assistant' && i > 0 && messages[i - 1].role === 'user'
        ? messages[i - 1].content
        : undefined
    }
  />
))}
```

No store changes needed — everything is resolved at render time from the messages array.

---

## Part 4 — Changes to `ChannelDetail.tsx`

**File:** `src/pages/Channels/ChannelDetail/ChannelDetail.tsx`

### 4.1 Read prefill on mount

```tsx
const [pendingQuery, setPendingQuery] = useState<string | null>(null)

useEffect(() => {
  if (!id) return
  try {
    const raw = sessionStorage.getItem('hikmah-channel-prefill')
    if (!raw) return
    const prefill = JSON.parse(raw) as { channelId: string; query: string }
    if (prefill.channelId === id) {
      setPendingQuery(prefill.query)
      sessionStorage.removeItem('hikmah-channel-prefill')
    }
  } catch {
    sessionStorage.removeItem('hikmah-channel-prefill')
  }
}, [id])
```

### 4.2 Pre-fill input when already joined

After the join state and questions are loaded, if `pendingQuery` is set and user is already
joined, pre-fill the input and auto-submit:

```tsx
useEffect(() => {
  if (isJoined && pendingQuery) {
    autoPostQuery(pendingQuery)
    setPendingQuery(null)
  }
}, [isJoined, pendingQuery])

const autoPostQuery = async (query: string) => {
  setIsSending(true)
  try {
    await submitQuestion(query.slice(0, 120), query)
    toast.success('Your question from AI Chat was posted!')
  } catch {
    // Fallback: just pre-fill the input so user can submit manually
    setInput(query)
    inputRef.current?.focus()
    toast.info('Your question is ready — press Enter to post.')
  } finally {
    setIsSending(false)
  }
}
```

### 4.3 Auto-post after joining (not yet joined)

In `handleJoin()`, after setting `isJoined = true`, trigger the pending query:

```tsx
const handleJoin = () => {
  const joined = getJoinedIds()
  if (id && !joined.includes(id)) {
    localStorage.setItem(JOINED_KEY, JSON.stringify([...joined, id]))
  }
  setIsJoined(true)
  toast.success(`Joined #${channel?.name ?? 'Channel'}!`)
  // pendingQuery useEffect fires on next render once isJoined flips
}
```

The `useEffect` on `[isJoined, pendingQuery]` handles the rest — no extra code in `handleJoin`.

---

## Part 5 — UX Details

### Banner (optional enhancement)
Show a subtle banner above the input when a prefill is pending:

```
┌─────────────────────────────────────────────────────┐
│  ✦ From your AI Chat conversation                   │
│  "My husband refuses to pay mahr — what..."         │  ← truncated query
└─────────────────────────────────────────────────────┘
```

Only shown briefly before auto-post fires. Helps user understand why a question
appeared without them typing.

### Failure fallback
If `submitQuestion` throws:
- Do NOT show an error toast and leave the user stranded
- Pre-fill `input` with the query and focus the textarea
- Show `toast.info('Your question is ready — press Enter to post.')`

### Toast sequencing
Join toast fires first → then auto-post fires ~300ms later (natural delay from
`useEffect` running after state flush). No manual `setTimeout` needed.

---

## Full Execution Order

| # | File | Change |
|---|---|---|
| 1 | `src/components/ChatBubble/ChatBubble.tsx` | Add `userQuery` prop; write sessionStorage on click |
| 2 | `src/pages/Chat/Chat.tsx` | Pass `userQuery={messages[i-1]?.content}` to assistant bubbles |
| 3 | `src/pages/Channels/ChannelDetail/ChannelDetail.tsx` | Read sessionStorage on mount; `pendingQuery` state; `autoPostQuery()`; `useEffect` on `[isJoined, pendingQuery]` |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| User navigates to channel without using AI chat link | `sessionStorage` is empty → no effect |
| User clicks channel link twice | sessionStorage cleared after first read → second mount is clean |
| `channelId` in storage doesn't match current channel | Mismatch check → ignore + clear |
| `submitQuestion` fails | Fallback to pre-fill + focus |
| User is already a member of the channel | `isJoined = true` on mount → `useEffect` fires immediately |
| Query is very long (> 120 chars) | `submitQuestion(query.slice(0, 120), query)` — short title, full body |
| User refreshes page mid-flow | sessionStorage survives refresh — pending query re-read on remount |

---

## What Does NOT Change

- The join gate UI — no changes to the join screen copy or layout
- The `postQuestion` API — uses the existing endpoint unchanged
- `useChatStore` — no new fields needed
- Routing — no new routes, no URL params
