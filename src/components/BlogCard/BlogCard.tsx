import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, BookOpen } from 'lucide-react'
import type { Blog } from '@/store/useBlogStore'
import './BlogCard.scss'

interface BlogCardProps {
  blog: Blog
  featured?: boolean
  colorAccent?: string
}

function readingTime(text: string): number {
  const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

const ACCENT_COLORS = ['#52B788', '#3B6FA0', '#A07040', '#5E4A87', '#A87820', '#357882']

export function BlogCard({ blog, featured = false, colorAccent }: BlogCardProps) {
  const mins = readingTime(blog.body)

  if (featured) {
    return (
      <Link to={`/blogs/${blog.id}`} className="blog-card-featured" aria-label={`Read featured: ${blog.title}`}>
        <div className="blog-card-featured-accent" />
        <div className="blog-card-featured-body">
          <div className="blog-card-featured-top">
            <span className="blog-card-featured-label">
              <BookOpen size={11} />
              Featured Article
            </span>
            <ArrowUpRight size={18} className="blog-card-arrow" aria-hidden="true" />
          </div>
          <h2 className="blog-card-featured-title">{blog.title}</h2>
          <p className="blog-card-featured-excerpt">{blog.excerpt}</p>
          <div className="blog-card-footer">
            <div className="blog-card-author-row">
              <div className="blog-card-avatar blog-card-avatar-lg">{blog.authorName[0]}</div>
              <div>
                <span className="blog-card-author">{blog.authorName}</span>
              </div>
            </div>
            <div className="blog-card-meta-right">
              <Clock size={12} />
              <span>{mins} min read</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/blogs/${blog.id}`} className="blog-card" aria-label={`Read: ${blog.title}`} style={{ '--card-accent': colorAccent } as React.CSSProperties}>
      <div className="blog-card-color-bar" />
      <div className="blog-card-top">
        <span className="blog-card-badge">Article</span>
        <ArrowUpRight size={16} className="blog-card-arrow" aria-hidden="true" />
      </div>

      <h3 className="blog-card-title">{blog.title}</h3>

      <p className="blog-card-excerpt">{blog.excerpt}</p>

      <div className="blog-card-footer">
        <div className="blog-card-author-row">
          <div className="blog-card-avatar">{blog.authorName[0]}</div>
          <span className="blog-card-author">{blog.authorName}</span>
        </div>
        <div className="blog-card-meta-right">
          <Clock size={11} />
          <span>{mins} min read</span>
        </div>
      </div>
    </Link>
  )
}

export { ACCENT_COLORS }
