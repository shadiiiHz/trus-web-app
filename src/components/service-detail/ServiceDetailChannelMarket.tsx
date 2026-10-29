import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailChannelMarket as ChannelMarketContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Faint purple band behind the top half (desktop only). Vertical falloff is the background, the horizontal falloff is a
 * mask; both profiles are sampled from the Figma frame (peak alpha ≈ 0.18).
 */
const HAZE_STYLE = {
  background:
    "linear-gradient(to bottom, rgba(91,43,185,0) 0%, rgba(91,43,185,0.054) 10%, rgba(91,43,185,0.12) 20%, rgba(91,43,185,0.171) 30%, rgba(91,43,185,0.18) 45%, rgba(91,43,185,0.108) 60%, rgba(91,43,185,0.054) 75%, rgba(91,43,185,0.018) 90%, rgba(91,43,185,0) 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.13) 4%, rgba(0,0,0,0.22) 8%, rgba(0,0,0,0.34) 12.5%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.8) 25%, #000 30%, #000 70%, rgba(0,0,0,0.8) 75%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.34) 87.5%, rgba(0,0,0,0.22) 92%, rgba(0,0,0,0.13) 96%, rgba(0,0,0,0) 100%)",
  maskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.13) 4%, rgba(0,0,0,0.22) 8%, rgba(0,0,0,0.34) 12.5%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.8) 25%, #000 30%, #000 70%, rgba(0,0,0,0.8) 75%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.34) 87.5%, rgba(0,0,0,0.22) 92%, rgba(0,0,0,0.13) 96%, rgba(0,0,0,0) 100%)",
} as const;

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
 * Dark "channel market" block: heading and tagline, an image beside a publish-by list (image above the list on
 * phones), then a "learn which channels respond better" list, over a faint purple haze. Rendered only for services whose
 * copy defines `channelMarket`.
 */
export function ServiceDetailChannelMarket({ content, image }: { content: ChannelMarketContent; image: string }) {
  return (
    <section
      aria-labelledby="service-channel-market-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="relative mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[37px] -z-10 hidden h-[300px] w-[1440px] -translate-x-1/2 lg:block"
          style={HAZE_STYLE}
        />

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:gap-5">
            <div className="flex flex-col gap-2">
              <h2
                id="service-channel-market-heading"
                className="font-body text-[26px] font-bold capitalize leading-[31px] lg:text-[32px] lg:leading-[39px]"
              >
                {content.heading}
              </h2>
              <p className={`text-justify ${BODY}`}>{content.tagline}</p>
            </div>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_54%] lg:h-[221px] lg:w-[420px] lg:[object-position:50%_57%] lg:rounded-2xl"
              />
              <div className={`lg:min-w-0 lg:flex-1 ${BODY}`}>
                <p className="font-bold">{content.publishLead}</p>
                <Bullets items={content.publishItems} />
                <p className="font-bold text-justify">{content.publishOutro}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="flex min-h-10 items-center max-lg:h-[53px] font-hero text-[26px] font-bold capitalize leading-[26px] tracking-[-0.5px] lg:text-[32px] lg:leading-[22px]">
                {content.insightHeading}
              </h3>
              <p className="text-justify font-body text-[16px] leading-[19px]">{content.insightText}</p>
            </div>
            <div className={BODY}>
              <p className="font-bold text-justify">{content.compareLead}</p>
              <Bullets items={content.compareItems} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelMarket;
