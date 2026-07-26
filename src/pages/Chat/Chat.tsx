import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Sparkles, Plus, Trash2, PanelLeft, MessageSquare } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { useChatStore } from '@/store/useChatStore'
import { ChatBubble } from '@/components/ChatBubble/ChatBubble'
import './Chat.scss'

const SUGGESTIONS = [
  'What are the five pillars of Islam?',
  'Explain the concept of Tawakkul',
  'What is the significance of Ramadan?',
  'How do I perform Wudu correctly?',
]

function formatSessionDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

export function Chat() {
  const { t } = useTranslation()
  const { messages, isSending, sendMessage } = useChat()
  const { sessions, activeSessionId, newSession, loadSession, deleteSession } = useChatStore()
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia('(min-width: 860px)').matches,
  )
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isSending) return
    setInput('')
    await sendMessage(text)
    inputRef.current?.focus()
  }

  const handleSuggestion = async (text: string) => {
    if (isSending) return
    await sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  const handleNewChat = () => {
    newSession()
    setInput('')
    if (window.matchMedia('(max-width: 859px)').matches) setSidebarOpen(false)
  }

  const handleLoadSession = (id: string) => {
    loadSession(id)
    if (window.matchMedia('(max-width: 859px)').matches) setSidebarOpen(false)
  }

  return (
    <div className="chat-page-layout">
      {sidebarOpen && (
        <div
          className="chat-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`chat-sidebar ${sidebarOpen ? 'chat-sidebar-open' : ''}`} aria-label="Chat history">
        <div className="chat-sidebar-header">
          <button
            className="chat-sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle chat history"
            aria-expanded={sidebarOpen}
          >
            <PanelLeft size={18} />
          </button>
          <span className="chat-sidebar-title">History</span>
          <button onClick={handleNewChat} className="chat-new-btn" aria-label="New chat">
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="chat-session-list" role="list">
          {sessions.length === 0 ? (
            <div className="chat-session-empty">
              <MessageSquare size={20} />
              <p>No past chats yet</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                role="listitem"
                className={`chat-session-item ${session.id === activeSessionId ? 'chat-session-item-active' : ''}`}
              >
                <button
                  className="chat-session-btn"
                  onClick={() => handleLoadSession(session.id)}
                  title={session.title}
                >
                  <span className="chat-session-title">{session.title}</span>
                  <span className="chat-session-date">{formatSessionDate(session.updatedAt)}</span>
                </button>
                <button
                  className="chat-session-delete"
                  onClick={() => deleteSession(session.id)}
                  aria-label={`Delete session`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="chat-main">
        {!sidebarOpen && (
          <button
            className="chat-mobile-open-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open chat history"
          >
            <PanelLeft size={18} />
          </button>
        )}

        <div className="chat-page">
          <div className="chat-page-header">
            <div className="chat-page-header-icon">
              <Sparkles size={20} />
            </div>
            <div>
              <h1 className="chat-page-title">{t('chat.title')}</h1>
              <p className="chat-page-subtitle">Ask anything about Islam</p>
            </div>
          </div>

          <div className="chat-container">
            <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.length === 0 && !isSending ? (
                <div className="chat-empty">
                  <div className="chat-empty-glow" aria-hidden="true" />
                  <div className="chat-empty-icon"><Sparkles size={28} /></div>
                  <h2 className="chat-empty-title">Assalamu Alaikum</h2>
                  <p className="chat-empty-desc">{t('chat.welcome')}</p>
                  <div className="chat-suggestions" role="group" aria-label="Suggested questions">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => handleSuggestion(s)} className="chat-suggestion-chip" disabled={isSending}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {isSending && (
                    <div className="chat-typing" aria-label="Assistant is typing">
                      <div className="chat-typing-avatar">H</div>
                      <div className="chat-typing-bubble">
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                        <span className="chat-typing-dot" />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSubmit} className="chat-input-form">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('chat.placeholder')}
                  disabled={isSending}
                  className="chat-input"
                  rows={1}
                  aria-label="Message input"
                />
                <button type="submit" disabled={!input.trim() || isSending} className="chat-send-btn" aria-label="Send message">
                  {isSending ? <span className="chat-send-spinner" aria-hidden="true" /> : <Send size={17} />}
                </button>
              </form>
              <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
