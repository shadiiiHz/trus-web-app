import { motion, MotionValue, useTransform } from 'framer-motion'
import { CrystalT } from '@/components/hero/CrystalT'

export interface PortfolioTProps {
  /**
   * Normalised progress 0→1 scoped to the Portfolio section.
   * Produced by: useTransform(sectionProgress, [0, 0.45], [0, 1])
   */
  portfolioTProgress: MotionValue<number>
}

/**
 * Position:fixed Crystal T for the Portfolio phase.
 *
 * Appears near where the About T faded out (~55vw / ~52vh), then drifts
 * downward and slightly left — towards the PORTFOLIO background text —
 * while fading to 0 as the letters light up.
 *
 * Deliberately kept as a separate component (not merged into FloatingCrystalT)
 * so neither phase's animation logic contaminates the other.
 */
export function PortfolioT({ portfolioTProgress }: PortfolioTProps) {
  // Fade in quickly, hold, then fade to 0 as PORTFOLIO text lights up
  const opacity = useTransform(portfolioTProgress, [0, 0.15, 0.70, 1], [0, 1, 1, 0])
  // Drift downward toward the PORTFOLIO text (which sits in the lower viewport)
  const y = useTransform(portfolioTProgress, [0, 1], [0, 130])
  // Slight leftward drift toward the text center
  const x = useTransform(portfolioTProgress, [0, 1], [0, -50])
  // Shrinks slightly as it dissolves into the word
  const scale = useTransform(portfolioTProgress, [0, 1], [0.48, 0.30])

  return (
    <motion.div
      className="hidden lg:block pointer-events-none"
      style={{
        position: 'fixed',
        // Start roughly where FloatingCrystalT ended (About image arrival point):
        // floatingT ends at: left=54vw+60px ≈ 55.5vw, top=26vh+260px ≈ 55vh at 900px
        left:   '52vw',
        top:    '50vh',
        width:  '380px',
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

export default PortfolioT
