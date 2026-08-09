import { siteConfig } from "@/config/site.config";

/** Fixed banner height per design spec. */
const BANNER_HEIGHT = 250;

/**
 * Right-side illustration. Drop the exported graphic in at this path
 * (public/templates/banner-graphic.png) — served as-is, no build step needed.
 */
const BANNER_GRAPHIC_SRC = "/templates/Image-template.webp";

/**
 * Full-bleed banner below the Navbar. Height is fixed per design spec — not
 * derived from content — so it stays pixel-identical to Figma regardless of
 * copy length or locale.
 */
export function TemplatesBanner() {
  const { headline, subtitle } = siteConfig.templatesPage.banner;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: BANNER_HEIGHT,
        background:
          "radial-gradient(ellipse 400px 420px at 80% 8%, rgba(159,126,225,0.34), rgba(159,126,225,0) 60%), " +
          "linear-gradient(90deg, rgba(22,22,22,1) 0%, rgba(17,16,41,1) 100%)",
      }}
    >
      {/* Mirrors the right-side glow onto the top-left corner, smaller */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-10 h-60 w-60 rounded-full"
        style={{
          background: "radial-gradient(ellipse 200px 400px at 100% 8%, rgba(159,126,225,0.5), rgba(159,126,225,0) 90%)",
          filter: "blur(70px)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-300 items-center justify-between gap-8 px-5">
        <div className="min-w-0">
          <h1 className="font-hero text-display-sm md:text-display-md font-bold text-brand-white md:whitespace-nowrap">
            {headline}
          </h1>
          <p className="mt-3 max-w-md font-body text-body text-brand-muted">
            {subtitle}
          </p>
        </div>

        <img
          src={BANNER_GRAPHIC_SRC}
          alt=""
          className="hidden lg:block h-full w-auto max-h-full shrink-0 object-contain"
        />
      </div>
    </section>
  );
}

export default TemplatesBanner;
