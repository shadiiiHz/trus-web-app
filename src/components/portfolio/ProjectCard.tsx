import { memo } from 'react'

interface ProjectCardProps {
  name:     string
  category: string
  /** Accent colour used for the top edge line and label */
  accent:   string
  /** Card background colour */
  bg:       string
}

/**
 * Portfolio project card — 337 × 240 px placeholder.
 *
 * Intentionally minimal: every card renders identically shaped so
 * the horizontal scroll animation reads as a uniform ribbon.
 * Real project screenshots will replace the placeholder area later.
 *
 * TUNING: card size
 *   Change `width` / `height` here.  border-radius: 6.12 px is design spec.
 *
 * TUNING: placeholder content
 *   Everything inside the outer div below the outer shell div is placeholder.
 *   Swap the inner <div> for an <img> when screenshots are ready.
 */
// memo: props are all static strings (no callbacks/MotionValues), so the card
// skips re-render during the parent's scroll-driven horizontal parallax updates.
export const ProjectCard = memo(function ProjectCard({ name, category, accent, bg }: ProjectCardProps) {
  return (
    <div
      style={{
        width:        '337px',
        height:       '240px',
        borderRadius: '6.12px',
        overflow:     'hidden',
        background:   bg,
        flexShrink:   0,
        position:     'relative',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position:   'absolute',
          top:        0, left: 0, right: 0,
          height:     '2px',
          background: `linear-gradient(to right, ${accent}, transparent 70%)`,
        }}
      />

      {/* Placeholder body — replace with <img> when screenshots are ready */}
      <div
        style={{
          position:   'absolute',
          inset:      0,
          background: `radial-gradient(ellipse 75% 60% at 38% 38%, ${accent}1a 0%, transparent 65%)`,
        }}
      />

      {/* Bottom label */}
      <div
        style={{
          position:   'absolute',
          bottom:     0, left: 0, right: 0,
          padding:    '18px 16px 14px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.30) 65%, transparent 100%)',
        }}
      >
        <div
          style={{
            fontSize:      '9px',
            color:          accent,
            fontWeight:    600,
            textTransform: 'uppercase',
            letterSpacing: '0.13em',
            marginBottom:  '3px',
            fontFamily:    'var(--font-body)',
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontSize:   '14px',
            color:      '#ffffff',
            fontWeight: 700,
            fontFamily: 'var(--font-hero)',
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
      </div>
    </div>
  )
})

export default ProjectCard
