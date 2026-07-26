import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { Calendar, User } from 'lucide-react'
import { useBlogs } from '@/hooks/useBlogs'
import { BackButton } from '@/components/BackButton/BackButton'
import './BlogDetail.scss'

export function BlogDetail() {
  const { id } = useParams<{ id: string }>()
  const { blogs, setActiveBlog, activeBlog } = useBlogs()

  useEffect(() => {
    const blog = blogs.find((b) => b.id === id)
    if (blog) setActiveBlog(blog)
    return () => setActiveBlog(null)
  }, [id, blogs])

  if (!activeBlog) {
    return (
      <div className="blog-detail-page">
        <BackButton to="/blogs" label="Back to Blogs" />
        <div className="empty-state"><p>Blog not found.</p></div>
      </div>
    )
  }

  const sanitizedBody = DOMPurify.sanitize(activeBlog.body)

  return (
    <div className="blog-detail-page">
      <BackButton to="/blogs" label="Back to Blogs" />

      <article className="blog-article">
        <span className="blog-article-badge">Article</span>
        <h1 className="blog-article-title">{activeBlog.title}</h1>
        <div className="blog-article-meta">
          <span><User size={14} /> {activeBlog.authorName}</span>
          <span><Calendar size={14} /> {new Date(activeBlog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="blog-article-divider" />
        <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: sanitizedBody }} />
      </article>
    </div>
  )
}
