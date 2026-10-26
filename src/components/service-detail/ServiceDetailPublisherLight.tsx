import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailPublisherLight as PublisherLightContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]";
const H3 =
  "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

/**
 * Light grey "publisher" block: heading, two text blocks (the second with bold labels), an image beside
 * "What You Gain", and a "Best For" note. Rendered only for services whose copy defines `publisherLight`.
 */
export function ServiceDetailPublisherLight({ content, image }: { content: PublisherLightContent; image: string }) {
  return (
    <section
      aria-labelledby="service-publisher-light-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-publisher-light-heading" className={H2}>
              {content.heading}
            </h2>
            <div className={`text-justify ${BODY}`}>
              <p className="font-bold">{content.lead}</p>
              {renderRichText(content.text)}
            </div>
            <div className={`text-justify lg:text-left ${BODY}`}>{renderRichText(content.example)}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[225px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{content.gainHeading}</h3>
              <ul className={`list-disc pl-5 ${BODY}`}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className={H3}>{content.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[22px] text-[#070606] lg:text-[18px]">
              {content.bestFor}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailPublisherLight;
