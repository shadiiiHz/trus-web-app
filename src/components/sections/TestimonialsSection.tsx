import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { siteConfig } from '@/config/site.config'
import { TestimonialCard } from '@/components/testimonials/TestimonialCard'

// Card layout config (desktop)
// Composition: UL | UR | Center | LL | LR
// Left column (11%) + right column (66%) are symmetric around 50% at ~1440px.
// inputRanges spread over a wider slice of the 500vh scroll so movement is cinematic.
const CARD_LAYOUT = [
  { left: '11%', top: '7vh',  inputRange: [0.04, 0.32] as [number, number] },  // 1 upper-left
  { left: '66%', top: '5vh',  inputRange: [0.07, 0.35] as [number, number] },  // 2 upper-right
  { left: '39%', top: '36vh', inputRange: [0.10, 0.38] as [number, number] },  // 3 center
  { left: '11%', top: '66vh', inputRange: [0.13, 0.41] as [number, number] },  // 4 lower-left
  { left: '66%', top: '68vh', inputRange: [0.16, 0.44] as [number, number] },  // 5 lower-right
] as const

// Sparse stars (module-level, no re-render churn)
const TEST_STARS = Array.from({ length: 25 }, (_, i) => ({
  id:      i,
  x:       Math.random() * 100,
  y:       Math.random() * 100,
  size:    Math.random() * 1.4 + 0.4,
  opacity: Math.random() * 0.18 + 0.03,
}))

// Shared helper — lives inside a component, NOT module-level
function makeProgressFn(containerRef: React.RefObject<HTMLDivElement | null>) {
  return (y: number): number => {
    const el = containerRef.current
    if (!el) return 0
    const start = el.offsetTop
    const end   = el.offsetTop + el.offsetHeight - window.innerHeight
    return Math.max(0, Math.min(1, (y - start) / Math.max(1, end - start)))
  }
}

// Single animated card
interface AnimatedCardProps {
  index:        number
  scrollYMV:    MotionValue<number>
  containerRef: React.RefObject<HTMLDivElement | null>
  isDesktop:    boolean
  children:     React.ReactNode
}

function AnimatedCard({ index, scrollYMV, containerRef, isDesktop, children }: AnimatedCardProps) {
  const layout = CARD_LAYOUT[index]
  const [rs] = layout.inputRange
  const prog = makeProgressFn(containerRef)

  const yMV = useTransform(scrollYMV, (y) => {
    const p = prog(y)
    const vh = window.innerHeight

    const t = Math.max(0, Math.min(1, (p - rs) / (1 - rs)))

    // continuous movement: enters from bottom and exits off the top, timed to
    // finish right as t reaches 1 so no dead scroll is left after the last card clears
    return (0.95 - t * 1.1) * vh
  })

  const opMV = useTransform(scrollYMV, (y) => {
    const p = prog(y)

    const fadeIn = Math.max(0, Math.min(1, (p - rs) / 0.16))
    const fadeOut = 1

    return Math.min(fadeIn, fadeOut)
  })

  if (!isDesktop) return null

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: layout.left,
        top: layout.top,
        y: yMV,
        opacity: opMV,
        zIndex: 4,
      }}
    >
      {children}
    </motion.div>
  )
}

// Mobile stacked list
interface MobileStackProps {
  items:        typeof siteConfig.testimonials.items
  scrollYMV:    MotionValue<number>
  containerRef: React.RefObject<HTMLDivElement | null>
}

function MobileStack({ items, scrollYMV, containerRef }: MobileStackProps) {
  const prog = makeProgressFn(containerRef)

  const yMV = useTransform(scrollYMV, (y) => {
    const p = prog(y)
    const vh = window.innerHeight

    const t = Math.max(0, Math.min(1, (p - 0.05) / 0.95))

    return (0.6 - t * 1.3) * vh
  })

  const opMV = useTransform(scrollYMV, (y) => {
    const p = prog(y)

    const fadeIn = Math.max(0, Math.min(1, (p - 0.05) / 0.18))
    const fadeOut = 1

    return Math.min(fadeIn, fadeOut)
  })

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: '44vh',
        left: 0,
        right: 0,
        y: yMV,
        opacity: opMV,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '0 16px',
      }}
    >
      {items.map((item) => (
        <TestimonialCard
          key={item.name}
          name={item.name}
          role={item.role}
          quote={item.quote}
          avatar={item.avatar}
          style={{ width: 'min(337px, 90vw)', height: 'auto', minHeight: '200px' }}
        />
      ))}
    </motion.div>
  )
}

// Main section
export function TestimonialsSection() {
  const { eyebrow, heading, subtitle, items } = siteConfig.testimonials

  const containerRef  = useRef<HTMLDivElement>(null)
  const globeVideoRef = useRef<HTMLVideoElement>(null)
  const scrollYMV     = useMotionValue(0)
  const [isDesktop, setIsDesktop] = useState(false)
  // Defer the 3.3 MB globe video: only attach its src once the section nears the
  // viewport, so it isn't fetched on initial page load. The container keeps its
  // fixed reserved size meanwhile, so there is no layout shift when it loads.
  const [globeNear, setGlobeNear] = useState(false)

  // Ensure the video plays — some browsers silently ignore the autoPlay attr
  const handleVideoReady = useCallback(() => {
    globeVideoRef.current?.play().catch(() => {/* autoplay silently blocked */})
  }, [])

  useEffect(() => {
    const v = globeVideoRef.current
    if (!v) return
    // Attempt play immediately and also on canplay in case media loads later
    v.play().catch(() => {})
    v.addEventListener('canplay', handleVideoReady)
    return () => v.removeEventListener('canplay', handleVideoReady)
  }, [handleVideoReady])

  // Lazy-load the globe video when the section comes within ~3 viewports, giving
  // it ample time to buffer before it's actually on screen.
  useEffect(() => {
    const el = containerRef.current
    if (!el || globeNear) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGlobeNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '300% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [globeNear])

  // Breakpoint listener
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Manual scroll listener — same reliable pattern as ServicesSection
  useEffect(() => {
    const update = () => scrollYMV.set(window.scrollY)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [scrollYMV])

  // eslint-disable-next-line react-hooks/refs
  const prog = makeProgressFn(containerRef)

  // Globe + header: fades 1→0 between progress 0.78 and 1.00 (end of section)
  const globeHeaderOpacity = useTransform(scrollYMV, (y) => {
    const p = prog(y)
    return Math.max(0, Math.min(1, 1 - (p - 0.78) / (1.00 - 0.75)))
  })

  // Dark overlay: ramps 0→0.55 between progress 0.40 and 0.80
  const overlayOpacity = useTransform(scrollYMV, (y) => {
    const p = prog(y)
    return Math.max(0, Math.min(0.55, (p - 0.40) / (0.40) * 0.55))
  })

  return (
    // 350vh scroll container
    <div
      id="testimonials"
      ref={containerRef}
      style={{ height: isDesktop ? '170vh' : '160vh', position: 'relative' }}
    >
      {/* Sticky viewport panel */}
      <div
        style={{
          position:   'sticky',
          top:        0,
          height:     '100vh',
          overflow:   'hidden',
          background: 'var(--color-brand-bg)',
        }}
      >

        {/* Sparse stars */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {TEST_STARS.map((s) => (
            <div
              key={s.id}
              className="absolute rounded-full bg-white"
              style={{
                left:    `${s.x}%`,
                top:     `${s.y}%`,
                width:   s.size,
                height:  s.size,
                opacity: s.opacity,
              }}
            />
          ))}
        </div>

        {/* Progressive dark overlay — sits above globe (z:2) but below cards (z:4) */}
        <motion.div
          aria-hidden="true"
          style={{
            position:      'absolute',
            inset:         0,
            background:    '#000000',
            opacity:       overlayOpacity,
            zIndex:        3,
            pointerEvents: 'none',
          }}
        />

        {/* Globe + header block */}
        <motion.div
          style={{
            position:      'absolute',
            inset:         0,
            opacity:       globeHeaderOpacity,
            zIndex:        2,
            pointerEvents: 'none',
          }}
        >
          {/* Soft purple aura — behind globe, slightly larger */}
          <div
            aria-hidden="true"
            style={{
              position:      'absolute',
              top:           '50%',
              left:          '50%',
              transform:     'translate(-50%, -50%)',
              width:         'clamp(520px, 82vw, 900px)',
              height:        'clamp(520px, 82vw, 900px)',
              background:    'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(135,93,217,0.22) 0%, rgba(83,40,168,0.09) 42%, transparent 68%)',
              filter:        'blur(32px)',
              zIndex:        0,
              pointerEvents: 'none',
            }}
          />

          {/* Globe video — blends into section background */}
          <div
            aria-hidden="true"
            style={{
              position:   'absolute',
              top:        '50%',
              left:       '50%',
              transform:  'translate(-50%, -50%)',
              width:      'clamp(500px, 74vw, 860px)',
              height:     'clamp(500px, 74vw, 860px)',
              zIndex:     1,
              background: 'var(--color-brand-bg)',  // matches page bg — hides any codec-black leakage
            }}
          >
            <video
              ref={globeVideoRef}
              src={globeNear ? '/globe.mp4' : undefined}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={handleVideoReady}
              style={{
                width:     '100%',
                height:    '100%',
                objectFit: 'cover',
                display:   'block',
              }}
            />

            {/* Vignette — fades globe edges into the section background; no visible rectangle */}
            <div
              style={{
                position:      'absolute',
                inset:         0,
                // background:    'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 42%, rgba(7,7,13,0.55) 62%, rgba(7,7,13,1.00) 76%)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Header text */}
          <div
            style={{
              position:      'absolute',
              top:           '200px',
              left:          0,
              right:         0,
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '6px',
              zIndex:        2,
            }}
          >
            <p
              className="text-section-label"
              style={{
                fontWeight:    400,
                lineHeight:    '20px',
                color:         '#9F7EE1',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                margin:        0,
                textAlign:     'center',
              }}
            >
              {eyebrow}
            </p>

            <h2
              className="text-section-title"
              style={{
                lineHeight:    '43px',
                color:         '#FFFFFF',
                textTransform: 'uppercase',
                margin:        0,
                textAlign:     'center',
                letterSpacing: '-0.01em',
              }}
            >
              {heading}
            </h2>

            <p
              className="text-section-subtitle"
              style={{
                fontWeight: 400,
                lineHeight: '26px',
                color:      '#BFBFBF',
                margin:     '4px 0 0 0',
                textAlign:  'center',
                maxWidth:   '460px',
              }}
            >
              {subtitle[0]}
              <br />
              {subtitle[1]}
            </p>
          </div>
        </motion.div>

        {/* Desktop: 5 individually animated cards */}
        {isDesktop && items.map((item, i) => (
          <AnimatedCard
            key={item.name}
            index={i}
            scrollYMV={scrollYMV}
            containerRef={containerRef}
            isDesktop={isDesktop}
          >
            <TestimonialCard
              name={item.name}
              role={item.role}
              quote={item.quote}
              avatar={item.avatar}
            />
          </AnimatedCard>
        ))}

        {/* Mobile: single-axis animated stack */}
        {!isDesktop && (
          <MobileStack
            items={items}
            scrollYMV={scrollYMV}
            containerRef={containerRef}
          />
        )}

        {/* T watermark */}
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        '-5%',
            left:          '-2%',
            fontSize:      'clamp(200px, 26vw, 380px)',
            fontFamily:    'var(--font-hero)',
            fontWeight:    700,
            color:         'rgba(135,93,217,0.022)',
            lineHeight:    1,
            userSelect:    'none',
            pointerEvents: 'none',
            zIndex:        1,
          }}
        >
          T
        </div>

      </div>
    </div>
  )
}

export default TestimonialsSection
