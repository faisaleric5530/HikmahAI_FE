import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, GraduationCap, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '@/hooks/useAuth'
import { updatePreferences } from '@/api/userApi'
import './Profile.scss'

export function Profile() {
  const { user, setUser } = useAuth()
  const [hashIdentity, setHashIdentity] = useState(user?.hashIdentity ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  if (!user) return null

  const handleToggle = async () => {
    const next = !hashIdentity
    setIsUpdating(true)
    try {
      await updatePreferences(next)
      setHashIdentity(next)
      setUser({ ...user, hashIdentity: next })
      toast.success(next ? 'Identity hidden in channels.' : 'Identity restored in channels.')
    } catch {
      toast.error('Failed to update preference.')
    } finally {
      setIsUpdating(false)
    }
  }

  const roleLabel = user.role === 'scholar' ? 'Scholar' : user.role === 'admin' ? 'Admin' : 'User'
  const roleBadgeClass = user.role === 'scholar' ? 'badge-green' : user.role === 'admin' ? 'badge-blue' : 'badge-amber'

  return (
    <div className="profile-page">
      <div className="page-head" style={{ marginBottom: '1.5rem' }}>
        <User size={22} className="page-head-icon" />
        <div>
          <h1 className="page-head-title">Profile</h1>
          <p className="page-head-desc">Manage your account and privacy settings</p>
        </div>
      </div>

      {/* Profile card */}
      <div className="profile-card">
        <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
        <div className="profile-card-info">
          <div className="profile-card-name">{user.name}</div>
          <div className="profile-card-email">{user.email}</div>
          <span className={`badge ${roleBadgeClass}`}>{roleLabel}</span>
        </div>
      </div>

      {/* Account details */}
      <div className="profile-section">
        <h2 className="profile-section-title">Account Details</h2>
        <div className="profile-field">
          <span className="profile-field-label">Name</span>
          <span className="profile-field-value">{user.name}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Email</span>
          <span className="profile-field-value">{user.email}</span>
        </div>
        <div className="profile-field">
          <span className="profile-field-label">Role</span>
          <span className="profile-field-value">{roleLabel}</span>
        </div>
      </div>

      {/* Privacy section — users only */}
      {user.role === 'user' && (
        <div className="profile-section">
          <h2 className="profile-section-title">Privacy</h2>
          <div className="profile-toggle-row">
            <div className="profile-toggle-info">
              <div className="profile-toggle-label">
                {hashIdentity ? <EyeOff size={15} /> : <Eye size={15} />}
                Hash My Identity in Channels
              </div>
              <p className="profile-toggle-desc">
                When enabled, your posts appear as <strong>Anon#{user.id.slice(0, 4)}</strong> instead of
                your real name. This applies to all past and future posts instantly.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={hashIdentity}
              aria-label="Hash my identity in channels"
              className={`profile-toggle ${hashIdentity ? 'profile-toggle-on' : ''}`}
              onClick={handleToggle}
              disabled={isUpdating}
            >
              <span className="profile-toggle-knob" />
            </button>
          </div>
        </div>
      )}

      {/* Scholar application CTA — users only */}
      {user.role === 'user' && (
        <Link to="/scholar-application" className="profile-scholar-cta">
          <div className="profile-scholar-cta-icon">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="profile-scholar-cta-title">Become a Verified Scholar</div>
            <div className="profile-scholar-cta-desc">
              Submit your credentials and get a trusted badge on all your answers.
            </div>
          </div>
          <span className="profile-scholar-cta-arrow">→</span>
        </Link>
      )}

      {/* Scholar badge section */}
      {user.role === 'scholar' && (
        <div className="profile-section profile-scholar-section">
          <div className="profile-scholar-badge-icon">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="profile-scholar-badge-title">Verified Scholar</div>
            <p className="profile-scholar-badge-desc">
              Your identity is always shown in channels. Verified scholars build trust through transparency.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
