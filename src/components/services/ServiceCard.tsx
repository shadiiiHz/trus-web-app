import type { ReactNode } from 'react'

interface ServiceCardProps {
  icon: ReactNode
  title: string
  description: string
  /** Fill the parent's width and hug content (mobile carousel slide). */
  fluid?: boolean
}

export function ServiceCard({ icon, title, description, fluid = false }: ServiceCardProps) {
  return (
    <div
      style={{
        width:        fluid ? '100%' : '337px',
        minWidth:     fluid ? 0 : '337px',
        height:       fluid ? 'auto' : '220px',
        borderRadius: fluid ? 'clamp(16px, 4.5vw, 24px)' : '16px',
        padding:      fluid ? 'clamp(22px, 6.4vw, 32px)' : '24px',
        background:   '#E3E3E3',
        display:      'flex',
        flexDirection: 'column',
        gap:          fluid ? 'clamp(14px, 4vw, 22px)' : '14px',
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
          fontSize:   fluid ? 'clamp(20px, 5.4vw, 28px)' : '20px',
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
          fontSize:   fluid ? 'clamp(14px, 3.9vw, 19px)' : '13.5px',
          lineHeight: fluid ? '1.6' : '1.55',
          color:      '#707075',
          margin:     0,
        }}
      >
        {description}
      </p>
    </div>
  )
}
