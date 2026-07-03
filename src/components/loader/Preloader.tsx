import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLoaderGate } from '@/hooks/useLoaderGate'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { EASE_PREMIUM } from '@/motion/variants'

export interface PreloaderProps {
  /**
   * Becomes `true` once the hero video can play through. The loader waits for
   * this (plus a minimum display time) before fading out, so the hero is live
   * — not a frozen first frame — the moment the loader disappears.
   */
  ready?: boolean
}

/**
 * Full-screen initial preloader.
 *
 * Renders a violet gradient backdrop with an outline-only "TRUS" wordmark.
 * A bright white stroke-dash glows and travels along the letter contours —
 * giving the impression of light scanning *through* the outline while the
 * letters themselves stay fixed. Fades out smoothly once the hero is ready.
 *
 * Self-contained: tracks its own dismissal timing and locks body scroll while
 * visible, so mounting it once near the app root is all that's required.
 */
export function Preloader({ ready = false }: PreloaderProps) {
  const done           = useLoaderGate({ ready })
  const reducedMotion  = useReducedMotion()

  // Lock scroll while the loader covers the page.
  useEffect(() => {
    if (done) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="trus-preloader"
          role="status"
          aria-live="polite"
          aria-label="Loading TruS ecosystem"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE_PREMIUM }}
          style={{
            position:       'fixed',
            inset:          0,
            zIndex:         9999,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            // Violet gradient: radial bloom for depth over a diagonal base.
            background: [
              'radial-gradient(ellipse 90% 75% at 50% 42%, rgba(130,95,220,0.45) 0%, rgba(60,40,130,0) 62%)',
              'linear-gradient(158deg, #3c2b88 0%, #2c2068 55%, #221a52 100%)',
            ].join(', '),
          }}
        >
          <TrusOutline reducedMotion={reducedMotion} />

          <span
            style={{
              position:      'absolute',
              bottom:        'clamp(20px, 5vh, 40px)',
              left:          0,
              right:         0,
              textAlign:     'center',
              fontFamily:    'var(--font-body)',
              fontSize:      'var(--text-label)',
              fontWeight:    500,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color:         'rgba(255,255,255,0.55)',
            }}
          >
            Loading Ecosystem
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Outline wordmark with traveling stroke glow

/**
 * Outlined letters are stroked with NO fill, so every glyph contour is drawn.
 * Modern Google Fonts (DM Sans, Inter, Syne) build the "R" leg as a separate
 * contour overlapping the bowl — harmless when filled, but stroke-only exposes
 * the overlap as a stray diagonal line through the leg. Arial / Helvetica use
 * merged, non-overlapping contours, so the R reads clean. Keep this stack on
 * any stroke-only TRUS lettering; do NOT swap it back to --font-hero.
 */
const OUTLINE_FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif"

// Travelling stroke-dash tuning. DASH + GAP define the repeat PERIOD; the scan
// animates strokeDashoffset by exactly one PERIOD so the loop is seamless.
const DASH_LENGTH   = 55
const DASH_GAP      = 360
const DASH_PERIOD   = DASH_LENGTH + DASH_GAP   // 415
const SCAN_DURATION = 3                         // seconds per loop, linear

function TrusOutline({ reducedMotion }: { reducedMotion: boolean }) {
  const SHARED = {
    x:                600,
    y:                182,
    textAnchor:       'middle'  as const,
    dominantBaseline: 'central' as const,
    fontFamily:       OUTLINE_FONT,
    fontWeight:       700,
    fontSize:         230,
    letterSpacing:    '6',
    fill:             'none',
  }

  return (
    <svg
      viewBox="0 0 1200 360"
      role="img"
      aria-hidden="true"
      style={{ width: 'min(82vw, 760px)', height: 'auto', overflow: 'visible' }}
    >
      <defs>
        {/* Soft bloom around the traveling stroke. */}
        <filter id="trus-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Continuous stroke-dash scan driven by a CSS keyframe animation.
          `strokeDasharray` (DASH + GAP = PERIOD) repeats around each glyph
          contour; animating `strokeDashoffset` by exactly one PERIOD makes the
          bright segments travel along the outline and loop seamlessly. CSS
          (vs. a JS/attribute animation) guarantees it runs continuously. */}
      <style>{`
        @keyframes trus-scan {
          from { stroke-dashoffset: ${DASH_PERIOD}; }
          to   { stroke-dashoffset: 0; }
        }
        .trus-scan-stroke {
          animation: trus-scan ${SCAN_DURATION}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .trus-scan-stroke { animation: none; }
        }
      `}</style>

      {/* Base: faint full outline, always visible. */}
      <text {...SHARED} stroke="rgba(255,255,255,0.22)" strokeWidth={1.5}>
        TRUS
      </text>

      {/* Traveling glow: bright dashes that scan along the letter contours. */}
      <text
        {...SHARED}
        className={reducedMotion ? undefined : 'trus-scan-stroke'}
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        filter="url(#trus-glow)"
        strokeDasharray={`${DASH_LENGTH} ${DASH_GAP}`}
        strokeDashoffset={reducedMotion ? 0 : undefined}
        opacity={reducedMotion ? 0.5 : 1}
      >
        TRUS
      </text>
    </svg>
  )
}

export default Preloader
