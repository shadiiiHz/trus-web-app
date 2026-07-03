import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { EASE_PREMIUM, DURATION_MD, STAGGER_STD } from '@/motion/variants'

export interface StaggerGroupProps {
  children: React.ReactNode
  /** Delay before the first child animates (seconds) */
  delayChildren?: number
  /** Stagger interval between children (seconds) */
  staggerDelay?: number
  /** Per-child duration */
  duration?: number
  className?: string
  /** Y-axis entrance offset for children */
  childOffset?: number
}

export function StaggerGroup({
  children,
  delayChildren = 0,
  staggerDelay = STAGGER_STD,
  duration = DURATION_MD,
  className,
  childOffset = 16,
}: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const shouldReduce = useReducedMotion()

  const containerVariants = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren:  shouldReduce ? 0 : staggerDelay,
        delayChildren:    shouldReduce ? 0 : delayChildren,
      },
    },
  }

  const itemVariants = {
    hidden:  { opacity: 0, y: shouldReduce ? 0 : childOffset },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : duration, ease: EASE_PREMIUM },
    },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {/* Wrap each child in a motion.div so stagger applies to all */}
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div key={i} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : <motion.div variants={itemVariants}>{children}</motion.div>}
    </motion.div>
  )
}

export default StaggerGroup
