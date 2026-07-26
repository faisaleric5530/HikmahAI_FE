import axiosInstance from './axiosInstance'

const USE_MOCK = !import.meta.env.VITE_API_BASE_URL

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

const mockConversations: DmConversation[] = [
  {
    id: 'dm-conv-1',
    otherUserId: 'scholar-1',
    otherUserName: 'Dr. Hassan',
    otherUserRole: 'scholar',
    lastMessage: 'Wa Alaikum Assalam! How can I help you?',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
  },
]

const mockMessages: Record<string, DmMessage[]> = {
  'dm-conv-1': [
    {
      id: 'dm-msg-1',
      conversationId: 'dm-conv-1',
      senderId: 'user-1',
      body: 'Assalamu Alaikum, I had a question about the 99 names of Allah.',
      isRead: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'dm-msg-2',
      conversationId: 'dm-conv-1',
      senderId: 'scholar-1',
      body: 'Wa Alaikum Assalam! How can I help you?',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
}

export async function startConversation(scholarPublicId: string): Promise<{ id: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return { id: 'dm-conv-1' }
  }
  const response = await axiosInstance.post<{ data: { id: string } }>('/dms', { scholarPublicId })
  return (response.data as any).data ?? response.data
}

export async function listConversations(): Promise<DmConversation[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return mockConversations
  }
  const response = await axiosInstance.get<{ data: DmConversation[] }>('/dms')
  return (response.data as any).data ?? response.data
}

export async function listMessages(conversationId: string): Promise<DmMessage[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return mockMessages[conversationId] ?? []
  }
  const response = await axiosInstance.get<{ data: DmMessage[] }>(`/dms/${conversationId}/messages`)
  return (response.data as any).data ?? response.data
}

export async function sendDmMessage(conversationId: string, body: string): Promise<DmMessage> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    const msg: DmMessage = {
      id: `dm-msg-${Date.now()}`,
      conversationId,
      senderId: 'user-1',
      body,
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    if (!mockMessages[conversationId]) mockMessages[conversationId] = []
    mockMessages[conversationId].push(msg)
    return msg
  }
  const response = await axiosInstance.post<{ data: DmMessage }>(`/dms/${conversationId}/messages`, { body })
  return (response.data as any).data ?? response.data
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (USE_MOCK) return
  await axiosInstance.patch(`/dms/${conversationId}/read`)
}
