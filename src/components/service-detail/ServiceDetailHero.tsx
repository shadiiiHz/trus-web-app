import { FadeIn } from "@/components/motion/FadeIn";

/** Per-page differences between Figma heroes (see `figma`). */
export interface FigmaHeroOptions {
  /** Desktop: text block sits bottom-left (80px inset, 24px gap) instead of top-left. */
  bottom?: boolean;
  /** Desktop: CSS `linear-gradient(…)` laid over the photo behind the text. */
  gradient?: string;
  /** Dark hero: black bottom fades and white text (instead of the white fade and dark text). */
  dark?: boolean;
}

const FIGMA_DARK_MOBILE_GRADIENT = "linear-gradient(0deg, rgba(0,0,0,0.898039) 0%, rgba(0,0,0,0) 53.45%)";
const FIGMA_LIGHT_MOBILE_GRADIENT = "linear-gradient(0deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 53.46%)";

const FIGMA_DEFAULT_GRADIENT =
  "linear-gradient(83.42deg, rgba(255,255,255,0.7) 30.19%, rgba(255,255,255,0) 46.7%)";

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
  /**
   * Figma-exact layout: the 1440×822 desktop frame scales proportionally with the viewport (cqw units, so it's
   * pixel-exact at 1440), the 390×613 mobile frame is bottom-aligned with 40/20 padding. Overrides the text/fade props.
   */
  figma?: boolean | FigmaHeroOptions;
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
  figma = false,
}: ServiceDetailHeroProps) {
  if (figma) {
    const opts: FigmaHeroOptions = figma === true ? {} : figma;
    const textColor = opts.dark ? "text-white" : "text-[#070606]";
    return (
      <section
        className={`relative isolate overflow-hidden [container-type:inline-size] ${
          opts.dark
            ? "bg-[#070606] max-lg:aspect-[390/613] max-lg:[background-image:var(--hero-fade-mobile),var(--hero-photo)] max-lg:[background-position:0_0,var(--hero-img-x)_center] max-lg:[background-repeat:no-repeat] max-lg:[background-size:100%_100%,cover]"
            : "bg-white"
        }`}
        style={
          opts.dark
            ? {
                ["--hero-fade-mobile" as string]: FIGMA_DARK_MOBILE_GRADIENT,
                ["--hero-photo" as string]: `url(${image})`,
                ["--hero-img-x" as string]: mobileImageX,
              }
            : undefined
        }
      >
        <img
          src={image}
          alt=""
          fetchPriority="high"
          style={{ ["--hero-img-x" as string]: mobileImageX }}
          className={`block aspect-[390/613] w-full object-cover [object-position:var(--hero-img-x)_center] lg:aspect-[1440/822] lg:object-center ${opts.dark ? "max-lg:hidden" : ""}`}
        />
        <div
          aria-hidden="true"
          style={{
            ["--hero-fade" as string]: opts.gradient ?? FIGMA_DEFAULT_GRADIENT,
            ["--hero-fade-mobile" as string]: opts.dark ? FIGMA_DARK_MOBILE_GRADIENT : FIGMA_LIGHT_MOBILE_GRADIENT,
          }}
          className={`pointer-events-none absolute inset-x-0 -bottom-px top-0 bg-(image:--hero-fade-mobile) lg:bg-(image:--hero-fade) ${opts.dark ? "max-lg:hidden" : ""}`}
        />

        <div
          className={`absolute inset-0 flex flex-col items-start justify-end gap-4 px-5 py-10 lg:px-[5.5556cqw] ${
            opts.bottom
              ? "lg:gap-[1.6667cqw] lg:py-[5.5556cqw]"
              : "lg:justify-start lg:gap-[1.1111cqw] lg:pb-0 lg:pt-[4.0972cqw]"
          }`}
        >
          <FadeIn direction="up" delay={0.06}>
            <h1
              style={mobileTitleWidth ? { ["--title-w" as string]: `${mobileTitleWidth}px` } : undefined}
              className={`font-hero text-[24px] font-bold leading-[31px] ${textColor} max-lg:max-w-(--title-w) ${opts.bottom ? "lg:w-[46.9444cqw]" : "lg:w-[50.3472cqw]"} lg:text-[4.7222cqw] lg:leading-[5.5556cqw]`}
            >
              {name}
            </h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.16}>
            <p className={`font-body text-[16px] font-medium leading-[19px] ${textColor} lg:text-[2.6389cqw] lg:leading-[3.1944cqw]`}>
              {taglineMobile.map((line) => (
                <span key={line} className="block whitespace-nowrap lg:hidden">
                  {line}
                </span>
              ))}
              {tagline.map((line) => (
                <span key={line} className="hidden whitespace-nowrap lg:block">
                  {line}
                </span>
              ))}
            </p>
          </FadeIn>
        </div>
      </section>
    );
  }

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
