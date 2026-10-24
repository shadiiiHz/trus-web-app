import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { ServiceContactCard } from "@/components/service-detail/ServiceContactCard";
import { ServiceContactForm } from "@/components/service-detail/ServiceContactForm";
import { getServiceDetailCommon } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailContactProps {
  /** Service name, pre-filled as the form's Subject. */
  subject: string;
  heading: string;
  description: string;
  /** Kept for config compatibility — the description always spans the full container width (Figma). */
  wide?: boolean;
}

/**
 * Per-service contact block (Figma): heading + description, then the info card
 * beside the contact form, with the service pre-filled as the form's Subject.
 * Identical on every service page; only the copy differs.
 */
export function ServiceDetailContact({ subject, heading, description }: ServiceDetailContactProps) {
  const { eyebrow, card, form } = siteConfig.contact;
  const { login } = siteConfig.auth;

  return (
    <section
      id="contact"
      className="bg-[#E3E3E3] px-5 py-14 lg:min-h-[900px] lg:pb-[105px] lg:pt-[129px]"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-7 lg:gap-5">
        <FadeIn direction="up" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-[12px] uppercase leading-[15px] text-[#5B2BB9] lg:text-[14px] lg:leading-[17px]">
              {eyebrow}
            </p>
            <h2 className="font-hero text-[26px] font-bold leading-[112%] text-[#070606] lg:text-[38px] lg:leading-[49px]">
              {heading}
            </h2>
          </div>
          <p className="text-justify font-body text-[16px] leading-6 tracking-[-0.45px] text-[#070606] lg:text-left">
            {renderRichText(description)}
          </p>
        </FadeIn>

        <div className="flex flex-col gap-7 lg:flex-row lg:gap-5">
          <ServiceContactCard
            tagline={card.tagline}
            cta={login.card.cta}
            office={card.office}
            phone={card.phone}
            email={card.email}
            officeLabel={login.card.officeLabel}
            phoneLabel={login.card.phoneLabel}
            emailLabel={login.card.emailLabel}
          />
          <div className="min-w-0 flex-1">
            <ServiceContactForm
              className="lg:h-[484px]"
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
