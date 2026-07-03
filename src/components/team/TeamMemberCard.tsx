import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties } from 'react'

// Visual state enum
// hovered  → directly under cursor: full colour + spotlight sweep + strong glow
// active   → default selected (no hover active): soft tint + gentle glow
// dim      → another card is hovered: darkened grayscale
// idle     → not selected, no hover happening: plain grayscale
export type CardState = 'hovered' | 'active' | 'dim' | 'idle'

export interface TeamMemberCardProps {
  image:        string
  name:         string
  state:        CardState
  style?:       CSSProperties
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick?:     () => void
}

export function TeamMemberCard({
  image,
  name,
  state,
  style,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TeamMemberCardProps) {
  const isHovered = state === 'hovered'
  const isActive  = state === 'active'
  const isDim     = state === 'dim'

  return (
    <motion.div
      style={{
        borderRadius:  16,
        overflow:      'hidden',
        position:      'relative',
        cursor:        'pointer',
        flexShrink:    0,
        ...style,
      }}
      animate={{
        filter: isDim ? 'brightness(0.42)' : 'brightness(1)',
        scale:  isHovered ? 1.028 : 1,
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Image — grayscale(100%) idle/dim, partial colour active, full colour hovered */}
      <motion.img
        src={image}
        alt={name}
        loading="lazy"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        animate={{
          filter: isHovered
            ? 'grayscale(0%)'
            : isActive
            ? 'grayscale(55%)'
            : 'grayscale(100%)',
        }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Purple glow border */}
      <motion.div
        aria-hidden="true"
        style={{
          position:     'absolute',
          inset:        0,
          borderRadius: 16,
          pointerEvents:'none',
          zIndex:       4,
        }}
        animate={{
          boxShadow: isHovered
            ? 'inset 0 0 0 1.5px rgba(159,126,225,0.85), 0 0 36px rgba(124,58,237,0.30)'
            : isActive
            ? 'inset 0 0 0 1px rgba(159,126,225,0.30), 0 0 16px rgba(124,58,237,0.10)'
            : 'inset 0 0 0 0px rgba(159,126,225,0)',
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Spotlight sweep — rises upward from the bottom on hover enter */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            aria-hidden="true"
            key="spotlight"
            initial={{ y: '115%', opacity: 1 }}
            animate={{ y: '-25%',  opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.70, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position:   'absolute',
              left:       '-30%',
              right:      '-30%',
              bottom:     0,
              height:     '75%',
              background: 'radial-gradient(ellipse at 50% 100%, rgba(190,150,255,0.32) 0%, transparent 68%)',
              pointerEvents: 'none',
              zIndex:     2,
            }}
          />
        )}
      </AnimatePresence>

      {/* Bottom gradient (always present for legibility) */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          inset:      0,
          background: 'linear-gradient(to top, rgba(4,4,12,0.60) 0%, transparent 55%)',
          pointerEvents: 'none',
          zIndex:     1,
        }}
      />
    </motion.div>
  )
}

export default TeamMemberCard
