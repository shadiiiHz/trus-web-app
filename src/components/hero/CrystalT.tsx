import { motion } from 'framer-motion'

/**
 * Crystal / glass 3-D letter "T" — the centrepiece of the Hero right column.
 *
 * Visual layers (bottom → top):
 *   0. Ambient radial glow behind the shape (pulsing opacity)
 *   1. SVG: soft blurred glow path (scale > 1)
 *   2. SVG: dark-glass body fill
 *   3. SVG: diagonal light-streak overlay (clipped to T)
 *   4. SVG: wide blurred neon-pink stroke (outer glow ring)
 *   5. SVG: medium glow stroke
 *   6. SVG: sharp crisp edge stroke (neon gradient)
 *   7. SVG: top/right/side edge highlights (bright thin lines)
 *   8. SVG: diagonal light-ray streak line
 *
 * Animation:
 *   - Whole component floats: y 0 → -18 → 0, 5 s loop
 *   - Ambient glow pulses: opacity 0.65 → 1.0 → 0.65, same period
 */

const W = 380
const H = 430
// T proportions: crossbar height = 115, stem width = 130 (centred at x=125–255)
const PATH = `M 0 0 L ${W} 0 L ${W} 115 L 255 115 L 255 ${H} L 125 ${H} L 125 115 L 0 115 Z`

export function CrystalT() {
  return (
    <motion.div
      className="relative select-none"
      style={{ width: '100%', maxWidth: `${W}px` }}
      animate={{ y: [0, -18, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      {/* Ambient radial glow (behind SVG, pulsing) */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: '-40%',
          background:
            'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(170,65,255,0.55) 0%, rgba(130,45,220,0.25) 35%, transparent 65%)',
          filter: 'blur(28px)',
        }}
        animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* SVG crystal letter */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: 'auto',
          // Perspective tilt for 3-D illusion
          transform: 'perspective(900px) rotateX(7deg) rotateY(-10deg)',
          // CSS drop-shadow cascade: tight hot-pink, mid violet, wide purple bloom
          filter: [
            'drop-shadow(0 0  8px rgba(220, 80,255,0.95))',
            'drop-shadow(0 0 22px rgba(190, 60,240,0.70))',
            'drop-shadow(0 0 50px rgba(150, 40,220,0.45))',
            'drop-shadow(0 0 90px rgba(120, 30,200,0.25))',
          ].join(' '),
        }}
      >
        <defs>
          {/* Dark-glass body */}
          <linearGradient id="ct-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#1e0548" stopOpacity="0.97" />
            <stop offset="45%"  stopColor="#0e0222" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050011" stopOpacity="0.98" />
          </linearGradient>

          {/* Diagonal light streak from top-right */}
          <linearGradient id="ct-streak" x1="95%" y1="0%" x2="12%" y2="72%">
            <stop offset="0%"   stopColor="rgba(255,215,255,0.60)" />
            <stop offset="12%"  stopColor="rgba(235,165,255,0.30)" />
            <stop offset="30%"  stopColor="rgba(190,105,255,0.10)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Sharp neon edge — hot-pink → violet → deep purple */}
          <linearGradient id="ct-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ff55ff" />
            <stop offset="28%"  stopColor="#dd44ff" />
            <stop offset="60%"  stopColor="#9933ee" />
            <stop offset="100%" stopColor="#6622cc" />
          </linearGradient>

          <clipPath id="ct-clip">
            <path d={PATH} />
          </clipPath>
        </defs>

        {/* 0 — Blurred glow silhouette (very soft, slightly enlarged) */}
        <path
          d={PATH}
          fill="rgba(175,65,255,0.28)"
          transform={`scale(1.06) translate(${-W * 0.03}, ${-H * 0.03})`}
          style={{ filter: 'blur(22px)' }}
        />

        {/* 1 — Main dark-glass body */}
        <path d={PATH} fill="url(#ct-body)" />

        {/* 2 — Light-streak + bright corner (clipped to T shape) */}
        <g clipPath="url(#ct-clip)">
          <rect x="0" y="0" width={W} height={H} fill="url(#ct-streak)" />
          {/* Secondary inner highlight patch at top-right corner */}
          <polygon
            points={`250,0 ${W},0 ${W},70 195,130 140,95 125,115 125,75 155,45`}
            fill="rgba(255,235,255,0.08)"
          />
        </g>

        {/* 3 — Wide blurred outer stroke (glow ring) */}
        <path d={PATH} fill="none" stroke="rgba(215,80,255,0.55)" strokeWidth="14"
              style={{ filter: 'blur(6px)' }} />

        {/* 4 — Medium glow stroke */}
        <path d={PATH} fill="none" stroke="rgba(235,95,255,0.45)" strokeWidth="5"
              style={{ filter: 'blur(2.5px)' }} />

        {/* 5 — Sharp crisp neon edge */}
        <path d={PATH} fill="none" stroke="url(#ct-edge)" strokeWidth="1.5" />

        {/* 6 — Top edge: white-bright line + wider glow streak */}
        <line x1="1"    y1="1"   x2={W - 1} y2="1"
              stroke="rgba(255,245,255,0.95)" strokeWidth="1.5"
              style={{ filter: 'blur(0.5px)' }} />
        <line x1="1"    y1="2"   x2={W - 1} y2="2"
              stroke="rgba(255,190,255,0.45)" strokeWidth="6"
              style={{ filter: 'blur(3px)' }} />

        {/* 7 — Right edge of crossbar */}
        <line x1={W - 1} y1="1"   x2={W - 1} y2="114"
              stroke="rgba(255,210,255,0.88)" strokeWidth="1.5"
              style={{ filter: 'blur(0.5px)' }} />

        {/* 8 — Left edge of crossbar (dimmer — shadow side) */}
        <line x1="1" y1="1" x2="1" y2="114"
              stroke="rgba(175,95,255,0.45)" strokeWidth="1" />

        {/* 9 — Stem right edge */}
        <line x1="254" y1="115" x2="254" y2={H - 2}
              stroke="rgba(205,120,255,0.62)" strokeWidth="1.5"
              style={{ filter: 'blur(0.5px)' }} />

        {/* 10 — Stem left edge */}
        <line x1="126" y1="115" x2="126" y2={H - 2}
              stroke="rgba(185,100,255,0.42)" strokeWidth="1" />

        {/* 11 — Bottom of stem */}
        <line x1="126" y1={H - 2} x2="254" y2={H - 2}
              stroke="rgba(200,115,255,0.58)" strokeWidth="1.5"
              style={{ filter: 'blur(0.5px)' }} />

        {/* 12 — Crossbar → stem shoulder line */}
        <line x1="126" y1="115" x2="254" y2="115"
              stroke="rgba(200,150,255,0.45)" strokeWidth="1" />

        {/* 13 — Diagonal light-ray line (main visual highlight) */}
        <g clipPath="url(#ct-clip)">
          {/* Soft glow ray */}
          <line x1="340" y1="8" x2="130" y2="210"
                stroke="rgba(255,230,255,0.60)" strokeWidth="4"
                style={{ filter: 'blur(3px)' }} />
          {/* Sharp core ray */}
          <line x1="340" y1="8" x2="130" y2="210"
                stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
        </g>
      </svg>
    </motion.div>
  )
}

export default CrystalT
