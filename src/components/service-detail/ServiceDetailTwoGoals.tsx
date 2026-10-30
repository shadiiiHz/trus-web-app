import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailTwoGoals as TwoGoalsContent } from "@/config/serviceDetails.config";

const LIST = "list-disc pl-6 font-body text-[15px] leading-[22px] text-white";
const TITLE = "font-hero text-[22px] font-bold leading-[24px] text-white lg:leading-[29px]";

/**
 * Dark "two growth goals" block: title, a "grow your YouTube presence" column (intro, list, monetization note), then an
 * image beside a "grow your business" column (intro, list, a viewer-to-customer pill chain) and a closing summary.
 * The image sits between the two columns on phones. Rendered for services whose copy defines `twoGoals`.
 */
export function ServiceDetailTwoGoals({ content, image }: { content: TwoGoalsContent; image: string }) {
  const { youtube, business } = content;
  return (
    <section
      aria-labelledby="service-two-goals-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:h-[900px] lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-two-goals-heading"
            className="font-hero text-[26px] font-bold leading-[29px] tracking-[-0.0085em] text-white lg:text-[32px] lg:leading-[35px] lg:tracking-[-0.0235em]"
          >
            {content.heading}
          </h2>
        </FadeIn>

        <div className="flex flex-col gap-10">
          <FadeIn direction="up">
            <div className="flex flex-col gap-4">
              <h3 className={TITLE}>{youtube.title}</h3>
              <div className="flex flex-col gap-2">
                <p className="font-body text-[16px] leading-[22px] tracking-[-0.003em] text-white">{youtube.intro}</p>
                <ul className={LIST}>
                  {youtube.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <p className="text-justify font-body text-[14px] leading-[22px] text-white lg:leading-5">{youtube.note}</p>
            </div>
          </FadeIn>

          <FadeIn direction="up">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full rounded-lg object-cover [object-position:50%_54%] lg:[object-position:71%_0%] lg:h-[293px] lg:w-[414px] lg:shrink-0 lg:rounded-xl"
              />
              <div className="flex flex-col gap-2 lg:min-w-0 lg:flex-1">
                <h3 className={TITLE}>{business.title}</h3>
                <div className="flex flex-col gap-2">
                  <p className="font-body text-[16px] leading-[22px] tracking-[-0.003em] text-white">{business.intro}</p>
                  <ul className={LIST}>
                    {business.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="font-body text-[15px] leading-[22px] text-white">{business.text}</p>
                  <ol className="-mx-5 flex items-center overflow-x-auto px-5 max-lg:mt-8 [scrollbar-width:none] lg:mx-0 lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                    {business.steps.map((step, i) => (
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
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up">
            <p className="text-justify font-body text-[16px] leading-[22px] text-white lg:leading-[19px] [&_span]:inline">
              {renderRichText(content.summary)}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailTwoGoals;
