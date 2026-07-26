import { Award } from 'lucide-react'
import type { Question } from '@/store/useChannelStore'
import './QuestionThread.scss'

interface QuestionThreadProps {
  question: Question
}

export function QuestionThread({ question }: QuestionThreadProps) {
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
            </div>
          </div>
        ))}
        {question.replies.length === 0 && (
          <p className="no-replies">No replies yet. Be the first to answer!</p>
        )}
      </div>
    </div>
  )
}
