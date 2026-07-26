import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Send, MessageSquare, UserPlus } from 'lucide-react'
import { useChannelDetail } from '@/hooks/useChannels'
import { useChannelStore } from '@/store/useChannelStore'
import { QuestionThread } from '@/components/QuestionThread/QuestionThread'
import { ListSkeleton } from '@/components/Skeletons/Skeletons'
import { MosqueIcon } from '@/components/Icons/MosqueIcon'
import { toast } from 'react-toastify'
import './ChannelDetail.scss'

const JOINED_KEY = 'hikmah-joined-channels'

function getJoinedIds(): string[] {
  try { return JSON.parse(localStorage.getItem(JOINED_KEY) ?? '[]') }
  catch { return [] }
}

export function ChannelDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const { questions, isLoading, loadQuestions, submitQuestion, submitReply, verifyReply } = useChannelDetail(id!)
  const channels = useChannelStore((s) => s.channels)
  const channel = channels.find((c) => c.id === id)

  const [isJoined, setIsJoined] = useState(() => id ? getJoinedIds().includes(id) : false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (id) setIsJoined(getJoinedIds().includes(id))
    setInput('')
  }, [id])

  useEffect(() => {
    if (!id) return
    try {
      const raw = sessionStorage.getItem('hikmah-channel-prefill')
      if (!raw) return
      const prefill = JSON.parse(raw) as { channelId: string; query: string }
      if (prefill.channelId === id) {
        setPendingQuery(prefill.query)
        sessionStorage.removeItem('hikmah-channel-prefill')
      }
    } catch {
      sessionStorage.removeItem('hikmah-channel-prefill')
    }
  }, [id])

  useEffect(() => {
    if (isJoined) loadQuestions()
  }, [id, isJoined])

  useEffect(() => {
    if (isJoined && pendingQuery) {
      autoPostQuery(pendingQuery)
      setPendingQuery(null)
    }
  }, [isJoined, pendingQuery])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [questions])

  const autoPostQuery = async (query: string) => {
    setIsSending(true)
    try {
      await submitQuestion(query.slice(0, 120), query)
      toast.success('Your question from AI Chat was posted!')
    } catch {
      setInput(query)
      inputRef.current?.focus()
      toast.info('Your question is ready — press Enter to post.')
    } finally {
      setIsSending(false)
    }
  }

  const handleJoin = () => {
    const joined = getJoinedIds()
    if (id && !joined.includes(id)) {
      localStorage.setItem(JOINED_KEY, JSON.stringify([...joined, id]))
    }
    setIsJoined(true)
    toast.success(`Joined #${channel?.name ?? 'Channel'}!`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isSending) return
    setIsSending(true)
    try {
      await submitQuestion(text.slice(0, 120), text)
      setInput('')
      toast.success('Question posted!')
    } catch {
      toast.error('Failed to post question.')
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

  if (!isJoined) {
    return (
      <div className="channel-detail-panel">
        <div className="channel-detail-head">
          <h1 className="channel-detail-title">{channel?.name ?? 'Channel'}</h1>
          {channel?.description && (
            <p className="channel-detail-desc">{channel.description}</p>
          )}
        </div>
        <div className="channel-join-screen">
          <div className="channel-join-icon">
            <MosqueIcon size={38} />
          </div>
          <h2 className="channel-join-title">Join #{channel?.name}</h2>
          <p className="channel-join-desc">
            Join this channel to view discussions and post your own questions to the community.
          </p>
          <button className="channel-join-btn" onClick={handleJoin}>
            <UserPlus size={17} />
            Join Channel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="channel-detail-panel">
      <div className="channel-detail-head">
        <h1 className="channel-detail-title">{channel?.name ?? 'Channel'}</h1>
        {channel?.description && (
          <p className="channel-detail-desc">{channel.description}</p>
        )}
      </div>

      <div className="channel-detail-body">
        {isLoading ? (
          <ListSkeleton count={3} />
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <MessageSquare size={22} />
            </div>
            <p className="empty-state-title">{t('channels.noQuestions')}</p>
            <p className="empty-state-desc">Be the first to ask a question in this channel.</p>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map((q) => (
              <QuestionThread key={q.id} question={q} onReply={submitReply} onVerify={verifyReply} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="channel-detail-input-area">
        <form onSubmit={handleSubmit} className="channel-detail-input-form">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question in this channel…"
            disabled={isSending}
            className="channel-detail-input"
            rows={1}
            aria-label="Ask a question"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="channel-detail-send-btn"
            aria-label="Post question"
          >
            {isSending ? <span className="channel-detail-spinner" aria-hidden="true" /> : <Send size={16} />}
          </button>
        </form>
        <p className="channel-detail-input-hint">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
