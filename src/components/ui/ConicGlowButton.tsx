// ConicGlowButton.tsx

export interface ConicGlowButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  radius?: number
  borderWidth?: number
  glowColor?: string
  fillFrom?: string
  fillTo?: string
  className?: string
  'aria-label'?: string
}

export function ConicGlowButton({
  children,
  href,
  onClick,
  radius = 8,
  borderWidth = 2,
  glowColor = 'rgb(176, 4, 255)',
  fillFrom = 'rgb(147, 5, 255)',
  fillTo = 'rgb(63, 88, 143)',
  className = '',
  'aria-label': ariaLabel,
}: ConicGlowButtonProps) {
  const style = {
    '--btn-radius': `${radius}px`,
    '--btn-border-w': `${borderWidth}px`,
    '--glow-color': glowColor,
    '--fill-from': fillFrom,
    '--fill-to': fillTo,
  } as React.CSSProperties

  const inner = (
    <>
      <div className="border" />
      <div className="color1" />
      <div className="color1-glow" />
      <div className="color2" />
      <div className="color2-glow" />
      <div className="fill" />
      <span className="btn-text-wrap">{children}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} className={`framer-btn ${className}`} style={style} aria-label={ariaLabel}>
        {inner}
      </a>
    )
  }

  return (
    <button type="button" className={`framer-btn ${className}`} style={style} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  )
}