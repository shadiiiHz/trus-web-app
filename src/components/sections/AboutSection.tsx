import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { StatCounter } from "@/components/motion/StatCounter";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { parseHeadline } from "@/utils/text";

// Sparse background stars generated once at module level — no re-render churn
const ABOUT_STARS = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.4 + 0.4,
  opacity: Math.random() * 0.22 + 0.04,
}));

export interface AboutSectionProps {
  data?: typeof siteConfig.about;
}

export function AboutSection({ data = siteConfig.about }: AboutSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Split-reveal: the image is cut into a left and right half. The right
  // half wipes in top → bottom, the left half wipes in bottom → top, so
  // the two edges converge in the vertical middle before the wipe keeps
  // going until the whole image is uncovered. Triggered once, purely by
  // the image entering the viewport — it plays on its own and does not
  // track scroll position.
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imageInView = useInView(imageWrapRef, { once: true, amount: 0.4 });
  const playReveal = imageInView || shouldReduceMotion;

  const clipTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 1.1, ease: [0.65, 0, 0.35, 1] as const };

  const rightHalfVariants = {
    hidden: { clipPath: "inset(0% 0% 100% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)" },
  };
  const leftHalfVariants = {
    hidden: { clipPath: "inset(100% 0% 0% 0%)" },
    visible: { clipPath: "inset(0% 0% 0% 0%)" },
  };

  return (
    <section
      id="about"
      ref={containerRef}
      aria-label="About TruS"
      style={{ background: "#E3E3E3" }}
    >
      <div className="overflow-hidden sticky top-0 min-h-screen flex flex-col justify-center">
        {/* Background layer */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Sparse stars */}
          {ABOUT_STARS.map((s) => (
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
  
          {/* Left ambient purple wash */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 55% at 0% 55%, rgba(135,93,217,0.07) 0%, transparent 65%)",
            }}
          />
  
          {/* Top edge fade (visual continuity from Hero) */}
          {/* <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, var(--color-brand-bg), transparent)',
            }}
          /> */}
  
          {/* Shadow T watermark — bottom-right, near-transparent */}
          <div
            className="absolute select-none"
            style={{
              bottom: "-2%",
              right: "-2%",
              fontSize: "clamp(260px, 34vw, 520px)",
              fontFamily: "var(--font-hero)",
              fontWeight: 700,
              color: "rgba(135, 93, 217, 0.025)",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            T
          </div>
        </div>
  
        {/* Main content */}
        <div className="relative z-10 mx-auto w-full max-w-330 px-5 py-32 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_630px] items-center gap-8 lg:gap-10">
            {/* LEFT COLUMN — copy */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-2">
                <FadeIn direction="up" delay={0.1}>
                  <span
                    className="text-section-label font-normal uppercase tracking-[0.22em]"
                    style={{ color: "#5B2BB9" }}
                  >
                    {data.eyebrow}
                  </span>
                </FadeIn>
  
                <FadeIn direction="up" delay={0.22}>
                  <h2 className="flex flex-col gap-0.5 m-0 p-0">
                    {data.headline.map((line) => {
                      const segs = parseHeadline(line as string);
                      return (
                        <span
                          key={line}
                          className="block text-section-title leading-[1.14] tracking-tight text-[#070606]"
                        >
                          {segs.map((seg) =>
                            seg.accent ? (
                              <span
                                key={seg.text}
                                style={{
                                  color: "var(--color-brand-accent)",
                                  textShadow: "0 0 26px rgba(135,93,217,0.65)",
                                }}
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={seg.text}>{seg.text}</span>
                            ),
                          )}
                        </span>
                      );
                    })}
                  </h2>
                </FadeIn>
              </div>
  
              {/* Body paragraphs */}
              <div className="flex flex-col gap-4">
                {(data.body as readonly string[]).map((para, i) => (
                  <FadeIn
                    key={para.slice(0, 20)}
                    direction="up"
                    delay={0.34 + i * 0.1}
                  >
                    <p
                      className="font-body text-[#070606] leading-relaxed m-0"
                      style={{ fontSize: "18px", maxWidth: "586px", textAlign: "justify" }}
                    >
                      {para}
                    </p>
                  </FadeIn>
                ))}
              </div>
  
              {/* Stats grid — four boxed counters, each cascading in with its own delay */}
              <div className="grid grid-cols-2 gap-4">
                {(data.stats as readonly { value: string; label: string }[]).map(
                  (stat) => (
                      <div
                        className="flex flex-col justify-center gap-2"
                        style={{
                          width: "283px",
                          maxWidth: "100%",
                          height: "96.45px",
                          borderRadius: "11.42px",
                          background: "#F5F5F5",
                          padding: "16px 20px",
                        }}
                      >
                        <StatCounter
                          value={stat.value}
                          className="font-hero leading-none"
                          style={{ fontSize: "32px", fontWeight: 700, color: "#141414" }}
                        />
                        <div style={{ borderTop: "1px dotted #DFDFDF" }} />
                        <span
                          className="font-body leading-tight"
                          style={{ fontSize: "12px", fontWeight: 400, color: "#494852" }}
                        >
                          {stat.label}
                        </span>
                      </div>
                  ),
                )}
              </div>
            </div>
  
            {/* RIGHT COLUMN — image card (630x514). Splits into a left and right
                half that wipe in from the bottom and top respectively, meeting
                in the middle. Plays once on its own as soon as the image
                enters the viewport. */}
            <div className="flex justify-center lg:justify-end">
              <div
                ref={imageWrapRef}
                style={{
                  width: "min(630px, 100%)",
                  height: "514px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Left half — wipes in bottom → top */}
                <motion.div
                  initial="hidden"
                  animate={playReveal ? "visible" : "hidden"}
                  variants={leftHalfVariants}
                  transition={clipTransition}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={data.image}
                    alt="TruS team at work"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "200%",
                      maxWidth: "none",
                      height: "100%",
                      objectFit: "fill",
                      display: "block",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.parentElement!.style.display = "none";
                    }}
                  />
                </motion.div>

                {/* Right half — wipes in top → bottom */}
                <motion.div
                  initial="hidden"
                  animate={playReveal ? "visible" : "hidden"}
                  variants={rightHalfVariants}
                  transition={clipTransition}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "50%",
                    height: "100%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={data.image}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "200%",
                      maxWidth: "none",
                      height: "100%",
                      objectFit: "fill",
                      display: "block",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.parentElement!.style.display = "none";
                    }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hold spacer — extra scroll distance the pinned panel above must be
          scrolled through before it releases, keeping the fully unhinged
          image on screen for a beat rather than letting it scroll straight
          past. */}
      <div aria-hidden="true" style={{ height: "100vh" }} />
    </section>
  );
}

export default AboutSection;
