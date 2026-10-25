import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailLocalization as LocalizationContent } from "@/config/serviceDetails.config";
import { renderRichBlocks } from "@/components/service-detail/richText";

const BODY = "text-justify font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "localization" block: heading, an image beside the text (with a bullet list), then a second heading + text.
 * Rendered only for services whose copy defines `localization`.
 */
export function ServiceDetailLocalization({ localization, image }: { localization: LocalizationContent; image: string }) {
  const { heading, imageAlt, body, publishHeading, publishBody } = localization;

  return (
    <section
      aria-labelledby="service-localization-heading"
      className="relative isolate overflow-hidden px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
      style={{ background: "#070606" }}
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <div className="flex flex-col gap-10 lg:gap-5">
          <FadeIn direction="up">
            <h2
              id="service-localization-heading"
              className="font-body text-[26px] font-bold capitalize leading-[31px] text-white lg:text-[32px] lg:leading-[39px]"
            >
              {heading}
            </h2>
          </FadeIn>

          <FadeIn direction="up" delay={0.1}>
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
              {/* Faint purple haze spanning the full section width behind the row (desktop only). */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[140px] w-[2400px] -translate-x-1/2 -translate-y-1/2 blur-[90px] lg:block"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(84, 38, 196, 0.7) 0%, rgba(84, 38, 196, 0.5) 30%, rgba(84, 38, 196, 0.24) 60%, rgba(84, 38, 196, 0.08) 80%, transparent 100%)",
                }}
              />
              <img
                src={image}
                alt={imageAlt}
                loading="lazy"
                className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[353px] lg:w-[420px] lg:rounded-2xl"
              />
              <div className={`lg:flex-1 ${BODY}`}>{renderRichBlocks(body, "list-disc pl-6 text-left")}</div>
            </div>
          </FadeIn>
        </div>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4 lg:gap-2">
            <h3 className="flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[34px] tracking-[-0.5px] text-white lg:text-[32px] lg:leading-[22px]">
              {publishHeading}
            </h3>
            <div className={`${BODY} lg:leading-[19px]`}>{renderRichBlocks(publishBody)}</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailLocalization;
