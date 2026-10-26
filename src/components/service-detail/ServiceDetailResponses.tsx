import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailResponses as ResponsesContent } from "@/config/serviceDetails.config";

/**
 * Bold lead line. A "\n" in the copy marks the Figma line break on phones: below `sm` the first line is stretched
 * full width and the rest drops below it; from `sm` up the lines simply run together.
 */
function Lead({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <p>
      {lines.map((line, i) => (
        <span
          key={i}
          className={i < lines.length - 1 ? "max-sm:block max-sm:[text-align-last:justify]" : "max-sm:block"}
        >
          {line.split("**").map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-bold">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
          {i < lines.length - 1 && " "}
        </span>
      ))}
    </p>
  );
}

const BODY = "text-justify font-body text-[16px] leading-[22px] text-white";

/**
 * Dark "responses" block: an image beside a heading, intro and comparison list, followed by a
 * "what to decide" list. Rendered only for services whose copy defines `responses`.
 */
export function ServiceDetailResponses({ content, image }: { content: ResponsesContent; image: string }) {
  return (
    <section
      aria-labelledby="service-responses-heading"
      className="bg-brand-bg px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover lg:h-[341px] lg:w-[420px] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:gap-5">
              <h2
                id="service-responses-heading"
                className="font-hero text-[26px] font-bold leading-[1.1] text-white lg:text-[32px] min-[1440px]:w-[745px] min-[1440px]:whitespace-nowrap"
              >
                <span className="lg:hidden">{content.heading}</span>
                <span className="hidden lg:inline">{content.headingDesktop}</span>
              </h2>
              <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
                <p>{content.intro}</p>
                <Lead text={content.lead} />
                <ul className="list-disc pl-6 text-left">
                  {content.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>{content.outro}</p>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
            <Lead text={content.nextLead} />
            <ul className="list-disc pl-6 text-left">
              {content.nextItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="tracking-[-0.05px]">{content.nextOutro}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailResponses;
