import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailMarketInsights as MarketInsightsContent } from "@/config/serviceDetails.config";
import { renderRichBlocks } from "@/components/service-detail/richText";

const BODY = "text-justify font-body text-[16px] leading-[22px] text-[#070606]";

/**
 * Light grey "market insights" block: heading, two texts with bullet lists, and a centred image.
 * Rendered only for services whose copy defines `marketInsights`.
 */
export function ServiceDetailMarketInsights({ insights, image }: { insights: MarketInsightsContent; image: string }) {
  return (
    <section
      aria-labelledby="service-insights-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2
              id="service-insights-heading"
              className="font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]"
            >
              {insights.heading}
            </h2>
            <div className={BODY}>{renderRichBlocks(insights.intro, "list-disc pl-6 text-left")}</div>
            <div className={BODY}>{renderRichBlocks(insights.example, "list-disc pl-6 text-left")}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={image}
            alt={insights.imageAlt}
            loading="lazy"
            className="mx-auto h-[212px] w-full rounded-lg object-cover lg:w-[420px] lg:rounded-2xl"
          />
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMarketInsights;
