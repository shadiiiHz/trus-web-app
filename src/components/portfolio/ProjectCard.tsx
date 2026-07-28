import { memo } from 'react'

interface ProjectCardProps {
  /** Project screenshot / sample image */
  image: string
  /** Project URL — the card links out to the live site */
  link: string
}

/**
 * Portfolio project card — 337 × 240 px image tile, radius 16px, links out
 * to the live project.
 *
 * Intentionally minimal: every card renders identically shaped so
 * the horizontal scroll animation reads as a uniform ribbon. No
 * name/category text is rendered on the card itself.
 *
 * TUNING: card size
 *   Change `width` / `height` here.
 */
// memo: props are all static strings (no callbacks/MotionValues), so the card
// skips re-render during the parent's scroll-driven horizontal parallax updates.
export const ProjectCard = memo(function ProjectCard({ image, link }: ProjectCardProps) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        width:        '337px',
        height:       '240px',
        borderRadius: '16px',
        overflow:     'hidden',
        flexShrink:   0,
        display:      'block',
        position:     'relative',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <img
        src={image}
        alt=""
        style={{
          width:      '100%',
          height:     '100%',
          objectFit:  'cover',
          display:    'block',
        }}
      />
    </a>
  )
})

export default ProjectCard
