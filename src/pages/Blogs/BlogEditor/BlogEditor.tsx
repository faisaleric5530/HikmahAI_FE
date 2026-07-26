import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useBlogs } from '@/hooks/useBlogs'
import { toast } from 'react-toastify'
import { ArrowLeft, Feather, Send } from 'lucide-react'
import './BlogEditor.scss'

const schema = Yup.object().shape({
  title: Yup.string().min(5, 'At least 5 characters').max(200).required('Required'),
  body: Yup.string().min(50, 'At least 50 characters').required('Required'),
})

export function BlogEditor() {
  const navigate = useNavigate()
  const { submitBlog } = useBlogs()

  return (
    <div className="blog-editor-page">
      <div className="blog-editor-topbar">
        <button className="blog-editor-back" onClick={() => navigate('/blogs')}>
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="blog-editor-topbar-brand">
          <Feather size={15} />
          <span>New Article</span>
        </div>
        <div className="blog-editor-topbar-right" />
      </div>

      <div className="blog-editor-body">
        <Formik
          initialValues={{ title: '', body: '' }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const blog = await submitBlog(values.title, values.body)
              toast.success('Blog post published!')
              navigate(`/blogs/${blog.id}`)
            } catch {
              toast.error('Failed to publish.')
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="blog-editor-form">
              <div className="blog-editor-card">
                <div className="blog-editor-section">
                  <label htmlFor="title" className="blog-editor-label">
                    Title <span className="blog-editor-required">*</span>
                  </label>
                  <Field
                    id="title"
                    name="title"
                    placeholder="What's your article about?"
                    className={`blog-editor-title-input ${errors.title && touched.title ? 'has-error' : ''}`}
                  />
                  <ErrorMessage name="title" component="p" className="form-err" />
                </div>

                <div className="blog-editor-separator" />

                <div className="blog-editor-section">
                  <label htmlFor="body" className="blog-editor-label">
                    Content <span className="blog-editor-required">*</span>
                  </label>
                  <p className="blog-editor-hint">
                    HTML formatting supported — use &lt;p&gt;, &lt;h3&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                  </p>
                  <Field
                    id="body"
                    name="body"
                    as="textarea"
                    rows={20}
                    placeholder="Start writing your article here..."
                    className={`blog-editor-body-input ${errors.body && touched.body ? 'has-error' : ''}`}
                  />
                  <ErrorMessage name="body" component="p" className="form-err" />
                </div>
              </div>

              <div className="blog-editor-actions">
                <p className="blog-editor-actions-note">
                  Your article will be visible to all community members after publishing.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="blog-editor-publish-btn"
                >
                  {isSubmitting ? (
                    <span className="btn-loading">
                      <span className="btn-spinner" />
                      Publishing…
                    </span>
                  ) : (
                    <>
                      <Send size={15} />
                      Publish Article
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
