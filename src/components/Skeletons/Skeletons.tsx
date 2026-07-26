import './Skeletons.scss'

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-h6 w-40" />
      <div className="skeleton-line skeleton-h5 w-75" />
      <div className="skeleton-line skeleton-h4 w-100" />
      <div className="skeleton-line skeleton-h4 w-60" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line skeleton-h6 w-40" />
          <div className="skeleton-line skeleton-h5 w-65" />
          <div className="skeleton-line skeleton-h4 w-100" />
          <div className="skeleton-line skeleton-h4 w-50" />
        </div>
      ))}
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="skeleton-chat">
      <div className="skeleton-row user">
        <div className="skeleton-bubble" />
      </div>
      <div className="skeleton-row assistant">
        <div className="skeleton-bubble long" />
      </div>
      <div className="skeleton-row user">
        <div className="skeleton-bubble short" />
      </div>
      <div className="skeleton-row assistant">
        <div className="skeleton-bubble" />
      </div>
    </div>
  )
}
