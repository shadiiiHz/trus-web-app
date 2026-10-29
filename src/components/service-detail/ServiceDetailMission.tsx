import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailMission as MissionContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "mission" block: eyebrow and heading, an image beside a paragraph list (the image sits below the text on
 * phones), then a "clear path" chain of pills (a scrollable chevron row on phones, equal pills joined by arrows from
 * `lg`). Rendered right after the hero for services whose copy defines `mission`.
 */
export function ServiceDetailMission({ content, image }: { content: MissionContent; image: string }) {
  return (
    <section
      aria-labelledby="service-mission-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:bg-[#0A0A0A] lg:py-20"
    >
      <div className="mx-auto w-full max-w-[1064px]">
        <FadeIn direction="up">
          <div className="flex flex-col lg:grid lg:grid-cols-[522px_minmax(0,1fr)] lg:gap-x-5 lg:gap-y-10">
            <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-2">
              <p className="text-[14px] uppercase leading-[17px] text-[#9F7EE1]">{getServiceDetailCommon().aboutEyebrow}</p>
              <h2
                id="service-mission-heading"
                className="max-w-[451px] font-hero text-[26px] font-bold leading-[29px] lg:text-[32px] lg:leading-[1.1]"
              >
                {content.heading}
              </h2>
            </div>

            <div className={`mt-4 text-justify lg:col-start-2 lg:row-start-2 lg:mt-0 ${BODY}`}>
              {content.paragraphs.map((p, i) =>
                p.text ? (
                  <p
                    key={i}
                    className={`${p.bold ? "font-bold" : ""} ${p.justifyLast ? "[text-align-last:justify]" : ""}`}
                  >
                    {p.text}
                  </p>
                ) : (
                  <div key={i} aria-hidden="true" className="h-[22px]" />
                ),
              )}
            </div>

            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="mt-10 h-[212px] w-full rounded-lg object-cover [object-position:50%_58%] lg:[object-position:50%_65%] lg:col-start-1 lg:row-start-2 lg:mt-0 lg:h-[308px] lg:rounded-2xl"
            />

            <div className="mt-10 flex flex-col gap-4 lg:col-span-2 lg:row-start-3 lg:mt-0">
              <p className={`text-justify font-bold ${BODY}`}>{content.pathLead}</p>
              <ol className="-mx-5 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {content.steps.map((step, i) => (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li
                        aria-hidden="true"
                        className="flex shrink-0 items-center justify-center px-2 lg:relative lg:block lg:h-px lg:min-w-4 lg:flex-1 lg:bg-white lg:p-0"
                      >
                        <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-white lg:absolute lg:right-[1.25px] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:border-r lg:border-t" />
                      </li>
                    )}
                    <li className="box-border flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/30 bg-white px-[15px] font-hero text-[14px] font-bold leading-[18px] text-[#070606] lg:w-[104.91px] lg:shrink lg:px-2">
                      {step}
                    </li>
                  </Fragment>
                ))}
              </ol>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMission;
