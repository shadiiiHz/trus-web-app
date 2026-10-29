import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailTimingPerformance as TimingPerformanceContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:text-[32px] lg:leading-[1.1]";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc pl-6 text-left">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Light grey "timing and performance" block: a timing text, then a "learn which conversations and markets perform
 * better" text beside an image (below it on phones). Rendered only for services whose copy defines `timingPerformance`.
 */
export function ServiceDetailTimingPerformance({
  content,
  image,
}: {
  content: TimingPerformanceContent;
  image: string;
}) {
  return (
    <section
      aria-labelledby="service-timing-performance-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-timing-performance-heading" className={H2}>
              {content.heading}
            </h2>
            <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
              <div className="text-justify">{renderRichText(content.intro)}</div>
              <Bullets items={content.items} />
              <p className="text-justify">{content.outro}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-4">
            <h2 className={`${H2} max-lg:tracking-[-0.005em]`}>{content.insightsHeading}</h2>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
              <div className={`flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-0 ${BODY}`}>
                <div className="text-justify">{renderRichText(content.insightsLead)}</div>
                <Bullets items={content.insightsItems} />
                <p className="text-justify">{content.insightsOutro}</p>
                <div aria-hidden="true" className="hidden h-[22px] lg:block" />
                <p className="font-bold">{content.decideLead}</p>
                <Bullets items={content.decideItems} />
              </div>
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_52%] lg:h-[396px] lg:w-[414px] lg:[object-position:50%_67%] lg:rounded-2xl"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailTimingPerformance;
