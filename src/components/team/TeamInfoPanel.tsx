import { motion, AnimatePresence } from 'framer-motion'

// Inline SVG social icons

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L2 2.25h6.84l4.265 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

// Types

export interface TeamMember {
  id:          string
  name:        string
  role:        string
  description: string
  socials:     { instagram: string; twitter: string; linkedin: string }
}

export interface TeamInfoPanelProps {
  member: TeamMember
}

// Component

export function TeamInfoPanel({ member }: TeamInfoPanelProps) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        height:         '100%',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <p
            style={{
              fontFamily:    'var(--font-body)',
              fontSize:      '13px',
              fontWeight:    400,
              lineHeight:    '20px',
              color:         '#BFBFBF',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              margin:        '0 0 4px 0',
            }}
          >
            {member.role}
          </p>

          <h3
            style={{
              fontFamily: 'var(--font-hero)',
              fontSize:   '24px',
              fontWeight: 700,
              lineHeight: '40px',
              color:      '#9F7EE1',
              margin:     '0 0 10px 0',
            }}
          >
            {member.name}
          </h3>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize:   '13.5px',
              fontWeight: 400,
              lineHeight: '21px',
              color:      'rgba(255,255,255,0.72)',
              margin:     '0 0 24px 0',
            }}
          >
            {member.description}
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {(
              [
                { href: member.socials.instagram, icon: <IconInstagram />, label: 'Instagram' },
                { href: member.socials.twitter,   icon: <IconX />,         label: 'X / Twitter' },
                { href: member.socials.linkedin,  icon: <IconLinkedIn />,  label: 'LinkedIn' },
              ] as const
            ).map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                style={{
                  color:      '#FFFFFF',
                  opacity:    0.65,
                  transition: 'opacity 0.2s, transform 0.2s',
                  lineHeight: 1,
                  display:    'block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity   = '1'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity   = '0.65'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default TeamInfoPanel
