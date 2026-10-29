import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailMarketStrategy as MarketStrategyContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "text-justify font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";

/**
 * Dark "market strategy" block: an intro with a list of adaptable factors beside an image, followed by a
 * "different markets" example. Rendered only for services whose copy defines `marketStrategy`.
 */
export function ServiceDetailMarketStrategy({ content, image }: { content: MarketStrategyContent; image: string }) {
  return (
    <section
      aria-labelledby="service-market-strategy-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[860px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-market-strategy-heading" className={`${H2} lg:capitalize`}>
              {content.heading}
            </h2>
            <p className={BODY}>{renderRichText(content.intro)}</p>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
              <div className={`flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-0 ${BODY}`}>
                <p className="font-bold">{content.adjustHeading}</p>
                <ul className="list-disc pl-6 text-left">
                  {content.adjustItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{content.outro}</p>
              </div>
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full rounded-lg object-cover [object-position:72%_center] lg:h-[308px] lg:min-w-0 lg:flex-1 lg:rounded-2xl"
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2 className={`${H2} lg:tracking-[-0.012em]`}>{content.marketsHeading}</h2>
            <div className={BODY}>
              <p>{content.marketsIntro}</p>
              <div className="mt-[22px]">{renderRichText(content.marketsExample)}</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMarketStrategy;
