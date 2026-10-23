import { FadeIn } from "@/components/motion/FadeIn";
import { type ServiceDetailProcess as ProcessContent } from "@/config/serviceDetails.config";

/** Faint grid behind the section, per Figma. */
const GRID_STYLE = {
  backgroundColor: "#070606",
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
  backgroundSize: "160px 160px",
} as const;

/**
 * "How it works" — numbered step cards (2 columns on desktop, 1 on mobile).
 * Rendered only for services whose copy defines `process`.
 */
export function ServiceDetailProcess({ process }: { process: ProcessContent }) {
  const { eyebrow, heading, description, steps } = process;

  return (
    <section
      aria-labelledby="service-process-heading"
      className="px-5 py-[60px] text-white lg:py-[120px]"
      style={GRID_STYLE}
    >
      <div className="mx-auto w-full max-w-[1060px]">
        <FadeIn direction="up" className="mx-auto flex max-w-[680px] flex-col items-center text-center">
          <p className="text-[12px] uppercase tracking-[0.04em] text-[#9F7EE1] lg:text-section-label">{eyebrow}</p>
          <h2
            id="service-process-heading"
            className="mt-2 font-hero text-[26px] font-bold leading-[1.2] lg:text-[38px] lg:leading-[1.2]"
          >
            {heading}
          </h2>
          <p className="mt-4 font-body text-[14px] leading-6 text-[#B3B3B3] lg:mt-5 lg:text-[16px]">{description}</p>
        </FadeIn>

        <ol className="mt-8 grid gap-4 lg:mt-[56px] lg:grid-cols-2 lg:gap-5">
          {steps.map((step, i) => (
            <li key={step.title}>
              <FadeIn direction="up" delay={(i % 2) * 0.08}>
                <div className="flex h-full min-h-[130px] flex-col rounded-[16px] border border-white/20 bg-[#070606] p-5 lg:h-[130px]">
                  <span className="font-body text-[14px] font-semibold leading-none text-[#9F7EE1]">
                    {String(i + 1).padStart(2, "0")} —
                  </span>
                  <h3 className="mt-3 font-body text-[20px] font-semibold leading-6 text-white">{step.title}</h3>
                  <p className="mt-2 font-body text-[14px] leading-[17px] text-[#B3B3B3]">{step.description}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ServiceDetailProcess;
