import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MessageCircle, FileText, LogOut, User, Menu, X, GraduationCap, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/store/useUIStore'
import { MosqueIcon } from '@/components/Icons/MosqueIcon'
import { HikmahLogoIcon } from '@/components/Icons/HikmahLogoIcon'
import './Header.scss'

export function Header() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)

  const handleLogout = () => {
    setIsMobileOpen(false)
    logout()
    navigate('/')
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isMobileOpen])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const navItems = [
    { to: '/chat', icon: <MessageCircle size={16} />, label: t('nav.chat') },
    { to: '/channels', icon: <MosqueIcon size={16} />, label: t('nav.channels') },
    { to: '/blogs', icon: <FileText size={16} />, label: t('nav.blogs') },
  ]

  return (
    <header className="hikmah-header">
      <nav className="header-inner">
        <div className="header-logo-wrap">
          <Link to="/" className="header-logo">
            <HikmahLogoIcon size={30} />
            <span className="header-logo-text">Hikmah AI</span>
          </Link>
        </div>

        {isAuthenticated && (
          <div className="header-nav">
            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? 'nav-link-active' : ''}`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}

        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="header-theme-btn"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'user' ? '/scholar-application' : '#'}
                className="header-user-btn"
              >
                <div className="header-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                <span className="header-user-name">{user?.name}</span>
                {user?.role === 'scholar' && <span className="header-scholar-tag">Scholar</span>}
                {user?.role === 'admin' && <span className="header-scholar-tag">Admin</span>}
              </Link>
              <button onClick={handleLogout} className="header-icon-btn" aria-label="Sign out">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className={`header-auth-btn header-auth-btn-desktop ${location.pathname === '/sign-in' ? 'header-auth-btn-active' : 'header-auth-btn-ghost'}`}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/sign-up"
                className={`header-auth-btn header-auth-btn-desktop ${location.pathname === '/sign-up' ? 'header-auth-btn-active' : 'header-auth-btn-ghost'}`}
              >
                {t('nav.signUp')}
              </Link>
            </>
          )}

          <button
            className="header-mobile-toggle"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileOpen}
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isMobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        ref={mobileMenuRef}
        className={`mobile-menu ${isMobileOpen ? 'mobile-menu-open' : ''}`}
        aria-hidden={!isMobileOpen}
      >
        {isAuthenticated ? (
          <>
            <div className="mobile-menu-user">
              <div className="mobile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-role">{user?.role}</div>
              </div>
            </div>

            <div className="mobile-nav-divider" />

            {navItems.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`mobile-nav-link ${isActive(to) ? 'mobile-nav-link-active' : ''}`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            ))}

            {user?.role === 'user' && (
              <Link to="/scholar-application" className="mobile-nav-link">
                <GraduationCap size={16} />
                <span>Become a Scholar</span>
              </Link>
            )}

            <div className="mobile-nav-divider" />

            <button onClick={handleLogout} className="mobile-nav-link mobile-nav-logout">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/sign-in" className="mobile-nav-link">
              <User size={16} />
              <span>{t('nav.signIn')}</span>
            </Link>
            <Link to="/sign-up" className="mobile-nav-link mobile-nav-link-primary">
              <span>{t('nav.signUp')}</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
