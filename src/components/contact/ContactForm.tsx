import { useState } from 'react'

interface Field {
  readonly id:          string
  readonly label:       string
  readonly placeholder: string
}

interface ContactFormProps {
  fields: readonly Field[]
  submit: string
}

export function ContactForm({ fields, submit }: ContactFormProps) {
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
    fontSize:     '14px',
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
          opacity: 1;
        }
        .trus-contact-form input:focus,
        .trus-contact-form textarea:focus {
          border-bottom-color: rgba(91,43,185,0.50);
        }
      `}</style>

      <form
        className="trus-contact-form"
        onSubmit={(e) => e.preventDefault()}
        style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}
      >
        {fields.map((field) => (
          <div key={field.id}>
            <label
              htmlFor={`contact-${field.id}`}
              style={{
                display:      'block',
                fontFamily:   'var(--font-body)',
                fontWeight:   400,
                fontSize:     '14px',
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
                rows={5}
                onChange={(e) => set(field.id, e.target.value)}
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
                style={inputBase}
              />
            )}
          </div>
        ))}

        <div>
          <button
            type="submit"
            style={{
              background:    'linear-gradient(135deg, #875DD9 0%, #5328A8 100%)',
              color:         '#FFFFFF',
              fontFamily:    'var(--font-body)',
              fontWeight:    600,
              fontSize:      '15px',
              lineHeight:    '20px',
              border:        'none',
              borderRadius:  '8px',
              padding:       '14px 32px',
              cursor:        'pointer',
              transition:    'opacity 0.2s, transform 0.15s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity   = '0.88'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity   = '1'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {submit}
          </button>
        </div>
      </form>
    </>
  )
}

export default ContactForm
