import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Plus } from 'lucide-react'
import { useBlogs } from '@/hooks/useBlogs'
import { useAuth } from '@/hooks/useAuth'
import { BlogCard, ACCENT_COLORS } from '@/components/BlogCard/BlogCard'
import { GridSkeleton } from '@/components/Skeletons/Skeletons'
import './BlogList.scss'

export function BlogList() {
  const { t } = useTranslation()
  const { blogs, isLoading } = useBlogs()
  const { isScholar, isAdmin } = useAuth()
  const canPublish = isScholar || isAdmin

  const [featured, ...rest] = blogs

  return (
    <div className="blog-list-page">
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <FileText size={22} className="page-head-icon" />
          <div>
            <h1 className="page-head-title">{t('blogs.title')}</h1>
            <p className="page-head-desc">Read and write insightful articles</p>
          </div>
        </div>
        {canPublish && (
          <Link to="/blogs/new" className="btn-primary-sm">
            <Plus size={15} />
            <span>{t('blogs.newPost')}</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <GridSkeleton count={4} />
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">{t('blogs.noBlogs')}</p>
          <p className="empty-state-desc">Be the first to publish an article.</p>
        </div>
      ) : (
        <>
          {featured && <BlogCard blog={featured} featured />}

          {rest.length > 0 && (
            <div className="blog-grid">
              {rest.map((blog, i) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  colorAccent={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
