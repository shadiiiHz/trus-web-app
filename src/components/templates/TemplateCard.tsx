import { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'

export interface TemplateCardProps {
  name:        string
  tag:         string
  image:       string
  /** Card height in px. Controls visual rhythm across the grid rows. */
  height?:     number
  /** Drives the border-glow animation (0 = off, 1 = peak glow). */
  isActivated?: boolean
  /** Slightly larger entrance glow for the featured centre card (#5). */
  isFeatured?:  boolean
}

/**
 * Individual template preview card.
 *
 * Layers (bottom → top):
 *   1. <img>         — picsum placeholder, object-fit: cover
 *   2. gradient overlay — bottom-fade for legibility
 *   3. activation glow  — border + outer halo driven by isActivated prop
 *   4. hover glow       — CSS group-hover overlay
 *   5. text label       — name + tag, bottom-left
 *
 * The glow wrapper sits OUTSIDE the clipped image container so border
 * glow is never cut off by overflow:hidden.
 */
// memo: props are primitive (strings/number/booleans). The activation cascade
// flips `isActivated` per card, so memo skips re-renders of cards whose state
// is unchanged during the parent's scroll-driven updates.
export const TemplateCard = memo(forwardRef<HTMLDivElement, TemplateCardProps>(
  function TemplateCard({ name, tag, image, height = 260, isActivated = false, isFeatured = false }, ref) {
    const glowColor    = isFeatured ? 'rgba(185, 130, 255, 0.9)'  : 'rgba(155, 100, 235, 0.75)'
    const glowColorDim = isFeatured ? 'rgba(135,  93, 217, 0.35)' : 'rgba(115,  70, 200, 0.25)'

    return (
      // Outer wrapper — no overflow:hidden so glow bleeds outside
      <motion.div
        ref={ref}
        className="group relative cursor-pointer select-none"
        style={{ height, borderRadius: 16 }}
        whileHover={{ scale: 1.025, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
      >
        {/* Activation glow border + halo */}
        <motion.div
          aria-hidden="true"
          style={{
            position:     'absolute',
            inset:        isFeatured ? '-3px' : '-2px',
            borderRadius: isFeatured ? 19 : 18,
            pointerEvents:'none',
            zIndex:       3,
          }}
          animate={isActivated ? {
            boxShadow: [
              '0 0 0 0px rgba(185,130,255,0), 0 0 0px rgba(135,93,217,0)',
              `0 0 0 1.5px ${glowColor}, 0 0 28px ${glowColorDim}, 0 0 60px rgba(100,60,200,0.15)`,
              '0 0 0 0px rgba(185,130,255,0), 0 0 0px rgba(135,93,217,0)',
            ],
          } : {
            boxShadow: '0 0 0 0px rgba(185,130,255,0)',
          }}
          transition={isActivated ? { duration: 1.6, times: [0, 0.38, 1], ease: 'easeInOut' } : { duration: 0.4 }}
        />

        {/* Hover glow border (CSS, no JS) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: `0 0 0 1.5px rgba(185,130,255,0.65), 0 0 24px rgba(135,93,217,0.25)`,
          }}
        />

        {/* Clipped image + overlay */}
        <div
          style={{
            width:        '100%',
            height:       '100%',
            borderRadius: 16,
            overflow:     'hidden',
            position:     'relative',
            background:   '#0C0C18',
          }}
        >
          <img
            src={image}
            alt={name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Bottom gradient overlay */}
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              inset:      0,
              background: 'linear-gradient(to top, rgba(4,4,10,0.88) 0%, rgba(4,4,10,0.28) 45%, transparent 70%)',
            }}
          />

          {/* Dark "powered off" overlay — covers image + text until card activates */}
          <motion.div
            aria-hidden="true"
            style={{
              position:     'absolute',
              inset:        0,
              background:   'rgba(4, 4, 12, 0.88)',
              pointerEvents:'none',
              zIndex:       5,
            }}
            animate={{ opacity: isActivated ? 0 : 1 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          />

          {/* Name + tag */}
          <div
            style={{
              position:  'absolute',
              bottom:    0,
              left:      0,
              right:     0,
              padding:   isFeatured ? '18px 20px' : '14px 16px',
              zIndex:    2,
            }}
          >
            <p
              style={{
                fontFamily:    'var(--font-body)',
                fontSize:      '10px',
                fontWeight:    500,
                color:         '#9D70F5',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                margin:        0,
                lineHeight:    1,
              }}
            >
              {tag}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-hero)',
                fontSize:   isFeatured ? '15px' : '13px',
                fontWeight: 600,
                color:      '#FFFFFF',
                margin:     '4px 0 0',
                lineHeight: 1.2,
              }}
            >
              {name}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }
))

export default TemplateCard
