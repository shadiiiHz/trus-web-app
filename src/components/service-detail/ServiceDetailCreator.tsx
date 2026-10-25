import { FadeIn } from "@/components/motion/FadeIn";
import { getServiceDetailCommon, type ServiceDetailCreator as CreatorContent } from "@/config/serviceDetails.config";
import { renderRichBlocks, renderRichText } from "@/components/service-detail/richText";

interface ServiceDetailCreatorProps {
  creator: CreatorContent;
  images: { about: string; gain: string };
}

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px]";

/**
 * Dark "service" block: about text + image, the service description (bullets, examples), an image beside
 * "What you gain", and a "Best for" note. Rendered only for services whose copy defines `creator`.
 */
export function ServiceDetailCreator({ creator, images }: ServiceDetailCreatorProps) {
  const paragraphs = creator.body.split("\n\n");

  return (
    <section aria-labelledby="service-creator-heading" className="relative isolate overflow-hidden bg-brand-bg px-5 py-14 text-white lg:py-20">
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] uppercase leading-[15px] text-[#9F7EE1] lg:text-[14px] lg:leading-[17px]">
                {getServiceDetailCommon().aboutEyebrow}
              </p>
              <h2 id="service-creator-heading" className={H2}>
                {creator.aboutHeading}
              </h2>
            </div>
            <p className={`text-justify ${BODY}`}>{renderRichText(creator.aboutDescription)}</p>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="relative">
            {/* Faint purple haze spanning the full section width, centred on the image (desktop only). */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 hidden h-[320px] w-[2600px] -translate-x-1/2 -translate-y-1/2 blur-3xl lg:block"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(84, 38, 196, 0.4) 0%, rgba(84, 38, 196, 0.26) 30%, rgba(84, 38, 196, 0.1) 60%, rgba(84, 38, 196, 0.03) 80%, transparent 100%)",
              }}
            />
          <img
            src={images.about}
            alt={creator.aboutImageAlt}
            loading="lazy"
            className="mx-auto h-[212px] w-full rounded-lg object-cover lg:w-[420px] lg:rounded-2xl"
          />
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 className={H2}>{creator.heading}</h2>
            <div className={`text-justify ${BODY}`}>
              <p className="font-hero text-[20px] font-bold leading-[22px]">{creator.subheading}</p>
              {paragraphs.map((paragraph, i) => (
                <div key={i} className={i > 0 ? "mt-[22px]" : undefined}>
                  {renderRichBlocks(paragraph, "list-disc pl-5 text-left")}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1} className="max-lg:-mt-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={images.gain}
              alt={creator.gainImageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[318px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:flex-1">
              <h3 className="flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-white lg:text-[32px]">
                {creator.gainHeading}
              </h3>
              <ul className={`list-disc pl-5 ${BODY}`}>
                {creator.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className="flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-white lg:text-[32px]">
              {creator.bestForHeading}
            </h3>
            <p className={`text-justify ${BODY}`}>{renderRichText(creator.bestFor)}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailCreator;
