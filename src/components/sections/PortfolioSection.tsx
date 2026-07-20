import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { AnimatedPortfolioWord } from "@/components/portfolio/AnimatedPortfolioWord";

// Sparse stars — module-level so they never re-generate on re-render
const PORT_STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.4 + 0.4,
  opacity: Math.random() * 0.2 + 0.04,
}));

// Vertical layout solver
// The sticky panel is exactly 100vh, so BOTH card rows must fit inside the
// viewport at every size. Two paths:
//
//   Desktop  (vh ≥ 825): the original formulas — pixel-identical at 900px+.
//   Compact  (vh < 825): MacBook 13" / tablet / mobile — rows are scaled down
//            just enough that Row 1 + gap + Row 2 fit above the fold. This is
//            what prevents the rows from overlapping on short viewports.
//
// TUNING
//   CARD_H    : ProjectCard height (must match ProjectCard.tsx)
//   MIN_SCALE : smallest allowed card scale on tiny landscape screens
//   gap       : compact row gap — 72px (56px below 720px vh), set inside
const CARD_H = 240;
const MIN_SCALE = 0.68;

function computeLayout(vh: number) {
  // Original desktop formulas (unchanged from the approved desktop design)
  const row1Desktop = Math.min(Math.max(280, vh * 0.34), 420);
  const row2Desktop = Math.max(
    row1Desktop + CARD_H + 64, // ≥64px gap
    Math.min(Math.min(Math.max(640, vh * 0.72), 780), vh - 244), // min(clamp(640,72vh,780), vh-244)
  );

  if (vh >= 825) {
    // Desktop: row 2 bottom (row2 + 240) fits inside vh for all vh ≥ 825
    const gap = row2Desktop - (row1Desktop + CARD_H);
    return {
      row1Top: Math.round(row1Desktop),
      row2Top: Math.round(row2Desktop),
      scale: 1,
      // Word top sits in the row gap; 72px offset = approved desktop position
      wordTop: Math.round(row2Desktop - Math.min(72, gap * 0.7)),
    };
  }

  // Compact: scale rows down so row1 + gap + row2 + bottom margin fit in vh
  const row1Top = vh >= 720 ? 280 : 264; // title block bottom ≈ 240px
  const gap = vh >= 720 ? 72 : 56;
  const margin = 18;
  const scale = Math.min(
    1,
    Math.max(MIN_SCALE, (vh - row1Top - gap - margin) / (CARD_H * 2)),
  );
  const cardH = CARD_H * scale;
  const row2Top = row1Top + cardH + gap;
  return {
    row1Top: Math.round(row1Top),
    row2Top: Math.round(row2Top),
    scale,
    wordTop: Math.round(row2Top - Math.min(72, gap * 0.7)),
  };
}

/** Live viewport height — re-renders on resize so the layout solver re-runs. */
function useViewportHeight() {
  const [vh, setVh] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 900,
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vh;
}

export function PortfolioSection() {
  // Scroll tracking scoped to THIS container
  // progress 0 = container top at viewport top
  // progress 1 = container bottom at viewport bottom
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sectionProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Derived MotionValues

  // Cards horizontal slide (row 1 and row 2 at different rates for parallax depth)
  // Both start off-screen right, slide to off-screen left
  const cardsRow1X = useTransform(
    sectionProgress,
    [0.05, 0.88],
    ["38vw", "-125vw"],
  );
  const cardsRow2X = useTransform(
    sectionProgress,
    [0.1, 0.92],
    ["54vw", "-120vw"],
  );

  // Halo behind PORTFOLIO word — pulses with letter light-up, dims with cards exit
  const haloOpacity = useTransform(
    sectionProgress,
    [0.05, 0.35, 0.55, 0.78],
    [0, 0.6, 0.6, 0],
  );

  // Vertical layout — desktop unchanged, compact path scales rows to fit 100vh
  const vh = useViewportHeight();
  const layout = computeLayout(vh);

  const { projects } = siteConfig.portfolio;
  const row1 = projects.slice(0, 5);
  const row2 = projects.slice(3, 8); // intentional overlap for density

  return (
    <>
      {/* Scroll container */}
      {/* TUNING: Portfolio section height — change the vh value below */}
      <div
        id="portfolio"
        ref={containerRef}
        style={{ height: "500vh", position: "relative" }}
      >
        {/* Sticky viewport panel
             Exactly 100vh — a sticky panel taller than the viewport would have
             its bottom clipped below the fold for the whole scroll, so instead
             the layout solver (computeLayout above) scales the card rows down
             on short viewports until everything fits inside the panel.        */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            background: "#000000",
          }}
        >
          {/* Background layers */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Sparse stars */}
            {PORT_STARS.map((s) => (
              <div
                key={s.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                }}
              />
            ))}

            {/* Right-side ambient purple wash */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse 55% 70% at 85% 60%, rgba(91,43,185,0.14) 0%, transparent 65%)",
              }}
            />

            {/* Bottom halo — glows as PORTFOLIO word lights up */}
            <motion.div
              style={{
                position: "absolute",
                bottom: "-5%",
                left: "5%",
                right: "5%",
                height: "55%",
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 80%, rgba(91,43,185,0.55) 0%, rgba(55,20,130,0.25) 40%, transparent 70%)",
                filter: "blur(38px)",
                opacity: haloOpacity,
              }}
            />

            {/* Dark T watermark — upper-right, same pattern as About section */}
            <div
              className="absolute select-none"
              style={{
                top: "-8%",
                right: "-4%",
                fontSize: "clamp(240px, 30vw, 460px)",
                fontFamily: "var(--font-hero)",
                fontWeight: 700,
                color: "rgba(0,0,0,0.04)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              T
            </div>

            {/* Top edge fade (continuity from About) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "80px",
                background: "linear-gradient(to bottom, #000000, transparent)",
              }}
            />
          </div>

          {/* Top content — z:10 above cards */}
          <div
            className="relative mx-auto w-full max-w-300 px-5"
            style={{ zIndex: 10, paddingTop: "130px" }}
          >
            {/* Row: label + heading + description (left) | See More (right) */}
            <div className="flex items-start justify-between">
              <div className="relative">
                <motion.video
                  src="T_animation_glass_mood.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    position: "absolute",
                    top: -120,
                    left: -285,
                    width: 516,
                    height: 290,
                    maxWidth: "none",
                    filter: "brightness(6) grayscale(1)",
                    zIndex: -1,
                    pointerEvents: "none",
                  }}
                />
                <p
                  className="text-section-label font-normal uppercase tracking-[0.22em]"
                  style={{
                    lineHeight: "20px",
                    color: "#9F7EE1",
                    marginBottom: "0px",
                  }}
                >
                  {siteConfig.portfolio.eyebrow}
                </p>

                <h2
                  className="text-section-title uppercase"
                  style={{
                    lineHeight: "1.1",
                    marginBottom: "5px",
                    color: "#FFFFFF",
                  }}
                >
                  {siteConfig.portfolio.headline}
                </h2>

                {/* Description — two lines as specified */}
                <div
                  className="text-section-subtitle font-normal"
                  style={{ lineHeight: "20px", color: "#BFBFBF" }}
                >
                  {siteConfig.portfolio.description.map((line, i) => (
                    <p key={i} style={{ margin: 1 }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* See More — top-right, aligned ~141px from section top */}
              <a
                href={siteConfig.portfolio.seeMore.href}
                className="font-body font-normal shrink-0"
                style={{
                  fontSize: "16.35px",
                  lineHeight: "25.2px",
                  color: "#9F7EE1",
                  marginTop:
                    "41px" /* 141px from section top − 100px paddingTop = 41px offset */,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {siteConfig.portfolio.seeMore.label}
              </a>
            </div>
          </div>

          {/* PORTFOLIO background word — z:2, behind cards */}
          {/* TUNING: PORTFOLIO word vertical position
                layout.wordTop — anchored to Row 2 so the top edge of the
                letters always shows cleanly in the row gap and the rest tucks
                behind Row 2's cards (z:2 < z:5) at every viewport size.
                Desktop: row2 − 72px (approved position, 576px at 900px vh).
                Compact: row2 − 0.7 × gap (same visible-slice proportion).    */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${layout.wordTop}px`,
              left: 0,
              right: 0,
              paddingLeft: "max(120px, calc((100vw - 1200px) / 2 + 20px))",
              zIndex: 2,
              pointerEvents: "none",
              overflow: "visible",
            }}
          >
            <AnimatedPortfolioWord sectionProgress={sectionProgress} />
          </div>

          {/* Project cards — z:5, above the PORTFOLIO word */}

          {/* Row 1
                TUNING: Row 1 vertical position
                  layout.row1Top (computeLayout above)
                  Desktop: clamp(280px, 34vh, 420px) — unchanged
                  Compact: 280px (264px below 720px vh)
                  Cards scale down on short viewports so both rows fit 100vh  */}
          <div
            style={{
              position: "absolute",
              top: `${layout.row1Top}px`,
              left: 0,
              right: 0,
              zIndex: 5,
              overflow: "visible",
              transform: `scale(${layout.scale})`,
              transformOrigin: "left top",
            }}
          >
            <motion.div
              style={{
                display: "flex",
                gap: "20px",
                x: cardsRow1X,
                width: "max-content",
                paddingLeft: "60px",
              }}
            >
              {row1.map((p) => (
                <ProjectCard
                  key={p.id}
                  name={p.name}
                  category={p.category}
                  accent={p.accent}
                  bg={p.bg}
                />
              ))}
            </motion.div>
          </div>

          {/* Row 2
                TUNING: Row 2 vertical position
                  layout.row2Top (computeLayout above)
                  Desktop: min(clamp(640px,72vh,780px), 100vh-244px) with a
                           64px-gap floor — 648px at 900px vh (unchanged)
                  Compact: row1Top + scaled card height + 72px gap
                           (56px gap below 720px vh)
                  Row 2 bottom is guaranteed ≤ 100vh at every viewport        */}
          <div
            style={{
              position: "absolute",
              top: `${layout.row2Top}px`,
              left: 0,
              right: 0,
              zIndex: 5,
              overflow: "visible",
              transform: `scale(${layout.scale})`,
              transformOrigin: "left top",
            }}
          >
            <motion.div
              style={{
                display: "flex",
                gap: "20px",
                x: cardsRow2X,
                width: "max-content",
                paddingLeft: "60px",
              }}
            >
              {row2.map((p) => (
                <ProjectCard
                  key={p.id}
                  name={p.name}
                  category={p.category}
                  accent={p.accent}
                  bg={p.bg}
                />
              ))}
            </motion.div>
          </div>
        </div>
        {/* end sticky panel */}
      </div>
      {/* end scroll container */}
    </>
  );
}

export default PortfolioSection;
