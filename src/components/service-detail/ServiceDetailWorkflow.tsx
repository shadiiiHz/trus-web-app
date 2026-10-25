import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichBlocks } from "@/components/service-detail/richText";
import type { ServiceDetailWorkflow as WorkflowContent } from "@/config/serviceDetails.config";

/**
 * Dark "growth + workflow" block: heading with intro and bullets, a centred image, a platform-by-platform
 * workflow description, then an image beside a highlights list. Rendered only for services whose copy defines `workflow`.
 */
export function ServiceDetailWorkflow({
  workflow,
  growthImage,
  workflowImage,
}: {
  workflow: WorkflowContent;
  growthImage: string;
  workflowImage: string;
}) {
  const { heading, intro, growthImageAlt, workflowHeading, workflowIntro, platforms, highlightsHeading, highlights, workflowImageAlt } =
    workflow;

  return (
    <section
      aria-labelledby="service-workflow-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:py-20 min-[1104px]:px-0"
      style={{ background: "#070606" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-[60%] hidden h-[420px] w-[1800px] -translate-x-1/2 -translate-y-1/2 blur-[60px] lg:block"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.34) 0%, rgba(91, 43, 185, 0.2) 40%, rgba(91, 43, 185, 0.08) 70%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2
              id="service-workflow-heading"
              className="font-hero text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-[1.1]"
            >
              {heading}
            </h2>
            <div className="text-justify font-body text-[16px] leading-[22px]">{renderRichBlocks(intro)}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={growthImage}
            alt={growthImageAlt}
            loading="lazy"
            className="h-[200px] w-full rounded-lg object-cover lg:mx-auto lg:h-[212px] lg:w-[414px] lg:rounded-2xl"
          />
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-4 lg:gap-2">
            <div className="flex flex-col gap-2">
              <h3 className="font-hero text-[28px] font-bold leading-[1.1]">{workflowHeading}</h3>
              <p className="font-body text-[16px] leading-[22px]">{workflowIntro}</p>
            </div>
            <div className="font-body text-[16px] leading-[22px] max-lg:text-justify">{renderRichBlocks(platforms)}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={workflowImage}
              alt={workflowImageAlt}
              loading="lazy"
              className="h-[200px] w-full rounded-lg object-cover lg:h-[259px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:h-[259px] lg:flex-1 lg:justify-center lg:gap-2">
              <h3 className="font-hero text-[28px] font-bold leading-[1.1]">{highlightsHeading}</h3>
              <ul className="list-disc pl-6 font-body text-[16px] leading-[22px]">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailWorkflow;
