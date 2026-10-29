import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailContentCreator as ContentCreatorContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";
const H3 =
  "font-hero text-[26px] font-bold leading-[1.1] text-white lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

/**
 * Dark "content creator" block: heading + intro with an adjustable-options list, an image beside
 * "What You Gain", and a "Best For" note. Rendered only for services whose copy defines `contentCreator`.
 */
export function ServiceDetailContentCreator({
  content,
  image,
  xStyle = false,
}: {
  content: ContentCreatorContent;
  image: string;
  /** The X page's Figma: 20px lead, regular adjust heading, 24px list indent, 414px image and a purple haze. */
  xStyle?: boolean;
}) {
  const listPad = xStyle ? "pl-6" : "pl-5";
  return (
    <section
      aria-labelledby="service-content-creator-heading"
      className={`relative isolate overflow-hidden px-5 py-14 text-white lg:py-20 bg-[#070606]`}
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-content-creator-heading" className={H2}>
              {content.heading}
            </h2>
            <div className={`text-justify ${BODY}`}>
              <p className={xStyle ? "text-[20px] font-bold" : "font-bold"}>{content.lead}</p>
              {renderRichText(content.text)}
            </div>
            <div className={`flex flex-col gap-4 text-justify lg:gap-0 ${BODY}`}>
              <p className={xStyle ? undefined : "font-bold"}>{content.adjustHeading}</p>
              <ul className={`list-disc ${listPad} text-left`}>
                {content.adjustItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div>{renderRichText(content.multilingual)}</div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            {xStyle && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[38%] -z-10 hidden h-[420px] w-[1600px] -translate-x-1/2 -translate-y-1/2 blur-2xl lg:block"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.3) 0%, rgba(91, 43, 185, 0.18) 35%, rgba(91, 43, 185, 0.07) 65%, transparent 100%)",
                }}
              />
            )}
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className={`h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[269px] lg:rounded-2xl ${
                xStyle
                  ? "[object-position:51%_center] lg:w-[414px]"
                  : "[object-position:40%_center] lg:w-[420px] lg:[object-position:82%_center]"
              }`}
            />
            <div className="flex flex-col gap-4 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{content.gainHeading}</h3>
              <ul className={`list-disc ${listPad} ${BODY}`}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className={`flex flex-col ${xStyle ? "gap-4 lg:gap-2" : "gap-2"}`}>
            <h3 className={H3}>{content.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[22px] text-white lg:text-[18px]">
              {renderRichText(content.bestFor)}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailContentCreator;
