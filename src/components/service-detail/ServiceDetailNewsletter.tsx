import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailNewsletter as NewsletterContent } from "@/config/serviceDetails.config";

const BODY = "font-body text-[16px] leading-[22px] text-[#070606] text-justify";
const HEADING = "font-hero text-[26px] font-bold leading-[34px] text-[#070606] lg:tracking-[-0.0085em]";

const bold = (line: string) =>
  line.split("**").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  );

/**
 * Paragraphs of a step: a `""` entry is a spacer line, and a `\n` inside one is a line break (the line before it is
 * justified to the full width, as in Figma).
 */
function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <div className={BODY}>
      {items.map((text, i) =>
        text ? (
          <p key={i}>
            {text.split("\n").map((line, j, lines) =>
              j < lines.length - 1 ? (
                <span key={j} className="block [text-align-last:justify]">
                  {bold(line)}{" "}
                </span>
              ) : (
                <span key={j}>{bold(line)}</span>
              ),
            )}
          </p>
        ) : (
          <div key={i} aria-hidden="true" className="h-[22px]" />
        ),
      )}
    </div>
  );
}

/**
 * Light "newsletter services" block: eyebrow and heading, a full-width first service, an image beside a second one
 * (below it on phones) and a third. Rendered right after the about / process block for services whose copy defines
 * `newsletter`.
 */
export function ServiceDetailNewsletter({ content, image }: { content: NewsletterContent; image: string }) {
  return (
    <section
      id="newsletter-services"
      aria-labelledby="service-newsletter-heading"
      className="bg-[#E3E3E3] px-5 py-14 text-[#070606] lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up" className="flex flex-col gap-2">
          <p className="text-[14px] uppercase leading-[17px] text-[#5B2BB9]">{content.eyebrow}</p>
          <h2 id="service-newsletter-heading" className="font-hero text-[26px] font-bold leading-[29px] lg:text-[32px] lg:leading-[35px] lg:tracking-[-0.0238em]">
            {content.heading}
          </h2>
        </FadeIn>

        <FadeIn direction="up" className="flex flex-col gap-2">
          <h3 className={HEADING}>{content.sendCreate.heading}</h3>
          <Paragraphs items={content.sendCreate.paragraphs} />
        </FadeIn>

        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full rounded-lg object-cover lg:h-[260px] lg:w-[420px] lg:shrink-0 lg:rounded-2xl"
            />
            <div className="flex flex-col gap-2 lg:min-w-0 lg:flex-1">
              <h3 className={`${HEADING} max-lg:whitespace-nowrap max-lg:tracking-[-0.04em]`}>{content.create.heading}</h3>
              <Paragraphs items={content.create.paragraphs} />
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" className="flex flex-col gap-2">
          <h3 className={HEADING}>{content.send.heading}</h3>
          <Paragraphs items={content.send.paragraphs} />
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailNewsletter;
