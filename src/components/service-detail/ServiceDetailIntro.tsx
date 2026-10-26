import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailIntro as IntroContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailIntroProps {
  intro: IntroContent;
  image: string;
}

/**
 * Dark "about the service" block: eyebrow, heading, justified description and a centred image.
 * Rendered right after the hero for services whose copy defines `intro`.
 */
export function ServiceDetailIntro({ intro, image }: ServiceDetailIntroProps) {
  return (
    <section
      aria-labelledby="service-intro-heading"
      className="relative isolate overflow-hidden bg-brand-bg px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">
                {getServiceDetailCommon().aboutEyebrow}
              </p>
              <h2
                id="service-intro-heading"
                className="font-hero text-[26px] font-bold leading-[1.1] lg:text-[32px]"
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
          {/* Desktop: Figma crops the photo zoomed in (175% wide, offset right/up); mobile just covers the frame. */}
          <div className="relative mx-auto h-[212px] w-full overflow-hidden rounded-lg lg:h-[298px] lg:w-[590px] lg:rounded-2xl">
            <img
              src={image}
              alt={intro.imageAlt}
              loading="lazy"
              className="size-full object-cover [object-position:right_center] lg:absolute lg:left-[-72.5%] lg:top-[-7.7%] lg:size-auto lg:w-[175.25%] lg:max-w-none"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailIntro;
