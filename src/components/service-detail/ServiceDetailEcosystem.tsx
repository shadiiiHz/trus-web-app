import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailEcosystem as EcosystemContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "ecosystem" block: heading and intro, a short pill chain, an image beside a "What You Gain" list (the image sits
 * above the list on phones), then a mission header with a summary. Rendered only for services whose copy defines
 * `ecosystem`.
 */
export function ServiceDetailEcosystem({ content, image }: { content: EcosystemContent; image: string }) {
  return (
    <section
      aria-labelledby="service-ecosystem-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:bg-[#0A0A0A] lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2
              id="service-ecosystem-heading"
              className="font-hero text-[26px] font-bold leading-[29px] lg:flex lg:min-h-10 lg:items-center lg:font-body lg:text-[38px] lg:capitalize lg:leading-[31px]"
            >
              {content.heading}
            </h2>
            <p className={`text-justify lg:text-left ${BODY}`}>{renderRichText(content.intro)}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <ol className="-mx-5 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:justify-center lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
            {content.steps.map((step, i) => (
              <Fragment key={step}>
                {i > 0 && (
                  <li
                    aria-hidden="true"
                    className="flex shrink-0 items-center justify-center px-2 lg:relative lg:block lg:h-px lg:w-[100px] lg:bg-white lg:p-0"
                  >
                    <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-white lg:absolute lg:right-[1.25px] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:border-r lg:border-t" />
                  </li>
                )}
                <li className="box-border flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/30 bg-white px-[7px] font-hero text-[14px] font-bold leading-[18px] text-[#070606] lg:px-[15px]">
                  {step}
                </li>
              </Fragment>
            ))}
          </ol>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_58%] lg:h-[312px] lg:w-[414px] lg:[object-position:52%_50%] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-2">
              <h3 className="font-hero text-[26px] font-bold leading-[29px] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:capitalize lg:leading-[22px] lg:tracking-[-0.5px]">
                {content.gainHeading}
              </h3>
              <ul className={`list-disc pl-6 ${BODY}`}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">
                {content.missionLabel}
              </p>
              <h3 className="font-hero text-[26px] font-bold leading-9 lg:text-[32px] lg:leading-[42px]">
                {content.missionHeading}
              </h3>
            </div>
            <div className={`flex flex-col gap-3 ${BODY}`}>
              <p>{content.missionIntro}</p>
              <ul className="list-disc pl-6">
                {content.missionQuestions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
              <p>{content.missionConnect}</p>
              <p className="font-bold">{content.missionGoal}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailEcosystem;
