import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, MessageSquare, Send, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '@/store/useAuthStore'
import { startConversation } from '@/api/dmApi'
import type { Question } from '@/store/useChannelStore'
import './QuestionThread.scss'

interface QuestionThreadProps {
  question: Question
  onReply: (questionId: string, body: string) => Promise<void>
  onVerify: (replyId: string) => Promise<void>
}

export function QuestionThread({ question, onReply, onVerify }: QuestionThreadProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [dmLoadingId, setDmLoadingId] = useState<string | null>(null)

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = replyText.trim()
    if (!text || isSending) return
    setIsSending(true)
    try {
      await onReply(question.id, text)
      setReplyText('')
      setShowReplyForm(false)
      toast.success('Reply posted!')
    } catch {
      toast.error('Failed to post reply.')
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async (replyId: string) => {
    setVerifyingId(replyId)
    try {
      await onVerify(replyId)
      toast.success('Reply marked as verified!')
    } catch {
      toast.error('Failed to verify reply.')
    } finally {
      setVerifyingId(null)
    }
  }

  const handleMessageScholar = async (authorPublicId: string) => {
    setDmLoadingId(authorPublicId)
    try {
      const { id } = await startConversation(authorPublicId)
      navigate(`/messages/${id}`)
    } catch {
      toast.error('Could not open conversation.')
    } finally {
      setDmLoadingId(null)
    }
  }

  const isScholar = user?.role === 'scholar' || user?.role === 'admin'

  return (
    <div className="question-thread">
      <div className="question-head">
        <h3 className="question-title">
          {question.title}
          {question.isVerifiedAnswer && (
            <span className="verified-badge">
              <Award size={12} />
              Verified
            </span>
          )}
        </h3>
      </div>
      <p className="question-body">{question.body}</p>
      <div className="question-meta">
        <span className="question-author-label">Asked by</span>
        <span className="question-author">{question.authorName}</span>
        <span className="meta-dot">&middot;</span>
        {new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      <div className="replies-section">
        {question.replies.length > 0 && (
          <div className="replies-count">
            {question.replies.length} {question.replies.length === 1 ? 'Reply' : 'Replies'}
          </div>
        )}
        {question.replies.map((reply) => (
          <div key={reply.id} className={`reply-item ${reply.isVerifiedAnswer ? 'verified-reply' : ''}`}>
            {reply.isVerifiedAnswer && (
              <span className="verified-tag">
                <Award size={12} />
                Verified Scholar Answer
              </span>
            )}
            <p className="reply-body">{reply.body}</p>
            <div className="reply-footer">
              <span className="reply-author-name">{reply.authorName}</span>
              {reply.authorRole === 'scholar' && (
                <span className="reply-scholar-badge">Scholar</span>
              )}
              {isScholar && !reply.isVerifiedAnswer && (
                <button
                  className="reply-verify-btn"
                  onClick={() => handleVerify(reply.id)}
                  disabled={verifyingId === reply.id}
                  aria-label="Mark as verified answer"
                >
                  <CheckCircle size={12} />
                  {verifyingId === reply.id ? 'Verifying…' : 'Verify'}
                </button>
              )}
              {!isScholar &&
                reply.authorRole === 'scholar' &&
                reply.authorPublicId &&
                user?.id === question.authorPublicId && (
                  <button
                    className="reply-dm-btn"
                    onClick={() => handleMessageScholar(reply.authorPublicId!)}
                    disabled={dmLoadingId === reply.authorPublicId}
                    aria-label="Message this scholar"
                  >
                    <MessageSquare size={12} />
                    {dmLoadingId === reply.authorPublicId ? 'Opening…' : 'Message Scholar'}
                  </button>
                )}
            </div>
          </div>
        ))}
        {question.replies.length === 0 && (
          <p className="no-replies">No replies yet. Be the first to answer!</p>
        )}
      </div>

      {user?.id !== question.authorPublicId && (
        <div className="reply-form-section">
          <button
            className="reply-toggle-btn"
            onClick={() => setShowReplyForm((v) => !v)}
            aria-expanded={showReplyForm}
          >
            {showReplyForm ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReplyForm ? 'Cancel' : 'Add Reply'}
          </button>

          {showReplyForm && (
            <form className="reply-form" onSubmit={handleReply}>
              <textarea
                className="reply-input"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply…"
                rows={3}
                disabled={isSending}
                aria-label="Reply text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleReply(e as unknown as React.FormEvent)
                  }
                }}
              />
              <div className="reply-form-footer">
                <span className="reply-form-hint">Enter to send · Shift+Enter for new line</span>
                <button
                  type="submit"
                  className="reply-send-btn"
                  disabled={!replyText.trim() || isSending}
                  aria-label="Post reply"
                >
                  {isSending ? <span className="reply-spinner" aria-hidden="true" /> : <Send size={14} />}
                  {isSending ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
