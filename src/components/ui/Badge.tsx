export interface BadgeProps {
  children: React.ReactNode
  className?: string
}

/**
 * Eyebrow pill label — "Web Development Studio", section tags, etc.
 * Uses the accent-soft styling from the design system.
 */
export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-label font-medium uppercase tracking-widest font-body ${className}`}
      style={{
        background:   'rgba(124, 58, 237, 0.12)',
        borderColor:  'rgba(124, 58, 237, 0.30)',
        color:        'var(--color-brand-accent-light)',
      }}
    >
      {/* Accent dot */}
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ background: 'var(--color-brand-accent-light)' }}
        aria-hidden="true"
      />
      {children}
    </span>
  )
}

export default Badge
