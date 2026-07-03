import type { ReactNode } from 'react'

interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
}

export function ServiceCard({ icon, title, description }: ServiceCardProps) {
  return (
    <div
      style={{
        width:        '337px',
        minWidth:     '337px',
        height:       '220px',
        borderRadius: '16px',
        padding:      '24px',
        background:   '#FFFFFF',
        display:      'flex',
        flexDirection: 'column',
        gap:          '14px',
        flexShrink:   0,
      }}
    >
      <div style={{ color: '#6F45F6', width: '42px', height: '42px', flexShrink: 0 }}>
        {icon}
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize:   '20px',
          lineHeight: '1.25',
          color:      '#000000',
          margin:     0,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 400,
          fontSize:   '13.5px',
          lineHeight: '1.55',
          color:      '#707075',
          margin:     0,
        }}
      >
        {description}
      </p>
    </div>
  )
}
