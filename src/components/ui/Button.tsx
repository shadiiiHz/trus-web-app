import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DURATION_SM, EASE_IN_OUT } from '@/motion/variants'

export type ButtonVariant = 'primary' | 'ghost' | 'outline-accent' | 'gradient'

export interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  /**
   * Adds two neon-cyan lights that trace the border on hover — one climbs the
   * left edge onto the top edge, the other mirrors it from the right edge
   * onto the bottom edge — and hold just past the midpoint while hovered.
   */
  glow?: boolean
  /** Corner radius (px) used to build the glow trace path. Defaults to a pill radius for `outline-accent`, 8px otherwise. */
  glowRadius?: number
  /** Whether hover/tap apply the built-in scale motion. Defaults to true. */
  hoverScale?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-[16px] font-medium font-body cursor-pointer transition-all focus-visible:outline-none select-none whitespace-nowrap'

const variants: Record<ButtonVariant, string> = {
  'primary':
    'rounded-[8px] bg-brand-accent text-white hover:bg-brand-accent-light',
  'ghost':
    'rounded-[8px] bg-transparent text-brand-white border border-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]',
  'outline-accent':
    'rounded-full bg-transparent text-brand-accent border border-brand-accent hover:bg-[rgba(135,93,217,0.1)]',
  'gradient':
    'rounded-[8px] text-white',
}

const gradientBg: React.CSSProperties = {
  background: 'linear-gradient(90deg, #875DD9 0%, #5328A8 100%)',
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  style,
  'aria-label': ariaLabel,
  glow = false,
  glowRadius,
  hoverScale = true,
}: ButtonProps) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    if (!glow) return
    const el = wrapRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [glow])

  const classes = `${base} ${variants[variant]} ${glow ? 'relative z-10' : ''} ${className}`

  // Merge gradient background with any caller-supplied styles
  const computedStyle: React.CSSProperties | undefined =
    variant === 'gradient'
      ? { ...gradientBg, ...style }
      : style

  const motionProps = hoverScale
    ? {
        whileHover: { scale: 1.03 },
        whileTap:   { scale: 0.97 },
        transition: { duration: DURATION_SM, ease: EASE_IN_OUT },
      }
    : {}

  const buttonEl = href ? (
    <motion.a
      href={href}
      className={classes}
      style={computedStyle}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.a>
  ) : (
    <motion.button
      type={type}
      className={classes}
      style={computedStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.button>
  )

  if (!glow) return buttonEl

  return (
    <span ref={wrapRef} className="btn-glow-wrap">
      {size && <GlowTracePaths width={size.w} height={size.h} radius={glowRadius} pill={variant === 'outline-accent'} />}
      {buttonEl}
    </span>
  )
}

/** Builds the two mirrored corner-tracing SVG paths for a button of the given size. */
function GlowTracePaths({ width: w, height: h, radius, pill }: { width: number; height: number; radius?: number; pill?: boolean }) {
  const gradId = useId()
  if (w === 0 || h === 0) return null

  const r = pill ? h / 2 : Math.min(radius ?? 8, h / 2)
  const stopTop = Math.min(w - r, w / 2 + 16)
  const stopBottom = Math.max(r, w / 2 - 16)

  const pathA = `M 0,${h - r} V ${r} A ${r},${r} 0 0 1 ${r},0 H ${stopTop}`
  const pathB = `M ${w},${r} V ${h - r} A ${r},${r} 0 0 1 ${w - r},${h} H ${stopBottom}`

  // The dash has a constant true length along the path, but while it still
  // straddles the corner it visually spans two directions at once and reads
  // as bigger than the same length lying flat. Size the dash off the final
  // straight run it comes to rest on so the held state stays a full, solid
  // bar instead of visually "shrinking" once it stops bending the corner.
  const verticalLen = h - 2 * r
  const arcLen       = (Math.PI / 2) * r
  const horizLen      = stopTop - r
  const totalLen      = verticalLen + arcLen + horizLen

  const dashPx     = Math.min(horizLen - 4, Math.max(24, horizLen * 0.85))
  const dashUnits  = (dashPx / totalLen) * 100
  const restOffset = dashUnits
  const holdOffset = -(100 - dashUnits)

  const dashStyle = {
    '--trace-dash':      dashUnits,
    '--trace-rest':      restOffset,
    '--trace-hold':      holdOffset,
  } as React.CSSProperties

  const fadeIdA = `${gradId}-fade-a`
  const fadeIdB = `${gradId}-fade-b`

  return (
    <svg className="btn-trace-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={fadeIdA} gradientUnits="userSpaceOnUse" x1={0} y1={h - r} x2={stopTop} y2={0}>
          <stop offset="0%"   stopColor="rgb(135,93,217)" stopOpacity="0" />
          <stop offset="12%"  stopColor="rgb(135,93,217)" stopOpacity="1" />
          <stop offset="88%"  stopColor="rgb(135,93,217)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(135,93,217)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={fadeIdB} gradientUnits="userSpaceOnUse" x1={w} y1={r} x2={stopBottom} y2={h}>
          <stop offset="0%"   stopColor="rgb(135,93,217)" stopOpacity="0" />
          <stop offset="12%"  stopColor="rgb(135,93,217)" stopOpacity="1" />
          <stop offset="88%"  stopColor="rgb(135,93,217)" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(135,93,217)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="btn-trace-light" pathLength={100} style={{ ...dashStyle, stroke: `url(#${fadeIdA})` }} d={pathA} />
      <path className="btn-trace-light" pathLength={100} style={{ ...dashStyle, stroke: `url(#${fadeIdB})` }} d={pathB} />
    </svg>
  )
}

export default Button
