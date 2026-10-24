import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailIntelligence as IntelligenceContent } from "@/config/serviceDetails.config";

/**
 * Light "insights" block: heading + intro, a centered image, then a bullet list and closing paragraph.
 * Rendered only for services whose copy defines `intelligence`.
 */
export function ServiceDetailIntelligence({ intelligence, image }: { intelligence: IntelligenceContent; image: string }) {
  const { heading, intro, imageAlt, listHeading, items, outro } = intelligence;

  return (
    <section
      aria-labelledby="service-intelligence-heading"
      className="bg-[#E3E3E3] px-5 py-14 text-[#070606] lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-intelligence-heading"
            className="font-hero text-[26px] font-bold leading-[1.1] lg:text-[32px] lg:leading-[1.1]"
          >
            {heading}
          </h2>
          <p className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:mt-2 lg:text-left">
            {renderRichText(intro)}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="h-[200px] w-full rounded-lg object-cover object-[12%_center] lg:mx-auto lg:h-[282px] lg:w-[420px] lg:rounded-2xl"
          />
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <h3 className="font-hero text-[26px] font-bold leading-[34px] lg:text-[28px] lg:leading-9">{listHeading}</h3>
          <ul className="mt-4 list-disc pl-6 font-body text-[16px] leading-[22px] lg:mt-2 lg:pl-5">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-2 font-body text-[16px] leading-[22px] lg:leading-5">{outro}</p>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailIntelligence;
