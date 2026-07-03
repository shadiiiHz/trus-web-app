import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export interface ParallaxLayerProps {
  children: React.ReactNode
  /**
   * Controls parallax intensity.
   * Positive = moves up as user scrolls down (floats).
   * Negative = moves down (sinks). Range: -1 to 1.
   */
  speed?: number
  className?: string
}

export function ParallaxLayer({ children, speed = 0.3, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Map scroll 0→1 to a Y translate range. Only GPU-safe transform.
  const y = useTransform(scrollYProgress, [0, 1], [speed * -80, speed * 80])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y: shouldReduce ? 0 : y }}
    >
      {children}
    </motion.div>
  )
}

export default ParallaxLayer
