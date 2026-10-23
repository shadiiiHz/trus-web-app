import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { LoginInfoCard } from "@/components/auth/LoginInfoCard";
import { ServiceContactForm } from "@/components/service-detail/ServiceContactForm";
import { getServiceDetailCommon } from "@/config/serviceDetails.config";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { renderRichText } from "@/components/service-detail/richText";
import "@/styles/contact.css";

interface ServiceDetailContactProps {
  /** Service name, pre-filled as the form's Subject. */
  subject: string;
  heading: string;
  description: string;
  /** Let the description run the full container width (default: 700px max, so it wraps like the shorter Figma copy). */
  wide?: boolean;
}

/**
 * Per-service contact block — the same info card as the login/register pages
 * (LoginInfoCard) beside the contact form, with a service-specific
 * heading/description and the service pre-filled as the form's Subject.
 */
export function ServiceDetailContact({ subject, heading, description, wide }: ServiceDetailContactProps) {
  const { eyebrow, card, form } = siteConfig.contact;
  const { login } = siteConfig.auth;
  // Card height per Figma: 484px beside the form on desktop, 302px stacked on mobile.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <section id="contact" style={{ background: "#E3E3E3" }}>
      <div className="mx-auto w-full max-w-[1102px] px-5 py-[60px] lg:py-24">
        <FadeIn direction="up">
          <p
            className="mb-1.5 text-[12px] lg:mb-4 lg:text-[14px] text-section-label"
            style={{ color: "#5B2BB9", textTransform: "uppercase", letterSpacing: "0.12em" }}
          >
            {eyebrow}
          </p>
          <h2
            className="text-section-title mb-3 text-[26px] leading-[33px] lg:mb-4 lg:text-[38px] lg:leading-[1.1]"
            style={{ color: "#070606" }}
          >
            {heading}
          </h2>
          <p
            className={`text-justify font-body text-[14px] leading-6 text-[#070606] lg:text-left lg:text-[16px] lg:leading-[1.5] tracking-[-0.45px] ${
              wide ? "" : "max-w-[700px]"
            }`}
          >
            {renderRichText(description)}
          </p>
        </FadeIn>

        <div className="mt-7 flex flex-col gap-7 lg:mt-10 lg:flex-row lg:gap-12">
          <div className="shrink-0" style={{ width: "min(414px, 100%)" }}>
            <LoginInfoCard
              tagline={card.tagline}
              cta={login.card.cta}
              office={card.office}
              phone={card.phone}
              email={card.email}
              officeLabel={login.card.officeLabel}
              phoneLabel={login.card.phoneLabel}
              emailLabel={login.card.emailLabel}
              height={isDesktop ? 484 : 302}
              background="rgba(255, 255, 255, 0.2)"
            />
          </div>
          <div className="min-w-0 flex-1 lg:h-[484px] lg:pt-2">
            <ServiceContactForm
              className="lg:h-full lg:justify-between"
              fields={form.fields}
              submit={form.submit}
              subject={{ label: getServiceDetailCommon().subjectLabel, value: subject }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailContact;
