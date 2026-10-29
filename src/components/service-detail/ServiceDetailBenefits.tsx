import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailBenefits as BenefitsContent } from "@/config/serviceDetails.config";

const LIST = "list-disc pl-6 font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";

/**
 * Dark "benefits" block: "What you gain" list beside an image, then an image beside a "Highlights" list
 * (stacked on phones). Rendered only for services whose copy defines `benefits`.
 */
export function ServiceDetailBenefits({ content, images }: { content: BenefitsContent; images: { gain: string; highlights: string } }) {
  return (
    <section
      aria-labelledby="service-benefits-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <div className="flex flex-col gap-4 lg:w-[518px] lg:shrink-0 lg:gap-2">
              <h2 id="service-benefits-heading" className={`${H2} lg:tracking-[-0.03em]`}>
                {content.heading}
              </h2>
              <ul className={LIST}>
                {content.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <img
              src={images.gain}
              alt={content.imageAlt}
              loading="lazy"
              className="order-last h-[212px] w-full rounded-lg object-cover lg:order-none lg:h-[307px] lg:min-w-0 lg:flex-1 lg:rounded-2xl"
            />
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={images.highlights}
              alt={content.imageAlt}
              loading="lazy"
              className="order-last h-[212px] w-full rounded-lg object-cover lg:order-none lg:h-[266px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:h-[266px] lg:min-w-0 lg:flex-1 lg:justify-center lg:gap-2">
              <h2 className={H2}>{content.highlightsHeading}</h2>
              <ul className={LIST}>
                {content.highlightItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailBenefits;
