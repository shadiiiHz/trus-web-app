import { FadeIn } from "@/components/motion/FadeIn";
import { AccordionCard } from "@/components/service-detail/ServiceDetailProcess";
import { renderRichText } from "@/components/service-detail/richText";
import {
  getServiceDetailCommon,
  type ServiceDetailAboutProcess as AboutProcessContent,
  type ServiceDetailProcess as ProcessContent,
} from "@/config/serviceDetails.config";
import { HAZE_STYLE, hazeMask } from "@/components/service-detail/haze";
import { useState } from "react";

const HAZE_Y = hazeMask([[0, 0], [0.18, 3.8], [0.47, 19], [0.76, 26.5], [0.88, 34], [0.97, 42], [1, 50], [0.97, 58], [0.88, 66], [0.76, 73.5], [0.47, 81], [0.18, 96.2], [0, 100]]);

const BODY = "font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "about the service" block (image beside a justified description; the image sits above the text on phones)
 * followed, in the same section, by the "how it works" heading and a single column of closed accordion cards on
 * white. Rendered right after the hero for services whose copy defines `aboutProcess`.
 */
export function ServiceDetailAboutProcess({
  content,
  process,
  image,
  imagePosition,
}: {
  content: AboutProcessContent;
  process: ProcessContent;
  image: string;
  imagePosition?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      aria-labelledby="service-about-process-heading"
      className="relative isolate overflow-hidden bg-[#070606] px-5 py-14 text-white lg:py-20"
    >
      {/* Purple haze behind the "how it works" heading, desktop only: alpha profile sampled from the Figma frame (flat core, soft edges on both axes). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-[495px] -z-10 hidden h-[264px] bg-[rgba(91,43,185,0.19)] lg:block"
        style={{ maskImage: HAZE_Y, WebkitMaskImage: HAZE_Y, ...HAZE_STYLE }}
      />
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10 lg:gap-20">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              style={imagePosition ? { objectPosition: imagePosition } : undefined}
              className="h-[212px] w-full rounded-lg object-cover lg:h-[318px] lg:w-[414px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1">
              <div className="flex flex-col gap-2">
                <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">
                  {getServiceDetailCommon().aboutEyebrow}
                </p>
                <h2
                  id="service-about-process-heading"
                  className="font-hero text-[26px] font-bold leading-[29px] lg:text-[32px] lg:leading-[35px]"
                >
                  {content.heading}
                </h2>
              </div>
              <div className={`text-justify ${BODY}`}>
                {content.paragraphs.map((p, i) =>
                  p.text ? (
                    <p key={i} className={p.justifyLast ? "lg:[text-align-last:justify]" : ""}>
                      {renderRichText(p.text)}
                    </p>
                  ) : (
                    <div key={i} aria-hidden="true" className="h-[22px]" />
                  ),
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-10 lg:gap-[43px]">
          <FadeIn direction="up" className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[14px] uppercase leading-[17px] text-[#9F7EE1]">{process.eyebrow}</p>
              <h2 className="font-hero text-[26px] font-bold leading-[34px] lg:text-[32px] lg:leading-[42px]">
                {process.heading}
              </h2>
            </div>
            <p className="font-body text-justify text-[16px] leading-6 text-white lg:text-left">{process.description}</p>
          </FadeIn>

          <ol className="flex flex-col gap-2.5 lg:gap-5">
            {process.steps.map((step, i) => (
              <li key={step.title}>
                <FadeIn direction="up">
                  <AccordionCard
                    index={i}
                    title={step.title}
                    body={step.description}
                    open={openIndex === i}
                    onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
                    justify
                  />
                </FadeIn>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailAboutProcess;
