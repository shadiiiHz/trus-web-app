import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { HAZE_STYLE, hazeMask } from "@/components/service-detail/haze";
import type { ServiceDetailGrowthSystem as GrowthSystemContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[35px] lg:tracking-[-0.0235em]";
const LIST_HEADING =
  "font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-white lg:text-[32px] lg:tracking-[-1.13px]";

/** Haze alpha over its 400px box (page y 3560–3960 of the Figma frame). */
const HAZE_Y = hazeMask([[0, 0], [0.11, 10], [0.46, 20], [0.8, 30], [1, 40], [0.86, 50], [0.63, 60], [0.4, 70], [0.2, 80], [0.07, 90], [0, 100]]);

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className={`list-disc pl-6 ${BODY}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "growth system" block: heading, a lead line and a pill chain (a scrollable chevron row on phones, pills joined
 * by flexible arrow lines from `lg`), a summary and result list, then an image beside "What You Gain" and a
 * "Highlights" list. Rendered after the newsletter services for services whose copy defines `growthSystem`.
 */
export function ServiceDetailGrowthSystem({ content, image }: { content: GrowthSystemContent; image: string }) {
  return (
    <section
      aria-labelledby="service-growth-system-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:py-20"
    >
      {/* Purple haze around the image row, desktop only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[375px] -z-10 hidden h-[400px] bg-[rgba(91,43,185,0.19)] lg:block"
        style={{ maskImage: HAZE_Y, WebkitMaskImage: HAZE_Y, ...HAZE_STYLE }}
      />
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-growth-system-heading" className={H2}>
              {content.heading}
            </h2>
            <div className="flex flex-col gap-4">
              <p className={`font-bold ${BODY}`}>{content.lead}</p>
              <ol className="-mx-5 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {content.steps.map((step, i) => (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li
                        aria-hidden="true"
                        className="flex shrink-0 items-center justify-center max-lg:mx-2 max-lg:w-0.5 lg:relative lg:block lg:h-px lg:min-w-4 lg:flex-1 lg:bg-white lg:p-0"
                      >
                        <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-white lg:absolute lg:right-[1.25px] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:border-r lg:border-t" />
                      </li>
                    )}
                    <li className="box-border flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-full border border-white bg-white p-[7px] font-hero text-[14px] font-bold leading-[18px] text-[#070606]">
                      {step}
                    </li>
                  </Fragment>
                ))}
              </ol>
            </div>
            <p className={`tracking-[-0.003em] ${BODY}`}>{content.text}</p>
            <div className={BODY}>
              <p className="font-bold">{content.resultLabel}</p>
              <ul className="list-disc pl-6">
                {content.resultItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover lg:h-[291px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:min-w-0 lg:flex-1">
              <div className="flex min-h-10 items-center">
                <h3 className={LIST_HEADING}>{content.gainHeading}</h3>
              </div>
              <Bullets items={content.gainItems} />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <div className="flex min-h-10 items-center">
              <h3 className={LIST_HEADING}>{content.highlightsHeading}</h3>
            </div>
            <Bullets items={content.highlightItems} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailGrowthSystem;
