import { create } from 'zustand'

export type ChannelColor = 'green' | 'blue' | 'amber' | 'purple' | 'orange' | 'teal'

export interface ChatSourceCitation {
  source: string
  author?: string
  section?: string
  discipline?: string
}

export interface SuggestedChannel {
  id: string
  name: string
  colorVariant: ChannelColor
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  lang: string
  sources?: ChatSourceCitation[]
  suggestedChannel?: SuggestedChannel | null
  createdAt?: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

interface ChatState {
  messages: ChatMessage[]
  isSending: boolean
  isLoadingSessions: boolean
  isLoadingSession: boolean
  sessions: ChatSession[]
  activeSessionId: string | null
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setSending: (sending: boolean) => void
  setLoadingSessions: (loading: boolean) => void
  setLoadingSession: (loading: boolean) => void
  setSessions: (sessions: ChatSession[]) => void
  setActiveSessionId: (id: string | null) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isSending: false,
  isLoadingSessions: false,
  isLoadingSession: false,
  sessions: [],
  activeSessionId: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setSending: (sending) => set({ isSending: sending }),
  setLoadingSessions: (loading) => set({ isLoadingSessions: loading }),
  setLoadingSession: (loading) => set({ isLoadingSession: loading }),
  setSessions: (sessions) => set({ sessions }),
  setActiveSessionId: (id) => set({ activeSessionId: id }),
  clearMessages: () => set({ messages: [], activeSessionId: null }),
}))
