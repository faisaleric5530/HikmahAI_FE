import { useNavigate } from 'react-router-dom'
import { UserPlus, MessageSquare } from 'lucide-react'
import type { ChatMessage } from '@/store/useChatStore'
import './ChatBubble.scss'

const JOINED_KEY = 'hikmah-joined-channels'

function isChannelJoined(channelId: string): boolean {
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]')
    return ids.includes(channelId)
  } catch {
    return false
  }
}

interface ChatBubbleProps {
  message: ChatMessage
  userQuery?: string
}

export function ChatBubble({ message, userQuery }: ChatBubbleProps) {
  const navigate = useNavigate()
  const isUser = message.role === 'user'

  return (
    <div className={`chat-bubble-wrapper ${isUser ? 'is-user' : 'is-assistant'}`}>
      {!isUser && (
        <div className="chat-bubble-avatar" aria-hidden="true">H</div>
      )}

      <div className={`chat-bubble-column ${isUser ? 'is-user' : 'is-assistant'}`}>
        <div className={`chat-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
          <p className="chat-bubble-text">{message.content}</p>
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="chat-bubble-sources">
            <span className="chat-bubble-sources-label">Sources</span>
            <div className="chat-bubble-sources-list">
              {message.sources.map((s, i) => (
                <span key={i} className="chat-bubble-source-tag">
                  {[s.author, s.source].filter(Boolean).join(' — ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isUser && message.suggestedChannel && (() => {
          const ch = message.suggestedChannel!
          const joined = isChannelJoined(ch.id)
          return (
            <button
              type="button"
              className="chat-bubble-channel-suggestion"
              style={{ '--suggestion-bg': `var(--channel-${ch.colorVariant}-bg)` } as React.CSSProperties}
              onClick={() => {
                if (userQuery) {
                  sessionStorage.setItem(
                    'hikmah-channel-prefill',
                    JSON.stringify({ channelId: ch.id, query: userQuery })
                  )
                }
                navigate(`/channels/${ch.id}`)
              }}
            >
              {joined ? <MessageSquare size={14} /> : <UserPlus size={14} />}
              <span>{joined ? `Ask in ${ch.name}` : `Join ${ch.name}`}</span>
            </button>
          )
        })()}
      </div>

      {isUser && (
        <div className="chat-bubble-avatar is-user-avatar" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
