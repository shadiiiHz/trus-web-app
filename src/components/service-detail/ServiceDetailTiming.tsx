import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailTiming as TimingContent } from "@/config/serviceDetails.config";

/**
 * Light text-only block: a heading + intro, then a second heading with intro, bold lead-in,
 * bullet list and closing paragraph. Rendered only for services whose copy defines `timing`.
 */
export function ServiceDetailTiming({ timing }: { timing: TimingContent }) {
  const { heading, intro, insightsHeading, insightsIntro, listHeading, items, outro } = timing;

  return (
    <section
      aria-labelledby="service-timing-heading"
      className="bg-[#E3E3E3] px-5 py-14 text-[#070606] lg:flex lg:min-h-[900px] lg:items-center lg:py-20 min-[1104px]:px-0"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2
              id="service-timing-heading"
              className="font-hero text-[26px] font-bold capitalize leading-[1.1] lg:flex lg:h-10 lg:items-center lg:text-[38px]"
            >
              {heading}
            </h2>
            <p className="font-body text-[16px] leading-[22px] max-lg:text-justify">{renderRichText(intro)}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-4 lg:gap-2">
            <h3 className="font-hero text-[26px] font-bold capitalize leading-[34px] lg:text-[28px] lg:leading-9">
              {insightsHeading}
            </h3>
            <div className="flex flex-col gap-2 font-body text-[16px] max-lg:text-justify">
              <p className="leading-5 lg:leading-[22px]">{renderRichText(insightsIntro)}</p>
              <p className="font-bold leading-5">{listHeading}</p>
              <ul className="list-disc pl-6 leading-[22px]">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="leading-5 lg:leading-[22px]">{outro}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailTiming;
