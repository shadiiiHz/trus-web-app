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
      // z-index lifts this wrapper into its own stacking context so its
      // box-shadow (which bleeds past its bottom edge) paints over the
      // Gallery section immediately below — without it, that section's
      // opaque background (later in DOM, same stacking level) paints over
      // the shadow and hides it completely.
      className="relative z-10 w-full"
    >
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: BANNER_HEIGHT,
          background: "#ffffff",
          // 1px inner top border
          boxShadow: "inset 0 1px 0 0 rgba(20,20,32,0.06)",
        }}
      >
        {/* Purple light halos — soft blurred blobs (not a flat gradient
            band), matching the Figma reference: one large one anchored
            top-left, a second behind the template-stack graphic top-right. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            top: -160,
            left: -200,
            width: 560,
            height: 320,
            background:
              "radial-gradient(circle, rgba(159,126,225,0.55) 0%, rgba(159,126,225,0) 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            top: -170,
            right: 0,
            width: 800,
            height: 300,
            background:
              "radial-gradient(circle, rgba(159,126,225,0.45) 0%, rgba(159,126,225,0) 100%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative mx-auto flex h-full max-w-300 items-center justify-between gap-8 px-5">
          <div className="min-w-0">
            <h1 className="font-hero text-display-sm md:text-display-md font-bold text-gallery-text md:whitespace-nowrap">
              {headline}
            </h1>
            <p className="mt-3 max-w-md font-body text-body text-gallery-muted">
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
            className="hidden lg:block h-full w-auto max-h-full shrink-0 object-contain mb-5"
            style={{ marginRight: 130 }}
          />
        </div>
      </section>
    </div>
  );
}

export default TemplatesBanner;
