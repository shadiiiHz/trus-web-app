import { useRef, useState, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'
import { ServiceCard } from '@/components/services/ServiceCard'

// Inline SVG icons — purple outline style

const IconSEO = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <circle cx="18" cy="18" r="10" />
    <line x1="25.5" y1="25.5" x2="36" y2="36" />
    <polyline points="12,23 16,18 20,21 24,14" />
  </svg>
)

const IconWebDev = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <polyline points="14,10 6,21 14,32" />
    <polyline points="28,10 36,21 28,32" />
    <line x1="18" y1="34" x2="24" y2="8" />
  </svg>
)

const IconWebDesign = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <rect x="6" y="6" width="13" height="13" rx="2" />
    <rect x="23" y="6" width="13" height="13" rx="2" />
    <rect x="6" y="23" width="13" height="13" rx="2" />
    <rect x="23" y="23" width="13" height="13" rx="2" />
  </svg>
)

const IconLeadMaker = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <path d="M7 9h28L24 22v11l-6-3V22L7 9z" />
  </svg>
)

const IconAIAgent = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <circle cx="21" cy="11" r="4" />
    <circle cx="9" cy="31" r="4" />
    <circle cx="33" cy="31" r="4" />
    <line x1="21" y1="15" x2="21" y2="24" />
    <line x1="21" y1="24" x2="9" y2="24" />
    <line x1="21" y1="24" x2="33" y2="24" />
    <line x1="9" y1="24" x2="9" y2="27" />
    <line x1="33" y1="24" x2="33" y2="27" />
  </svg>
)

const IconContent = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <rect x="8" y="5" width="26" height="32" rx="3" />
    <line x1="14" y1="14" x2="28" y2="14" />
    <line x1="14" y1="20" x2="28" y2="20" />
    <line x1="14" y1="26" x2="22" y2="26" />
  </svg>
)

const IconBranding = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <path d="M21 6c-8.8 0-16 6.9-16 15.4 0 5 3.2 7.6 6.6 7.6 2.1 0 3.4-1.2 3.4-3 0-1.4-1-2-1-3.4 0-2.6 2.4-4.6 5-4.6 5 0 8-3.4 8-8.6C27 8 24.6 6 21 6z" />
    <circle cx="14" cy="17" r="1.6" />
    <circle cx="21" cy="13" r="1.6" />
    <circle cx="28" cy="17" r="1.6" />
  </svg>
)

const IconSocialMedia = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <circle cx="10" cy="21" r="4.5" />
    <circle cx="31" cy="9" r="4.5" />
    <circle cx="31" cy="33" r="4.5" />
    <line x1="14" y1="19" x2="27" y2="11" />
    <line x1="14" y1="23" x2="27" y2="31" />
  </svg>
)

const IconEmailMarketing = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <rect x="5" y="10" width="32" height="22" rx="3" />
    <polyline points="5,12 21,24 37,12" />
  </svg>
)

const IconAnalytics = () => (
  <svg viewBox="0 0 42 42" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
    <line x1="7" y1="36" x2="7" y2="22" />
    <line x1="17.5" y1="36" x2="17.5" y2="12" />
    <line x1="28" y1="36" x2="28" y2="26" />
    <line x1="38.5" y1="36" x2="38.5" y2="6" />
    <line x1="4" y1="36" x2="41" y2="36" />
  </svg>
)

const ICON_MAP: Record<string, ReactNode> = {
  seo: <IconSEO />,
  'web-dev': <IconWebDev />,
  'web-design': <IconWebDesign />,
  branding: <IconBranding />,
  'social-media': <IconSocialMedia />,
  'lead-maker': <IconLeadMaker />,
  'ai-agent': <IconAIAgent />,
  content: <IconContent />,
  'email-marketing': <IconEmailMarketing />,
  analytics: <IconAnalytics />,
}

// Row scroll geometry — desktop cards are a fixed 337px wide with a 24px
// gap (see ServiceCard.tsx), both rows in natural (unreversed) order. At
// rest, the top row's 1st card (SEO) and the bottom row's last card
// (Analytics) meet at the center of the screen; the top row then slides
// right-to-left and the bottom row slides left-to-right, at the same speed,
// crossing at the section's midpoint, until the top row's last card
// (Social Media) and the bottom row's 1st card (Lead Maker) meet at the
// center of the screen.
const CARD_WIDTH = 337
const CARD_GAP = 24
const ROW_SIZE = 5
const CARD_PITCH = CARD_WIDTH + CARD_GAP
const ROW_SIDE_INSET = 40
const ROW_TOTAL_SHIFT = (ROW_SIZE - 1) * CARD_PITCH

// translateX that puts a row's 1st card (content x = 0) at the screen's
// horizontal center — recomputed live so centering always matches the
// current viewport width.
const getCenteredStartX = () =>
  window.innerWidth / 2 - CARD_WIDTH / 2 - ROW_SIDE_INSET

// Component

export function ServicesSection() {
  const { eyebrow, heading, description, items } = siteConfig.services

  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const sectionRef = useRef<HTMLElement>(null)
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
    const viewportH = window.innerHeight

    const scrollableDistance = rect.height - viewportH
    const raw = -rect.top / Math.max(1, scrollableDistance)

    return Math.max(0, Math.min(1, raw))
  }

  // Top row: card 1 (SEO) starts centered and slides left by ROW_TOTAL_SHIFT
  // (exactly 4 card-pitches), ending with card 5 (Social Media) centered.
  const topRowX = useTransform(
    scrollYMV,
    (y) => getCenteredStartX() - computeT(y) * ROW_TOTAL_SHIFT,
  )

  // Bottom row: card 5 (Analytics) starts centered (i.e. the row itself
  // starts ROW_TOTAL_SHIFT to the left of top's start) and slides right by
  // the same ROW_TOTAL_SHIFT, ending with card 1 (Lead Maker) centered. Both
  // rows travel the same distance at the same rate, so they cross exactly
  // at the section's scroll midpoint.
  const bottomRowX = useTransform(
    scrollYMV,
    (y) => getCenteredStartX() - ROW_TOTAL_SHIFT + computeT(y) * ROW_TOTAL_SHIFT,
  )

  const [starKey, setStarKey] = useState(0)
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 })
  const prevInViewRef = useRef(false)

  useEffect(() => {
    if (isInView && !prevInViewRef.current) {
      setStarKey((k) => k + 1)
    }
    prevInViewRef.current = isInView
  }, [isInView])

  const topRow = items.slice(0, 5)
  const bottomRow = items.slice(5, 10)

  return (
    <section
      id="services"
      ref={sectionRef}
      aria-label="Services"
      style={{
        background: 'var(--color-brand-bg)',
        position: 'relative',
        overflow: 'visible',
        height: isDesktop ? '300vh' : 'auto',
      }}
    >
      <div
        style={{
          position: isDesktop ? 'sticky' : 'relative',
          top: 0,
          height: isDesktop ? '115vh' : 'auto',
          overflow: 'hidden',
          paddingBottom: '120px',
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
          style={{ maxWidth: '1200px', padding: '0 20px', zIndex: 1 }}
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
              <h2
                className="text-section-title"
                style={{
                  lineHeight: '67px',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                {heading}
              </h2>
            </FadeIn>

            <FadeIn direction="up" delay={0.28}>
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
            </FadeIn>

            <FadeIn direction="none" delay={0.38}>
              <div
                style={{
                  position: 'relative',
                  marginTop: '18px',
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
            marginTop: '60px',
          }}
          aria-label="Service cards"
        >
          {isDesktop ? (
            <>
              <motion.div
                style={{
                  x: topRowX,
                  display: 'flex',
                  gap: '24px',
                  paddingLeft: `${ROW_SIDE_INSET}px`,
                  width: 'max-content',
                }}
              >
                {topRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={ICON_MAP[service.id]}
                    title={service.title}
                    description={service.description}
                  />
                ))}
              </motion.div>

              <motion.div
                style={{
                  x: bottomRowX,
                  display: 'flex',
                  gap: '24px',
                  paddingLeft: `${ROW_SIDE_INSET}px`,
                  marginTop: '24px',
                  width: 'max-content',
                }}
              >
                {bottomRow.map((service) => (
                  <ServiceCard
                    key={service.id}
                    icon={ICON_MAP[service.id]}
                    title={service.title}
                    description={service.description}
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
                    icon={ICON_MAP[service.id]}
                    title={service.title}
                    description={service.description}
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
                    icon={ICON_MAP[service.id]}
                    title={service.title}
                    description={service.description}
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