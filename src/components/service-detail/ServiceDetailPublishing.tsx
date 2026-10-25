import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import { ServiceStackIconGlyph, type ServiceStackIcon } from "@/components/service-detail/socialIcons";
import type { ServiceDetailPublishing as PublishingContent } from "@/config/serviceDetails.config";

/**
 * Dark "multilingual publishing" block: heading + intro, a centred image, an icon list
 * and a closing paragraph. Rendered only for services whose copy defines `publishing`.
 */
export function ServiceDetailPublishing({
  publishing,
  image,
  icons,
}: {
  publishing: PublishingContent;
  image: string;
  /** One glyph per list item. */
  icons?: readonly ServiceStackIcon[];
}) {
  const { heading, subheading, description, imageAlt, listHeading, items, outro } = publishing;

  return (
    <section
      aria-labelledby="service-publishing-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:items-center lg:py-20 min-[1104px]:px-0"
      style={{ background: "#070606" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -z-10 left-1/2 top-[78%] hidden h-[340px] w-[2000px] -translate-x-1/2 -translate-y-1/2 blur-[90px] lg:block"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.3) 0%, rgba(91, 43, 185, 0.18) 35%, rgba(91, 43, 185, 0.07) 65%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-[1064px] flex-col items-center gap-10">
        <FadeIn direction="up" className="w-full">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h2
              id="service-publishing-heading"
              className="font-body text-[26px] font-bold capitalize leading-[31px] lg:flex lg:h-10 lg:items-center lg:text-[38px]"
            >
              {heading}
            </h2>
            <div className="flex flex-col gap-2">
              <p className="font-body text-[16px] font-bold leading-[22px]">{subheading}</p>
              <p className="font-body text-[16px] leading-[22px]">{description}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            className="h-[200px] w-full rounded-lg object-cover lg:h-[212px] lg:w-[414px]"
          />
        </FadeIn>

        <FadeIn direction="up" delay={0.1} className="w-full">
          <div className="flex flex-col gap-4 lg:gap-0.5">
            <h3 className="font-hero text-[28px] font-bold capitalize leading-9 max-lg:flex max-lg:h-[61px] max-lg:items-center tracking-[-0.5px] lg:flex lg:h-10 lg:items-center lg:text-[20px] lg:leading-[22px]">
              {listHeading}:
            </h3>
            <div className="flex flex-col gap-0.5">
              <ul className="flex flex-col gap-0.5">
                {items.map((item, i) => (
                  <li key={item} className="flex items-start gap-0.5 lg:items-center">
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center">
                      <span className="size-1 rounded-full bg-white" />
                    </span>
                    {icons?.[i] && <ServiceStackIconGlyph name={icons[i]} className="size-6 shrink-0" />}
                    <span className="font-body text-[16px] leading-6 max-lg:text-justify">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="font-body text-[16px] font-medium leading-[22px] max-lg:text-justify lg:font-normal">
                {renderRichText(outro)}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailPublishing;
