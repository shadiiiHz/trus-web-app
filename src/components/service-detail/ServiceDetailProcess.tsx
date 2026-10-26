import { useId, useState } from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import { renderRichBlocks } from "@/components/service-detail/richText";
import { type ServiceDetailProcess as ProcessContent } from "@/config/serviceDetails.config";

/** Faint divider grid behind the section, per Figma (positions are % of the 1440×900 frame). */
const VERTICAL_LINES = [11.17, 22.28, 33.39, 44.43, 55.54, 66.59, 77.7, 88.81];
const HORIZONTAL_LINES = [18.89, 38.67, 58.44, 78.22];
/** Figma pattern of the localized-growth page: frame is 1440×486 at the top; vertical lines span its upper 54%. */
const FIGMA_VERTICAL_LINES = [11.17, 22.28, 33.39, 44.43, 55.54, 66.59, 77.7, 88.81];
const FIGMA_HORIZONTAL_LINES = [10.2, 20.89, 31.57, 42.26];
const LINE_ALPHA =
  "rgba(255, 255, 255, 0.005) 0%, rgba(255, 255, 255, 0.075) 50%, rgba(255, 255, 255, 0.005) 100%";

function AccordionCard({
  index,
  title,
  body,
  open,
  onToggle,
  justify,
}: {
  index: number;
  title: string;
  body: string;
  open: boolean;
  onToggle: () => void;
  justify?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex h-full flex-col rounded-[16px] ring-1 ring-inset ring-white/30 bg-white p-5">
      <span className="mb-2 font-body text-[14px] font-bold uppercase leading-[17px] text-[#5B2BB9]">
        {String(index + 1).padStart(2, "0")} —
      </span>
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-2.5 text-left font-body text-[20px] font-bold leading-6 text-[#070606]"
        >
          <span className="flex-1">{title}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="size-6 shrink-0"
          >
            <path d={open ? "M17 14L12 9L7 14" : "M7 10L12 15L17 10"} />
          </svg>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className={`pt-2 font-body text-[14px] leading-[22px] text-[#070606] ${justify ? "text-justify" : ""}`}>
            {renderRichBlocks(body, "list-disc pl-5")}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * "How it works" — numbered step cards (2 columns on desktop, 1 on mobile).
 * Rendered only for services whose copy defines `process`.
 */
export function ServiceDetailProcess({
  process,
  accordion,
  figma,
}: {
  process: ProcessContent;
  accordion?: boolean;
  /** Figma-exact spacing, 32px heading, centred description, justified card text and the 486px divider pattern (needs `accordion`). */
  figma?: boolean;
}) {
  const { eyebrow, heading, description, steps } = process;
  // Only one card can be open at a time; the first starts open.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="service-process-heading"
      className={`relative overflow-hidden bg-[#E3E3E3] px-5 py-14 text-[#070606] ${accordion ? "lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20" : "lg:py-[109px]"}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute hidden lg:block ${figma ? "inset-x-0 top-0 h-[486.19px]" : "inset-0"}`}
      >
        {figma &&
          FIGMA_VERTICAL_LINES.map((left) => (
            <span
              key={`fv${left}`}
              className="absolute top-0 h-[54.02%] w-0.5"
              style={{ left: `${left}%`, background: `linear-gradient(180deg, ${LINE_ALPHA})` }}
            />
          ))}
        {figma &&
          FIGMA_HORIZONTAL_LINES.map((top) => (
            <span
              key={`fh${top}`}
              className="absolute inset-x-0 h-px"
              style={{ top: `${top}%`, background: `linear-gradient(90deg, ${LINE_ALPHA})` }}
            />
          ))}
        {!figma && VERTICAL_LINES.map((left) => (
          <span
            key={`v${left}`}
            className="absolute inset-y-0 w-0.5"
            style={{
              left: `${left}%`,
              background: `linear-gradient(180deg, ${LINE_ALPHA})`,
            }}
          />
        ))}
        {!figma && HORIZONTAL_LINES.map((top) => (
          <span
            key={`h${top}`}
            className="absolute inset-x-0 h-0.5"
            style={{
              top: `${top}%`,
              background: `linear-gradient(90deg, ${LINE_ALPHA})`,
            }}
          />
        ))}
      </div>
      <div className="relative mx-auto w-full max-w-[1064px]">
        <FadeIn
          direction="up"
          className="mx-auto flex max-w-[684px] flex-col items-center text-center"
        >
          <p
            className={`text-[12px] uppercase text-[#5B2BB9] lg:text-[14px] lg:leading-[17px] ${accordion ? "leading-[15px]" : "tracking-[0.04em]"}`}
          >
            {eyebrow}
          </p>
          <h2
            id="service-process-heading"
            className={`mt-2 font-hero text-[26px] font-bold leading-[34px] ${accordion && !figma ? "lg:text-[38px] lg:leading-[49px]" : "lg:text-[32px] lg:leading-[42px]"}`}
          >
            {heading}
          </h2>
          <p
            className={`mt-4 w-full font-body text-justify text-[16px] text-black lg:mt-4 lg:text-center lg:leading-6 ${accordion ? "leading-6" : "leading-[22px]"}`}
          >
            {description}
          </p>
        </FadeIn>

        <ol
          className={`grid lg:grid-cols-2 lg:gap-5 ${figma ? "mt-10 gap-2.5 lg:mt-[67px]" : accordion ? "mt-10 gap-2.5" : "mt-10 gap-5 lg:mt-[67px]"}`}
        >
          {steps.map((step, i) => (
            <li key={step.title}>
              <FadeIn direction="up" delay={(i % 2) * 0.08} className="h-full">
                {accordion ? (
                  <AccordionCard
                    index={i}
                    title={step.title}
                    body={step.description}
                    open={openIndex === i}
                    onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
                    justify={figma && step.description.length > 160 && !step.description.includes("\n")}
                  />
                ) : (
                  <div className="flex h-full flex-col rounded-[16px] border border-white/30 bg-white p-5">
                    <span className="font-body text-[14px] font-bold uppercase leading-[17px] text-[#5B2BB9]">
                      {String(i + 1).padStart(2, "0")} —
                    </span>
                    <h3 className="mt-2 font-body text-[18px] font-bold leading-[22px] text-[#070606] lg:text-[20px] lg:leading-6">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-body text-justify text-[14px] leading-5 text-[#070606] lg:text-left lg:leading-[22px]">
                      {step.description}
                    </p>
                  </div>
                )}
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ServiceDetailProcess;
