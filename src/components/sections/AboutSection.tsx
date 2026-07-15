import React, { useRef } from 'react'
import { motion, useMotionValue, useTransform, MotionValue } from 'framer-motion'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'
import { parseHeadline } from '@/utils/text'

// Sparse background stars generated once at module level — no re-render churn
const ABOUT_STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.4 + 0.4,
  opacity: Math.random() * 0.22 + 0.04,
}))

export interface AboutSectionProps {
  data?: typeof siteConfig.about
  /** Scroll-driven value (0 → 1). Brightens the image border glow as the T "arrives". */
  imageGlowIntensity?: MotionValue<number>
}

export function AboutSection({
  data = siteConfig.about,
  imageGlowIntensity,
}: AboutSectionProps) {
  const ref = useRef<HTMLElement>(null)

  // Fallback: static 0 when no scroll prop is provided (e.g. isolated render)
  const fallbackGlow = useMotionValue(0)
  const glow = imageGlowIntensity ?? fallbackGlow

  // Animate the gradient border wrapper's box-shadow so the border itself
  // visibly lights up (not just the blurred halo behind it).
  // Both shadow strings have the same structure so Framer Motion interpolates cleanly.
  const borderGlowShadow = useTransform(glow, [0, 1], [
    '0 0 0px rgba(185,120,255,0), 0 0 0px rgba(135,93,217,0), 0 0 0px rgba(100,60,200,0)',
    '0 0 30px rgba(185,120,255,0.95), 0 0 65px rgba(135,93,217,0.65), 0 0 110px rgba(100,60,200,0.35)',
  ])
  const imageFilter = useTransform(glow, [0, 1], ['grayscale(100%)', 'grayscale(0%)'])

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden"
      aria-label="About TruS"
    >
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">

        {/* Sparse stars */}
        {ABOUT_STARS.map((s) => (
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

        {/* Left ambient purple wash */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 55% at 0% 55%, rgba(135,93,217,0.07) 0%, transparent 65%)',
          }}
        />

        {/* Top edge fade (visual continuity from Hero) */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '120px',
            background: 'linear-gradient(to bottom, var(--color-brand-bg), transparent)',
          }}
        />

        {/* Shadow T watermark — bottom-right, near-transparent */}
        <div
          className="absolute select-none"
          style={{
            bottom: '-2%',
            right:  '-2%',
            fontSize: 'clamp(260px, 34vw, 520px)',
            fontFamily: 'var(--font-hero)',
            fontWeight: 700,
            color: 'rgba(135, 93, 217, 0.025)',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          T
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-300 px-5 py-32 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-14 lg:gap-20">

          {/* LEFT COLUMN — copy */}
          <div className="flex flex-col gap-7">

            <FadeIn direction="up" delay={0.1}>
              <span
                className="text-section-label font-normal uppercase tracking-[0.22em]"
                style={{ color: 'var(--color-brand-accent-light)' }}
              >
                {data.eyebrow}
              </span>
            </FadeIn>

            <FadeIn direction="up" delay={0.22}>
              <h2 className="flex flex-col gap-0.5 m-0 p-0">
                {data.headline.map((line) => {
                  const segs = parseHeadline(line as string)
                  return (
                    <span
                      key={line}
                      className="block text-section-title leading-[1.14] tracking-tight text-brand-white"
                    >
                      {segs.map((seg) =>
                        seg.accent ? (
                          <span
                            key={seg.text}
                            style={{
                              color: 'var(--color-brand-accent)',
                              textShadow: '0 0 26px rgba(135,93,217,0.65)',
                            }}
                          >
                            {seg.text}
                          </span>
                        ) : (
                          <span key={seg.text}>{seg.text}</span>
                        )
                      )}
                    </span>
                  )
                })}
              </h2>
            </FadeIn>

            {/* Body paragraphs */}
            <div className="flex flex-col gap-4">
              {(data.body as readonly string[]).map((para, i) => (
                <FadeIn key={para.slice(0, 20)} direction="up" delay={0.34 + i * 0.1}>
                  <p
                    className="font-body text-brand-muted leading-relaxed m-0"
                    style={{ fontSize: '1rem', maxWidth: '510px' }}
                  >
                    {para}
                  </p>
                </FadeIn>
              ))}
            </div>

            {/* Stats row */}
            <FadeIn direction="up" delay={0.66}>
              <div className="flex items-start pt-2">
                {(data.stats as readonly { value: string; label: string }[]).map((stat, i) => (
                  <React.Fragment key={stat.value}>
                    {/* Vertical divider between stats */}
                    {i > 0 && (
                      <div
                        className="shrink-0 self-stretch mx-7"
                        style={{
                          width: '1px',
                          background:
                            'linear-gradient(to bottom, transparent, rgba(135,93,217,0.45), transparent)',
                        }}
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <span
                        className="font-hero font-bold text-brand-white leading-none"
                        style={{
                          fontSize: 'clamp(1.5rem, 2.1vw, 2rem)',
                          textShadow: '0 0 18px rgba(135,93,217,0.5)',
                        }}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="font-body text-brand-muted uppercase tracking-wider leading-tight"
                        style={{ fontSize: '10.5px' }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </FadeIn>

          </div>

          {/* RIGHT COLUMN — image card with glow */}
          <FadeIn direction="up" delay={0.18} className="flex justify-center lg:justify-end">
            <div className="relative">

              {/* Glow halo — intensity driven by scroll (T arriving) */}
              <motion.div
                className="absolute pointer-events-none"
                aria-hidden="true"
                style={{
                  inset:      '-60px',
                  background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(185,120,255,0.95) 0%, rgba(135,93,217,0.55) 38%, transparent 68%)',
                  filter:     'blur(32px)',
                  opacity:    glow,
                }}
              />

              {/* Always-on subtle base glow */}
              <div
                className="absolute pointer-events-none"
                aria-hidden="true"
                style={{
                  inset:      '-15px',
                  background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(83,40,168,0.3) 0%, transparent 65%)',
                  filter:     'blur(16px)',
                }}
              />

              {/* Gradient border wrapper — boxShadow animates from dark to bright glow */}
              <motion.div
                style={{
                  position:     'relative',
                  padding:       '5px',
                  background:   'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, #5328A8 55%, rgba(135,93,217,0.4) 100%)',
                  borderRadius: '20px',
                  boxShadow:    borderGlowShadow,
                }}
              >
                {/* Inner card */}
                <div
                  style={{
                    width:        'clamp(300px, 38vw, 488px)',
                    height:       'clamp(320px, 42vw, 500px)',
                    borderRadius: '16px',
                    overflow:     'hidden',
                    background:   'linear-gradient(135deg, #1a0440 0%, #2d0878 48%, #0e0222 100%)',
                    position:     'relative',
                  }}
                >
                  {/* Team image — hidden via onError when file is absent */}
                  <motion.img
                    src={data.image}
                    alt="TruS team at work"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: imageFilter }}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />

                  {/* Depth overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    aria-hidden="true"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(135,93,217,0.10) 0%, transparent 45%, rgba(83,40,168,0.07) 100%)',
                    }}
                  />

                  {/* Top-left corner light leak */}
                  <div
                    className="absolute pointer-events-none"
                    aria-hidden="true"
                    style={{
                      top: 0, left: 0, width: '55%', height: '55%',
                      background:
                        'radial-gradient(ellipse at 5% 5%, rgba(210,170,255,0.14) 0%, transparent 60%)',
                    }}
                  />
                </div>
              </motion.div>

            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}

export default AboutSection
