import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  lang: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

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

interface ChatState {
  messages: ChatMessage[]
  isSending: boolean
  sessions: ChatSession[]
  activeSessionId: string | null
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setSending: (sending: boolean) => void
  clearMessages: () => void
  saveCurrentSession: () => void
  loadSession: (id: string) => void
  newSession: () => void
  deleteSession: (id: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isSending: false,
  sessions: loadPersistedSessions(),
  activeSessionId: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSending: (sending) => set({ isSending: sending }),
  clearMessages: () => set({ messages: [], activeSessionId: null }),

  saveCurrentSession: () => {
    const { messages, activeSessionId, sessions } = get()
    if (messages.length === 0) return
    const firstUserMsg = messages.find((m) => m.role === 'user')
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 50) + (firstUserMsg.content.length > 50 ? '…' : '')
      : 'Chat session'
    const now = new Date().toISOString()
    if (activeSessionId) {
      const updated = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, messages, title, updatedAt: now } : s
      )
      persistSessions(updated)
      set({ sessions: updated })
    } else {
      const newSess: ChatSession = {
        id: `session-${Date.now()}`,
        title,
        messages,
        createdAt: now,
        updatedAt: now,
      }
      const updated = [newSess, ...sessions]
      persistSessions(updated)
      set({ sessions: updated, activeSessionId: newSess.id })
    }
  },

  loadSession: (id) => {
    const { sessions } = get()
    const session = sessions.find((s) => s.id === id)
    if (session) set({ messages: session.messages, activeSessionId: id })
  },

  newSession: () => {
    get().saveCurrentSession()
    set({ messages: [], activeSessionId: null })
  },

  deleteSession: (id) => {
    const { sessions, activeSessionId, messages } = get()
    const updated = sessions.filter((s) => s.id !== id)
    persistSessions(updated)
    set({
      sessions: updated,
      activeSessionId: activeSessionId === id ? null : activeSessionId,
      messages: activeSessionId === id ? [] : messages,
    })
  },
}))
