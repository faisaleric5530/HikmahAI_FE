import { create } from 'zustand'
import type { DmConversation } from '@/api/dmApi'

interface DmState {
  conversations: DmConversation[]
  totalUnread: number
  setConversations: (convs: DmConversation[]) => void
}

export const useDmStore = create<DmState>((set) => ({
  conversations: [],
  totalUnread: 0,
  setConversations: (conversations) =>
    set({
      conversations,
      totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    }),
}))
