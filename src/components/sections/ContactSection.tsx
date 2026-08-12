import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { ContactInfoCard } from '@/components/contact/ContactInfoCard'
import { ContactForm } from '@/components/contact/ContactForm'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'

// Extra scroll runway (on top of the pinned 100vh) the user has to scroll
// through before the section releases — same sticky-panel technique as
// WhyUsSection/TeamSection, just a shorter hold since Contact has no
// scroll-driven entrance choreography of its own.
const PIN_RUNWAY_VH = 40

/**
 * ContactSection — #E3E3E3 section with info card + contact form.
 *
 * Crystal T logic has been removed (paused for future redesign).
 * The info card border glow now activates via scroll:
 *   once the section is 40% in view → isLit becomes true permanently.
 *
 * Desktop (≥1024px): the section locks/pins in place for a short scroll
 * distance on entry, same as WhyUs/Team, so the user has a settled moment
 * with the form before it releases into the Footer. Mobile keeps the plain
 * static layout — pinning a stacked card+form column risks clipping it on
 * short viewports, and there's no room for it there anyway.
 */
export function ContactSection() {
  const { eyebrow, heading, card, form } = siteConfig.contact

  const sectionRef = useRef<HTMLElement>(null)
  const [isDesktop, setIsDesktop] = useState(false)

  // Light the card border once the section scrolls 40% into view (one-shot)
  const isLit = useInView(sectionRef, { once: true, amount: 0.40 })

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const content = (
    <div
      className="relative mx-auto w-full max-w-330 px-5"
      style={{
        paddingTop:    '100px',
        paddingBottom: '120px',
        position:      'relative',
        zIndex:        2,
      }}
    >

      <FadeIn direction="up" delay={0.08}>
        <p
          className="text-section-label"
          style={{
            fontWeight:    400,
            lineHeight:    '100%',
            color:         '#5B2BB9',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin:        '0 0 24px 0',
          }}
        >
          {eyebrow}
        </p>
      </FadeIn>

      <FadeIn direction="up" delay={0.16}>
        <h2
          className="text-section-title"
          style={{
            lineHeight: '100%',
            color:      '#070606',
            margin:     '0 0 48px 0',
          }}
        >
          {heading}
        </h2>
      </FadeIn>

      {/* Two-column layout */}
      <div
        className="flex flex-col lg:flex-row"
        style={{ gap: '48px', alignItems: 'stretch' }}
      >
        {/* Left — info card */}
        <div style={{ flexShrink: 0, width: 'min(386px, 100%)' }}>
          <ContactInfoCard
            tagline={card.tagline}
            cta={card.cta}
            office={card.office}
            phone={card.phone}
            email={card.email}
            isLit={isLit}
          />
        </div>

        {/* Right — contact form */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: '8px' }}>
          <ContactForm fields={form.fields} submit={form.submit} />
        </div>
      </div>

    </div>
  )

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ position: 'relative', background: '#E3E3E3', overflow: 'visible' }}
    >
      {isDesktop ? (
        <div style={{ height: `calc(100vh + ${PIN_RUNWAY_VH}vh)`, position: 'relative' }}>
          <div
            style={{
              position: 'sticky',
              top:      0,
              overflow: 'hidden',
            }}
          >
            {content}
          </div>
        </div>
      ) : (
        content
      )}
    </section>
  )
}

export default ContactSection
