// import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface StarData {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  dur: number
  delay: number
}

// Generated once at module level — stable, no re-render churn
const STARS: StarData[] = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 80,
  size: Math.random() < 0.12 ? Math.random() * 2.5 + 1.5 : Math.random() * 1.2 + 0.4,
  opacity: Math.random() * 0.55 + 0.15,
  dur: 1.5 + Math.random() * 3.5,
  delay: Math.random() * 5,
}))

export function BackgroundStars() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Twinkling stars */}
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{ opacity: [s.opacity, s.opacity * 0.1, s.opacity * 0.7, s.opacity] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Planet horizon — dominant purple sphere at bottom-right */}
      {/* <div
        className="absolute"
        style={{
          bottom: '-18%',
          left: '18%',
          right: '-10%',
          height: '80%',
          background: [
            'radial-gradient(ellipse 72% 72% at 55% 92%,',
            '  rgba(105,28,195,0.18) 0%,',
            '  rgba(78,18,155,0.58) 15%,',
            '  rgba(52,10,115,0.32) 35%,',
            '  rgba(28,4,68,0.14) 55%,',
            '  transparent 72%)',
          ].join(''),
          borderRadius: '50%',
        }}
      /> */}
      {/* Bright inner core glow of planet */}
      {/* <div
        className="absolute"
        style={{
          bottom: '-5%',
          left: '32%',
          right: '8%',
          height: '45%',
          background:
            'radial-gradient(ellipse 60% 60% at 52% 95%, rgba(145,50,240,0.10) 0%, rgba(100,30,185,0.22) 30%, transparent 60%)',
          filter: 'blur(8px)',
        }}
      /> */}

      {/* Ambient right-side glow (sits behind the T) */}
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{
          width: '62%',
          background:
            'radial-gradient(ellipse 68% 65% at 60% 48%, rgba(130,50,220,0.18) 0%, transparent 62%)',
        }}
      />

      {/* Very faint upper-right stardust wash */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: '50%',
          height: '50%',
          background:
            'radial-gradient(ellipse 70% 60% at 80% 20%, rgba(100,40,180,0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  )
}

export default BackgroundStars
