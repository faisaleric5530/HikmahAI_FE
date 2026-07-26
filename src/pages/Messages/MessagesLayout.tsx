import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useDmStore } from '@/store/useDmStore'
import { useConversations } from '@/hooks/useDm'
import { startConversation } from '@/api/dmApi'
import { ListSkeleton } from '@/components/Skeletons/Skeletons'
import './MessagesLayout.scss'

function formatMsgDate(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  if (diff < 60000) return 'Just now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(diff / 3600000)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(iso).toLocaleDateString()
}

function MessagesEmptyPanel() {
  return (
    <div className="messages-panel-empty">
      <div className="messages-panel-empty-icon">
        <MessageSquare size={44} />
      </div>
      <h2 className="messages-panel-empty-title">Select a Conversation</h2>
      <p className="messages-panel-empty-desc">
        Click on a scholar's reply in any channel and choose "Message Scholar" to start a private conversation.
      </p>
    </div>
  )
}

export function MessagesLayout() {
  const location = useLocation()
  const conversations = useDmStore((s) => s.conversations)
  const { isLoading } = useConversations()

  const hasConversation =
    location.pathname !== '/messages' && location.pathname.startsWith('/messages/')

  return (
    <div className="messages-split">
      <aside className={`messages-sidebar${hasConversation ? ' messages-sidebar-mobile-hidden' : ''}`}>
        <div className="messages-sidebar-header">
          <div className="messages-sidebar-brand">
            <MessageSquare size={17} />
            <span>Messages</span>
          </div>
        </div>

        <div className="messages-sidebar-list" role="list">
          {isLoading ? (
            <ListSkeleton count={3} />
          ) : conversations.length === 0 ? (
            <div className="messages-sidebar-empty">
              <MessageSquare size={20} />
              <p>No conversations yet</p>
              <span>Reply on a scholar's answer to start one.</span>
            </div>
          ) : (
            conversations.map((conv) => (
              <NavLink
                key={conv.id}
                to={`/messages/${conv.id}`}
                className={({ isActive }) =>
                  `messages-conv-item${isActive ? ' messages-conv-item-active' : ''}`
                }
                role="listitem"
              >
                <div className="messages-conv-avatar">
                  {conv.otherUserName[0]?.toUpperCase()}
                </div>
                <div className="messages-conv-info">
                  <div className="messages-conv-top">
                    <span className="messages-conv-name">{conv.otherUserName}</span>
                    <span className="messages-conv-role">{conv.otherUserRole}</span>
                  </div>
                  <div className="messages-conv-bottom">
                    <span className="messages-conv-preview">
                      {conv.lastMessage ?? 'No messages yet'}
                    </span>
                    <span className="messages-conv-date">{formatMsgDate(conv.lastMessageAt)}</span>
                  </div>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="messages-conv-unread">{conv.unreadCount}</span>
                )}
              </NavLink>
            ))
          )}
        </div>
      </aside>

      <div className={`messages-panel${!hasConversation ? ' messages-panel-mobile-hidden' : ''}`}>
        <div className="messages-panel-scroll">
          {hasConversation ? <Outlet /> : <MessagesEmptyPanel />}
        </div>
      </div>
    </div>
  )
}
