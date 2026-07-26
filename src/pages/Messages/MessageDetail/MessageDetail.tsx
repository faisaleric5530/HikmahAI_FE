import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ChevronLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/store/useAuthStore'
import { useDmStore } from '@/store/useDmStore'
import { useConversationMessages } from '@/hooks/useDm'
import { ListSkeleton } from '@/components/Skeletons/Skeletons'
import './MessageDetail.scss'

export function MessageDetail() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const conversations = useDmStore((s) => s.conversations)
  const conversation = conversations.find((c) => c.id === conversationId)

  const { messages, isLoading, send } = useConversationMessages(conversationId!)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isSending) return
    setIsSending(true)
    setInput('')
    try {
      await send(text)
    } catch {
      toast.error('Failed to send message.')
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="message-detail-panel">
      <div className="message-detail-head">
        <button
          className="message-detail-back"
          onClick={() => navigate('/messages')}
          aria-label="Back to conversations"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="message-detail-head-info">
          <div className="message-detail-avatar">
            {conversation?.otherUserName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <h1 className="message-detail-name">
              {conversation?.otherUserName ?? 'Scholar'}
            </h1>
            {conversation?.otherUserRole && (
              <span className="message-detail-role">{conversation.otherUserRole}</span>
            )}
          </div>
        </div>
      </div>

      <div className="message-detail-body">
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : messages.length === 0 ? (
          <div className="message-detail-empty">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="dm-messages">
            {messages.map((msg) => {
              const isOwn = msg.senderId === user?.id
              return (
                <div key={msg.id} className={`dm-bubble-wrapper ${isOwn ? 'is-own' : 'is-other'}`}>
                  {!isOwn && (
                    <div className="dm-bubble-avatar" aria-hidden="true">
                      {conversation?.otherUserName?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className={`dm-bubble ${isOwn ? 'dm-bubble-own' : 'dm-bubble-other'}`}>
                    <p className="dm-bubble-text">{msg.body}</p>
                    <span className="dm-bubble-time">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )
            })}
            {isSending && (
              <div className="dm-bubble-wrapper is-own">
                <div className="dm-bubble dm-bubble-own dm-bubble-sending">
                  <span className="dm-typing-dot" />
                  <span className="dm-typing-dot" />
                  <span className="dm-typing-dot" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="message-detail-input-area">
        <form onSubmit={handleSubmit} className="message-detail-input-form">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            disabled={isSending}
            className="message-detail-input"
            rows={1}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="message-detail-send-btn"
            aria-label="Send message"
          >
            {isSending ? <span className="message-detail-spinner" aria-hidden="true" /> : <Send size={16} />}
          </button>
        </form>
        <p className="message-detail-input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
