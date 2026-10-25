import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailPublisher as PublisherContent } from "@/config/serviceDetails.config";
import { renderRichBlocks, renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";
const H3 = "flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-white lg:text-[32px]";

/**
 * Dark "publisher" block: heading + description (with bullet examples), an image beside "What You Gain",
 * and a "Best For" note. Rendered only for services whose copy defines `publisher`.
 */
export function ServiceDetailPublisher({ publisher, image }: { publisher: PublisherContent; image: string }) {
  return (
    <section
      aria-labelledby="service-publisher-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
      style={{ background: "#070606" }}
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-publisher-heading" className={H2}>
              {publisher.heading}
            </h2>
            <div className={`text-justify ${BODY}`}>
              <p className="text-[20px] font-bold leading-[22px] lg:text-[16px]">{publisher.subheading}</p>
              {renderRichBlocks(publisher.body, "list-disc pl-6 text-left")}
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            {/* Faint purple haze spanning the full section width behind the row (desktop only). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[65%] -z-10 hidden h-[240px] w-[2400px] -translate-x-1/2 -translate-y-1/2 blur-[90px] lg:block"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(84, 38, 196, 0.5) 0%, rgba(84, 38, 196, 0.32) 30%, rgba(84, 38, 196, 0.14) 60%, rgba(84, 38, 196, 0.04) 80%, transparent 100%)",
              }}
            />
            <img
              src={image}
              alt={publisher.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[225px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:flex-1">
              <h3 className={H3}>{publisher.gainHeading}</h3>
              <ul className={`list-disc pl-6 ${BODY}`}>
                {publisher.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className={H3}>{publisher.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[19px] text-white">{renderRichText(publisher.bestFor)}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailPublisher;
