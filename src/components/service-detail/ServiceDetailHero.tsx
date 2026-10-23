import { FadeIn } from "@/components/motion/FadeIn";

interface ServiceDetailHeroProps {
  name: string;
  /** Tagline lines on desktop (and on mobile unless `taglineMobile` is given). */
  tagline: readonly string[];
  /** Mobile line breaks, when they differ from desktop's. */
  taglineMobile?: readonly string[];
  image: string;
  /** Desktop: vertical center of the text block as a % of the hero's height (each Figma hero places it differently). */
  textY?: number;
  /** Mobile: where the text sits over the photo. */
  mobileAlign?: "top" | "bottom";
  /** Mobile: CSS `object-position` x for cropping the photo (the y stays centered). */
  mobileImageX?: string;
  /** Mobile: max width (px) of the title, to force the Figma line break. Omit for full width. */
  mobileTitleWidth?: number;
  /** Desktop: add the left-to-right white fade behind the text. */
  desktopFade?: boolean;
  /** Desktop: let the title block run up to 700px (default 620px) so a long title wraps later. */
  wideTitle?: boolean;
}

export function ServiceDetailHero({
  name,
  tagline,
  taglineMobile = tagline,
  image,
  textY = 50,
  mobileAlign = "bottom",
  mobileImageX = "93%",
  mobileTitleWidth,
  desktopFade = false,
  wideTitle = false,
}: ServiceDetailHeroProps) {
  const atTop = mobileAlign === "top";

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <img
        src={image}
        alt=""
        fetchPriority="high"
        style={{ ["--hero-img-x" as string]: mobileImageX }}
        className="block aspect-[523/826] w-full object-cover [object-position:var(--hero-img-x)_center] lg:aspect-[1440/822] lg:object-center"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 lg:hidden ${
          atTop
            ? "top-0 h-[45%] bg-linear-to-b from-white/90 via-white/70 to-white/0"
            : "bottom-0 h-[45%] bg-linear-to-t from-white/90 to-white/0"
        }`}
      />
      {desktopFade && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-[55%] bg-linear-to-r from-white/70 to-white/0 lg:block"
        />
      )}

      <div
        className={`absolute inset-0 mx-auto flex w-full max-w-330 px-5 lg:items-center lg:pb-0 lg:pt-0 ${
          atTop ? "items-start pt-10" : "items-end pb-11"
        }`}
      >
        <div
          className={`${wideTitle ? "max-w-[700px]" : "max-w-[620px]"} lg:absolute lg:left-5 lg:top-[var(--hero-text-y)] lg:-translate-y-1/2`}
          style={{ ["--hero-text-y" as string]: `${textY}%` }}
        >
          <FadeIn direction="up" delay={0.06}>
            <h1
              style={mobileTitleWidth ? { ["--title-w" as string]: `${mobileTitleWidth}px` } : undefined}
              className="font-hero text-[25px] font-bold leading-[31px] tracking-[-0.02em] text-[#0B0B0F] max-lg:max-w-(--title-w) lg:text-[clamp(48px,5vw,72px)] lg:leading-[1.14]"
            >
              {name}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.16}>
            <p className="mt-4 font-body text-[16px] font-medium leading-[1.35] text-[#0B0B0F] lg:mt-5 lg:text-[clamp(26px,2.5vw,36px)] lg:leading-[1.28]">
              {taglineMobile.map((line) => (
                <span key={line} className="block lg:hidden">
                  {line}
                </span>
              ))}
              {tagline.map((line) => (
                <span key={line} className="hidden lg:block">
                  {line}
                </span>
              ))}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default ServiceDetailHero;
