import { useParams, useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useChannelDetail } from '@/hooks/useChannels'
import { toast } from 'react-toastify'
import './AskQuestion.scss'

const schema = Yup.object().shape({
  title: Yup.string().min(10, 'At least 10 characters').max(200).required('Required'),
  body: Yup.string().min(20, 'At least 20 characters').required('Required'),
})

export function AskQuestion() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { submitQuestion } = useChannelDetail(id!)

  return (
    <div className="ask-panel">
      <div className="ask-panel-head">
        <button
          className="ask-panel-back"
          onClick={() => navigate(`/channels/${id}`)}
          aria-label="Back to channel"
        >
          ← Back to channel
        </button>
        <h1 className="ask-panel-title">Ask a Question</h1>
        <p className="ask-panel-desc">Provide a clear title and detailed description</p>
      </div>

      <Formik
        initialValues={{ title: '', body: '' }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await submitQuestion(values.title, values.body)
            toast.success('Your question has been posted!')
            navigate(`/channels/${id}`)
          } catch {
            toast.error('Failed to post question.')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="form-layout">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Question Title</label>
              <Field
                id="title" name="title"
                placeholder="e.g., What is the ruling on interest in Islam?"
                className={`form-field ${errors.title && touched.title ? 'has-error' : ''}`}
              />
              <p className="form-hint">Summarize your question in one clear sentence</p>
              <ErrorMessage name="title" component="p" className="form-err" />
            </div>

            <div className="form-group">
              <label htmlFor="body" className="form-label">Details</label>
              <Field
                id="body" name="body" as="textarea" rows={6}
                placeholder="Provide context and any specific aspects you'd like addressed..."
                className={`form-field form-textarea ${errors.body && touched.body ? 'has-error' : ''}`}
              />
              <p className="form-hint">Include relevant details so others can provide accurate answers</p>
              <ErrorMessage name="body" component="p" className="form-err" />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <span className="btn-loading"><span className="btn-spinner" />Posting...</span>
              ) : 'Post Question'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  )
}
