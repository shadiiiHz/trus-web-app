import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { ServiceGrowthTree } from "@/components/services/ServiceGrowthTree";

/**
 * Services page hero — eyebrow/heading/subtitle on the left, the animated
 * "Growth AI" circuit-tree diagram on the right. Each branch label is a
 * real in-page anchor (`#node-id`); the sections they'll eventually scroll
 * to don't exist yet, so clicks are inert until those are built.
 *
 * Pinned full-screen, matching the Home page hero (Hero.tsx): the section
 * fills the viewport (100svh) and its content is vertically centered within
 * that space, instead of sizing to its own content height.
 */
export function ServicesHeroSection() {
  const { eyebrow, heading, subtitle } = siteConfig.servicesPage.hero;

  return (
    <section
      aria-label="Services"
      className="relative overflow-hidden flex items-center"
      style={{ background: "#FAFAFB", minHeight: "100svh" }}
    >
      <div className="mx-auto w-full max-w-330 px-5 py-20 lg:pt-28 lg:pb-9">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[350px_1fr] lg:gap-32">
          {/* LEFT — copy. Fixed width (not `fr`) so it hugs the logo's left
              edge and leaves the right column free to run all the way to
              the container's right edge (same edge the Login button sits
              on), rather than splitting the row by a flexible ratio. Wide
              enough (500px) that the subtitle fits on one line at its
              natural width (~463px measured) instead of wrapping. */}
          <div className="flex flex-col gap-4 lg:max-w-[515px]">
            <FadeIn direction="up" delay={0.06}>
              <span
                className="text-section-label font-normal uppercase tracking-[0.22em]"
                style={{ color: "#5D3AE1" }}
              >
                {eyebrow}
              </span>
            </FadeIn>

            <FadeIn direction="up" delay={0.16}>
              <h1 className="font-hero text-[48px] font-bold leading-[1.12] tracking-tight text-[#0B0B0F]">
                {(heading as readonly string[]).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.26}>
              <p className="font-body text-body leading-relaxed text-[#6B6A78] lg:whitespace-nowrap">
                {subtitle}
              </p>
            </FadeIn>
          </div>

          {/* RIGHT — animated circuit-tree diagram. The lg:pr reserves room
              for branch-label pills near the right edge (Lead Finder, Smart
              Newsletter, Content Studio) to spill past the diagram's own
              box without overflowing the page — the diagram itself still
              runs flush to the container's right edge (the Login button's
              edge), only the pill text pokes into this reserved gutter. */}
          <FadeIn direction="none" delay={0.2} scale={0.97} className="min-w-0 lg:pr-5">
            <ServiceGrowthTree />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default ServicesHeroSection;
