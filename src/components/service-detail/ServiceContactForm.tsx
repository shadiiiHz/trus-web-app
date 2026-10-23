import { useState } from 'react'
import GradientButton from '../ui/GradientButton'

interface Field {
  readonly id:          string
  readonly label:       string
  readonly placeholder: string
}

interface ServiceContactFormProps {
  fields: readonly Field[]
  submit: string
  /** Pre-filled, read-only "Subject" field shown above the others. */
  subject: { label: string; value: string }
  className?: string
}

export function ServiceContactForm({ fields, submit, subject, className }: ServiceContactFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((f) => [f.id, '']))
  )

  const set = (id: string, val: string) =>
    setValues((prev) => ({ ...prev, [id]: val }))

  const inputBase: React.CSSProperties = {
    display:      'block',
    width:        '100%',
    border:       'none',
    borderBottom: '1px solid rgba(0,0,0,0.15)',
    background:   'transparent',
    fontFamily:   'var(--font-body)',
    fontSize:     '16px',
    lineHeight:   '20px',
    color:        '#070606',
    padding:      '10px 0',
    outline:      'none',
    resize:       'none',
  }

  return (
    <>
      {/* Scoped placeholder styling — can't set ::placeholder via inline styles */}
      <style>{`
        .trus-contact-form input::placeholder,
        .trus-contact-form textarea::placeholder {
          color: #707075;
          font-size: 16px;
          opacity: 1;
        }
        .trus-contact-form input:focus,
        .trus-contact-form textarea:focus {
          border-bottom-color: rgba(91,43,185,0.50);
        }
        /* Mobile message box is ~100px tall (desktop keeps the single-row one). */
        @media (max-width: 1023px) {
          .trus-contact-form--service textarea { min-height: 100px; }
        }
      `}</style>

      <form
        className={['trus-contact-form', subject && 'trus-contact-form--service', className]
          .filter(Boolean)
          .join(' ')}
        onSubmit={(e) => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', gap: subject ? '17px' : '20px' }}
      >
        {subject && (
          <div>
            <label
              className="contact-field-label"
              htmlFor="contact-subject"
              style={{
                display:      'block',
                fontFamily:   'var(--font-body)',
                fontWeight:   400,
                fontSize:     '16px',
                lineHeight:   '20px',
                color:        '#070606',
                marginBottom: '10px',
              }}
            >
              {subject.label}
            </label>
            <input
              id="contact-subject"
              name="subject"
              type="text"
              readOnly
              value={subject.value}
              className="contact-input"
              style={inputBase}
            />
          </div>
        )}

        {fields.map((field) => (
          <div key={field.id}>
            <label
              className="contact-field-label"
              htmlFor={`contact-${field.id}`}
              style={{
                display:      'block',
                fontFamily:   'var(--font-body)',
                fontWeight:   400,
                fontSize:     '16px',
                lineHeight:   '20px',
                color:        '#070606',
                marginBottom: '10px',
              }}
            >
              {field.label}
            </label>

            {field.id === 'message' ? (
              <textarea
                id={`contact-${field.id}`}
                name={field.id}
                placeholder={field.placeholder}
                value={values[field.id]}
                rows={subject ? 1 : 3}
                onChange={(e) => set(field.id, e.target.value)}
                className="contact-textarea"
                style={inputBase}
              />
            ) : (
              <input
                id={`contact-${field.id}`}
                name={field.id}
                type={field.id === 'email' ? 'email' : 'text'}
                placeholder={field.placeholder}
                value={values[field.id]}
                onChange={(e) => set(field.id, e.target.value)}
                className="contact-input"
                style={inputBase}
              />
            )}
          </div>
        ))}

        <div>
          <GradientButton
            type="submit"
            text={submit}
            className="contact-submit justify-center"
            style={{
              ['--fill-gradient' as string]: subject
                ? '#5B2BB9'
                : 'linear-gradient(135deg, #875DD9 0%, #5328A8 100%)',
            }}
          />
        </div>
      </form>
    </>
  )
}

export default ServiceContactForm
