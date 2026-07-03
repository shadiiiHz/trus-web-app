import { motion, MotionValue, useTransform } from 'framer-motion'

const LETTERS = 'PORTFOLIO'.split('')

/**
 * These letters are rendered outline-only via `-webkit-text-stroke` (no fill),
 * so every glyph contour is drawn. DM Sans (--font-hero) builds the "R" leg as
 * a separate contour overlapping the bowl, which the stroke exposes as a stray
 * diagonal line through the leg. Arial / Helvetica use merged contours, so the
 * R reads clean. Keep this stack for the stroked word; do NOT revert to
 * --font-hero (that token stays DM Sans for filled headings elsewhere).
 */
const OUTLINE_FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

interface AnimatedPortfolioWordProps {
  /** Section scroll progress 0→1 (scoped to Portfolio container) */
  sectionProgress: MotionValue<number>
}

/**
 * Large background "PORTFOLIO" text — each letter has its own scroll-linked
 * colour + glow transition so the word appears to light up letter-by-letter
 * as the Crystal T transfers energy into it, then dims as the cards slide away.
 *
 * Light-up  : sectionProgress  0.03 → 0.35  (staggered per letter)
 * Hold lit  : sectionProgress  0.35 → 0.55
 * Dim       : sectionProgress  0.55 → 0.75
 */
export function AnimatedPortfolioWord({ sectionProgress }: AnimatedPortfolioWordProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        display:        'flex',
        letterSpacing:  '-0.03em',
        lineHeight:     1,
        userSelect:     'none',
        pointerEvents:  'none',
      }}
    >
      {LETTERS.map((letter, i) => (
        <MotionLetter
          key={i}
          letter={letter}
          index={i}
          sectionProgress={sectionProgress}
        />
      ))}
    </div>
  )
}

// Per-letter animated span

function MotionLetter({
  letter,
  index,
  sectionProgress,
}: {
  letter: string
  index: number
  sectionProgress: MotionValue<number>
}) {
  // Each letter lights up ~0.03 progress after the previous one
  const litStart  = 0.03 + index * 0.03   // P:0.03, O:0.06, R:0.09 … O:0.27
  const litEnd    = litStart + 0.06
  const dimStart  = 0.55
  const dimEnd    = 0.75

  // Base colour: dim purple hex with 30% alpha (matches #5B2BB94D)
  const DIM = 'rgba(91,43,185,0.30)'
  const LIT = 'rgb(91,43,185)'

  // Colour interpolation — Framer Motion handles hex↔rgba natively
  const color = useTransform(
    sectionProgress,
    [0,   litStart, litEnd, dimStart, dimEnd, 1],
    [DIM, DIM,      LIT,    LIT,      DIM,    DIM],
  )

  // Glow layer opacity (0 = invisible, 1 = full purple bloom)
  const glowOpacity = useTransform(
    sectionProgress,
    [0, litStart, litEnd, dimStart, dimEnd, 1],
    [0, 0,        1,      1,        0,      0],
  )

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* Base dim layer */}
      <motion.span
        style={{
          color,
          display:         'block',
          fontFamily:      OUTLINE_FONT,
          fontSize:        'clamp(100px, 14vw, 200px)',
          fontWeight:      700,
          lineHeight:      1,
          // 1px stroke per spec
          WebkitTextStroke: '1px rgba(255,255,255,0.20)',
          // Static drop shadow per spec: x:-2 y:-2 blur:0.3 colour:#FFF
          textShadow:      '-2px -2px 0.3px rgba(255,255,255,0.30)',
        }}
      >
        {letter}
      </motion.span>

      {/* Glow overlay (same letter, purple bloom, fades in/out) */}
      <motion.span
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          display:         'block',
          color:           '#5B2BB9',
          opacity:         glowOpacity,
          fontFamily:      OUTLINE_FONT,
          fontSize:        'clamp(100px, 14vw, 200px)',
          fontWeight:      700,
          lineHeight:      1,
          WebkitTextStroke: '1px rgba(255,255,255,0.55)',
          textShadow: [
            '-2px -2px 0.3px rgba(255,255,255,0.9)',
            '0 0 22px rgba(91,43,185,0.9)',
            '0 0 55px rgba(91,43,185,0.55)',
            '0 0 100px rgba(91,43,185,0.25)',
          ].join(', '),
          pointerEvents:   'none',
        }}
      >
        {letter}
      </motion.span>
    </span>
  )
}

export default AnimatedPortfolioWord
