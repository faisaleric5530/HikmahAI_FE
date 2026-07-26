import axiosInstance from './axiosInstance'
import { getMockChatReply } from './mockData'
import type { ChatMessage } from '@/store/useChatStore'

// Chat intentionally stays on mock data — the AI chat integration is handled
// separately and shouldn't flip just because VITE_API_BASE_URL is set for
// the rest of the app (auth/channels/blogs/scholar applications).
const USE_MOCK = true

export interface ChatResponse {
  reply: string
  detectedLang: string
  sources?: { type: 'quran' | 'hadith'; reference: string }[]
}

export async function sendChatMessage(
  messages: ChatMessage[],
  text: string
): Promise<ChatResponse> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
    return getMockChatReply(text)
  }
  const response = await axiosInstance.post<ChatResponse>('/chat/message', {
    messages,
    text,
  })
  return response.data
}
