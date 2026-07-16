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
  // pathA (the "top" light) now genuinely starts on the BOTTOM edge, sweeps
  // through the bottom-left corner, climbs the whole left edge, sweeps
  // through the top-left corner, and settles on the top edge — a real
  // rotation around one whole side, instead of starting on the flat left
  // edge. pathB mirrors it: starts on the TOP edge, rotates down through
  // the right side, settles on the bottom edge.
  const NEAR_FRACTION = 0.5  // tail length on the starting (opposite) edge — animation only, never shown at rest
  const MID_FRACTION  = 0.3   // how much of the connecting side edge the *animation* sweeps through
  const FAR_FRACTION  = 0.55  // resting-bar length on the destination edge
  const REST_VERT_FRACTION = 0.26 // how much of the side edge stays visible once held — matches the old, compact resting look
  const availableVert  = h - 2 * r
  const availableHoriz = w - 2 * r
  const nearRun = availableHoriz * NEAR_FRACTION
  const midRun  = availableVert * MID_FRACTION
  const farRun  = availableHoriz * FAR_FRACTION
  const restVertRun = availableVert * REST_VERT_FRACTION

  const stopTop = r + farRun
  const stopBottom = w - r - farRun

  const pathA = `M ${r + nearRun},${h} H ${r} A ${r},${r} 0 0 1 0,${h - r} V ${r} A ${r},${r} 0 0 1 ${r},0 H ${stopTop}`
  const pathB = `M ${w - r - nearRun},0 H ${w - r} A ${r},${r} 0 0 1 ${w},${r} V ${h - r} A ${r},${r} 0 0 1 ${w - r},${h} H ${stopBottom}`

  // The *drawn* path is long (starts on the opposite edge, through both
  // corners) so the reveal sweep genuinely travels from there — but only
  // its final stretch (matching the old, compact single-corner look) stays
  // on screen once held. dashUnits sizes that visible stretch; rest/hold
  // offsets grow it in starting from position 0 (the far starting tail)
  // and ending exactly on that stretch, same as always.
  const arcLen   = (Math.PI / 2) * r
  const totalLen = nearRun + arcLen + midRun + arcLen + farRun
  const visibleLen = restVertRun + arcLen + farRun

  const dashUnits  = (visibleLen / totalLen) * 100
  const restOffset = dashUnits
  const holdOffset = -(100 - dashUnits)

  const dashStyle = {
    '--trace-dash':      dashUnits,
    '--trace-rest':      restOffset,
    '--trace-hold':      holdOffset,
  } as React.CSSProperties

  const fadeIdA = `${gradId}-fade-a`
  const fadeIdB = `${gradId}-fade-b`

  // Everything before `windowStart` (the far starting tail, its corner, and
  // the excess mid-run beyond `restVertRun`) is never part of the held
  // shape, only flashed through during the fast sweep — keep it uniformly
  // dim so that's consistent whether or not it happens to be visible. The
  // dim-to-bright transition then lands at the same relative spot within
  // the visible stretch as the old single-corner design did.
  const DIM_OPACITY        = 0.25
  const FAR_DIM_START_OPACITY = 0.8
  const FAR_DIM_OPACITY    = 0.6
  const FAR_DIM_SPAN       = 50
  const windowStart = 100 - dashUnits
  const cornerPct  = windowStart + ((restVertRun + arcLen) / totalLen) * 100
  const rampEnd    = cornerPct + 10
  const farDimStart = 100 - FAR_DIM_SPAN

  return (
    <svg className="btn-trace-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={fadeIdA} gradientUnits="userSpaceOnUse" x1={r + nearRun} y1={h} x2={stopTop} y2={0}>
          <stop offset="0%"               stopColor="rgb(255,255,255)" stopOpacity={DIM_OPACITY} />
          <stop offset={`${cornerPct}%`}  stopColor="rgb(255,255,255)" stopOpacity={DIM_OPACITY} />
          <stop offset={`${rampEnd}%`}    stopColor="rgb(255,255,255)" stopOpacity="1" />
          <stop offset={`${farDimStart}%`} stopColor="rgb(255,255,255)" stopOpacity={FAR_DIM_START_OPACITY} />
          <stop offset="100%"             stopColor="rgb(255,255,255)" stopOpacity={FAR_DIM_OPACITY} />
        </linearGradient>
        <linearGradient id={fadeIdB} gradientUnits="userSpaceOnUse" x1={w - r - nearRun} y1={0} x2={stopBottom} y2={h}>
          <stop offset="0%"               stopColor="rgb(255,255,255)" stopOpacity={DIM_OPACITY} />
          <stop offset={`${cornerPct}%`}  stopColor="rgb(255,255,255)" stopOpacity={DIM_OPACITY} />
          <stop offset={`${rampEnd}%`}    stopColor="rgb(255,255,255)" stopOpacity="1" />
          <stop offset={`${farDimStart}%`} stopColor="rgb(255,255,255)" stopOpacity={FAR_DIM_START_OPACITY} />
          <stop offset="100%"             stopColor="rgb(255,255,255)" stopOpacity={FAR_DIM_OPACITY} />
        </linearGradient>
      </defs>
      <path className="btn-trace-light" pathLength={100} style={{ ...dashStyle, stroke: `url(#${fadeIdA})` }} d={pathA} />
      <path className="btn-trace-light" pathLength={100} style={{ ...dashStyle, stroke: `url(#${fadeIdB})` }} d={pathB} />
    </svg>
  )
}

export default Button
