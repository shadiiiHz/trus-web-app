import { motion, MotionValue, useTransform } from 'framer-motion'
import { CrystalT } from '@/components/hero/CrystalT'

export interface FloatingCrystalTProps {
  /**
   * Normalised scroll progress (0 → 1) produced by the parent via
   * useTransform(scrollY, [startPx, endPx], [0, 1]).
   * Controls opacity, position, and scale of the floating T.
   */
  scrollProgress: MotionValue<number>
}

/**
 * A position:fixed clone of the Crystal T that travels from the Hero
 * right column to the About section image card, driven by scroll progress.
 *
 * Illusion: Hero orbit system fades out while this element fades in at
 * the exact same screen position, then drifts downward into the About section.
 */
export function FloatingCrystalT({ scrollProgress }: FloatingCrystalTProps) {
  // Position delta — T drifts down and slightly right as it "leaves" the Hero
  const y     = useTransform(scrollProgress, [0, 1], [0, 260])
  const x     = useTransform(scrollProgress, [0, 1], [0, 60])
  // Scale down to ~half as it approaches the About image
  const scale = useTransform(scrollProgress, [0, 1], [1, 0.48])
  // Fade in quickly as it lifts off, hold full opacity, then fade to 0 on arrival
  const opacity = useTransform(scrollProgress, [0, 0.12, 0.72, 1], [0, 1, 1, 0])

  return (
    <motion.div
      // Hidden on mobile — right column (and thus the orbit T) is already hidden there
      className="hidden lg:block pointer-events-none"
      style={{
        position: 'fixed',
        // Align with the T's top-left corner inside the Hero orbit system:
        // Right column starts ~636px from viewport left on 1440px screen.
        // T left edge = column_left - 18px (overflow center) + 160px (T offset in orbit) ≈ 778px ≈ 54vw
        left: '54vw',
        // T top edge: paddingTop(88) + vertical-center-offset ≈ 26% of viewport height
        top: '26vh',
        width: '380px',
        zIndex: 25,
        y,
        x,
        scale,
        opacity,
        transformOrigin: 'center top',
      }}
    >
      <CrystalT />
    </motion.div>
  )
}

export default FloatingCrystalT
