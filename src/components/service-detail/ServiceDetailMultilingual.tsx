import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailMultilingual as MultilingualContent } from "@/config/serviceDetails.config";
import { renderRichBlocks, renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";

/**
 * Light grey text-only block: heading, subheading + intro with a bullet list, per-account examples and a closing note.
 * Rendered only for services whose copy defines `multilingual`.
 */
export function ServiceDetailMultilingual({ multilingual }: { multilingual: MultilingualContent }) {
  const { heading, subheading, intro, exampleIntro, examples, outro } = multilingual;

  return (
    <section
      aria-labelledby="service-multilingual-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-multilingual-heading"
            className="font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]"
          >
            {heading}
          </h2>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-body text-[20px] font-bold leading-6 text-[#070606] lg:text-[26px] lg:leading-5">{subheading}</p>
              <div className={`text-justify ${BODY}`}>{renderRichBlocks(intro, "list-disc pl-6 text-left")}</div>
            </div>

            <div className={BODY}>
              <span className="block">{exampleIntro}</span>
              {examples.map((example) => (
                <span key={example.title} className="block">
                  <strong className="font-bold max-lg:block">
                    {example.title}
                    <span className="max-lg:hidden">:</span>
                  </strong>{" "}
                  <span className="max-lg:block">{example.description}</span>
                </span>
              ))}
            </div>

            <div className={BODY}>{renderRichText(outro)}</div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMultilingual;
