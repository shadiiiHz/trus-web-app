import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailGainHighlights as GainHighlightsContent } from "@/config/serviceDetails.config";

const LIST = "list-disc pl-6 font-body text-[16px] leading-[22px] text-white";
const TITLE = "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px]";

/**
 * Dark "what you gain / highlights" block: a "What You Gain" list beside an image (the image sits under the list on
 * phones), then a "Highlights" list beside a second image (the image sits under the list on phones too; on desktop it
 * comes first). Rendered for services whose copy defines `gainHighlights`.
 */
export function ServiceDetailGainHighlights({
  content,
  images,
}: {
  content: GainHighlightsContent;
  images: { gain: string; highlights: string };
}) {
  return (
    <section
      aria-labelledby="service-gain-highlights-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-2">
              <div className="lg:flex lg:min-h-10 lg:items-center">
                <h2
                  id="service-gain-highlights-heading"
                  className={`${TITLE} capitalize tracking-[-0.5px] max-lg:tracking-normal lg:leading-[22px] lg:tracking-[-1.13px]`}
                >
                  {content.gainHeading}
                </h2>
              </div>
              <ul className={LIST}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <img
              src={images.gain}
              alt={content.gainImageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover lg:h-[291px] lg:w-[512px] lg:shrink-0 lg:rounded-2xl lg:[object-position:47.5%_50%]"
            />
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <div className="flex flex-col gap-4 lg:order-2 lg:min-w-0 lg:flex-1 lg:justify-center lg:gap-2 lg:self-stretch">
              <h3 className={`${TITLE} lg:leading-[35px] lg:tracking-[-0.0235em]`}>{content.highlightsHeading}</h3>
              <ul className={LIST}>
                {content.highlightItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <img
              src={images.highlights}
              alt={content.highlightsImageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover lg:order-1 lg:h-[263px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl [object-position:24%_50%] lg:[object-position:25%_63%]"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailGainHighlights;
