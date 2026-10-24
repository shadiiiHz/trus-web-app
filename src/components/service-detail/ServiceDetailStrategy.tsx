import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichText } from "@/components/service-detail/richText";
import type { ServiceDetailStrategy as StrategyContent } from "@/config/serviceDetails.config";

function BulletList({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 text-justify font-body text-[16px] text-white lg:pl-5 lg:text-left">{children}</ul>;
}

/**
 * Dark "strategy" block: heading + intro, an image beside a list of examples,
 * then a second list below. Rendered only for services whose copy defines `strategy`.
 */
export function ServiceDetailStrategy({ strategy, image }: { strategy: StrategyContent; image: string }) {
  const { heading, intro, exampleHeading, examples, includeHeading, includeItems, imageAlt } = strategy;

  return (
    <section
      aria-labelledby="service-strategy-heading"
      className="relative overflow-hidden px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:items-center lg:py-20"
      style={{ background: "#070606" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[62%] hidden h-[340px] w-[2000px] -translate-x-1/2 -translate-y-1/2 blur-[90px] lg:block"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(91, 43, 185, 0.3) 0%, rgba(91, 43, 185, 0.18) 35%, rgba(91, 43, 185, 0.07) 65%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[1064px] flex flex-col gap-10">
        <FadeIn direction="up">
          <h2
            id="service-strategy-heading"
            className="font-body text-[26px] font-bold leading-[31px] lg:text-[32px] lg:leading-[31px]"
          >
            {heading}
          </h2>
          <p className="mt-4 text-justify font-body text-[16px] leading-[22px] lg:mt-2 lg:text-left">
            {renderRichText(intro)}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-5">
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className="h-[200px] w-full rounded-lg object-cover object-[75%_center] lg:rounded-2xl lg:h-[212px] lg:w-[420px] lg:shrink-0"
            />
            <div className="lg:flex-1">
              <h3 className="font-hero text-[26px] font-bold leading-[22px] tracking-[-0.5px] lg:text-[28px]">
                {exampleHeading}
              </h3>
              <div className="mt-4">
                <BulletList>
                  {examples.map((ex) => (
                    <li key={ex.title} className="leading-[22px] lg:leading-6">
                      <strong className="block font-bold lg:inline">{ex.title}</strong>{" "}
                      <span>
                        {ex.description.split("**").map((part, j) =>
                          j % 2 === 1 ? (
                            <strong key={j} className="font-bold">
                              {part}
                            </strong>
                          ) : (
                            part
                          ),
                        )}
                      </span>
                    </li>
                  ))}
                </BulletList>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <h3 className="font-hero text-[26px] font-bold leading-[22px] tracking-[-0.5px] lg:text-[28px]">
            {includeHeading}
          </h3>
          <div className="mt-4">
            <BulletList>
              {includeItems.map((item) => (
                <li key={item} className="leading-[22px]">
                  {item}
                </li>
              ))}
            </BulletList>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailStrategy;
