import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface TeamCarouselArrowProps {
  direction: 'left' | 'right'
  onClick: () => void
  /** Disabled while the entrance animation is still moving the cards into place. */
  disabled?: boolean
}

export function TeamCarouselArrow({ direction, onClick, disabled = false }: TeamCarouselArrowProps) {
  const [hovered, setHovered] = useState(false)
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Show previous team photos' : 'Show next team photos'}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.3)',
        boxShadow: hovered && !disabled ? '0 0 16px 1px rgba(159,126,225,0.8)' : '0 0 0 0px rgba(159,126,225,0)',
        color: '#FFFFFF',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        flexShrink: 0,
        transition: 'box-shadow 0.35s ease, border-color 0.35s ease, opacity 0.3s ease',
      }}
    >
      <Icon size={18} strokeWidth={1.75} />
    </button>
  )
}

export default TeamCarouselArrow
