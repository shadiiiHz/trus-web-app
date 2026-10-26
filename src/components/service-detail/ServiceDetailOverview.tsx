import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailOverview as OverviewContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]";
const H3 =
  "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

/**
 * Light grey "overview" block: heading + intro with bullets, an image beside a "review and refine" list,
 * a "What You Gain" list and a "Best For" note. Rendered only for services whose copy defines `overview`.
 */
export function ServiceDetailOverview({ overview, image }: { overview: OverviewContent; image: string }) {
  return (
    <section aria-labelledby="service-overview-heading" className="bg-[#E3E3E3] px-5 py-14 lg:py-20">
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-overview-heading" className={H2}>
              {overview.heading}
            </h2>
            <div className={`flex flex-col gap-4 text-justify lg:gap-0 ${BODY}`}>
              <div>
                <p className="font-bold">{overview.lead}</p>
                {renderRichText(overview.text)}
              </div>
              <ul className="list-disc pl-5 text-left">
                {overview.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{overview.outro}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={overview.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:48%_center] lg:h-[318px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{overview.refineHeading}</h3>
              <div className={`flex flex-col gap-4 text-justify lg:gap-0 ${BODY}`}>
                <ul className="list-disc pl-5 text-left">
                  {overview.refineItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{overview.refineOutro}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h3 className={H3}>{overview.gainHeading}</h3>
            <ul className={`list-disc pl-5 ${BODY}`}>
              {overview.gainItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className={H3}>{overview.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[22px] text-[#070606] lg:leading-[19px]">
              {renderRichText(overview.bestFor)}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailOverview;
