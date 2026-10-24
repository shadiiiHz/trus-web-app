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
  /** Desktop line-height (px) of the description when  is present (default 20). */
  textLeading?: number;
  /** Desktop image sizes in px (defaults 414×212). */
  aboutImageSize?: { width: number; height: number };
  highlightsImageSize?: { width: number; height: number };
}

const DEFAULT_IMAGE_SIZE = { width: 414, height: 212 };

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc pl-6 font-body text-[16px] leading-5 text-white lg:pl-5 lg:leading-[22px]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Glow({ wide }: { wide?: boolean }) {
  if (wide) {
    // Figma: a large, faint purple haze that spans the full section width, centred just above the image row.
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[560px] w-[1600px] -translate-x-1/2 -translate-y-[58%] blur-2xl lg:block"
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
      className="pointer-events-none absolute -inset-x-40 -inset-y-5 hidden blur-md lg:block"
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
      className="relative overflow-hidden bg-brand-bg px-10 pb-14 pt-14 text-white lg:px-5 lg:py-20 min-[1104px]:px-0"
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
          <p className={`mt-4 text-justify font-body text-[16px] leading-5 text-white ${highlights ? "lg:leading-(--about-lh)" : "lg:leading-relaxed"}`} style={{ ["--about-lh" as string]: `${textLeading}px` }}>
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
              className="relative mt-7 flex flex-col gap-7 lg:mt-12 lg:flex-row lg:items-center lg:gap-5"
              style={aboutVars}
            >
              {glow && <Glow wide />}
              {about.image && (
                <img
                  src={about.image}
                  alt={about.imageAlt}
                  loading="lazy"
                  className="relative aspect-[2.1/1] w-full rounded-2xl object-cover lg:h-(--img-h) lg:w-(--img-w) lg:shrink-0 lg:aspect-auto"
                />
              )}
              <div className="relative">
                <h3 className="font-hero text-[24px] font-bold tracking-[-0.5px] text-white lg:text-[28px]">
                  {gain.heading}
                </h3>
                <div className="mt-2.5 lg:mt-3">
                  <BulletList items={gain.items} />
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
