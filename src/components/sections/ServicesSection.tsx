import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ServicesMobile } from '@/components/services/ServicesMobile'
import { SERVICE_ICON_MAP, SERVICE_LINKS } from '@/components/services/serviceIconMap'
import { useMediaQuery } from '@/hooks/useMediaQuery'

// Row geometry from the Figma frame (1440px wide): 305px cards, 20px gap,
// top row starting 99px from the left and bottom row 60px. Scrolling slides
// the top row right and the bottom row left by the same distance until
// Business Growth sits directly above YouTube. Scales with the viewport.
const DESIGN_W = 1440
const CARD_W = 305
const GAP = 20
const TOP_INSET = 99
const BOTTOM_INSET = 60
// Distance each row travels so card 1 of the top row ends directly above the
// last card of the bottom row (top moves right, bottom moves left).
const SHIFT = (BOTTOM_INSET + 3 * (CARD_W + GAP) - TOP_INSET) / 2

const getScale = () =>
  Math.min(1.25, Math.max(0.8, window.innerWidth / DESIGN_W))

// Component

/** Below `lg` the pinned two-row parallax is replaced by a swipeable carousel. */
export function ServicesSection() {
  const isWide = useMediaQuery('(min-width: 1024px)')
  return isWide ? <ServicesDesktop /> : <ServicesMobile iconMap={SERVICE_ICON_MAP} />
}

function ServicesDesktop() {
  const { eyebrow, heading, showMore, items } = siteConfig.services

  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  const scrollYMV = useMotionValue(0)

  useEffect(() => {
    const update = () => scrollYMV.set(window.scrollY)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [scrollYMV])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const computeT = (_y: number) => {
    const el = sectionRef.current
    if (!el) return 0

    const rect = el.getBoundingClientRect()
    const pinH = pinRef.current?.offsetHeight ?? window.innerHeight

    const scrollableDistance = rect.height - pinH
    const raw = (-rect.top) / Math.max(1, scrollableDistance)

    return Math.max(0, Math.min(1, raw))
  }

  const [scale, setScale] = useState(getScale)
  useEffect(() => {
    const onResize = () => setScale(getScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // All cards share the height of the tallest one. Cards render at natural
  // height first (cardH === null), then the max is measured and applied.
  const [measured, setMeasured] = useState<{ scale: number; items: unknown; h: number } | null>(null)
  const cardH = measured && measured.scale === scale && measured.items === items ? measured.h : null
  const rowsRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (cardH !== null) return
    const cards = rowsRef.current?.querySelectorAll<HTMLElement>('[data-service-card]')
    if (!cards?.length) return
    const h = Math.ceil(Math.max(...Array.from(cards, (c) => c.offsetHeight)))
    setMeasured({ scale, items, h })
  }, [cardH, scale, items])

  const cardW = CARD_W * scale
  const gap = GAP * scale
  const shift = SHIFT * scale
  const topStart = TOP_INSET * scale
  const bottomStart = BOTTOM_INSET * scale

  // Top row slides right, bottom row slides left, by the same distance.
  const topRowX = useTransform(scrollYMV, (y) => topStart + computeT(y) * shift)
  const bottomRowX = useTransform(scrollYMV, (y) => bottomStart - computeT(y) * shift)

  const [starKey, setStarKey] = useState(0)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const prevInViewRef = useRef(false)

  useEffect(() => {
    if (isInView && !prevInViewRef.current) {
      setStarKey((k) => k + 1)
    }
    prevInViewRef.current = isInView
  }, [isInView])

  const topRow = items.slice(0, 4)
  const bottomRow = items.slice(4, 8)

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-label="Services"
      style={{
        background: 'var(--color-brand-bg)',
        position: 'relative',
        overflow: 'visible',
        height: isDesktop ? '650vh' : 'auto',
      }}
    >
      <div
        ref={pinRef}
        style={{
          position: isDesktop ? 'sticky' : 'relative',
          top: 0,
          // height: isDesktop ? '115vh' : 'auto',
          overflow: 'hidden',
          paddingBottom: '32px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px',
            height: '500px',
            background:
              'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.10) 0%, rgba(111, 69, 246, 0.04) 50%, transparent 75%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          className="relative mx-auto w-full"
          style={{ maxWidth: '1320px', padding: '0 20px', zIndex: 1 }}
        >
          <div style={{ paddingTop: '100px' }}>
            <FadeIn direction="up" delay={0.08}>
              <p
                className="text-section-label"
                style={{
                  fontWeight: 400,
                  lineHeight: '20px',
                  color: '#9F7EE1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  margin: 0,
                }}
              >
                {eyebrow}
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.18}>
              <div className="flex items-center justify-between gap-6">
                <h2
                  className="text-section-title"
                  style={{
                    lineHeight: '46px',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  {heading}
                </h2>
                <Link
                  to="/services"
                  className="shrink-0 font-body text-[16px] font-semibold leading-[19px] text-[#9F7EE1] underline underline-offset-2 transition-colors duration-200 hover:text-brand-accent-light"
                >
                  {showMore}
                </Link>
              </div>
            </FadeIn>

            {/* <FadeIn direction="up" delay={0.28}>
              <p
                className="text-section-subtitle"
                style={{
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#BFBFBF',
                  margin: 0,
                }}
              >
                {description}
              </p>
            </FadeIn> */}

            <FadeIn direction="none" delay={0.38}>
              <div
                style={{
                  position: 'relative',
                  marginTop: '8px',
                  overflow: 'hidden',
                  height: '1px',
                }}
                aria-hidden="true"
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(90deg, #B7A2FC 0%, #B7A2FC 3%, rgba(255,255,255,0.30) 15%, rgba(255,255,255,0.30) 100%)',
                    borderRadius: '100px',
                  }}
                />

                <motion.div
                  key={starKey}
                  initial={{ x: '-15%', opacity: 0 }}
                  animate={{ x: '105vw', opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.8,
                  }}
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    left: 0,
                    width: '140px',
                    height: '5px',
                    background:
                      'linear-gradient(90deg, transparent 0%, #B7A2FC 30%, #FFFFFF 55%, #B7A2FC 75%, transparent 100%)',
                    borderRadius: '3px',
                    filter: 'blur(1.5px)',
                  }}
                />
              </div>
            </FadeIn>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: '21px',
          }}
          aria-label="Service cards"
          ref={rowsRef}
        >
          {isDesktop ? (
            <>
              <motion.div
                style={{
                  x: topRowX,
                  display: 'flex',
                  gap: `${gap}px`,
                  width: 'max-content',
                }}
              >
                {topRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={SERVICE_ICON_MAP[service.id]}
                    title={service.title}
                    bullets={service.bullets}
                    width={cardW}
                    height={cardH ?? undefined}
                    href={SERVICE_LINKS[service.id]}
                  />
                ))}
              </motion.div>

              <motion.div
                style={{
                  x: bottomRowX,
                  display: 'flex',
                  gap: `${gap}px`,
                  marginTop: '24px',
                  width: 'max-content',
                }}
              >
                {bottomRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={SERVICE_ICON_MAP[service.id]}
                    title={service.title}
                    bullets={service.bullets}
                    width={cardW}
                    height={cardH ?? undefined}
                    href={SERVICE_LINKS[service.id]}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '0 20px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {topRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={SERVICE_ICON_MAP[service.id]}
                    title={service.title}
                    bullets={service.bullets}
                    href={SERVICE_LINKS[service.id]}
                  />
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '0 20px',
                  marginTop: '16px',
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {bottomRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={SERVICE_ICON_MAP[service.id]}
                    title={service.title}
                    bullets={service.bullets}
                    href={SERVICE_LINKS[service.id]}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection