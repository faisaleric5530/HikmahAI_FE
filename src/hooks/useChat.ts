import { useChatStore } from '@/store/useChatStore'
import { sendChatMessage } from '@/api/chatApi'

export function useChat() {
  const { messages, isSending, setSending, addMessage, saveCurrentSession } = useChatStore()

  const sendMessage = async (text: string) => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: text,
      lang: 'en',
    }
    addMessage(userMsg)
    setSending(true)
    try {
      const response = await sendChatMessage(messages, text)
      const assistantMsg = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: response.reply,
        lang: response.detectedLang,
      }
      addMessage(assistantMsg)
    } finally {
      setSending(false)
      saveCurrentSession()
    }
  }

  return { messages, isSending, sendMessage }
}
