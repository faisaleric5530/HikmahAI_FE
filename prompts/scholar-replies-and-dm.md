# Scholar Replies & One-on-One DM — End-to-End Plan

**Features:**
1. Any authenticated user can reply to channel questions; scholars get a verified badge
2. Users can start a private one-on-one DM with a scholar directly from that scholar's channel reply

---

## Current State

| What | Status |
|---|---|
| `reply` model + `POST /questions/:id/replies` | ✅ Exists |
| `PATCH /replies/:id/verify` (scholar/admin) | ✅ Exists |
| Reply UI in QuestionThread | ❌ Missing |
| `authorPublicId` exposed on replies | ❌ Missing (needed for DM entry point) |
| DM model, routes, service | ❌ All missing |
| DM inbox + conversation UI | ❌ All missing |
| "Message Scholar" button in reply | ❌ Missing |
| Unread count badge in header | ❌ Missing |

---

## Feature 1 — Scholar / User Replies in Channels

### 1.1 Backend — expose replies in question list

`GET /channels/:channelId/questions` currently returns questions **without** replies.
Modify `channel-service.js` `listQuestions()` to JOIN replies so every question in the
channel list already carries its replies array.

**`channel-service.js` — `listQuestions()`:**

```js
const questions = await Question.findAll({
  where: { channel_id: channelId },
  include: [
    { model: User, as: 'author', attributes: ['name', 'public_id', 'hash_identity'] },
    {
      model: Reply,
      include: [
        { model: User, as: 'author', attributes: ['name', 'public_id', 'hash_identity', 'role'] },
      ],
    },
  ],
  order: [['created_at', 'DESC'], [Reply, 'created_at', 'ASC']],
})
return questions.map(toPublicQuestionWithReplies)
```

Add `toPublicQuestionWithReplies(question)`:
```js
function toPublicQuestionWithReplies(question) {
  const replies = (question.replies ?? []).map(toPublicReply)
  return {
    ...toPublicQuestion(question),
    isVerifiedAnswer: replies.some((r) => r.isVerifiedAnswer),
    replies,
  }
}
```

### 1.2 Backend — expose `authorPublicId` on replies

`toPublicReply` must include the author's `public_id` so the frontend can show
the "Message Scholar" button with the correct ID.

```js
function toPublicReply(reply) {
  return {
    id: reply.public_id,
    questionId: reply.question_id,
    body: reply.body,
    authorName: maskName(reply.author),
    authorPublicId: reply.author.public_id,   // ← ADD
    authorRole: reply.author.role,
    isVerifiedAnswer: reply.is_verified_answer,
    verifiedAt: reply.verified_at,
    createdAt: reply.created_at,
    updatedAt: reply.updated_at,
  }
}
```

### 1.3 Frontend — update store types

**`src/store/useChannelStore.ts`:**

```ts
interface Reply {
  id: string
  questionId: string
  body: string
  authorName: string
  authorPublicId: string       // ← ADD
  authorRole: 'user' | 'scholar'
  isVerifiedAnswer: boolean
  verifiedAt?: string
  createdAt: string
}
```

### 1.4 Frontend — add `postReply` to api + hook

**`src/api/channelsApi.ts` — add:**

```ts
export async function postReply(questionId: string, body: string): Promise<Reply> {
  // real mode: POST /questions/:questionId/replies
  // mock mode: return stub Reply
}
```

**`src/hooks/useChannels.ts` — `useChannelDetail()`:**

```ts
const submitReply = async (questionId: string, body: string) => {
  await postReply(questionId, body)
  await loadQuestions()           // refresh the list to pick up new reply
}
return { questions, isLoading, loadQuestions, submitQuestion, submitReply }
```

### 1.5 Frontend — reply input in QuestionThread

**`src/components/QuestionThread/QuestionThread.tsx`:**

Add a reply form below the replies list, inside each question card.
The form is collapsed by default; an "Add Reply" button expands it.

```tsx
const [showReplyForm, setShowReplyForm] = useState(false)
const [replyText, setReplyText] = useState('')
const [isSending, setIsSending] = useState(false)

const handleReply = async (e: React.FormEvent) => {
  e.preventDefault()
  const text = replyText.trim()
  if (!text || isSending) return
  setIsSending(true)
  try {
    await onReply(question.id, text)
    setReplyText('')
    setShowReplyForm(false)
    toast.success('Reply posted!')
  } catch {
    toast.error('Failed to post reply.')
  } finally {
    setIsSending(false)
  }
}
```

Props:
```ts
interface QuestionThreadProps {
  question: Question
  onReply: (questionId: string, body: string) => Promise<void>
}
```

Scholar badge stays on existing replies. On the "Message Scholar" button — see Feature 2 section.

**Passing `onReply` from ChannelDetail:**
```tsx
{questions.map((q) => (
  <QuestionThread key={q.id} question={q} onReply={submitReply} />
))}
```

### 1.6 UI Detail — Verify button

Only scholars see a "Mark as Verified" button on replies that are not yet verified.
Add a verify call in the hook; after verifying, reload questions.

```ts
const verifyReply = async (replyId: string) => {
  await markReplyVerified(replyId)   // PATCH /replies/:id/verify
  await loadQuestions()
}
```

---

## Feature 2 — One-on-One Scholar DM

### 2.1 Backend — new models

#### Migration 1: `create-dm-conversation`

```js
// database/migrations/TIMESTAMP-create-dm-conversation.js
const schema = process.env.DB_SCHEMA || 'hikmah'
await queryInterface.createTable(
  { tableName: 'dm_conversation', schema },
  {
    id:          { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    public_id:   { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, unique: true },
    user_id:     { type: Sequelize.UUID, allowNull: false },    // FK → user.public_id
    scholar_id:  { type: Sequelize.UUID, allowNull: false },    // FK → user.public_id
    created_at:  { type: Sequelize.DATE, allowNull: false },
    updated_at:  { type: Sequelize.DATE, allowNull: false },
  }
)
await queryInterface.addIndex(
  { tableName: 'dm_conversation', schema },
  ['user_id', 'scholar_id'],
  { unique: true, name: 'dm_conversation_pair_unique' }
)
```

#### Migration 2: `create-dm-message`

```js
// database/migrations/TIMESTAMP-create-dm-message.js
const schema = process.env.DB_SCHEMA || 'hikmah'
await queryInterface.createTable(
  { tableName: 'dm_message', schema },
  {
    id:              { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    public_id:       { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, unique: true },
    conversation_id: { type: Sequelize.UUID, allowNull: false },  // FK → dm_conversation.public_id
    sender_id:       { type: Sequelize.UUID, allowNull: false },  // FK → user.public_id
    body:            { type: Sequelize.TEXT, allowNull: false },
    is_read:         { type: Sequelize.BOOLEAN, defaultValue: false },
    created_at:      { type: Sequelize.DATE, allowNull: false },
    updated_at:      { type: Sequelize.DATE, allowNull: false },
  }
)
```

#### `database/models/dm_conversation.js`

```js
module.exports = (sequelize, DataTypes) => {
  const DmConversation = sequelize.define('dm_conversation', {
    public_id:  { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    user_id:    DataTypes.UUID,
    scholar_id: DataTypes.UUID,
  }, { underscored: true })

  DmConversation.associate = (models) => {
    DmConversation.belongsTo(models.user, { as: 'user',    foreignKey: 'user_id',    targetKey: 'public_id' })
    DmConversation.belongsTo(models.user, { as: 'scholar', foreignKey: 'scholar_id', targetKey: 'public_id' })
    DmConversation.hasMany(models.dm_message, { foreignKey: 'conversation_id', sourceKey: 'public_id' })
  }
  return DmConversation
}
```

#### `database/models/dm_message.js`

```js
module.exports = (sequelize, DataTypes) => {
  const DmMessage = sequelize.define('dm_message', {
    public_id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
    conversation_id: DataTypes.UUID,
    sender_id:       DataTypes.UUID,
    body:            DataTypes.TEXT,
    is_read:         { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { underscored: true })

  DmMessage.associate = (models) => {
    DmMessage.belongsTo(models.dm_conversation, { foreignKey: 'conversation_id', targetKey: 'public_id' })
    DmMessage.belongsTo(models.user, { as: 'sender', foreignKey: 'sender_id', targetKey: 'public_id' })
  }
  return DmMessage
}
```

Register both in `database/models/index.js`.

### 2.2 Backend — DM service

**`server/services/dm-service.js`:**

```js
const { dm_conversation, dm_message, user } = require('../../database/models')
const { Op } = require('sequelize')

function toPublicConversation(conv, myPublicId) {
  const other = conv.user_id === myPublicId ? conv.scholar : conv.user
  const lastMsg = conv.dm_messages?.[0]
  const unreadCount = (conv.dm_messages ?? []).filter(
    (m) => !m.is_read && m.sender_id !== myPublicId
  ).length
  return {
    id: conv.public_id,
    otherUserId: other.public_id,
    otherUserName: other.name,
    otherUserRole: other.role,
    lastMessage: lastMsg?.body ?? null,
    lastMessageAt: lastMsg?.created_at ?? conv.created_at,
    unreadCount,
  }
}

function toPublicMessage(msg) {
  return {
    id: msg.public_id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    body: msg.body,
    isRead: msg.is_read,
    createdAt: msg.created_at,
  }
}

async function startOrGetConversation(callerPublicId, scholarPublicId) {
  // Determine user_id / scholar_id order
  const scholar = await user.findOne({ where: { public_id: scholarPublicId } })
  if (!scholar || scholar.role !== 'scholar') throw new Error('Scholar not found')
  const caller = await user.findOne({ where: { public_id: callerPublicId } })

  // user_id is always the non-scholar; scholar_id is always the scholar
  const userId    = caller.role !== 'scholar' ? callerPublicId : scholarPublicId
  const scholId   = caller.role !== 'scholar' ? scholarPublicId : callerPublicId

  const [conv] = await dm_conversation.findOrCreate({
    where: { user_id: userId, scholar_id: scholId },
    defaults: { user_id: userId, scholar_id: scholId },
  })
  return { id: conv.public_id }
}

async function listConversations(myPublicId) {
  const conversations = await dm_conversation.findAll({
    where: { [Op.or]: [{ user_id: myPublicId }, { scholar_id: myPublicId }] },
    include: [
      { model: user, as: 'user',    attributes: ['public_id', 'name', 'role'] },
      { model: user, as: 'scholar', attributes: ['public_id', 'name', 'role'] },
      { model: dm_message, order: [['created_at', 'DESC']], limit: 1 },
    ],
    order: [[dm_message, 'created_at', 'DESC']],
  })
  return conversations.map((c) => toPublicConversation(c, myPublicId))
}

async function listMessages(conversationPublicId, myPublicId) {
  const conv = await dm_conversation.findOne({ where: { public_id: conversationPublicId } })
  if (!conv) throw new Error('Conversation not found')
  if (conv.user_id !== myPublicId && conv.scholar_id !== myPublicId) throw new Error('Forbidden')

  const messages = await dm_message.findAll({
    where: { conversation_id: conversationPublicId },
    order: [['created_at', 'ASC']],
  })
  return messages.map(toPublicMessage)
}

async function sendMessage(conversationPublicId, senderPublicId, body) {
  const conv = await dm_conversation.findOne({ where: { public_id: conversationPublicId } })
  if (!conv) throw new Error('Conversation not found')
  if (conv.user_id !== senderPublicId && conv.scholar_id !== senderPublicId) throw new Error('Forbidden')

  const msg = await dm_message.create({
    conversation_id: conversationPublicId,
    sender_id: senderPublicId,
    body,
  })
  return toPublicMessage(msg)
}

async function markAsRead(conversationPublicId, readerPublicId) {
  await dm_message.update(
    { is_read: true },
    {
      where: {
        conversation_id: conversationPublicId,
        sender_id: { [Op.ne]: readerPublicId },
        is_read: false,
      },
    }
  )
}
```

### 2.3 Backend — DM Zod schemas

**`server/schema/dms/start-conversation.js`:**
```js
const { z } = require('zod')
module.exports = { body: z.object({ scholarPublicId: z.string().uuid() }) }
```

**`server/schema/dms/send-message.js`:**
```js
const { z } = require('zod')
module.exports = { body: z.object({ body: z.string().min(1).max(2000) }) }
```

**`server/schema/dms/index.js`:**
```js
module.exports = {
  startConversation: require('./start-conversation'),
  sendMessage: require('./send-message'),
}
```

### 2.4 Backend — DM controller

**`server/controllers/dm-controller.js`:**

```js
const dmService = require('../services/dm-service')

const start = async (req, res) => {
  const conv = await dmService.startOrGetConversation(
    req.user.publicId, req.body.scholarPublicId
  )
  res.status(200).json(conv)
}

const list = async (req, res) => {
  const conversations = await dmService.listConversations(req.user.publicId)
  res.status(200).json(conversations)
}

const messages = async (req, res) => {
  const msgs = await dmService.listMessages(req.params.conversationId, req.user.publicId)
  res.status(200).json(msgs)
}

const send = async (req, res) => {
  const msg = await dmService.sendMessage(
    req.params.conversationId, req.user.publicId, req.body.body
  )
  res.status(201).json(msg)
}

const markRead = async (req, res) => {
  await dmService.markAsRead(req.params.conversationId, req.user.publicId)
  res.status(204).end()
}

module.exports = { start, list, messages, send, markRead }
```

### 2.5 Backend — DM routes

**`server/routes/dms.js`:**

```js
const { Router } = require('express')
const { validate } = require('../middleware/validate')
const { strictAuth } = require('../middleware/auth')
const dmSchemas = require('../schema/dms')
const dmController = require('../controllers/dm-controller')

const router = Router()
router.use(strictAuth)

router.post('/', validate(dmSchemas.startConversation), dmController.start)
router.get('/', dmController.list)
router.get('/:conversationId/messages', dmController.messages)
router.post('/:conversationId/messages', validate(dmSchemas.sendMessage), dmController.send)
router.patch('/:conversationId/read', dmController.markRead)

module.exports = router
```

Register in `server/utils/server.js`:
```js
const dmRouter = require('../routes/dms')
app.use('/api/v1/dms', dmRouter)
```

---

## Frontend Implementation

### 3.1 Types

**`src/api/dmApi.ts`:**

```ts
export interface DmConversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserRole: 'user' | 'scholar'
  lastMessage: string | null
  lastMessageAt: string
  unreadCount: number
}

export interface DmMessage {
  id: string
  conversationId: string
  senderId: string
  body: string
  isRead: boolean
  createdAt: string
}

export async function startConversation(scholarPublicId: string): Promise<{ id: string }>
export async function listConversations(): Promise<DmConversation[]>
export async function listMessages(conversationId: string): Promise<DmMessage[]>
export async function sendDmMessage(conversationId: string, body: string): Promise<DmMessage>
export async function markConversationRead(conversationId: string): Promise<void>
```

All functions follow the same `USE_MOCK` flag pattern as other API files.

### 3.2 Zustand DM store

**`src/store/useDmStore.ts`:**

```ts
interface DmStore {
  conversations: DmConversation[]
  setConversations: (convs: DmConversation[]) => void
  updateConversation: (id: string, patch: Partial<DmConversation>) => void
  totalUnread: number          // derived: sum of unreadCount
}
```

### 3.3 DM hooks

**`src/hooks/useDm.ts`:**

```ts
export function useConversations() {
  const { setConversations } = useDmStore()
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    const convs = await listConversations()
    setConversations(convs)
    setIsLoading(false)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)   // poll every 30s
    return () => clearInterval(interval)
  }, [])

  return { isLoading, reload: load }
}

export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<DmMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    const msgs = await listMessages(conversationId)
    setMessages(msgs)
    setIsLoading(false)
    await markConversationRead(conversationId)
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 10_000)   // poll every 10s
    return () => clearInterval(interval)
  }, [conversationId])

  const send = async (body: string) => {
    await sendDmMessage(conversationId, body)
    await load()
  }

  return { messages, isLoading, send }
}
```

### 3.4 Pages structure

```
src/pages/Messages/
  MessagesLayout.tsx       ← split panel (sidebar + Outlet), polls conversations
  MessagesLayout.scss
  MessageDetail/
    MessageDetail.tsx      ← conversation view with polling messages + input bar
    MessageDetail.scss
```

#### MessagesLayout

Left sidebar (same 320px pattern as ChannelsLayout):
- "Messages" header + MessageSquare icon
- Conversation list: each row shows avatar circle (initial), name + role badge, last message preview, timestamp, unread count badge
- `NavLink` per conversation (active state like channels)
- Empty state: "No conversations yet. Reply on a scholar's answer to start one."

Right panel:
- Default empty state: "Select a conversation"
- `<Outlet />` renders MessageDetail

#### MessageDetail

- Header: scholar/user name + role badge
- Scrollable messages area (same `.chat-messages` pattern)
  - User's own messages: right-aligned (`.is-user` bubble style)
  - Other's messages: left-aligned with avatar initial
- Input bar at bottom: textarea + send button (identical to ChannelDetail input bar)
- Auto-scroll to bottom on new messages
- Marks conversation as read on mount and after poll

### 3.5 New routes in App.tsx

```tsx
import { MessagesLayout } from '@/pages/Messages/MessagesLayout'
import { MessageDetail } from '@/pages/Messages/MessageDetail/MessageDetail'

// Inside route tree:
<Route path="/messages" element={<RequireAuth><MessagesLayout /></RequireAuth>}>
  <Route path=":conversationId" element={<MessageDetail />} />
</Route>
```

Footer: add `/messages` to `isFullHeight` check in `App.tsx`.

### 3.6 Header nav changes

Add "Messages" link between "Channels" and "Blogs" in the desktop nav:
```tsx
<NavLink to="/messages" className={...}>
  <MessageSquare size={15} />
  Messages
  {totalUnread > 0 && <span className="header-unread-badge">{totalUnread}</span>}
</NavLink>
```

`totalUnread` comes from `useDmStore((s) => s.totalUnread)`.

Add matching mobile menu link.

**New CSS token** in `index.css` (both `:root` and `html.dark`):
```css
--color-unread-badge: #e84040;   /* solid red for unread count dot */
```

### 3.7 "Message Scholar" button in QuestionThread

On each reply where `reply.authorRole === 'scholar'`, show a button to the right of the author name (only visible to non-scholars — hide when `user.role === 'scholar'`):

```tsx
{reply.authorRole === 'scholar' && user?.role !== 'scholar' && (
  <button
    className="reply-dm-btn"
    onClick={async () => {
      const { id } = await startConversation(reply.authorPublicId)
      navigate(`/messages/${id}`)
    }}
  >
    <MessageSquare size={13} />
    Message Scholar
  </button>
)}
```

The button is small and secondary-style. On click: call `startConversation` → navigate to the conversation.

---

## Execution Order

| # | Location | Change |
|---|---|---|
| 1 | `channel-service.js` | Include replies in `listQuestions()`, add `authorPublicId` to `toPublicReply` |
| 2 | `useChannelStore.ts` | Add `authorPublicId` to `Reply` interface |
| 3 | `channelsApi.ts` | Add `postReply()` |
| 4 | `useChannels.ts` | Add `submitReply()` to `useChannelDetail()` |
| 5 | `QuestionThread.tsx/scss` | Add reply input form + "Message Scholar" button |
| 6 | `ChannelDetail.tsx` | Pass `onReply={submitReply}` to QuestionThread |
| 7 | BE migrations | `create-dm-conversation`, `create-dm-message` |
| 8 | BE models | `dm_conversation.js`, `dm_message.js` — register in index |
| 9 | BE service | `dm-service.js` |
| 10 | BE schema | `server/schema/dms/*.js` |
| 11 | BE controller | `dm-controller.js` |
| 12 | BE routes | `server/routes/dms.js` — register in `server.js` |
| 13 | FE api | `src/api/dmApi.ts` |
| 14 | FE store | `src/store/useDmStore.ts` |
| 15 | FE hooks | `src/hooks/useDm.ts` |
| 16 | FE pages | `MessagesLayout.tsx/scss`, `MessageDetail.tsx/scss` |
| 17 | `App.tsx` | Add `/messages` routes + add to `isFullHeight` |
| 18 | `Header.tsx` | Add Messages nav link with unread badge |

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Scholar clicks "Message Scholar" on another scholar's reply | Button hidden when `user.role === 'scholar'` |
| User tries to DM same scholar twice | `findOrCreate` on `(user_id, scholar_id)` unique pair → returns existing conversation |
| Scholar initiates DM (backend) | `startOrGetConversation` detects caller role and always puts non-scholar as `user_id` |
| Very long messages | `body` capped at 2000 chars via Zod schema |
| User leaves conversation page mid-poll | `clearInterval` in `useEffect` cleanup |
| Unread count goes stale | 30s poll on MessagesLayout keeps sidebar fresh |
| Non-auth user on `/messages` | `RequireAuth` wrapper redirects to `/sign-in` |
| Reply fails to post | toast.error; input stays filled so user can retry |
| Scholar reply marked verified (verify button) | Reload questions after verify to update badge |
| Conversation not found / forbidden (direct URL) | Service throws → controller returns 404/403 |

---

## What Does NOT Change

- `postQuestion` API — unchanged
- `useChatStore` — no changes
- Channel join gate UI — unchanged
- Blog, Auth, ScholarApplication pages — unchanged
- Existing AI chat → channel prefill flow — unchanged
