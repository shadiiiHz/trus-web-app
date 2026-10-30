import { FadeIn } from "@/components/motion/FadeIn";
import { HAZE_STYLE, hazeMask } from "@/components/service-detail/haze";
import { renderRichText } from "@/components/service-detail/richText";
import { getServiceDetailCommon, type ServiceDetailBroadcastAbout as BroadcastAboutContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const GOAL = "font-hero text-[24px] font-bold leading-[31px] text-white";

/** Haze alpha over its 355px box (page y 1440–1795 of the Figma frame): steep top edge, long soft tail down to the section end. */
const HAZE_Y = hazeMask([[0, 0], [0.09, 11.3], [0.41, 23.9], [0.91, 36.6], [1, 45], [0.82, 62], [0.47, 74.6], [0.25, 87.3], [0.1, 100]]);

/** A `""` entry is a spacer line; `**bold**` is supported. */
function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className={`text-justify ${BODY}`}>
      {items.map((text, i) =>
        text ? (
          <p key={i}>{renderRichText(text)}</p>
        ) : (
          <div key={i} aria-hidden="true" className="h-[22px]" />
        ),
      )}
    </div>
  );
}

/**
 * Dark "about the service" block for the YouTube service: eyebrow and title, an intro, an "for example" list, the
 * delivery paragraphs, a "goal + goal" pair (stacked on phones), then an image. Rendered right after the hero for
 * services whose copy defines `broadcastAbout`.
 */
export function ServiceDetailBroadcastAbout({ content, image }: { content: BroadcastAboutContent; image: string }) {
  return (
    <section
      aria-labelledby="service-broadcast-about-heading"
      className="relative isolate bg-[#070606] px-5 py-14 text-white lg:flex lg:h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      {/* Purple haze behind the image, desktop only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[545px] -z-10 hidden h-[355px] bg-[rgba(91,43,185,0.19)] lg:block"
        style={{ maskImage: HAZE_Y, WebkitMaskImage: HAZE_Y, ...HAZE_STYLE }}
      />
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:gap-2">
              <p className="text-[14px] uppercase leading-[17px] text-[#9F7EE1]">{getServiceDetailCommon().aboutEyebrow}</p>
              <h2
                id="service-broadcast-about-heading"
                className="font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[35px] lg:tracking-[-0.0235em]"
              >
                {content.heading}
              </h2>
            </div>
            <Paragraphs items={content.intro} />
            <div className={BODY}>
              <p>{content.exampleLabel}</p>
              <ul className="list-disc pl-6">
                {content.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <Paragraphs items={content.outro} />
            <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-10">
              <div className="flex w-full items-center justify-center rounded-xl bg-white/10 px-5 py-5 lg:flex-1 lg:px-8">
                <span className={GOAL}>{content.goals[0]}</span>
              </div>
              <span aria-hidden="true" className="font-hero text-[28px] font-bold leading-[34px] text-white lg:leading-9">
                +
              </span>
              <div className="flex w-full items-center justify-center rounded-xl bg-white/10 px-5 py-5 lg:flex-1 lg:px-8">
                <span className={GOAL}>{content.goals[1]}</span>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <img
            src={image}
            alt={content.imageAlt}
            loading="lazy"
            className="mx-auto h-[212px] w-full rounded-lg object-cover [object-position:50%_33%] lg:w-[420px] lg:rounded-2xl"
          />
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailBroadcastAbout;
