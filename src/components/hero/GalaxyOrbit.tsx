/**
 * GalaxyOrbit — TRUS service-node orbital galaxy
 *
 * Visual architecture (back → front):
 *   0. Outer ambient haze (radial gradient div)
 *   1. Static orbit ring lines (SVG ellipses with tilt transform)
 *   2. Central nebula glow (no T — the galaxy IS the hero visual)
 *   3. Service nodes — orbiting on four tilted ellipses
 *
 * Motion architecture:
 *   • useTime() → single shared timer passed to every ServiceNode
 *   • Each node: useTransform chains for angle → world-pos → depth
 *   • Depth effect: nodes at the visual "back" of their orbit are
 *     smaller and dimmer — gives a convincing 3-D tilt illusion
 *   • Entrance: each disc pops in with a spring delay stagger
 *
 * TUNING
 *   Canvas size  : W, H constants
 *   Orbit centre : CX, CY
 *   Orbit rings  : ORBITS array  (rx, ry, tiltDeg, duration, reverse)
 *   Service nodes: NODES array   (orbitIdx, angle0, size, color)
 */

import { motion, useTime, useTransform, MotionValue } from 'framer-motion'
// lucide-react not installed — this component is orphaned and never rendered.
// Stubbed so the build doesn't fail on the unused file.
const _noop = () => null
const Search = _noop, Code2 = _noop, Atom = _noop, Bot = _noop, Cog = _noop
const Layers = _noop, TrendingUp = _noop, Server = _noop, GitMerge = _noop, Zap = _noop

// Canvas
const W  = 580
const H  = 560
const CX = 290   // orbit-system centre x
const CY = 268   // orbit-system centre y — slightly above geometric centre

// Types
interface OrbitDef {
  rx:       number   // semi-major axis px
  ry:       number   // semi-minor axis px  (rx > ry gives the tilted-disc illusion)
  tiltDeg:  number   // ellipse rotation in degrees
  duration: number   // full revolution seconds
  reverse:  boolean  // counter-clockwise
  opacity:  number   // ring-line opacity
}

interface NodeDef {
  id:       string
  label:    string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon:     React.ElementType<any>
  orbitIdx: number
  angle0:   number   // starting angle on the ellipse (radians)
  size:     number   // disc diameter px
  color:    string   // neon accent color
}

// Orbit ring definitions
// Four rings — different tilt, speed, and direction create depth + parallax.
// TUNING: adjust rx/ry for more/less "3-D tilt" (lower ry/rx ratio = flatter disc)
const ORBITS: OrbitDef[] = [
  { rx:  82, ry:  30, tiltDeg: -22, duration: 16, reverse: false, opacity: 0.58 },
  { rx: 156, ry:  58, tiltDeg:  14, duration: 30, reverse: true,  opacity: 0.62 },
  { rx: 238, ry:  88, tiltDeg:  -8, duration: 48, reverse: false, opacity: 0.58 },
  { rx: 314, ry: 116, tiltDeg:  20, duration: 72, reverse: true,  opacity: 0.48 },
]

// Precomputed actual y-extent of each orbit after the tilt transform.
// Used for accurate depth normalisation: sqrt((rx·sinθ)² + (ry·cosθ)²)
const ORBIT_Y_EXT = ORBITS.map((o) => {
  const r = (o.tiltDeg * Math.PI) / 180
  return Math.sqrt((o.rx * Math.sin(r)) ** 2 + (o.ry * Math.cos(r)) ** 2)
})

// Service node definitions
// 10 services spread across the four orbits.
// angle0 values in radians; 2π/3 ≈ 2.094 for even 3-node spacing.
const NODES: NodeDef[] = [
  // Orbit 0 — innermost, fast (2 nodes)
  { id: 'seo',   label: 'SEO',          Icon: Search,    orbitIdx: 0, angle0: 0,       size: 60, color: '#a855f7' },
  { id: 'perf',  label: 'Performance',  Icon: Zap,       orbitIdx: 0, angle0: 3.14159, size: 56, color: '#c084fc' },

  // Orbit 1 — 3 nodes, 120° apart
  { id: 'react', label: 'React',        Icon: Atom,      orbitIdx: 1, angle0: 0,       size: 64, color: '#818cf8' },
  { id: 'uiux',  label: 'UI / UX',      Icon: Layers,    orbitIdx: 1, angle0: 2.094,   size: 60, color: '#e879f9' },
  { id: 'auto',  label: 'Automation',   Icon: Cog,       orbitIdx: 1, angle0: 4.189,   size: 60, color: '#a78bfa' },

  // Orbit 2 — 3 nodes
  { id: 'web',   label: 'Web Dev',      Icon: Code2,     orbitIdx: 2, angle0: 1.047,   size: 66, color: '#7c3aed' },
  { id: 'data',  label: 'Analytics',    Icon: TrendingUp, orbitIdx: 2, angle0: 3.141,  size: 62, color: '#9333ea' },
  { id: 'ai',    label: 'AI Agents',    Icon: Bot,       orbitIdx: 2, angle0: 5.236,   size: 64, color: '#d946ef' },

  // Orbit 3 — outermost, slow (2 nodes)
  { id: 'host',  label: 'Hosting',      Icon: Server,    orbitIdx: 3, angle0: 0.785,   size: 62, color: '#6d28d9' },
  { id: 'integ', label: 'Integrations', Icon: GitMerge,  orbitIdx: 3, angle0: 3.927,   size: 62, color: '#7e22ce' },
]

// Geometry
/** (x, y) on a tilted ellipse at parametric angle t */
function ptOnEllipse(o: OrbitDef, t: number) {
  const r   = (o.tiltDeg * Math.PI) / 180
  const cos = Math.cos(r)
  const sin = Math.sin(r)
  return {
    x: CX + o.rx * Math.cos(t) * cos - o.ry * Math.sin(t) * sin,
    y: CY + o.rx * Math.cos(t) * sin + o.ry * Math.sin(t) * cos,
  }
}

/** Pulsing nebula at the galaxy centre — replaces the Crystal T */
function CenterCore() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">

      {/* Outermost ambient halo */}
      <div style={{
        position: 'absolute',
        width: 420, height: 420,
        left: CX - 210, top: CY - 210,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(109,40,217,0.14) 0%, rgba(59,7,100,0.07) 40%, transparent 70%)',
        filter: 'blur(32px)',
      }} />

      {/* Pulsing mid nebula ring */}
      <motion.div
        style={{
          position: 'absolute',
          width: 200, height: 200,
          left: CX - 100, top: CY - 100,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(147,51,234,0.34) 0%, rgba(88,28,135,0.16) 45%, transparent 70%)',
          filter: 'blur(16px)',
        }}
        animate={{ opacity: [0.52, 0.95, 0.52], scale: [1, 1.15, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* Bright inner corona */}
      <motion.div
        style={{
          position: 'absolute',
          width: 76, height: 76,
          left: CX - 38, top: CY - 38,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(218,124,255,0.60) 0%, rgba(158,64,248,0.28) 45%, transparent 70%)',
          filter: 'blur(8px)',
        }}
        animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.24, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hot core point */}
      <motion.div
        style={{
          position: 'absolute',
          width: 14, height: 14,
          left: CX - 7, top: CY - 7,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.96) 0%, rgba(220,148,255,0.76) 45%, transparent 90%)',
          boxShadow:
            '0 0 10px rgba(228,148,255,0.90), 0 0 28px rgba(178,82,255,0.58)',
        }}
        animate={{ scale: [1, 1.42, 1], opacity: [0.80, 1, 0.80] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

    </div>
  )
}

/** Static SVG ellipses — one blurred glow + one crisp dashed line per ring */
function OrbitRings() {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {ORBITS.map((o, i) => (
        <g key={i}>
          {/* Wide glow stroke */}
          <ellipse
            cx={CX} cy={CY}
            rx={o.rx} ry={o.ry}
            fill="none"
            stroke="rgba(168,85,247,0.44)"
            strokeWidth="6"
            transform={`rotate(${o.tiltDeg},${CX},${CY})`}
            style={{ filter: 'blur(4px)', opacity: o.opacity }}
          />
          {/* Crisp dashed line */}
          <ellipse
            cx={CX} cy={CY}
            rx={o.rx} ry={o.ry}
            fill="none"
            stroke={`rgba(196,112,255,${(o.opacity * 0.90).toFixed(2)})`}
            strokeWidth="0.85"
            strokeDasharray="7 11"
            transform={`rotate(${o.tiltDeg},${CX},${CY})`}
          />
        </g>
      ))}
    </svg>
  )
}

// ServiceNode
interface ServiceNodeProps {
  node:          NodeDef
  time:          MotionValue<number>
  entranceDelay: number
}

/**
 * One orbiting service disc.
 *
 * Position is derived entirely from MotionValue transforms — no state, no
 * re-renders. Depth (opacity + scale) is computed from the node's y position
 * relative to its orbit's y-extent, creating a 3-D tilt illusion.
 */
function ServiceNode({ node, time, entranceDelay }: ServiceNodeProps) {
  const orbit   = ORBITS[node.orbitIdx]
  const yExt    = ORBIT_Y_EXT[node.orbitIdx]
  const { Icon, size, color } = node
  const half    = size / 2
  const dir     = orbit.reverse ? -1 : 1

  // Parametric angle — advances linearly with elapsed time
  const angle = useTransform(
    time,
    (t: number) => dir * (t / (orbit.duration * 1000)) * Math.PI * 2 + node.angle0,
  )

  // World position on the tilted ellipse
  const px = useTransform(angle, (a: number) => ptOnEllipse(orbit, a).x)
  const py = useTransform(angle, (a: number) => ptOnEllipse(orbit, a).y)

  // Translate so the disc centre sits exactly on the orbit point
  const tx = useTransform(px, (v: number) => v - half)
  const ty = useTransform(py, (v: number) => v - half)

  // Depth effect
  // n = 0: node is at the visual "top" (far side)
  // n = 1: node is at the visual "bottom" (near side)
  const depthOpacity = useTransform(py, (v: number) => {
    const n = Math.max(0, Math.min(1, (v - (CY - yExt)) / (2 * yExt)))
    return 0.36 + n * 0.64   // far: 0.36  →  near: 1.00
  })
  const depthScale = useTransform(py, (v: number) => {
    const n = Math.max(0, Math.min(1, (v - (CY - yExt)) / (2 * yExt)))
    return 0.74 + n * 0.32   // far: 0.74  →  near: 1.06
  })

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0, top: 0,
        x: tx, y: ty,
        opacity: depthOpacity,
        scale:   depthScale,
        width:   size,
        pointerEvents: 'none',
      }}
    >
      {/* Entrance spring pop */}
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
        initial={{ opacity: 0, scale: 0.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.72,
          delay:    entranceDelay,
          ease:     [0.34, 1.56, 0.64, 1],   // spring-like overshoot
        }}
      >

        {/* Glass disc */}
        <div
          style={{
            width:        size,
            height:       size,
            borderRadius: '50%',
            flexShrink:   0,
            background:
              'radial-gradient(circle at 36% 30%, rgba(118,44,210,0.88) 0%, rgba(33,6,74,0.96) 60%, rgba(9,2,24,0.99) 100%)',
            border: `1.5px solid ${color}90`,
            boxShadow: [
              `0 0 ${Math.round(size * 0.38)}px ${color}42`,
              `0 0 ${Math.round(size * 0.14)}px ${color}65`,
              `inset 0 0 ${Math.round(size * 0.28)}px rgba(200,100,255,0.10)`,
              `inset 0 ${Math.round(size * 0.08)}px ${Math.round(size * 0.18)}px rgba(255,215,255,0.07)`,
            ].join(', '),
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            size={Math.round(size * 0.34)}
            style={{ color, filter: `drop-shadow(0 0 5px ${color}cc)` }}
          />
        </div>

        <span
          style={{
            fontFamily:    'var(--font-body)',
            fontSize:      '7.5px',
            fontWeight:    700,
            color:         '#e0ccff',
            textTransform: 'uppercase',
            letterSpacing: '0.13em',
            textShadow:    `0 0 8px ${color}b0`,
            whiteSpace:    'nowrap',
          }}
        >
          {node.label}
        </span>

      </motion.div>
    </motion.div>
  )
}

/**
 * The full orbital galaxy system.
 * Drop it straight into the Hero right column — it is self-contained.
 */
export function GalaxyOrbit() {
  // Single shared timer — all nodes stay perfectly frame-synchronised
  const time = useTime()

  return (
    <div
      className="relative select-none"
      style={{ width: `${W}px`, height: `${H}px` }}
      aria-hidden="true"
    >

      {/* Outer ambient haze — a wide soft purple bloom behind everything */}
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          background:
            'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(109,40,217,0.18) 0%, transparent 68%)',
          filter: 'blur(26px)',
          pointerEvents: 'none',
        }}
      />

      {/* Static orbit ring lines (SVG) */}
      <OrbitRings />

      {/* Central nebula — no T */}
      <CenterCore />

      {/* Service nodes */}
      {NODES.map((node, i) => (
        <ServiceNode
          key={node.id}
          node={node}
          time={time}
          entranceDelay={0.50 + i * 0.10}
        />
      ))}

    </div>
  )
}

export default GalaxyOrbit
