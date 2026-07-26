import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { GraduationCap, ArrowLeft, Clock, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { applyForScholar } from '@/api/scholarApplicationApi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import './ScholarApplication.scss'

const steps = [
  {
    icon: <GraduationCap size={18} />,
    label: 'Apply',
    desc: 'Submit your credentials and background',
  },
  {
    icon: <Clock size={18} />,
    label: 'Review',
    desc: 'Admin reviews within 2–5 business days',
  },
  {
    icon: <CheckCircle2 size={18} />,
    label: 'Verified',
    desc: 'Answers receive a verified scholar badge',
  },
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

  return (
    <div className="scholar-page">
      <button onClick={() => navigate(-1)} className="scholar-back-btn">
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Hero */}
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

      {/* Process steps */}
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

      {/* Form card */}
      <div className="scholar-form-card">
        <div className="scholar-form-card-head">
          <h2 className="scholar-form-card-title">Your Application</h2>
          <p className="scholar-form-card-desc">
            All fields marked as required must be completed before submission.
          </p>
        </div>

        <Formik
          initialValues={{ fullName: user.name || '', email: '', qualifications: '', ijazah: '' }}
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

              <div className="scholar-form-footer">
                <p className="scholar-form-note">
                  Applications are reviewed within 2–5 business days. You will be notified by email.
                </p>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="btn-spinner" />
                      Submitting...
                    </span>
                  ) : (
                    <>
                      <GraduationCap size={16} />
                      Submit Application
                    </>
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
