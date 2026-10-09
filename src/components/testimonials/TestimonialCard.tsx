import type { CSSProperties } from 'react'

export interface TestimonialCardProps {
  name:   string
  role:   string
  quote:  string
  avatar: string
  style?: CSSProperties
  /** Mobile carousel slide: fills its width, hugs content, larger type, X logo. */
  fluid?: boolean
}

export function TestimonialCard({ name, role, quote, avatar, style, fluid = false }: TestimonialCardProps) {
  return (
    <div
      style={{
        width:        fluid ? '100%' : '337px',
        height:       fluid ? 'auto' : '225px',
        background:   fluid ? '#050505' : '#0D0D0D',
        border:       fluid ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.20)',
        borderRadius: fluid ? 'clamp(16px, 4.6vw, 22px)' : '16px',
        padding:      fluid ? 'clamp(20px, 5vw, 26px)' : '24px',
        display:      'flex',
        flexDirection:'column',
        justifyContent: 'space-between',
        boxSizing:    'border-box',
        flexShrink:   0,
        ...style,
      }}
    >
      {/* Stars */}
      <div style={{ display: 'flex', gap: fluid ? '4px' : '3px', marginBottom: fluid ? 'clamp(16px, 5vw, 24px)' : '10px' }}>
        {[0,1,2,3,4].map((i) => (
          <span key={i} style={{ color: '#FBBF24', fontSize: fluid ? '17px' : '14px', lineHeight: 1 }}>★</span>
        ))}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize:   fluid ? 'clamp(15px, 4.2vw, 19px)' : '13px',
          fontWeight: 400,
          lineHeight: fluid ? 1.45 : '19px',
          color:      fluid ? '#FFFFFF' : '#E0E0E0',
          margin:     0,
          flex:       1,
          overflow:   fluid ? 'visible' : 'hidden',
          display:    fluid ? 'block' : '-webkit-box',
          WebkitLineClamp: fluid ? 'unset' : 4,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {quote}
      </p>

      {/* Footer */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginTop:      fluid ? 'clamp(18px, 5.4vw, 26px)' : '12px',
        }}
      >
        {/* Avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: fluid ? '14px' : '10px' }}>
          <img
            src={avatar}
            alt={name}
            width={fluid ? 44 : 32}
            height={fluid ? 44 : 32}
            loading="lazy"
            decoding="async"
            style={{
              borderRadius: '50%',
              objectFit:    'cover',
              flexShrink:   0,
              background:   '#1a1a2a',
            }}
            onError={(e) => { e.currentTarget.style.background = '#2a1a4a' }}
          />
          <div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize:   fluid ? 'clamp(14px, 3.7vw, 16px)' : '12px',
                fontWeight: fluid ? 500 : 600,
                color:      '#FFFFFF',
                margin:     0,
                lineHeight: fluid ? 1.35 : '16px',
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize:   fluid ? 'clamp(14px, 3.7vw, 16px)' : '11px',
                fontWeight: 400,
                color:      fluid ? '#FFFFFF' : '#9CA3AF',
                margin:     0,
                lineHeight: fluid ? 1.35 : '15px',
              }}
            >
              {role}
            </p>
          </div>
        </div>

        {fluid ? (
          <svg viewBox="0 0 24 24" fill="#FFFFFF" width="28" height="28" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L2 2.25h6.84l4.265 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ) : (
        <div
          aria-hidden="true"
          style={{
            width:          '24px',
            height:         '24px',
            borderRadius:   '50%',
            border:         '1px solid rgba(255,255,255,0.18)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
            color:          'rgba(255,255,255,0.45)',
            fontSize:       '12px',
            lineHeight:     1,
            userSelect:     'none',
          }}
        >
          ×
        </div>
        )}
      </div>
    </div>
  )
}

export default TestimonialCard
