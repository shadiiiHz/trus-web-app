import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { CrystalT } from '@/components/hero/CrystalT'

export interface TemplatesTProps {
  /** True once the section is in view and card #5 position is measured. */
  active: boolean
  /** Viewport X of card #5 centre (pixels from left). */
  targetX: number
  /** Viewport Y of card #5 centre (pixels from top). */
  targetY: number
}

// Crystal T display dimensions at the arrival scale (0.42)
const T_W = Math.round(380 * 0.42)   // ≈ 160 px
const T_H = Math.round(430 * 0.42)   // ≈ 181 px

/**
 * Position:fixed Crystal T for the Template Categories section.
 *
 * Behaviour — entirely time-driven (NOT scroll-driven):
 *   1. Fades in off-screen upper-left the instant the section enters view.
 *   2. Glides diagonally to card #5's viewport centre in ~1.2 s.
 *   3. Holds at card #5 briefly while it lights up.
 *   4. Fades to 0 and stays invisible for the rest of the session.
 *
 * Uses useAnimation + controls.set() → controls.start() so the initial
 * entry position is computed from the real card #5 coordinates (not stale 0,0).
 *
 * TUNING
 *   Entry offset above card #5  → entryY (currently 140 px above)
 *   T arrival scale             → arrivalScale (currently 0.42)
 *   Total animation duration    → DURATION (currently 2.2 s)
 *   Times keyframe split        → times array in controls.start()
 */
export function TemplatesT({ active, targetX, targetY }: TemplatesTProps) {
  const controls = useAnimation()

  useEffect(() => {
    if (!active) return

    const entryX   = -T_W - 60                  // off-screen left
    const entryY   = targetY - T_H / 2 - 140    // 140 px above card #5 centre
    const arrivalX = targetX - T_W / 2           // horizontally centred on card #5
    const arrivalY = targetY - T_H / 2           // vertically   centred on card #5

    // Snap to entry point (no animation) then run the full sequence
    controls.set({ x: entryX, y: entryY, scale: 0.56, opacity: 0 })
    controls.start({
      x:       [entryX, entryX, arrivalX, arrivalX],
      y:       [entryY, entryY - 30, arrivalY,  arrivalY],
      opacity: [0,      1,           1,           0],
      scale:   [0.56,   0.52,        0.42,        0.38],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transition: { duration: 2.2, times: [0, 0.11, 0.54, 0.68], ease: [0.16, 1, 0.3, 1] as any },
    })
  }, [active, targetX, targetY, controls])

  return (
    <motion.div
      className="hidden lg:block pointer-events-none"
      style={{
        position:        'fixed',
        left:            0,
        top:             0,
        width:           380,
        zIndex:          25,
        opacity:         0,          // invisible until controls fires
        transformOrigin: 'center center',
      }}
      animate={controls}
    >
      <CrystalT />
    </motion.div>
  )
}

export default TemplatesT
