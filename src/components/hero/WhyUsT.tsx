import { motion, MotionValue, useTransform } from 'framer-motion'
import { CrystalT } from '@/components/hero/CrystalT'

export interface WhyUsTProps {
  /**
   * Normalised scroll progress (0 → 1) scoped to the Why Us section.
   * Produced by WhyUsSection's internal useScroll({ target: containerRef }).
   */
  sectionProgress: MotionValue<number>
}

/**
 * Position:fixed Crystal T for the Why Us section entrance.
 *
 * Behaviour:
 *   1. Enters from off-screen LEFT toward Card 01's position.
 *   2. Reaches Card 01 at roughly sectionProgress ≈ 0.10.
 *   3. Fades out completely by sectionProgress ≈ 0.20 — at the same
 *      moment Card 01's border is lighting up.
 *   4. Does NOT persist or scan. The card border sequence continues alone.
 *
 * Uses the same <CrystalT /> SVG as all other T phases.
 *
 * TUNING: T fade timing
 *   [fadeInStart, fadeInEnd, holdEnd, fadeOutEnd] in the opacity transform.
 *   Currently: [0.02, 0.09, 0.10, 0.20] — enters fast, vanishes by 20 % progress.
 *
 * TUNING: T scan speed / entry position
 *   First useTransform below controls horizontal travel.
 *   '-28vw' = entry point (off-screen left).
 *   '10vw'  = arrival point (near Card 01 left edge).
 *   Widen the progress window [0.02, 0.12] to slow the entry glide.
 */
export function WhyUsT({ sectionProgress }: WhyUsTProps) {
  // Diagonal entry: upper-left → Card 01 (center-left of cards row)
  //
  // The T appears to drift in from the Portfolio section above, entering from
  // the top-left corner and gliding diagonally down-right to Card 01.
  //
  // `top: '0px'` is the fixed anchor. x and y offsets move from there.
  //
  // TUNING: T entrance x position
  //   First value in x array  = off-screen entry point (currently −22 vw from left)
  //   Second value             = Card 01 arrival point (currently 10 vw from left)
  const x = useTransform(
    sectionProgress,
    [0.02, 0.12, 0.20],
    ['-22vw', '10vw', '12vw'],
  )

  // TUNING: T entrance y position
  //   First value  = entry height (currently 3 vh — near top of viewport)
  //   Second value = arrival height (currently 42 vh — card row level)
  const y = useTransform(
    sectionProgress,
    [0.02, 0.12, 0.20],
    ['3vh', '42vh', '44vh'],
  )

  // Quick fade-in, brief hold, gone by 0.20.
  // TUNING: T fade timing
  const opacity = useTransform(
    sectionProgress,
    [0.02, 0.09, 0.10, 0.20],
    [0,    1,    1,    0],
  )

  // Subtle scale drift — slightly larger on entry (further away), smaller on arrival
  const scale = useTransform(sectionProgress, [0.02, 0.20], [0.70, 0.62])

  return (
    <motion.div
      className="hidden lg:block pointer-events-none"
      style={{
        position:        'fixed',
        // Anchor at viewport top; y MotionValue positions vertically.
        top:             '0px',
        left:            0,
        width:           '380px',
        zIndex:          25,
        x,
        y,
        opacity,
        scale,
        transformOrigin: 'center center',
      }}
    >
      <CrystalT />
    </motion.div>
  )
}

export default WhyUsT
