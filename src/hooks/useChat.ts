import { useEffect } from 'react'
import { useChatStore } from '@/store/useChatStore'
import {
  fetchChatSessions,
  createChatSession,
  fetchChatSession,
  deleteChatSession,
  sendChatMessage,
} from '@/api/chatApi'

export function useChat() {
  const store = useChatStore()

  useEffect(() => {
    if (store.sessions.length === 0 && !store.isLoadingSessions) {
      store.setLoadingSessions(true)
      fetchChatSessions()
        .then((sessions) => useChatStore.setState({ sessions, isLoadingSessions: false }))
        .catch(() => store.setLoadingSessions(false))
    }
  }, [])

  const sendMessage = async (text: string) => {
    const tempId = `temp-${Date.now()}`
    store.addMessage({ id: tempId, role: 'user', content: text, lang: 'en' })
    store.setSending(true)

    try {
      let sessionId = store.activeSessionId
      if (!sessionId) {
        const session = await createChatSession()
        sessionId = session.id
        useChatStore.setState((s) => ({ activeSessionId: sessionId, sessions: [session, ...s.sessions] }))
      }

      const { userMessage, assistantMessage } = await sendChatMessage(sessionId, text)
      useChatStore.setState((s) => ({
        messages: [...s.messages.filter((m) => m.id !== tempId), userMessage, assistantMessage],
      }))

      const sessions = await fetchChatSessions()
      useChatStore.setState({ sessions })
    } catch (err) {
      useChatStore.setState((s) => ({ messages: s.messages.filter((m) => m.id !== tempId) }))
      throw err
    } finally {
      store.setSending(false)
    }
  }

  const loadSession = async (id: string) => {
    store.setLoadingSession(true)
    try {
      const session = await fetchChatSession(id)
      useChatStore.setState({ activeSessionId: id, messages: session.messages, isLoadingSession: false })
    } catch (err) {
      store.setLoadingSession(false)
      throw err
    }
  }

  const newSession = () => {
    useChatStore.setState({ activeSessionId: null, messages: [] })
  }

  const removeSession = async (id: string) => {
    await deleteChatSession(id)
    useChatStore.setState((s) => ({
      sessions: s.sessions.filter((sess) => sess.id !== id),
      activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
      messages: s.activeSessionId === id ? [] : s.messages,
    }))
  }

  return {
    messages: store.messages,
    isSending: store.isSending,
    isLoadingSession: store.isLoadingSession,
    sessions: store.sessions,
    activeSessionId: store.activeSessionId,
    sendMessage,
    loadSession,
    newSession,
    deleteSession: removeSession,
  }
}
