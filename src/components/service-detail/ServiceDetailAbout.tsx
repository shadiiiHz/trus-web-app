import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

type AboutContent = NonNullable<ServiceDetailContent["about"]>;
type GainContent = NonNullable<ServiceDetailContent["gain"]>;
type HighlightsContent = NonNullable<ServiceDetailContent["highlights"]>;

interface ServiceDetailAboutProps {
  about: AboutContent;
  gain: GainContent;
  highlights: HighlightsContent;
  /** Purple radial glow behind the section (Figma background). */
  glow?: boolean;
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

export function ServiceDetailAbout({
  about,
  gain,
  highlights,
  glow,
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
      className="relative overflow-hidden bg-brand-bg px-10 pb-[34px] pt-[51px] text-white lg:px-5 lg:py-20"
    >
      <div className="relative mx-auto w-full max-w-[790px] lg:max-w-[1060px]">
        <FadeIn direction="up">
          <p className="text-[12px] uppercase tracking-[0.12em] text-[#9F7EE1] lg:text-section-label">
            {getServiceDetailCommon().aboutEyebrow}
          </p>
          <h2
            id="service-about-heading"
            aria-label={about.heading.replace(/\n/g, " ")}
            className="mt-3 font-hero text-[24px] font-bold leading-[1.1] lg:text-[32px] lg:leading-tight"
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
          <p className="mt-4 text-justify font-body text-[16px] leading-5 text-white lg:leading-relaxed">
            {renderRichText(about.description)}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          {/* Fixed 212px slot: the glow is anchored to it, not to the image, so it stays put even without a photo. */}
          <div className="relative mt-5 lg:mt-8 lg:h-(--img-h)" style={aboutVars}>
            {glow && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-40 -inset-y-5 hidden blur-md lg:block"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.4) 0%, rgba(91, 43, 185, 0.22) 40%, rgba(91, 43, 185, 0.08) 75%, transparent 100%)",
                }}
              />
            )}
            {about.image && (
              <img
                src={about.image}
                alt={about.imageAlt}
                loading="lazy"
                className="relative aspect-[2.1/1] w-full rounded-2xl object-cover lg:mx-auto lg:h-(--img-h) lg:w-(--img-w) lg:aspect-auto"
              />
            )}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <h3 className="mt-5 font-body text-[24px] font-bold text-white lg:mt-8 lg:text-[28px]">
            {gain.heading}
          </h3>
          <div className="mt-2.5 lg:mt-3">
            <BulletList items={gain.items} />
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div
            className="mt-7 flex flex-col gap-7 lg:mt-10 lg:flex-row lg:items-stretch lg:gap-5"
            style={highlightsVars}
          >
            <img
              src={highlights.image}
              alt={highlights.imageAlt}
              loading="lazy"
              className="aspect-[2.1/1] w-full rounded-2xl object-cover lg:min-h-(--img-h) lg:w-(--img-w) lg:shrink-0 lg:self-stretch lg:aspect-auto"
            />
            <div className="lg:self-center">
              <h3 className="font-body text-[24px] font-bold lg:text-[28px]">{highlights.heading}</h3>
              <div className="mt-2 lg:mt-3">
                <BulletList items={highlights.items} />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailAbout;
