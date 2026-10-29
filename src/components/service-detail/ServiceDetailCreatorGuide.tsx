import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailCreatorGuide as CreatorGuideContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:text-[32px] lg:leading-[1.1]";
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
 * Light grey "creator guide" block: heading and a "based on" list, an image beside the purposes list, a refine list, a
 * "What You Gain" list beside an image and a "Best For" note. Rendered only for services whose copy defines `creatorGuide`.
 */
export function ServiceDetailCreatorGuide({
  content,
  images,
}: {
  content: CreatorGuideContent;
  images: { purposes: string; gain: string };
}) {
  return (
    <section
      aria-labelledby="service-creator-guide-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 id="service-creator-guide-heading" className={H2}>
                {content.heading}
              </h2>
              <p className={BODY}>{content.tagline}</p>
            </div>
            <div className={BODY}>
              <p className="font-bold">{content.basedLead}</p>
              <Bullets items={content.basedItems} />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={images.purposes}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_58%] lg:h-[286px] lg:w-[414px] lg:[object-position:55%_50%] lg:rounded-2xl"
            />
            <div className={`lg:min-w-0 lg:flex-1 ${BODY}`}>
              <p className="font-bold">{content.purposesLead}</p>
              <Bullets items={content.purposesItems} />
              <p>{content.purposesOutro}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className={BODY}>
            <p className="font-bold">{content.refineLead}</p>
            <Bullets items={content.refineItems} />
            <p>{content.refineOutro}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={images.gain}
              alt={content.gainImageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_58%] lg:h-[312px] lg:w-[414px] lg:[object-position:52%_50%] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{content.gainHeading}</h3>
              <div className={BODY}>
                <Bullets items={content.gainItems} />
              </div>
            </div>
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

export default ServiceDetailCreatorGuide;
