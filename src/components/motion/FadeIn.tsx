import { useRef } from 'react'
import { motion, useInView, type UseInViewOptions } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { EASE_PREMIUM, DURATION_LG } from '@/motion/variants'

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

export interface FadeInProps {
  children: React.ReactNode
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  /** Override the inView margin trigger. Default: '-10% 0px' */
  margin?: UseInViewOptions['margin']
  /** Optional starting scale (e.g. 0.95) that animates up to 1 alongside the fade/slide. */
  scale?: number
}

const offsetMap: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: -32 },
  right: { x: 32 },
  none: {},
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = DURATION_LG,
  className,
  margin = '-10% 0px',
  scale,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin })
  const shouldReduce = useReducedMotion()

  const offset = offsetMap[direction]
  const hiddenScale = scale !== undefined ? { scale } : {}
  const visibleScale = scale !== undefined ? { scale: 1 } : {}

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset, ...hiddenScale }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0, ...visibleScale }
          : { opacity: 0, ...offset, ...hiddenScale }
      }
      transition={{
        duration: shouldReduce ? 0 : duration,
        delay: shouldReduce ? 0 : delay,
        ease: EASE_PREMIUM,
      }}
    >
      {children}
    </motion.div>
  )
}

export default FadeIn