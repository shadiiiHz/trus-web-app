import { FadeIn } from "@/components/motion/FadeIn";
import { type ServiceDetailMatters as MattersContent } from "@/config/serviceDetails.config";

interface ServiceDetailMattersProps {
  matters: MattersContent;
  image: string;
}

/**
 * Dark "why this matters" block: heading + justified paragraph, then an image beside a highlights list
 * (stacked on mobile). Rendered only for services whose copy defines `matters`.
 */
export function ServiceDetailMatters({ matters, image }: ServiceDetailMattersProps) {
  return (
    <section
      aria-labelledby="service-matters-heading"
      className="relative isolate overflow-hidden bg-brand-bg px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="relative mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h2
              id="service-matters-heading"
              className="font-hero text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-[42px]"
            >
              {matters.heading}
            </h2>
            <p className="text-justify font-body text-[16px] leading-[22px] text-white">{matters.body}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            {/* Faint purple haze spanning the section width, centred on the row (desktop only). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[560px] w-[1600px] -translate-x-1/2 -translate-y-1/2 blur-2xl lg:block"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.26) 0%, rgba(91, 43, 185, 0.16) 35%, rgba(91, 43, 185, 0.06) 65%, transparent 100%)",
              }}
            />
            <img
              src={image}
              alt={matters.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[312px] lg:w-[414px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:h-[312px] lg:flex-1 lg:justify-center">
              <h3 className="flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] text-white lg:text-[32px]">
                {matters.highlightsHeading}
              </h3>
              <ul className="list-disc pl-5 font-body text-[16px] font-medium leading-[22px] text-white">
                {matters.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMatters;
