import { motion } from 'framer-motion'

export interface OrbitBubbleProps {
  /** Icon element — render a Lucide icon or any ReactNode */
  icon: React.ReactNode
  /** Service label shown below the bubble */
  label: string
  /** Bubble diameter in px (default 68) */
  size?: number
  /** Float animation delay offset in seconds */
  animDelay?: number
  /** Additional inline positioning styles */
  style?: React.CSSProperties
}

/**
 * Glassmorphism service bubble for the orbit system.
 * Floats vertically with a slow sine-wave animation.
 * Position it via the `style` prop using absolute coordinates.
 */
export function OrbitBubble({
  icon,
  label,
  size = 68,
  animDelay = 0,
  style,
}: OrbitBubbleProps) {
  return (
    <motion.div
      className="absolute flex flex-col items-center gap-1.5"
      style={style}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: [0, -10, 0],
      }}
      transition={{
        opacity:  { duration: 0.6, delay: 0.8 + animDelay * 0.15 },
        scale:    { duration: 0.6, delay: 0.8 + animDelay * 0.15 },
        y: {
          duration: 3.2 + animDelay * 0.25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: animDelay * 0.35,
        },
      }}
    >
      {/* Glass disc */}
      <div
        className="flex items-center justify-center rounded-full shrink-0"
        style={{
          width: size,
          height: size,
          background:
            'radial-gradient(circle at 35% 30%, rgba(130,55,210,0.85) 0%, rgba(45,12,100,0.96) 60%, rgba(18,5,45,0.99) 100%)',
          border: '1px solid rgba(190,110,255,0.5)',
          boxShadow: [
            `0 0 ${size * 0.35}px rgba(160,80,255,0.35)`,
            `0 0 ${size * 0.12}px rgba(210,110,255,0.55)`,
            `inset 0 0 ${size * 0.22}px rgba(180,100,255,0.12)`,
            `inset 0 ${size * 0.08}px ${size * 0.15}px rgba(255,200,255,0.08)`,
          ].join(', '),
        }}
      >
        {icon}
      </div>

      <span
        className="font-body font-semibold text-white tracking-widest uppercase"
        style={{
          fontSize: '9.5px',
          textShadow: '0 0 12px rgba(200,120,255,0.9)',
        }}
      >
        {label}
      </span>
    </motion.div>
  )
}

export default OrbitBubble
