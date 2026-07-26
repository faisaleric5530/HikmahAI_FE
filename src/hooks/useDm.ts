import { useEffect, useState, useCallback } from 'react'
import { useDmStore } from '@/store/useDmStore'
import { listConversations, listMessages, sendDmMessage, markConversationRead } from '@/api/dmApi'
import type { DmMessage } from '@/api/dmApi'

export function useConversations() {
  const setConversations = useDmStore((s) => s.setConversations)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const convs = await listConversations()
      setConversations(convs)
    } finally {
      setIsLoading(false)
    }
  }, [setConversations])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [load])

  return { isLoading, reload: load }
}

export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<DmMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const reload = useDmStore((s) => s.setConversations)

  const load = useCallback(async () => {
    try {
      const msgs = await listMessages(conversationId)
      setMessages(msgs)
      await markConversationRead(conversationId)
      const convs = await listConversations()
      useDmStore.setState({
        conversations: convs,
        totalUnread: convs.reduce((sum, c) => sum + c.unreadCount, 0),
      })
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    load()
    const interval = setInterval(load, 10_000)
    return () => clearInterval(interval)
  }, [load])

  const send = async (body: string) => {
    await sendDmMessage(conversationId, body)
    await load()
  }

  return { messages, isLoading, send }
}
