import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailFocus as FocusContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]";
const H3 = "flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-[#070606] lg:text-[32px]";

/**
 * Light grey "focus" block: heading + description, an image beside "What You Gain", and a "Best For" note.
 * Rendered only for services whose copy defines `focus`.
 */
export function ServiceDetailFocus({ focus, image }: { focus: FocusContent; image: string }) {
  return (
    <section aria-labelledby="service-focus-heading" className="bg-[#E3E3E3] px-5 py-14 lg:py-20">
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-focus-heading" className={H2}>
              {focus.heading}
            </h2>
            <div className={`text-justify ${BODY}`}>
              <p className="font-hero text-[20px] font-bold leading-[22px]">{focus.subheading}</p>
              {renderRichText(focus.body)}
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={focus.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:30%_center] lg:h-[300px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:flex-1">
              <h3 className={H3}>{focus.gainHeading}</h3>
              <ul className={`list-disc pl-5 ${BODY}`}>
                {focus.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className={H3}>{focus.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[19px] text-[#070606]">{renderRichText(focus.bestFor)}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailFocus;
