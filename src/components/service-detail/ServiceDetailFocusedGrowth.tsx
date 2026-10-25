import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailFocusedGrowth as FocusedGrowthContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailFocusedGrowthProps {
  growth: FocusedGrowthContent;
  images: { gain: string; highlights: string };
}

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className={`list-disc pl-6 ${BODY}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "focused growth" block: intro with a step cycle (pills joined by lines), workflow options, a "gain" list beside
 * an image and highlights beside an image. Rendered only for services whose copy defines `focusedGrowth`.
 */
export function ServiceDetailFocusedGrowth({ growth, images }: ServiceDetailFocusedGrowthProps) {
  return (
    <section
      aria-labelledby="service-focused-growth-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:py-20"
      style={{ background: "#070606" }}
    >
      {/* Faint purple haze spanning the full section width behind the lists (desktop only). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[54%] -z-10 hidden h-[80px] w-[2200px] -translate-x-1/2 -translate-y-1/2 blur-[70px] lg:block"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(84, 38, 196, 0.9) 0%, rgba(84, 38, 196, 0.72) 30%, rgba(84, 38, 196, 0.42) 60%, rgba(84, 38, 196, 0.16) 80%, transparent 100%)",
        }}
      />

      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-focused-growth-heading" className={H2}>
              {growth.heading}
            </h2>
            <div className="flex flex-col gap-4">
              <p className={`text-justify ${BODY}`}>{renderRichText(growth.intro)}</p>

              <ol className="gap-2 max-lg:grid max-lg:grid-cols-[minmax(106px,auto)] max-lg:justify-center lg:flex lg:flex-row lg:items-center">
                {growth.steps.map((step, i) => (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li
                        aria-hidden="true"
                        className="h-5 w-px bg-white max-lg:justify-self-center lg:h-px lg:w-auto lg:min-w-1 lg:flex-1"
                      />
                    )}
                    <li className="box-border flex h-[34px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/30 bg-white p-[7px] font-hero text-[14px] font-bold leading-[18px] text-[#070606]">
                      {step}
                    </li>
                  </Fragment>
                ))}
              </ol>

              <p className={`text-justify ${BODY}`}>{growth.closing}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className="flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[34px] tracking-[-0.5px] text-white lg:text-[32px] lg:leading-[22px]">
              {growth.workflowHeading}
            </h3>
            <ul className="flex list-disc flex-col gap-0.5 pl-6 text-justify font-body text-[16px] leading-6 text-white">
              {growth.workflows.map((workflow) => (
                <li key={workflow.title}>
                  <span className="block font-bold">{workflow.title}</span>
                  <span className="block">{workflow.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2 lg:gap-5">
            <h3 className={H2}>{growth.gainHeading}</h3>
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-2">
              <div className="lg:flex-1">
                <BulletList items={growth.gainItems} />
              </div>
              <img
                src={images.gain}
                alt={growth.gainImageAlt}
                loading="lazy"
                className="h-[212px] w-full rounded-lg object-cover lg:h-[242px] lg:flex-1 lg:basis-0 lg:rounded-2xl"
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:h-[258px] lg:flex-row lg:items-stretch lg:gap-5">
            <img
              src={images.highlights}
              alt={growth.highlightsImageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover max-lg:order-2 lg:h-[259px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col justify-center gap-2 max-lg:order-1 lg:flex-1">
              <h3 className={H2}>{growth.highlightsHeading}</h3>
              <BulletList items={growth.highlightItems} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailFocusedGrowth;
