import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailFlexible as FlexibleContent } from "@/config/serviceDetails.config";

/** Light "modes" block: heading + intro, then one titled paragraph group per service mode. */
export function ServiceDetailFlexible({ flexible }: { flexible: FlexibleContent }) {
  const { heading, description, modes } = flexible;

  return (
    <section
      aria-labelledby="service-flexible-heading"
      className="bg-[#E3E3E3] px-5 py-14 text-[#070606] lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-flexible-heading"
            className="font-hero text-[26px] font-bold leading-[1.1] lg:text-[32px]"
          >
            {heading}
          </h2>
          <p className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:mt-2 lg:text-left lg:leading-6">
            {description}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.05}>
          <ul className="flex flex-col gap-4">
            {modes.map((mode) => (
              <li key={mode.title} className="flex flex-col gap-2">
                <h3 className="flex min-h-10 items-center font-body text-[20px] font-bold leading-5">{mode.title}</h3>
                <p className="text-justify font-body text-[16px] leading-[22px]">{renderRichText(mode.description)}</p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailFlexible;
