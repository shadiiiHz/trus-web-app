import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { ContactInfoCard } from '@/components/contact/ContactInfoCard'
import { ContactForm } from '@/components/contact/ContactForm'
import { siteConfig } from '@/config/site.config'
import { FadeIn } from '@/components/motion/FadeIn'

/**
 * ContactSection — white section with info card + contact form.
 *
 * Crystal T logic has been removed (paused for future redesign).
 * The info card border glow now activates via scroll:
 *   once the section is 40% in view → isLit becomes true permanently.
 */
export function ContactSection() {
  const { eyebrow, heading, card, form } = siteConfig.contact

  const sectionRef = useRef<HTMLElement>(null)

  // Light the card border once the section scrolls 40% into view (one-shot)
  const isLit = useInView(sectionRef, { once: true, amount: 0.40 })

  return (
    <section
      id="contact"
      ref={sectionRef}
      style={{ position: 'relative', background: '#FFFFFF', overflow: 'visible' }}
    >
      {/* Content */}
      <div
        className="relative mx-auto w-full max-w-[1200px] px-5"
        style={{ paddingTop: '100px', paddingBottom: '120px', position: 'relative', zIndex: 2 }}
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
          style={{ gap: '48px', alignItems: 'flex-start' }}
        >
          {/* Left — info card */}
          <div style={{ flexShrink: 0, width: 'min(380px, 100%)' }}>
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
    </section>
  )
}

export default ContactSection
