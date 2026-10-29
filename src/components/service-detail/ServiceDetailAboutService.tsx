import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailAboutService as AboutServiceContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "about the service" block: eyebrow, heading and a justified description, then an image beside a second heading,
 * bold lead and bullet list (stacked on phones), over a faint purple haze. Rendered right after the hero for services
 * whose copy defines `aboutService`.
 */
export function ServiceDetailAboutService({ content, image }: { content: AboutServiceContent; image: string }) {
  return (
    <section
      aria-labelledby="service-about-service-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:gap-2">
              <p className="text-[14px] uppercase leading-[17px] text-[#9F7EE1]">{getServiceDetailCommon().aboutEyebrow}</p>
              <h2
                id="service-about-service-heading"
                className="font-hero text-[26px] font-bold leading-[29px] lg:text-[32px] lg:leading-[1.1]"
              >
                {content.heading}
              </h2>
            </div>
            <p className={`text-justify [&_strong]:font-semibold ${BODY}`}>{renderRichText(content.body)}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            {/* Faint purple haze spanning the full section width behind the image row (desktop only). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[420px] w-[1600px] -translate-x-1/2 -translate-y-1/2 blur-2xl lg:block"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.3) 0%, rgba(91, 43, 185, 0.18) 35%, rgba(91, 43, 185, 0.07) 65%, transparent 100%)",
              }}
            />
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover [object-position:50%_54%] lg:h-[290px] lg:min-w-0 lg:flex-1 lg:basis-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:basis-0 lg:gap-2">
              <h3 className="font-hero text-[26px] font-bold leading-[29px] text-white lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize">
                {content.subHeading}
              </h3>
              <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
                <p className="text-justify">
                  <strong className="font-bold">{content.lead}</strong>
                  <span className="block">{content.text}</span>
                </p>
                <ul className="list-disc pl-6 text-left">
                  {content.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailAboutService;
