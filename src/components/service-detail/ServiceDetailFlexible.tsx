import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailFlexible as FlexibleContent } from "@/config/serviceDetails.config";

interface ServiceDetailFlexibleProps {
  flexible: FlexibleContent;
  images: { schedule: string; multilingual: string };
}

function Dot() {
  return <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-white lg:mt-[7px]" />;
}

/**
 * Dark "modes + localization" block: a list of service modes, a centered
 * scheduling image, then a multilingual image/text row.
 */
export function ServiceDetailFlexible({ flexible, images }: ServiceDetailFlexibleProps) {
  const { eyebrow, heading, modes, scheduleImageAlt, multilingual } = flexible;

  return (
    <section
      aria-labelledby="service-flexible-heading"
      className="px-5 py-[60px] text-white lg:py-20"
      style={{ background: "#070606" }}
    >
      <div className="mx-auto w-full max-w-[1068px]">
        <FadeIn direction="up">
          <p className="text-[12px] uppercase tracking-[0.04em] text-[#9F7EE1] lg:text-section-label">{eyebrow}</p>
          <h2
            id="service-flexible-heading"
            className="mt-2 max-w-[360px] font-hero text-[26px] font-bold leading-[1.1] lg:mt-3 lg:text-[32px] lg:leading-[36px]"
          >
            {heading}
          </h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.05}>
          <ul className="mt-6 space-y-4 lg:mt-[26px]">
            {modes.map((mode) => (
              <li key={mode.title}>
                <h3 className="flex items-start gap-2 font-body text-[16px] font-bold leading-5">
                  <Dot />
                  {mode.title}
                </h3>
                <p className="mt-2 font-body text-[14px] leading-5 text-white lg:text-[16px]">
                  {renderRichText(mode.description)}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={images.schedule}
            alt={scheduleImageAlt}
            loading="lazy"
            className="mx-auto mt-7 aspect-[2.1/1] w-full rounded-2xl object-cover lg:mt-[30px] lg:h-[212px] lg:w-[420px] lg:aspect-auto"
          />
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="mt-6 flex flex-col gap-6 lg:mt-[21px] lg:flex-row lg:items-start">
            <img
              src={images.multilingual}
              alt={multilingual.imageAlt}
              loading="lazy"
              className="aspect-[2.1/1] w-full shrink-0 rounded-2xl object-cover lg:h-[267px] lg:w-[321px] lg:aspect-auto"
            />
            <div className="min-w-0">
              <h3 className="font-hero text-[22px] font-bold leading-tight lg:text-[32px] lg:leading-[36px]">
                {multilingual.heading}
              </h3>
              <p className="mt-3 font-body text-[14px] leading-5 lg:text-[16px]">{multilingual.intro}</p>
              <ul className="mt-5 space-y-0 font-body text-[14px] leading-5 lg:text-[16px]">
                {multilingual.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Dot />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-body text-[14px] leading-5 lg:text-[16px]">{multilingual.outro}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailFlexible;
