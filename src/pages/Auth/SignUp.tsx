import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { register } from '@/api/authApi'
import { toast } from 'react-toastify'
import { HikmahLogoIcon } from '@/components/Icons/HikmahLogoIcon'
import './Auth.scss'

const schema = Yup.object().shape({
  name: Yup.string().min(2, 'At least 2 characters').required('Required'),
  email: Yup.string().email('Enter a valid email').required('Required'),
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[a-z]/, 'Include a lowercase letter')
    .matches(/[A-Z]/, 'Include an uppercase letter')
    .matches(/[0-9]/, 'Include a digit')
    .matches(/[^A-Za-z0-9]/, 'Include a special character')
    .required('Required'),
})

export function SignUp() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="auth-layout">
      <div className="auth-panel" aria-hidden="true">
        <div className="auth-panel-deco" />
        <div className="auth-panel-glow" />
        <div className="auth-panel-content">
          <div className="auth-panel-brand">
            <div className="auth-panel-logo"><HikmahLogoIcon size={32} /></div>
            <div>
              <h2 className="auth-panel-name">Hikmah AI</h2>
              <p className="auth-panel-tagline">Islamic Knowledge, Powered by AI</p>
            </div>
          </div>

          <div className="auth-panel-headline">
            <h3 className="auth-panel-headline-text">
              Seek Knowledge.<br />Find Guidance.<br />Grow in Faith.
            </h3>
            <p className="auth-panel-headline-sub">
              Join thousands learning authentic Islam with AI-powered guidance.
            </p>
          </div>

          <ul className="auth-panel-features">
            <li className="auth-panel-feature">
              <span className="auth-panel-feature-check"><Check size={11} strokeWidth={3} /></span>
              AI answers grounded in Quran &amp; authentic Hadith
            </li>
            <li className="auth-panel-feature">
              <span className="auth-panel-feature-check"><Check size={11} strokeWidth={3} /></span>
              Moderated Q&amp;A channels across Islamic sciences
            </li>
            <li className="auth-panel-feature">
              <span className="auth-panel-feature-check"><Check size={11} strokeWidth={3} /></span>
              Scholar-authored blogs and curated resources
            </li>
          </ul>

          <blockquote className="auth-panel-quote">
            "Seeking knowledge is an obligation upon every Muslim"
            <cite>— Ibn Majah</cite>
          </blockquote>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <Link to="/" className="auth-back-home" aria-label="Back to home">
            <HikmahLogoIcon size={24} />
            <span>Hikmah AI</span>
          </Link>

          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the community and start exploring</p>

          <Formik
            initialValues={{ name: '', email: '', password: '' }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const user = await register(values.name, values.email, values.password)
                setUser(user)
                toast.success('Welcome to Hikmah AI!')
                navigate('/chat')
              } catch (error) {
                const message = axios.isAxiosError(error)
                  ? (error.response?.data as { message?: string } | undefined)?.message
                  : undefined
                toast.error(message || 'Something went wrong. Please try again.')
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="form-layout">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full name</label>
                  <Field
                    id="name"
                    name="name"
                    placeholder="Your full name"
                    autoComplete="name"
                    className={`form-field ${errors.name && touched.name ? 'has-error' : ''}`}
                  />
                  <ErrorMessage name="name" component="p" className="form-err" />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email address</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`form-field ${errors.email && touched.email ? 'has-error' : ''}`}
                  />
                  <ErrorMessage name="email" component="p" className="form-err" />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="form-field-pass-wrap">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters, mixed case, digit & symbol"
                      autoComplete="new-password"
                      className={`form-field ${errors.password && touched.password ? 'has-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="form-pass-toggle"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="form-err" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary auth-submit-btn"
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="btn-spinner" />
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>
              </Form>
            )}
          </Formik>

          <p className="auth-alt">
            Already have an account? <Link to="/sign-in">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
