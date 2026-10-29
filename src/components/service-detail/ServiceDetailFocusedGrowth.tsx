import { Fragment } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailFocusedGrowth as FocusedGrowthContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailFocusedGrowthProps {
  growth: FocusedGrowthContent;
  images: { gain: string; highlights: string };
  /** The X page's Figma: 40px phone gaps around the pills, inline workflow labels, title beside each image, haze at the top. */
  xStyle?: boolean;
}

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[1.1]";

/** `tightOnPhone` mirrors Figma's 19px line height for the "gain" list on phones. */
function BulletList({ items, tightOnPhone }: { items: readonly string[]; tightOnPhone?: boolean }) {
  return (
    <ul className={`list-disc pl-6 ${tightOnPhone ? BODY.replace("leading-[22px]", "leading-[19px] lg:leading-[22px]") : BODY}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "focused growth" block: intro with a step cycle (pills joined by arrows; a scrollable row of chevron-linked pills on phones), workflow options, a "gain" list beside
 * an image and highlights beside an image. Rendered only for services whose copy defines `focusedGrowth`.
 */
export function ServiceDetailFocusedGrowth({ growth, images, xStyle = false }: ServiceDetailFocusedGrowthProps) {
  return (
    <section
      aria-labelledby="service-focused-growth-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:py-20"
      style={{ background: "#070606" }}
    >
      {/* Faint purple haze spanning the full section width behind the lists (desktop only). */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 -z-10 hidden h-[80px] w-[2200px] -translate-x-1/2 -translate-y-1/2 blur-[70px] lg:block ${xStyle ? "top-[14%]" : "top-[54%]"}`}
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
            <div className={`flex flex-col ${xStyle ? "gap-10 lg:gap-4" : "gap-4"}`}>
              <p className={`text-justify ${BODY}`}>{renderRichText(growth.intro)}</p>

              <ol className="-mx-5 flex items-center overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:gap-2 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {growth.steps.map((step, i) => (
                  <Fragment key={step}>
                    {i > 0 && (
                      <li
                        aria-hidden="true"
                        className="flex shrink-0 items-center justify-center px-2 lg:relative lg:block lg:h-px lg:min-w-4 lg:flex-1 lg:bg-white lg:p-0"
                      >
                        <span className="block size-[6px] -translate-x-[2.12px] rotate-45 border-r-[1.5px] border-t-[1.5px] border-white lg:absolute lg:right-[1.25px] lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 lg:border-r lg:border-t" />
                      </li>
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
          <div className={xStyle ? "flex flex-col gap-4 lg:gap-2" : "flex flex-col gap-2"}>
            <h3
              className={`flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[34px] tracking-[-0.5px] text-white lg:text-[32px] lg:leading-[22px] ${
                xStyle ? "max-lg:min-h-0 max-lg:normal-case max-lg:leading-[29px] max-lg:tracking-normal" : ""
              }`}
            >
              {growth.workflowHeading}
            </h3>
            {xStyle ? (
              <>
                <div className="flex flex-col gap-4 text-justify font-body text-[16px] leading-[22px] text-white lg:hidden">
                  {growth.workflows.map((workflow) => (
                    <p key={workflow.title}>
                      • <span className="font-bold">{workflow.title}</span> {workflow.description}
                    </p>
                  ))}
                </div>
                <ul className="hidden list-disc flex-col gap-0.5 pl-6 text-justify font-body text-[16px] leading-6 text-white lg:flex">
                  {growth.workflows.map((workflow) => (
                    <li key={workflow.title}>
                      <span className="font-bold">{workflow.title}</span> {workflow.description}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <ul className="flex list-disc flex-col gap-0.5 pl-6 text-justify font-body text-[16px] leading-6 text-white">
                {growth.workflows.map((workflow) => (
                  <li key={workflow.title}>
                    <span className="block font-bold">{workflow.title}</span>
                    <span className="block">{workflow.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>

        {xStyle ? (
          <>
            <FadeIn direction="up">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
                <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:basis-0 lg:gap-2">
                  <h3 className={`${H2} max-lg:tracking-[-0.01em]`}>{growth.gainHeading}</h3>
                  <BulletList items={growth.gainItems} />
                </div>
                <img
                  src={images.gain}
                  alt={growth.gainImageAlt}
                  loading="lazy"
                  className="h-[212px] w-full rounded-lg object-cover lg:h-[307px] lg:[object-position:50%_52%] lg:min-w-0 lg:flex-1 lg:basis-0 lg:rounded-2xl"
                />
              </div>
            </FadeIn>

            <FadeIn direction="up">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-5">
                <img
                  src={images.highlights}
                  alt={growth.highlightsImageAlt}
                  loading="lazy"
                  className="h-[212px] w-full rounded-lg object-cover [object-position:50%_71%] max-lg:order-2 lg:h-[285px] lg:[object-position:50%_50%] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
                />
                <div className="flex flex-col justify-center gap-4 max-lg:order-1 lg:min-w-0 lg:flex-1 lg:gap-2">
                  <h3 className={H2}>{growth.highlightsHeading}</h3>
                  <BulletList items={growth.highlightItems} />
                </div>
              </div>
            </FadeIn>
          </>
        ) : (
          <>
            <FadeIn direction="up">
              <div className="flex flex-col gap-2 lg:gap-5">
                <h3 className={H2}>{growth.gainHeading}</h3>
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-2">
                  <div className="lg:flex-1">
                    <BulletList items={growth.gainItems} tightOnPhone />
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
          </>
        )}
      </div>
    </section>
  );
}

export default ServiceDetailFocusedGrowth;
