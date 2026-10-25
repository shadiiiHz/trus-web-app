import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

type AboutContent = NonNullable<ServiceDetailContent["about"]>;
type GainContent = NonNullable<ServiceDetailContent["gain"]>;
type HighlightsContent = NonNullable<ServiceDetailContent["highlights"]>;

interface ServiceDetailAboutProps {
  about: AboutContent;
  gain: GainContent;
  /** Omit for pages without a Highlights block; the About image then sits beside `gain`. */
  highlights?: HighlightsContent;
  /** Purple radial glow behind the section (Figma background). */
  glow?: boolean;
  /** Figma 22px leading, 20px mobile gutters and 40px block gaps (only without `highlights`). */
  tight?: boolean;
  /** Desktop line-height (px) of the description when  is present (default 20). */
  textLeading?: number;
  /** Desktop image sizes in px (defaults 414×212). */
  aboutImageSize?: { width: number; height: number };
  highlightsImageSize?: { width: number; height: number };
}

const DEFAULT_IMAGE_SIZE = { width: 414, height: 212 };

function BulletList({ items, tight }: { items: readonly string[]; tight?: boolean }) {
  return (
    <ul
      className={`list-disc pl-6 font-body text-[16px] text-white lg:pl-5 lg:leading-[22px] ${tight ? "leading-[22px]" : "leading-5"}`}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Glow({ wide, tight }: { wide?: boolean; tight?: boolean }) {
  if (wide) {
    // Figma: a large, faint purple haze that spans the full section width, centred just above the image row.
    // `tight` pages centre it on the dashed guide, ~50px above the row (the end of the paragraph).
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -z-10 left-1/2 hidden w-[1600px] -translate-x-1/2 blur-2xl lg:block ${tight ? "top-[-50px] h-[420px] -translate-y-1/2" : "top-1/2 h-[560px] -translate-y-[58%]"}`}
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.26) 0%, rgba(91, 43, 185, 0.16) 35%, rgba(91, 43, 185, 0.06) 65%, transparent 100%)",
        }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -z-10 -inset-x-40 -inset-y-5 hidden blur-md lg:block"
      style={{
        background:
          "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.4) 0%, rgba(91, 43, 185, 0.22) 40%, rgba(91, 43, 185, 0.08) 75%, transparent 100%)",
      }}
    />
  );
}

export function ServiceDetailAbout({
  about,
  gain,
  highlights,
  glow,
  tight,
  textLeading = 20,
  aboutImageSize = DEFAULT_IMAGE_SIZE,
  highlightsImageSize = DEFAULT_IMAGE_SIZE,
}: ServiceDetailAboutProps) {
  const aboutVars = {
    "--img-w": `${aboutImageSize.width}px`,
    "--img-h": `${aboutImageSize.height}px`,
  } as React.CSSProperties;
  const highlightsVars = {
    "--img-w": `${highlightsImageSize.width}px`,
    "--img-h": `${highlightsImageSize.height}px`,
  } as React.CSSProperties;
  return (
    <section
      aria-labelledby="service-about-heading"
      className={`relative isolate overflow-hidden bg-brand-bg px-10 pb-14 pt-14 text-white lg:px-5 lg:py-20 min-[1104px]:px-0 ${tight ? "max-sm:px-5" : ""}`}
    >
      <div className="relative mx-auto w-full max-w-[790px] lg:max-w-[1064px]">
        <FadeIn direction="up">
          <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">
            {getServiceDetailCommon().aboutEyebrow}
          </p>
          <h2
            id="service-about-heading"
            aria-label={about.heading.replace(/\n/g, " ")}
            className="mt-2 font-hero text-[26px] font-bold leading-[1.1] lg:text-[32px]"
          >
            {about.headingMobile ? (
              <>
                <span aria-hidden className="lg:hidden">
                  {about.headingMobile.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
                <span aria-hidden className="hidden lg:block">
                  {about.heading.split("\n").map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              about.heading
            )}
          </h2>
          <p className={`mt-4 text-justify font-body text-[16px] leading-5 text-white ${highlights ? "lg:leading-(--about-lh)" : tight ? "leading-[22px] lg:leading-[22px]" : "lg:leading-relaxed"}`} style={{ ["--about-lh" as string]: `${textLeading}px` }}>
            {renderRichText(about.description)}
          </p>
        </FadeIn>

        {highlights ? (
          <>
            <FadeIn direction="up" delay={0.1}>
              {/* Fixed 212px slot: the glow is anchored to it, not to the image, so it stays put even without a photo. */}
              <div className="relative mt-5 lg:mt-10 lg:h-(--img-h)" style={aboutVars}>
                {glow && <Glow />}
                {about.image && (
                  <img
                    src={about.image}
                    alt={about.imageAlt}
                    loading="lazy"
                    className="relative h-[160px] w-full rounded-lg object-cover lg:mx-auto lg:h-(--img-h) lg:w-(--img-w) lg:rounded-2xl"
                  />
                )}
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <h3 className="mt-5 font-hero text-[26px] font-bold leading-[1.1] text-white lg:mt-10 lg:text-[28px]">
                {gain.heading}
              </h3>
              <div className="mt-2">
                <BulletList items={gain.items} />
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.1}>
              <div
                className="mt-5 flex flex-col gap-5 lg:mt-10 lg:flex-row lg:items-stretch lg:gap-5"
                style={highlightsVars}
              >
                <img
                  src={highlights.image}
                  alt={highlights.imageAlt}
                  loading="lazy"
                  className="h-[160px] w-full rounded-lg object-cover lg:h-(--img-h) lg:w-(--img-w) lg:shrink-0 lg:rounded-2xl"
                />
                <div className="lg:flex lg:h-(--img-h) lg:flex-col lg:justify-center">
                  <h3 className="font-hero text-[26px] font-bold leading-[1.1] lg:text-[28px]">{highlights.heading}</h3>
                  <div className="mt-2">
                    <BulletList items={highlights.items} />
                  </div>
                </div>
              </div>
            </FadeIn>
          </>
        ) : (
          /* No Highlights block: the About image sits beside "What You Gain" (stacked on mobile). */
          <FadeIn direction="up" delay={0.1}>
            <div
              className={`relative flex flex-col lg:flex-row lg:items-center lg:gap-5 ${tight ? "mt-10 gap-10" : "mt-7 gap-7 lg:mt-12"}`}
              style={aboutVars}
            >
              {glow && <Glow wide tight={tight} />}
              {about.image && (
                <img
                  src={about.image}
                  alt={about.imageAlt}
                  loading="lazy"
                  className={`relative w-full object-cover lg:h-(--img-h) lg:w-(--img-w) lg:shrink-0 lg:aspect-auto ${tight ? "h-[200px] rounded-lg lg:rounded-2xl" : "aspect-[2.1/1] rounded-2xl"}`}
                />
              )}
              <div className="relative">
                <h3
                  className={`font-hero font-bold tracking-[-0.5px] text-white lg:text-[28px] ${tight ? "text-[26px] leading-[22px]" : "text-[24px]"}`}
                >
                  {gain.heading}
                </h3>
                <div className={tight ? "mt-4 lg:mt-3" : "mt-2.5 lg:mt-3"}>
                  <BulletList items={gain.items} tight={tight} />
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

export default ServiceDetailAbout;
