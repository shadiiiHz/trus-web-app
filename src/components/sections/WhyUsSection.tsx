import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'
import { WhyUsCard } from '@/components/whyus/WhyUsCard'

// Sparse background stars — generated once at module level, no re-render churn
const WHY_STARS = Array.from({ length: 30 }, (_, i) => ({
  id:      i,
  x:       Math.random() * 100,
  y:       Math.random() * 100,
  size:    Math.random() * 1.4 + 0.4,
  opacity: Math.random() * 0.20 + 0.04,
}))

/**
 * Why Us — 200 vh sticky-scroll section.
 *
 * Scroll timeline (sectionProgress 0 → 1)
 *
 *  [0.05, 0.70]  Cards split: odd (01 & 03) rise, even (02 & 04) drop
 *
 *  Card border pulse sequence:
 *  [0.05, 0.28]  Card 01 border pulse
 *  [0.30, 0.54]  Card 02 border pulse
 *  [0.54, 0.75]  Card 03 border pulse
 *  [0.74, 0.93]  Card 04 border pulse
 *
 * Tuning quick-reference
 *   card vertical movement amount  → cardsYOdd / cardsYEven output range (±60 px)
 *   each card border glow timing   → card[N]Progress useTransform stops below
 *   background grid cell size      → backgroundSize in grid <div> (~120 px)
 */
export function WhyUsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Section-scoped progress: 0 when section top hits viewport top,
  //                          1 when section bottom hits viewport bottom.
  const { scrollYProgress: sectionProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Card vertical split
  // Spreads over 65 % of section scroll so the movement feels gradual.
  // TUNING: card vertical movement amount
  //   Change the last value (currently ±60). Negative = up, positive = down.
  const cardsYOdd  = useTransform(sectionProgress, [0.05, 0.70], [0, -60])
  const cardsYEven = useTransform(sectionProgress, [0.05, 0.70], [0,  60])

  // Border activation pulses
  // Each is a 3-stop tent: riseStart → peak → fallEnd, mapped to 0 → 1 → 0.
  //
  // Each is a 3-stop tent: 0 → 1 → 0 over its window.
  // TUNING: each card border glow timing
  //   [riseStart, peak, fallEnd] — all sectionProgress fractions (0–1).
  //   Widen  riseStart→peak  for a slower glow-up.
  //   Adjust stagger by shifting the riseStart of each card.
  const card1Progress = useTransform(sectionProgress, [0.05, 0.15, 0.28], [0, 1, 0])
  const card2Progress = useTransform(sectionProgress, [0.30, 0.42, 0.54], [0, 1, 0])
  const card3Progress = useTransform(sectionProgress, [0.54, 0.65, 0.75], [0, 1, 0])
  const card4Progress = useTransform(sectionProgress, [0.74, 0.84, 0.93], [0, 1, 0])

  // Ambient glow — active across the full border sequence, not the T
  const ambientGlow = useTransform(
    sectionProgress,
    [0.05, 0.22, 0.82, 0.95],
    [0,    0.60, 0.60, 0],
  )

  const { cards, eyebrow, headline } = siteConfig.whyUs

  const cardProgressMap = [card1Progress, card2Progress, card3Progress, card4Progress]

  return (
    <>
      {/* 200 vh scroll container */}
      <div
        id="why-us"
        ref={containerRef}
        style={{ height: '200vh', position: 'relative' }}
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

          {/* Background layers */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">

            {/*
              Background grid — visible in centre, fades to transparent at edges.
              Two-layer technique:
                1. The grid tile fills the entire area at full line opacity.
                2. A CSS mask (radial gradient) controls where the grid shows.
                   Centre = opaque (grid fully visible), edges = transparent.
               TUNING: background grid cell size
                Change backgroundSize (currently 120 px × 120 px).
               TUNING: grid line opacity
                Change rgba alpha (currently 0.14) — the mask handles edge fade.
               TUNING: grid centre fade / mask
                Adjust the radial-gradient in maskImage:
                  '70% 60%'  = ellipse radii (wider → larger visible area)
                  '30%'      = inner solid zone before fade starts
                  '100%'     = outer edge where mask reaches full transparent
            */}
            <div
              style={{
                position:        'absolute',
                inset:           0,
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), ' +
                  'linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
                backgroundSize:  '120px 120px',
                // Radial mask: fully opaque at centre, fully transparent at edges
                maskImage:        'radial-gradient(ellipse 70% 60% at 50% 55%, black 25%, transparent 100%)',
                WebkitMaskImage:  'radial-gradient(ellipse 70% 60% at 50% 55%, black 25%, transparent 100%)',
              }}
            />

            {/* Sparse stars */}
            {WHY_STARS.map((s) => (
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

            {/* Centre purple glow — pulses across the full border sequence */}
            <motion.div
              style={{
                position:     'absolute',
                top:          '50%',
                left:         '50%',
                width:        '65vw',
                height:       '65vw',
                transform:    'translate(-50%, -50%)',
                borderRadius: '50%',
                background:
                  'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(135,93,217,0.20) 0%, rgba(83,40,168,0.08) 45%, transparent 70%)',
                filter:  'blur(52px)',
                opacity: ambientGlow,
              }}
            />

            {/* Top edge fade — visual continuity from Portfolio */}
            <div
              style={{
                position:   'absolute',
                top:        0, left: 0, right: 0,
                height:     '80px',
                background: 'linear-gradient(to bottom, var(--color-brand-bg), transparent)',
              }}
            />

            {/* T watermark — bottom-left, near-transparent */}
            <div
              className="absolute select-none"
              aria-hidden="true"
              style={{
                bottom:     '-4%',
                left:       '-3%',
                fontSize:   'clamp(220px, 28vw, 420px)',
                fontFamily: 'var(--font-hero)',
                fontWeight: 700,
                color:      'rgba(135, 93, 217, 0.022)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              T
            </div>
          </div>

          {/* Main content */}
          <div
            className="relative z-10 mx-auto w-full max-w-300 px-5"
            style={{
              height:         '100%',
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '52px',
            }}
          >

            {/* Text header — centred */}
            <div className="flex flex-col items-center gap-3 text-center">
              <FadeIn direction="up" delay={0.10}>
                <span
                  className="text-section-label"
                  style={{
                    fontWeight:    400,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color:         'var(--color-brand-accent-light)',
                  }}
                >
                  {eyebrow}
                </span>
              </FadeIn>

              <FadeIn direction="up" delay={0.22}>
                <h2
                  className="text-section-title"
                  style={{
                    lineHeight:    1.12,
                    letterSpacing: '-0.01em',
                    color:         '#FFFFFF',
                    margin:        20,
                    textAlign:     'center',
                  }}
                >
                  {headline.map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </h2>
              </FadeIn>
            </div>

            {/* Cards row */}
            {/*
              Desktop: horizontal flex row with scroll-driven vertical split.
              Mobile:  static stacked column, no scroll animation.
            */}
            <div
              className="flex flex-wrap lg:flex-nowrap justify-center"
              style={{ gap: '0px' }}
            >
              {/* Desktop — scroll-animated */}
              {cards.map((card, i) => {
                const isEven     = i % 2 === 1
                const yVal       = isEven ? cardsYEven : cardsYOdd
                const borderProg = cardProgressMap[i]

                return (
                  <motion.div
                    key={card.number}
                    className="hidden lg:block"
                    style={{ y: yVal }}
                  >
                    <WhyUsCard
                      number={card.number}
                      title={card.title}
                      description={card.description}
                      borderProgress={borderProg}
                    />
                  </motion.div>
                )
              })}

              {/* Mobile fallback — static, no vertical split */}
              {cards.map((card, i) => (
                <div key={`m-${card.number}`} className="block lg:hidden">
                  <WhyUsCard
                    number={card.number}
                    title={card.title}
                    description={card.description}
                    borderProgress={cardProgressMap[i]}
                  />
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default WhyUsSection
