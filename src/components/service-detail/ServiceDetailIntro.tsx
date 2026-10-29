import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailIntro as IntroContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailIntroProps {
  intro: IntroContent;
  image: string;
  /** The Telegram page's Figma: 14/17 eyebrow, 522×360 image with no zoomed crop, purple haze behind it. */
  figma?: boolean;
}

/**
 * Dark "about the service" block: eyebrow, heading, justified description and a centred image.
 * Rendered right after the hero for services whose copy defines `intro`.
 */
export function ServiceDetailIntro({ intro, image, figma = false }: ServiceDetailIntroProps) {
  return (
    <section
      aria-labelledby="service-intro-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className={`flex flex-col ${figma ? "gap-4 lg:gap-2" : "gap-2"}`}>
              <p
                className={`uppercase text-[#9F7EE1] ${
                  figma ? "text-[14px] leading-[17px]" : "text-[12px] leading-[15px] lg:text-[14px] lg:leading-[17px]"
                }`}
              >
                {getServiceDetailCommon().aboutEyebrow}
              </p>
              <h2
                id="service-intro-heading"
                className={`font-hero text-[26px] font-bold lg:text-[32px] ${
                  figma ? "leading-[29px] lg:leading-[1.1]" : "leading-[1.1]"
                }`}
              >
                {intro.heading}
              </h2>
            </div>
            <p className="text-justify font-body text-[16px] leading-[22px] text-white">
              {renderRichText(intro.body)}
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          {figma ? (
            <div className="relative">
              {/* Faint purple haze behind the image (desktop only); the profile is sampled from the Figma frame. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[calc(50%-35px)] -z-10 hidden h-[350px] w-[1300px] -translate-x-1/2 -translate-y-1/2 lg:block"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.32) 0%, rgba(91, 43, 185, 0.15) 50%, rgba(91, 43, 185, 0.065) 70%, rgba(91, 43, 185, 0.02) 90%, transparent 100%)",
                }}
              />
              <img
                src={image}
                alt={intro.imageAlt}
                loading="lazy"
                className="mx-auto h-[212px] w-full rounded-lg object-cover [object-position:50%_58%] lg:h-[360px] lg:w-[522px] lg:[object-position:52%_50%] lg:rounded-2xl"
              />
            </div>
          ) : (
            <div className="relative mx-auto h-[212px] w-full overflow-hidden rounded-lg lg:h-[298px] lg:w-[590px] lg:rounded-2xl">
              {/* Desktop: Figma crops the photo zoomed in (175% wide, offset right/up); mobile just covers the frame. */}
              <img
                src={image}
                alt={intro.imageAlt}
                loading="lazy"
                className="size-full object-cover [object-position:right_center] lg:absolute lg:left-[-72.5%] lg:top-[-7.7%] lg:size-auto lg:w-[175.25%] lg:max-w-none"
              />
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailIntro;
