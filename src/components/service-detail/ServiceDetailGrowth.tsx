import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailGrowth as GrowthContent } from "@/config/serviceDetails.config";

function BulletList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`list-disc pl-6 font-body text-[16px] leading-[22px] ${className}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "connected growth" block: eyebrow + heading + intro and a list, then an image beside a highlights list.
 * Rendered only for services whose copy defines `growth`.
 */
export function ServiceDetailGrowth({ growth, image }: { growth: GrowthContent; image: string }) {
  const { eyebrow, heading, description, listIntro, listItems, outro, highlightsHeading, highlights, imageAlt } = growth;

  return (
    <section
      aria-labelledby="service-growth-heading"
      className="px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
      style={{ background: "#070606" }}
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">{eyebrow}</p>
          <h2
            id="service-growth-heading"
            className="mt-2 font-hero text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-[42px]"
          >
            {heading}
          </h2>
          <p className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:mt-2 lg:text-left lg:leading-6 lg:tracking-[-0.45px]">
            {description}
          </p>

          <div className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:text-left">
            <p>{listIntro}</p>
            <BulletList items={listItems} className="text-left" />
          </div>
          <p className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:text-left lg:leading-5">{outro}</p>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="h-[160px] w-full rounded-lg object-cover lg:h-[240px] lg:w-[322px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col justify-center gap-4 lg:h-[240px] lg:gap-2">
              <h3 className="font-hero text-[26px] font-bold leading-[22px] lg:text-[28px]">{highlightsHeading}</h3>
              <BulletList items={highlights} className="font-medium lg:leading-6" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailGrowth;
