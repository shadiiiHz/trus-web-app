import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailBroadcastInsights as BroadcastInsightsContent } from "@/config/serviceDetails.config";

/**
 * Light "smarter broadcasting" block: title, a justified description, a "for example" list, a closing line, then a wide
 * image (a 212px tile on phones). Rendered for services whose copy defines `broadcastInsights`.
 */
export function ServiceDetailBroadcastInsights({ content, image }: { content: BroadcastInsightsContent; image: string }) {
  return (
    <section
      aria-labelledby="service-broadcast-insights-heading"
      className="bg-[#E3E3E3] px-5 py-14 text-[#070606] lg:flex lg:h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-broadcast-insights-heading"
            className="font-hero text-[26px] font-bold leading-[29px] tracking-[-0.0085em] lg:text-[32px] lg:leading-[35px] lg:tracking-[-0.0235em]"
          >
            {content.heading}
          </h2>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 font-body text-[16px] leading-[22px]">
            <p className="text-justify tracking-[-0.003em]">{content.description}</p>
            <div className="flex flex-col gap-2.5">
              <p className="font-bold leading-[22px] lg:font-semibold lg:leading-[19px]">{content.exampleLabel}</p>
              <ul className="list-disc pl-6 text-[15px]">
                {content.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p>{content.closing}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <img
            src={image}
            alt={content.imageAlt}
            loading="lazy"
            className="h-[212px] w-full rounded-lg object-cover [object-position:80%_50%] lg:h-[243px] lg:rounded-2xl lg:[object-position:50%_20%]"
          />
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailBroadcastInsights;
