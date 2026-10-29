import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailPublisherLight as PublisherLightContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606]";
const H2 = "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:text-[32px]";
const H3 =
  "font-hero text-[26px] font-bold leading-[1.1] text-[#070606] lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";
const CHANNEL_H2 = "font-hero text-[26px] font-bold leading-[29px] text-[#070606] lg:text-[32px] lg:leading-[1.1]";
const CHANNEL_H3 =
  "flex min-h-10 items-center font-hero text-[26px] font-bold capitalize leading-[22px] tracking-[-0.5px] text-[#070606] lg:text-[32px]";

/** The Telegram page's Figma: regular tagline under the title, a closing sentence, 420px image on the left, 26/22 headings on phones. */
function ChannelPublisher({ content, image }: { content: PublisherLightContent; image: string }) {
  return (
    <section
      aria-labelledby="service-publisher-light-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <h2 id="service-publisher-light-heading" className={CHANNEL_H2}>
                {content.heading}
              </h2>
              <p className={BODY}>{content.lead}</p>
            </div>
            <div className={`text-justify ${BODY}`}>{renderRichText(content.text)}</div>
            <div className={BODY}>{renderRichText(content.example)}</div>
            {content.closing && <p className={`text-justify ${BODY}`}>{content.closing}</p>}
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:50%_54%] lg:h-[225px] lg:w-[420px] lg:[object-position:50%_52%] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:min-w-0 lg:flex-1">
              <h3 className={CHANNEL_H3}>{content.gainHeading}</h3>
              <ul className={`list-disc pl-6 ${BODY}`}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-2">
            <h3 className={CHANNEL_H3}>{content.bestForHeading}</h3>
            <p className="text-justify font-body text-[16px] leading-[19px] text-[#070606]">
              {renderRichText(content.bestFor)}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/**
 * Light grey "publisher" block: heading, two text blocks (the second with bold labels), an image beside
 * "What You Gain", and a "Best For" note. Rendered only for services whose copy defines `publisherLight`.
 */
export function ServiceDetailPublisherLight({
  content,
  image,
  xStyle = false,
  channelStyle = false,
}: {
  content: PublisherLightContent;
  image: string;
  /** The X page's Figma: 414px image, 24px list indent, **bold** and 16/19 type in "Best For". */
  xStyle?: boolean;
  /** The Telegram page's Figma (see `ChannelPublisher`). */
  channelStyle?: boolean;
}) {
  if (channelStyle) return <ChannelPublisher content={content} image={image} />;
  return (
    <section
      aria-labelledby="service-publisher-light-heading"
      className="bg-[#E3E3E3] px-5 py-14 lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-4">
            <h2 id="service-publisher-light-heading" className={H2}>
              {content.heading}
            </h2>
            <div className={`text-justify ${BODY}`}>
              <p className="font-bold">{content.lead}</p>
              {renderRichText(content.text)}
            </div>
            <div className={`text-justify lg:text-left ${BODY}`}>{renderRichText(content.example)}</div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className={`h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[225px] lg:rounded-2xl ${xStyle ? "[object-position:64%_center] lg:order-last lg:w-[414px] lg:[object-position:51%_center]" : "lg:w-[420px]"}`}
            />
            <div className="flex flex-col gap-4 lg:flex-1 lg:gap-2">
              <h3 className={H3}>{content.gainHeading}</h3>
              <ul className={`list-disc ${xStyle ? "pl-6" : "pl-5"} ${BODY}`}>
                {content.gainItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up">
          <div className={`flex flex-col ${xStyle ? "gap-4 lg:gap-2" : "gap-2"}`}>
            <h3 className={H3}>{content.bestForHeading}</h3>
            <p
              className={`text-justify font-body text-[16px] leading-[22px] text-[#070606] ${xStyle ? "lg:leading-[19px]" : "lg:text-[18px]"}`}
            >
              {xStyle ? renderRichText(content.bestFor) : content.bestFor}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailPublisherLight;
