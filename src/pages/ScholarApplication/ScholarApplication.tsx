import { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { GraduationCap, ArrowLeft, Clock, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { applyForScholar, fetchMyScholarApplication, type ScholarApplication } from '@/api/scholarApplicationApi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GridSkeleton } from '@/components/Skeletons/Skeletons'
import './ScholarApplication.scss'

const steps = [
  { icon: <GraduationCap size={18} />, label: 'Apply', desc: 'Submit your credentials and background' },
  { icon: <Clock size={18} />, label: 'Review', desc: 'Admin reviews within 2–5 business days' },
  { icon: <CheckCircle2 size={18} />, label: 'Verified', desc: 'Answers receive a verified scholar badge' },
]

const schema = Yup.object().shape({
  fullName: Yup.string().min(3, 'At least 3 characters').required('Required'),
  email: Yup.string().email('Enter a valid email').required('Required'),
  qualifications: Yup.string().min(30, 'Please provide at least 30 characters').required('Required'),
  ijazah: Yup.string(),
})

export function ScholarApplication() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [existingApp, setExistingApp] = useState<ScholarApplication | null>(null)
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 'user') {
      fetchMyScholarApplication()
        .then(setExistingApp)
        .catch(() => null)
        .finally(() => setAppLoading(false))
    } else {
      setAppLoading(false)
    }
  }, [user])

  if (!user || user.role !== 'user') {
    return (
      <div className="scholar-page">
        <div className="empty-state">
          <div className="empty-state-icon"><ShieldCheck size={24} /></div>
          <p className="empty-state-title">
            {user ? 'Your account already has elevated privileges.' : 'Please sign in to continue.'}
          </p>
        </div>
      </div>
    )
  }

  if (appLoading) {
    return (
      <div className="scholar-page">
        <GridSkeleton count={2} />
      </div>
    )
  }

  if (existingApp?.status === 'pending') {
    return <ScholarPendingView app={existingApp} onBack={() => navigate(-1)} />
  }

  if (existingApp?.status === 'rejected') {
    return (
      <ScholarRejectedView
        app={existingApp}
        user={user}
        onBack={() => navigate(-1)}
        onResubmit={async () => {
          const fresh = await fetchMyScholarApplication()
          setExistingApp(fresh)
        }}
      />
    )
  }

  return (
    <ScholarFormView
      user={user}
      onBack={() => navigate(-1)}
      onSuccess={async () => {
        const fresh = await fetchMyScholarApplication()
        setExistingApp(fresh)
      }}
    />
  )
}

// ─── Pending view ─────────────────────────────────────────────────────────────
function ScholarPendingView({ app, onBack }: { app: ScholarApplication; onBack: () => void }) {
  const submittedDate = new Date(app.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="scholar-page">
      <button onClick={onBack} className="scholar-back-btn">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="scholar-hero scholar-hero-pending">
        <div className="scholar-hero-deco" />
        <div className="scholar-hero-content">
          <div className="scholar-hero-icon scholar-hero-icon-amber">
            <Clock size={30} />
          </div>
          <div>
            <h1 className="scholar-hero-title">Your application is under review</h1>
            <p className="scholar-hero-desc">Submitted on {submittedDate}</p>
          </div>
        </div>
      </div>

      <div className="scholar-form-card">
        <div className="scholar-form-card-head">
          <h2 className="scholar-form-card-title">Your submitted details</h2>
        </div>
        <div className="scholar-status-fields">
          <div className="scholar-status-field">
            <span className="scholar-status-label">Full Name</span>
            <span className="scholar-status-value">{app.fullName}</span>
          </div>
          <div className="scholar-status-field">
            <span className="scholar-status-label">Qualifications</span>
            <span className="scholar-status-value">{app.qualifications}</span>
          </div>
          {app.ijazah && (
            <div className="scholar-status-field">
              <span className="scholar-status-label">Ijazah</span>
              <span className="scholar-status-value">{app.ijazah}</span>
            </div>
          )}
        </div>
        <p className="scholar-status-note">We'll notify you once a decision has been made.</p>
      </div>
    </div>
  )
}

// ─── Rejected view ────────────────────────────────────────────────────────────
function ScholarRejectedView({
  app,
  user,
  onBack,
  onResubmit,
}: {
  app: ScholarApplication
  user: { name?: string; email?: string }
  onBack: () => void
  onResubmit: () => Promise<void>
}) {
  const reviewedDate = app.reviewedAt
    ? new Date(app.reviewedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="scholar-page">
      <button onClick={onBack} className="scholar-back-btn">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="scholar-hero scholar-hero-rejected">
        <div className="scholar-hero-deco" />
        <div className="scholar-hero-content">
          <div className="scholar-hero-icon scholar-hero-icon-danger">
            <XCircle size={30} />
          </div>
          <div>
            <h1 className="scholar-hero-title">Your application was not approved</h1>
            {reviewedDate && <p className="scholar-hero-desc">Reviewed on {reviewedDate}</p>}
          </div>
        </div>
      </div>

      {app.reviewerNote && (
        <blockquote className="scholar-reviewer-note">
          <span className="scholar-reviewer-note-label">Admin feedback</span>
          <span>{app.reviewerNote}</span>
        </blockquote>
      )}

      <div className="scholar-form-card">
        <div className="scholar-form-card-head">
          <h2 className="scholar-form-card-title">Update and resubmit</h2>
          <p className="scholar-form-card-desc">
            Address the feedback above and resubmit your application.
          </p>
        </div>
        <Formik
          initialValues={{
            fullName: app.fullName || user.name || '',
            email: user.email || '',
            qualifications: app.qualifications || '',
            ijazah: app.ijazah || '',
          }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await applyForScholar({
                fullName: values.fullName,
                qualifications: values.qualifications,
                ijazah: values.ijazah || undefined,
              })
              toast.success('Application resubmitted successfully.')
              await onResubmit()
            } catch {
              toast.error('Resubmission failed. Please try again.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="form-layout">
              <FormFields errors={errors} touched={touched} />
              <div className="scholar-form-footer">
                <p className="scholar-form-note">Resubmitting replaces your previous application.</p>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <span className="btn-loading"><span className="btn-spinner" />Submitting...</span>
                  ) : (
                    <><GraduationCap size={16} />Resubmit Application</>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

// ─── Original form view ───────────────────────────────────────────────────────
function ScholarFormView({
  user,
  onBack,
  onSuccess,
}: {
  user: { name?: string; email?: string }
  onBack: () => void
  onSuccess: () => Promise<void>
}) {
  return (
    <div className="scholar-page">
      <button onClick={onBack} className="scholar-back-btn">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="scholar-hero">
        <div className="scholar-hero-deco" />
        <div className="scholar-hero-content">
          <div className="scholar-hero-icon">
            <GraduationCap size={30} />
          </div>
          <div>
            <h1 className="scholar-hero-title">Become a Verified Scholar</h1>
            <p className="scholar-hero-desc">
              Share your Islamic knowledge with verified authority. Approved scholars receive a
              trusted badge displayed on all their answers and contributions.
            </p>
          </div>
        </div>
      </div>

      <div className="scholar-steps">
        {steps.map(({ icon, label, desc }, i) => (
          <div key={label} className="scholar-step">
            <div className="scholar-step-icon">{icon}</div>
            <div className="scholar-step-body">
              <div className="scholar-step-num">Step {i + 1}</div>
              <div className="scholar-step-label">{label}</div>
              <div className="scholar-step-desc">{desc}</div>
            </div>
            {i < steps.length - 1 && <div className="scholar-step-connector" />}
          </div>
        ))}
      </div>

      <div className="scholar-form-card">
        <div className="scholar-form-card-head">
          <h2 className="scholar-form-card-title">Your Application</h2>
          <p className="scholar-form-card-desc">
            All fields marked as required must be completed before submission.
          </p>
        </div>
        <Formik
          initialValues={{ fullName: user.name || '', email: user.email || '', qualifications: '', ijazah: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const result = await applyForScholar({
                fullName: values.fullName,
                qualifications: values.qualifications,
                ijazah: values.ijazah || undefined,
              })
              if (result.success) {
                toast.success(result.message)
                resetForm()
                await onSuccess()
              }
            } catch {
              toast.error('Submission failed. Please try again.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="form-layout">
              <FormFields errors={errors} touched={touched} />
              <div className="scholar-form-footer">
                <p className="scholar-form-note">
                  Applications are reviewed within 2–5 business days. You will be notified by email.
                </p>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <span className="btn-loading"><span className="btn-spinner" />Submitting...</span>
                  ) : (
                    <><GraduationCap size={16} />Submit Application</>
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

// ─── Shared form fields ───────────────────────────────────────────────────────
function FormFields({ errors, touched }: { errors: Record<string, string | undefined>; touched: Record<string, boolean | undefined> }) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="fullName" className="form-label">Full Name</label>
        <Field
          id="fullName"
          name="fullName"
          placeholder="Your full name as on your credentials"
          className={`form-field ${errors.fullName && touched.fullName ? 'has-error' : ''}`}
        />
        <ErrorMessage name="fullName" component="p" className="form-err" />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <Field
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          className={`form-field ${errors.email && touched.email ? 'has-error' : ''}`}
        />
        <ErrorMessage name="email" component="p" className="form-err" />
      </div>

      <div className="form-group">
        <label htmlFor="qualifications" className="form-label">
          Qualifications &amp; Background
        </label>
        <Field
          id="qualifications"
          name="qualifications"
          as="textarea"
          rows={5}
          placeholder="Describe your Islamic studies background, institutions attended, teachers you studied under..."
          className={`form-field form-textarea ${errors.qualifications && touched.qualifications ? 'has-error' : ''}`}
        />
        <p className="form-hint">
          Include formal and informal Islamic education, years of study, and areas of specialization.
        </p>
        <ErrorMessage name="qualifications" component="p" className="form-err" />
      </div>

      <div className="form-group">
        <label htmlFor="ijazah" className="form-label">
          Ijazah / Certifications
          <span className="form-optional">(optional)</span>
        </label>
        <Field
          id="ijazah"
          name="ijazah"
          as="textarea"
          rows={3}
          placeholder="List any ijazah, diplomas, or formal certifications you hold..."
          className="form-field form-textarea"
        />
      </div>
    </>
  )
}
