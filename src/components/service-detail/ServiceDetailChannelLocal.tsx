import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailChannelLocal as ChannelLocalContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const TIGHT = "font-body text-[16px] leading-[19px] text-[#070606]";

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
 * Light grey "local channel" block: heading and intro, an image beside an adapt list (image above the list on phones),
 * then an "ongoing relationship" text with a scheduled-content list. Rendered only for services whose copy defines
 * `channelLocal`.
 */
export function ServiceDetailChannelLocal({ content, image }: { content: ChannelLocalContent; image: string }) {
  return (
    <section
      aria-labelledby="service-channel-local-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:gap-5">
            <div className="flex flex-col gap-4 lg:gap-2">
              <h2
                id="service-channel-local-heading"
                className="font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:font-body lg:text-[32px] lg:capitalize lg:leading-[39px]"
              >
                {content.heading}
              </h2>
              <p className={`text-justify ${BODY}`}>{content.intro}</p>
            </div>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_54%] lg:h-[287px] lg:w-[420px] lg:[object-position:53%_50%] lg:rounded-2xl"
              />
              <div className={`lg:min-w-0 lg:flex-1 ${BODY}`}>
                <p className="font-bold">{content.adaptLead}</p>
                <Bullets items={content.adaptItems} />
                <p className="text-justify">{content.adaptOutro}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:gap-4">
            <div className="flex flex-col gap-4 lg:gap-2">
              <h3 className="flex font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize">
                {content.ongoingHeading}
              </h3>
              <p className={`text-justify ${TIGHT}`}>{renderRichText(content.ongoingText)}</p>
            </div>
            <div className={BODY}>
              <p className="font-bold">{content.exampleLead}</p>
              <Bullets items={content.exampleItems} />
            </div>
            <p className={`text-justify ${TIGHT}`}>{content.closing}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelLocal;
