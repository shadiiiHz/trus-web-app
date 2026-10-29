import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailChannelWorkflow as ChannelWorkflowContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[1.1]";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className={`list-disc pl-6 text-left ${BODY}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "channel workflow" block: a workflow-choice list with bold labels, a "What You Gain" list, then an image beside a
 * highlights list (the image sits between the two lists on phones). Rendered only for services whose copy defines
 * `channelWorkflow`.
 */
export function ServiceDetailChannelWorkflow({ content, image }: { content: ChannelWorkflowContent; image: string }) {
  return (
    <section
      aria-labelledby="service-channel-workflow-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h2 id="service-channel-workflow-heading" className={H2}>
              {content.workflowHeading}
            </h2>
            <div className="flex flex-col gap-0.5 text-justify font-body text-[16px] leading-6 text-white lg:tracking-[-0.019em]">
              {content.workflows.map((w) => (
                <p key={w.title}>
                  <span className="font-bold">{w.title}</span> {w.description}
                </p>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h3 className={H2}>{content.gainHeading}</h3>
            <Bullets items={content.gainItems} />
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_54%] lg:h-[285px] lg:w-[414px] lg:[object-position:59%_50%] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:min-w-0 lg:flex-1 lg:justify-center lg:self-stretch">
              <h3 className={H2}>{content.highlightsHeading}</h3>
              <Bullets items={content.highlightItems} />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailChannelWorkflow;
