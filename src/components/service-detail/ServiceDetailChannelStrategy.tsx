import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailChannelStrategy as ChannelStrategyContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "multilingual channel strategy" block: heading with tagline, intro, labelled examples, then a list beside an
 * image (the image sits above the list on phones). Rendered only for services whose copy defines `channelStrategy`.
 */
export function ServiceDetailChannelStrategy({ content, image }: { content: ChannelStrategyContent; image: string }) {
  return (
    <section
      aria-labelledby="service-channel-strategy-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-10">
            <div className="flex flex-col gap-4 lg:gap-2">
              <h2
                id="service-channel-strategy-heading"
                className="font-hero text-[26px] font-bold leading-[29px] lg:text-[32px] lg:leading-[1.1]"
              >
                {content.heading}
              </h2>
              <p className={`text-justify lg:text-left ${BODY}`}>{content.tagline}</p>
            </div>
            <div className={`text-justify ${BODY}`}>{renderRichText(content.intro)}</div>
            <div className={`text-justify lg:text-left ${BODY}`}>
              <p className="font-bold">{content.exampleLead}</p>
              {content.examples.map((ex) => (
                <p key={ex.label}>
                  <strong className="block font-bold lg:inline">{ex.label}</strong>
                  <span className="lg:ml-1">{ex.text}</span>
                </p>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <div className={`lg:min-w-0 lg:flex-1 ${BODY}`}>
              <p className="font-bold">{content.listLead}</p>
              <ul className="list-disc pl-6 text-left">
                {content.listItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{content.listOutro}</p>
            </div>
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_54%] max-lg:order-first lg:h-[242px] lg:w-[414px] lg:[object-position:50%_68%] lg:rounded-2xl"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelStrategy;
