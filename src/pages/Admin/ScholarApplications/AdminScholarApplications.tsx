import { useState, useEffect } from 'react'
import { GraduationCap, Check, X } from 'lucide-react'
import { toast } from 'react-toastify'
import {
  fetchAllScholarApplications,
  reviewScholarApplication,
  type ScholarApplication,
} from '@/api/scholarApplicationApi'
import { ListSkeleton } from '@/components/Skeletons/Skeletons'
import './AdminScholarApplications.scss'

type TabFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function AdminScholarApplications() {
  const [applications, setApplications] = useState<ScholarApplication[]>([])
  const [activeTab, setActiveTab] = useState<TabFilter>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState<{ open: boolean; applicationId: string | null }>({
    open: false,
    applicationId: null,
  })
  const [rejectNote, setRejectNote] = useState('')
  const [isActing, setIsActing] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [activeTab])

  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const data = await fetchAllScholarApplications(
        activeTab === 'all' ? undefined : activeTab
      )
      setApplications(data)
    } catch {
      toast.error('Failed to load applications.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setIsActing(true)
    try {
      await reviewScholarApplication(id, 'approved')
      toast.success('Application approved.')
      loadApplications()
    } catch {
      toast.error('Failed to approve application.')
    } finally {
      setIsActing(false)
    }
  }

  const openRejectModal = (id: string) => {
    setRejectNote('')
    setRejectModal({ open: true, applicationId: id })
  }

  const handleReject = async () => {
    if (!rejectModal.applicationId) return
    setIsActing(true)
    try {
      await reviewScholarApplication(
        rejectModal.applicationId,
        'rejected',
        rejectNote.trim() || undefined
      )
      toast.success('Application rejected.')
      setRejectModal({ open: false, applicationId: null })
      loadApplications()
    } catch {
      toast.error('Failed to reject application.')
    } finally {
      setIsActing(false)
    }
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="admin-applications-page">
      <div className="page-head-row">
        <div className="page-head" style={{ marginBottom: 0 }}>
          <GraduationCap size={22} className="page-head-icon" />
          <div>
            <h1 className="page-head-title">Scholar Applications</h1>
            <p className="page-head-desc">Review and manage scholar credential requests</p>
          </div>
        </div>
      </div>

      <div className="admin-app-tabs">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`admin-app-tab ${activeTab === key ? 'admin-app-tab-active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No applications</p>
          <p className="empty-state-desc">
            {activeTab === 'pending'
              ? 'No pending applications at the moment.'
              : `No ${activeTab === 'all' ? '' : activeTab} applications found.`}
          </p>
        </div>
      ) : (
        <div className="admin-app-list">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onApprove={handleApprove}
              onReject={openRejectModal}
              isActing={isActing}
            />
          ))}
        </div>
      )}

      {rejectModal.open && (
        <>
          <div
            className="admin-modal-backdrop"
            onClick={() => setRejectModal({ open: false, applicationId: null })}
          />
          <div className="admin-modal" role="dialog" aria-modal="true">
            <h2 className="admin-modal-title">Reject Application</h2>
            <p className="admin-modal-desc">Provide a reason to help the applicant improve their submission.</p>
            <div className="form-group">
              <label htmlFor="rejectNote" className="form-label">
                Reason for rejection
                <span className="form-optional">(optional)</span>
              </label>
              <textarea
                id="rejectNote"
                className="form-field form-textarea"
                rows={4}
                maxLength={500}
                placeholder="Describe what the applicant should improve..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
              />
              <p className="form-hint">{rejectNote.length}/500</p>
            </div>
            <div className="admin-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setRejectModal({ open: false, applicationId: null })}
                disabled={isActing}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={handleReject} disabled={isActing}>
                <X size={15} />
                {isActing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface CardProps {
  app: ScholarApplication
  onApprove: (id: string) => void
  onReject: (id: string) => void
  isActing: boolean
}

function ApplicationCard({ app, onApprove, onReject, isActing }: CardProps) {
  const initials = app.applicant?.name?.[0]?.toUpperCase() ?? '?'
  const submittedDate = new Date(app.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const reviewedDate = app.reviewedAt
    ? new Date(app.reviewedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className={`admin-app-card admin-app-card-${app.status}`}>
      <div className="admin-app-card-head">
        <div className="admin-app-avatar">{initials}</div>
        <div className="admin-app-info">
          <div className="admin-app-name">{app.applicant?.name ?? app.fullName}</div>
          {app.applicant?.email && (
            <div className="admin-app-email">{app.applicant.email}</div>
          )}
          <div className="admin-app-meta">Submitted {submittedDate}</div>
        </div>
        <span className={`badge badge-${app.status === 'pending' ? 'amber' : app.status === 'approved' ? 'green' : 'red'}`}>
          {app.status}
        </span>
      </div>

      <div className="admin-app-body">
        <div className="admin-app-field">
          <span className="admin-app-field-label">Full Name</span>
          <span className="admin-app-field-value">{app.fullName}</span>
        </div>
        <div className="admin-app-field">
          <span className="admin-app-field-label">Qualifications</span>
          <span className="admin-app-field-value admin-app-field-excerpt">{app.qualifications}</span>
        </div>
        {app.ijazah && (
          <div className="admin-app-field">
            <span className="admin-app-field-label">Ijazah</span>
            <span className="admin-app-field-value">{app.ijazah}</span>
          </div>
        )}
        {app.reviewerNote && (
          <div className="admin-app-field">
            <span className="admin-app-field-label">Reviewer note</span>
            <span className="admin-app-field-value">{app.reviewerNote}</span>
          </div>
        )}
        {reviewedDate && (
          <div className="admin-app-meta" style={{ marginTop: '0.25rem' }}>
            Reviewed on {reviewedDate}
          </div>
        )}
      </div>

      {app.status === 'pending' && (
        <div className="admin-app-actions">
          <button
            className="btn-primary-sm admin-app-approve"
            onClick={() => onApprove(app.id)}
            disabled={isActing}
          >
            <Check size={14} />
            Approve
          </button>
          <button
            className="btn-secondary admin-app-reject"
            onClick={() => onReject(app.id)}
            disabled={isActing}
          >
            <X size={14} />
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
