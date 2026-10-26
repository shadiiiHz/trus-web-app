import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailAudience as AudienceContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";

/**
 * Light grey "audience" block: a heading + intro, an image beside a list of target audiences, and a second
 * "publish according to market" block. Rendered only for services whose copy defines `audience`.
 */
export function ServiceDetailAudience({ content, image }: { content: AudienceContent; image: string }) {
  return (
    <section
      aria-labelledby="service-audience-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:gap-5">
            <div className="flex flex-col gap-4 lg:gap-2">
              <h2
                id="service-audience-heading"
                className="font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:font-body lg:text-[32px] lg:leading-[39px] lg:capitalize"
              >
                {content.heading}
              </h2>
              <p className={`text-justify ${BODY}`}>{content.intro}</p>
            </div>

            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
              <img
                src={image}
                alt={content.imageAlt}
                loading="lazy"
                className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[331px] lg:w-[412px] lg:rounded-2xl"
              />
              <div className={`flex flex-col gap-4 text-justify lg:min-w-0 lg:flex-1 lg:gap-0 ${BODY}`}>
                <p className="font-bold">{content.lead}</p>
                <ul className="list-disc pl-6 text-left">
                  {content.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div>
                  {content.text.split("\n").map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2 className="font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize">
              {content.publishHeading}
            </h2>
            <div className={`flex flex-col gap-4 text-justify lg:gap-0 lg:text-[18px] ${BODY}`}>
              <p>{content.publishIntro}</p>
              <p className="font-bold">{content.publishLead}</p>
              <ul className="list-disc pl-6 text-left">
                {content.publishItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{content.publishText}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailAudience;
