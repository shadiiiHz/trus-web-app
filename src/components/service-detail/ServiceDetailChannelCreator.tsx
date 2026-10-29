import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailChannelCreator as ChannelCreatorContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[1.1]";
const H3 =
  "font-hero text-[26px] font-bold leading-[29px] text-white lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

/**
 * Faint purple band behind the "What You Gain" row (desktop only). Vertical falloff is the background, the
 * horizontal falloff is a mask; both profiles are sampled from the Figma frame.
 */
const HAZE_STYLE = {
  background:
    "linear-gradient(to bottom, rgba(91,43,185,0) 0%, rgba(91,43,185,0.014) 4.5%, rgba(91,43,185,0.048) 18%, rgba(91,43,185,0.118) 34%, rgba(91,43,185,0.16) 50%, rgba(91,43,185,0.118) 66%, rgba(91,43,185,0.048) 82%, rgba(91,43,185,0.014) 95.5%, rgba(91,43,185,0) 100%)",
  WebkitMaskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.21) 7%, rgba(0,0,0,0.6) 17%, #000 22%, #000 78%, rgba(0,0,0,0.6) 83%, rgba(0,0,0,0.21) 93%, rgba(0,0,0,0) 100%)",
  maskImage:
    "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.21) 7%, rgba(0,0,0,0.6) 17%, #000 22%, #000 78%, rgba(0,0,0,0.6) 83%, rgba(0,0,0,0.21) 93%, rgba(0,0,0,0) 100%)",
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
 * Dark "channel creator" block: heading and intro, an image beside a refine list, a closing text, a "What You Gain"
 * list beside an image and a "Best For" note. Rendered only for services whose copy defines `channelCreator`.
 */
export function ServiceDetailChannelCreator({
  content,
  images,
}: {
  content: ChannelCreatorContent;
  images: { refine: string; gain: string };
}) {
  return (
    <section
      aria-labelledby="service-channel-creator-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:flex lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 id="service-channel-creator-heading" className={H2}>
                {content.heading}
              </h2>
              <p className={BODY}>{content.tagline}</p>
            </div>
            <div className={`text-justify ${BODY}`}>{renderRichText(content.intro)}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={images.refine}
              alt={content.refineImageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_58%] lg:h-[242px] lg:w-[414px] lg:[object-position:50%_71%] lg:rounded-2xl"
            />
            <div className={`lg:min-w-0 lg:flex-1 ${BODY}`}>
              <p className="font-bold">{content.refineLead}</p>
              <Bullets items={content.refineItems} />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className={`text-justify ${BODY}`}>{renderRichText(content.closing)}</div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[440px] w-[1440px] -translate-x-1/2 -translate-y-1/2 lg:block"
              style={HAZE_STYLE}
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{content.gainHeading}</h3>
              <div className={BODY}>
                <Bullets items={content.gainItems} />
              </div>
            </div>
            <img
              src={images.gain}
              alt={content.gainImageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_57%] lg:h-[272px] lg:w-[414px] lg:[object-position:60%_50%] lg:rounded-2xl"
            />
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h3 className={H3}>{content.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[19px] tracking-[-0.031em] text-white">
              {content.bestFor}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelCreator;
