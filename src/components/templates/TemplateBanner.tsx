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
    // Drop shadow lives on this outer wrapper — the inner section needs
    // overflow:hidden to clip the corner glows, and that would clip its own
    // box-shadow too if the shadow were declared there instead.
    <div
      className="relative w-full"
      style={{ boxShadow: "0 18px 44px 0 rgba(0,0,0,0.14)" }}
    >
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: BANNER_HEIGHT,
          background:
            "radial-gradient(ellipse 400px 420px at 73% 8%, rgba(159,126,225,0.34), rgba(159,126,225,0) 70%), " +
            "linear-gradient(90deg, rgba(22,22,22,1) 0%, rgba(17,16,41,1) 100%)",
          // 1px inner top border
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.16)",
        }}
      >
        {/* Mirrors the right-side glow onto the top-left corner, smaller */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse 200px 400px at 100% 8%, rgba(159,126,225,0.5), rgba(159,126,225,0) 90%)",
            filter: "blur(70px)",
          }}
        />

        <div className="relative mx-auto flex h-full max-w-300 items-center justify-between gap-8 px-5">
          <div className="min-w-0">
            <h1 className="font-hero text-display-sm md:text-display-md font-bold text-brand-white md:whitespace-nowrap">
              {headline}
            </h1>
            <p className="mt-3 max-w-md font-body text-body text-white/70">
              {subtitle}
            </p>
          </div>

          {/* marginRight = Navbar Login button width (136px, w-34) + the gap-5
              (20px) to its left = 156px — both sit in the same max-w-300/px-5
              container, so this lines the photo's right edge up with the
              language switch's right edge (i.e. just before that gap). */}
          <img
            src={BANNER_GRAPHIC_SRC}
            alt=""
            className="hidden lg:block h-full w-auto max-h-full shrink-0 object-contain"
            style={{ marginRight: 130 }}
          />
        </div>
      </section>
    </div>
  );
}

export default TemplatesBanner;
