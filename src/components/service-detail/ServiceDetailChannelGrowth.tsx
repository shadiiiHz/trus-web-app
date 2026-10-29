import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailChannelGrowth as ChannelGrowthContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const TIGHT = "font-body text-[16px] leading-[19px] text-[#070606]";

/**
 * Light grey "channel growth" block: an "over time you can identify" list, an image, then a heading with intro and a
 * pill process chain (a scrollable chevron row on phones, arrow-linked pills from `lg`). Rendered only for services whose
 * copy defines `channelGrowth`.
 */
export function ServiceDetailChannelGrowth({ content, image }: { content: ChannelGrowthContent; image: string }) {
  return (
    <section
      aria-labelledby="service-channel-growth-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-[77px]"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className={BODY}>
              <p className="font-bold">{content.listLead}</p>
              <ul className="list-disc pl-6 text-justify lg:text-left">
                {content.listItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className={`text-justify ${TIGHT}`}>{content.listOutro}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={image}
            alt={content.imageAlt}
            loading="lazy"
            className="mx-auto h-[212px] w-full rounded-lg object-cover [object-position:50%_54%] lg:w-[522px] lg:[object-position:50%_66%] lg:rounded-2xl"
          />
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2
              id="service-channel-growth-heading"
              className="font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:text-[32px] lg:leading-[1.1]"
            >
              {content.heading}
            </h2>
            <div className="flex flex-col gap-4">
              <p className={`text-justify ${BODY}`}>{renderRichText(content.intro)}</p>
              <p className={`text-justify font-bold ${BODY}`}>{content.processLead}</p>

              <ol className="-mx-5 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {content.steps.map((step, i) => (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li
                        aria-hidden="true"
                        className="flex shrink-0 items-center justify-center px-2 lg:relative lg:block lg:h-px lg:min-w-4 lg:flex-1 lg:bg-[#070606] lg:p-0"
                      >
                        <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-[#070606] lg:absolute lg:right-[1.25px] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:border-r lg:border-t" />
                      </li>
                    )}
                    <li className="box-border flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/30 bg-[#070606] p-[7px] font-hero text-[14px] font-bold leading-[18px] text-white">
                      {step}
                    </li>
                  </Fragment>
                ))}
              </ol>

              <p className={`text-justify ${BODY}`}>{content.closing}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelGrowth;
