import axiosInstance from './axiosInstance'
import { getMockChatReply } from './mockData'
import type { ChatMessage, ChatSession } from '@/store/useChatStore'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

const SESSIONS_KEY = 'hikmah-chat-sessions'
const MAX_SESSIONS = 20

function loadPersistedSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persistSessions(sessions: ChatSession[]) {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)))
  } catch {}
}

function toSummary(session: ChatSession): ChatSession {
  return { ...session, messages: [] }
}

interface BackendMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  detectedLang: string | null
  sources?: ChatMessage['sources']
  suggestedChannel?: ChatMessage['suggestedChannel']
  createdAt: string
}

interface BackendSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface BackendSessionDetail extends BackendSession {
  messages: BackendMessage[]
}

function toChatMessage(m: BackendMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    lang: m.detectedLang ?? 'en',
    sources: m.sources ?? [],
    suggestedChannel: m.suggestedChannel ?? null,
    createdAt: m.createdAt,
  }
}

function toChatSession(s: BackendSession, messages: ChatMessage[] = []): ChatSession {
  return { id: s.id, title: s.title, messages, createdAt: s.createdAt, updatedAt: s.updatedAt }
}

function mockSourcesToCitations(
  sources: { type: 'quran' | 'hadith'; reference: string }[]
): NonNullable<ChatMessage['sources']> {
  return sources.map((s) => ({ source: s.reference, discipline: s.type }))
}

export async function fetchChatSessions(): Promise<ChatSession[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return loadPersistedSessions().map(toSummary)
  }
  const response = await axiosInstance.get<BackendSession[]>('/chat/sessions')
  return response.data.map((s) => toChatSession(s))
}

export async function createChatSession(): Promise<ChatSession> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    const now = new Date().toISOString()
    const session: ChatSession = { id: `session-${Date.now()}`, title: 'New Chat', messages: [], createdAt: now, updatedAt: now }
    const sessions = [session, ...loadPersistedSessions()]
    persistSessions(sessions)
    return session
  }
  const response = await axiosInstance.post<BackendSession>('/chat/sessions')
  return toChatSession(response.data)
}

export async function fetchChatSession(id: string): Promise<ChatSession> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    const session = loadPersistedSessions().find((s) => s.id === id)
    if (!session) throw new Error('Chat session not found')
    return session
  }
  const response = await axiosInstance.get<BackendSessionDetail>(`/chat/sessions/${id}`)
  return toChatSession(response.data, response.data.messages.map(toChatMessage))
}

export async function deleteChatSession(id: string): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    persistSessions(loadPersistedSessions().filter((s) => s.id !== id))
    return
  }
  await axiosInstance.delete(`/chat/sessions/${id}`)
}

export async function sendChatMessage(
  sessionId: string,
  content: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
    const mockReply = getMockChatReply(content)
    const now = new Date().toISOString()
    const userMessage: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content, lang: 'en', createdAt: now }
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: mockReply.reply,
      lang: mockReply.detectedLang,
      sources: mockSourcesToCitations(mockReply.sources),
      createdAt: now,
    }

    const sessions = loadPersistedSessions()
    const updated = sessions.map((s) => {
      if (s.id !== sessionId) return s
      const title = s.title === 'New Chat' ? content.slice(0, 50) : s.title
      return { ...s, title, messages: [...s.messages, userMessage, assistantMessage], updatedAt: now }
    })
    persistSessions(updated)

    return { userMessage, assistantMessage }
  }

  const response = await axiosInstance.post<{ userMessage: BackendMessage; assistantMessage: BackendMessage }>(
    `/chat/sessions/${sessionId}/messages`,
    { content }
  )
  return {
    userMessage: toChatMessage(response.data.userMessage),
    assistantMessage: toChatMessage(response.data.assistantMessage),
  }
}
