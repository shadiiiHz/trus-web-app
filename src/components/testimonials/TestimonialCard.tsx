import type { CSSProperties } from 'react'

export interface TestimonialCardProps {
  name:   string
  role:   string
  quote:  string
  avatar: string
  style?: CSSProperties
}

export function TestimonialCard({ name, role, quote, avatar, style }: TestimonialCardProps) {
  return (
    <div
      style={{
        width:        '337px',
        height:       '225px',
        background:   '#0D0D0D',
        border:       '1px solid rgba(255,255,255,0.20)',
        borderRadius: '16px',
        padding:      '24px',
        display:      'flex',
        flexDirection:'column',
        justifyContent: 'space-between',
        boxSizing:    'border-box',
        flexShrink:   0,
        ...style,
      }}
    >
      {/* Stars */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
        {[0,1,2,3,4].map((i) => (
          <span key={i} style={{ color: '#FBBF24', fontSize: '14px', lineHeight: 1 }}>★</span>
        ))}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize:   '13px',
          fontWeight: 400,
          lineHeight: '19px',
          color:      '#E0E0E0',
          margin:     0,
          flex:       1,
          overflow:   'hidden',
          display:    '-webkit-box',
          WebkitLineClamp: 4,
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
          marginTop:      '12px',
        }}
      >
        {/* Avatar + identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={avatar}
            alt={name}
            width={32}
            height={32}
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
                fontSize:   '12px',
                fontWeight: 600,
                color:      '#FFFFFF',
                margin:     0,
                lineHeight: '16px',
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize:   '11px',
                fontWeight: 400,
                color:      '#9CA3AF',
                margin:     0,
                lineHeight: '15px',
              }}
            >
              {role}
            </p>
          </div>
        </div>

        {/* Close / X icon */}
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
      </div>
    </div>
  )
}

export default TestimonialCard
