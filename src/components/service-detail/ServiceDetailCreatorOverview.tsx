import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailCreatorOverview as CreatorOverviewContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H3 =
  "font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc pl-6 text-left">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Light grey "creator overview" block: two list columns (purposes / adjustable parts), a "What You Gain" list beside an
 * image and a "Best For" note. Rendered only for services whose copy defines `creatorOverview`.
 */
export function ServiceDetailCreatorOverview({ content, image }: { content: CreatorOverviewContent; image: string }) {
  return (
    <section
      aria-labelledby="service-creator-overview-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-[57px]"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-5">
            <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
              <p className="text-justify font-bold lg:text-left">{content.intro}</p>
              <Bullets items={content.items} />
              <p className="text-justify lg:text-left">{content.outro}</p>
            </div>
            <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
              <p className="text-justify font-bold lg:text-left">{content.adjustLead}</p>
              <Bullets items={content.adjustItems} />
              <div aria-hidden="true" className="hidden h-[22px] lg:block" />
              <p className="text-justify lg:text-left">{content.adjustOutro}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:basis-0 lg:justify-center lg:gap-2">
              <h2 id="service-creator-overview-heading" className={`${H3} lg:max-w-[472px]`}>
                {content.gainHeading}
              </h2>
              <div className={`${BODY} lg:max-w-[472px]`}>
                <Bullets items={content.gainItems} />
              </div>
            </div>
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover [object-position:50%_54%] lg:h-[312px] lg:min-w-0 lg:flex-1 lg:basis-0 lg:rounded-2xl"
            />
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h3 className={H3}>{content.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[22px] text-[#070606] lg:leading-[19px]">
              {renderRichText(content.bestFor)}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailCreatorOverview;
