import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailJourney as JourneyContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "text-justify font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:text-[32px] lg:leading-[1.1]";

/**
 * Light grey "journey" block: an image, a heading + intro with a connected pill workflow (a scrollable row on phones, a full-width row
 * from `xl`), and a "choose the right workflow" block. Rendered only for services whose copy defines `journey`.
 */
export function ServiceDetailJourney({ content, image }: { content: JourneyContent; image: string }) {
  return (
    <section
      aria-labelledby="service-journey-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <img
            src={image}
            alt={content.imageAlt}
            loading="lazy"
            className="mx-auto h-[212px] w-full rounded-lg object-cover lg:w-[522px] lg:rounded-2xl"
          />
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:gap-4">
            <div className="flex flex-col gap-4">
              <h2 id="service-journey-heading" className={H2}>
                {content.heading}
              </h2>
              <div className={BODY}>
                <p>{content.intro}</p>
                <p className="font-bold">{content.introLead}</p>
              </div>
            </div>

            <ol className="-mx-5 -mt-6 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mt-0 xl:mx-0 xl:gap-0.5 xl:overflow-visible xl:px-0 [&::-webkit-scrollbar]:hidden">
              {content.steps.map((step, i) => (
                <Fragment key={step}>
                  {i > 0 && (
                    <li
                      role="presentation"
                      aria-hidden="true"
                      className="flex shrink-0 items-center justify-center px-2 xl:relative xl:block xl:h-px xl:min-w-0 xl:flex-1 xl:bg-[#070606] xl:p-0"
                    >
                      <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-[#070606] xl:absolute xl:right-[1.25px] xl:top-1/2 xl:translate-x-0 xl:-translate-y-1/2 xl:border-r xl:border-t" />
                    </li>
                  )}
                  <li className="flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#070606] p-2 font-hero text-[14px] font-bold leading-[18px] text-white">
                    {step}
                  </li>
                </Fragment>
              ))}
            </ol>

            <p className={BODY}>{content.outro}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 className={H2}>{content.workflowHeading}</h2>
            <div className={BODY}>{renderRichText(content.workflow)}</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailJourney;
