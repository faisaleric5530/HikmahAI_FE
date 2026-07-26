import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, Hash, FileText, ArrowRight, BookOpen, Users, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fetchPlatformStats, type PlatformStats } from '@/api/statsApi'
import './Home.scss'

function toStatItems(stats: PlatformStats | null) {
  return [
    { value: stats ? `${stats.qnaAnswered}` : '—', label: 'Q&A Answered' },
    { value: stats ? `${stats.topicChannels}` : '—', label: 'Topic Channels' },
    { value: stats ? `${stats.publishedArticles}` : '—', label: 'Published Articles' },
  ]
}

const features = [
  {
    icon: <MessageCircle size={22} />,
    title: 'Hikmah AI Chat',
    desc: 'Ask anything about Islam and receive knowledgeable responses grounded in authentic sources.',
    tag: 'Available 24/7',
    to: '/chat',
    color: 'green',
  },
  {
    icon: <Hash size={22} />,
    title: 'Hikmah Channels',
    desc: 'Engage with topic-based communities — Aqeedah, Fiqh, Tafsir, Hadith, Seerah, Spirituality.',
    tag: '6 Topics',
    to: '/channels',
    color: 'amber',
  },
  {
    icon: <FileText size={22} />,
    title: 'Blogs',
    desc: 'Read and write insightful Islamic articles from scholars and the wider community.',
    tag: 'Read & Write',
    to: '/blogs',
    color: 'neutral',
  },
]

const trust = [
  'Responses cite Quran and authenticated Hadith',
  'Scholar-verified answers highlighted in channels',
  'User-generated content sanitized for safety',
]

export function Home() {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const stats = toStatItems(platformStats)

  useEffect(() => {
    fetchPlatformStats().then(setPlatformStats).catch(() => {})
  }, [])

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-dots" aria-hidden="true" />

        <span className="home-hero-badge">Islamic Knowledge Platform</span>

        <h1 className="home-hero-title">
          {t('home.title')}
        </h1>

        <p className="home-hero-subtitle">{t('home.subtitle')}</p>

        <p className="home-hero-desc">{t('home.description')}</p>

        <div className="home-hero-actions">
          <Link
            to={isAuthenticated ? '/chat' : '/sign-up'}
            className="btn-primary home-hero-cta home-hero-cta-bounce"
          >
            {isAuthenticated ? 'Hikmah AI Chat' : t('home.getStarted')}
            <ArrowRight size={17} />
          </Link>
          {!isAuthenticated && (
            <Link to="/sign-in" className="btn-secondary">
              {t('home.learnMore')}
            </Link>
          )}
        </div>

        {/* Trust signals */}
        <div className="home-trust">
          {trust.map((item) => (
            <div key={item} className="home-trust-item">
              <CheckCircle size={14} className="home-trust-icon" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="home-stats">
        {stats.map(({ value, label }) => (
          <div key={label} className="home-stat">
            <div className="home-stat-value">{value}</div>
            <div className="home-stat-label">{label}</div>
          </div>
        ))}
      </section>

      {/* ── Features bento ── */}
      <section className="home-features">
        <div className="home-section-label">
          <BookOpen size={14} />
          <span>What you can do</span>
        </div>

        <div className="home-features-grid">
          {features.map(({ icon, title, desc, tag, to, color }) => (
            <Link
              key={to}
              to={isAuthenticated ? to : '/sign-up'}
              className={`home-feature-card home-feature-card-${color}`}
            >
              <div className="home-feature-icon-wrap">{icon}</div>
              <div className="home-feature-body">
                <div className="home-feature-title-row">
                  <h3 className="home-feature-title">{title}</h3>
                  <ArrowRight size={15} className="home-feature-arrow" />
                </div>
                <p className="home-feature-desc">{desc}</p>
              </div>
              <div className="home-feature-footer">
                <span className="home-feature-tag">{tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quote ── */}
      <section className="home-quote">
        <div className="home-quote-inner">
          <div className="home-quote-mark">&ldquo;</div>
          <blockquote className="home-quote-text">
            Seeking knowledge is an obligation upon every Muslim.
          </blockquote>
          <cite className="home-quote-cite">
            — Prophet Muhammad &lrm;<span>(Peace Be Upon Him)</span>, Ibn Majah
          </cite>
          <div className="home-quote-deco" aria-hidden="true" />
        </div>
      </section>

      {/* ── CTA footer ── */}
      {!isAuthenticated && (
        <section className="home-cta-footer">
          <div className="home-cta-footer-inner">
            <Users size={28} className="home-cta-footer-icon" />
            <h2 className="home-cta-footer-title">Join the Community</h2>
            <p className="home-cta-footer-desc">
              Create a free account to access AI Chat, community channels, and scholarly blogs.
            </p>
            <Link to="/sign-up" className="btn-primary">
              Get Started — It's Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
