import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  const ref = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Top edge stays fixed; the image hinges from there, leaning back into
  // depth and rotating forward to flat as the section scrolls into view —
  // scrubbed continuously with scroll position rather than a one-shot
  // trigger, so it tracks scroll direction and speed directly.
  const { scrollYProgress: imageProgress } = useScroll({
    target: ref,
    offset: ["start 100%", "start -10%"],
  });
  const imageRotateX = useTransform(
    imageProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [-85, 0],
    { clamp: true },
  );
  const imageOpacity = useTransform(
    imageProgress,
    [0, 0.08],
    [0, 1],
    { clamp: true },
  );

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden"
      aria-label="About TruS"
      style={{ background: "#C3C3C3" }}
    >
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
      <div className="relative z-10 mx-auto w-full max-w-300 px-5 py-32 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-14 lg:gap-20">
          {/* LEFT COLUMN — copy */}
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <FadeIn direction="up" delay={0.1}>
                <span
                  className="text-section-label font-normal uppercase tracking-[0.22em]"
                  style={{ color: "var(--color-brand-accent-light)" }}
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
                    style={{ fontSize: "18px", maxWidth: "510px" }}
                  >
                    {para}
                  </p>
                </FadeIn>
              ))}
            </div>

            {/* Stats row — each card cascades in with its own delay */}
            <div className="flex items-start pt-2">
              {(
                data.stats as readonly { value: string; label: string }[]
              ).map((stat, i) => (
                <React.Fragment key={stat.value}>
                  {/* Vertical divider between stats */}
                  {i > 0 && (
                    <div
                      className="shrink-0 self-stretch mx-7"
                      style={{
                        width: "1px",
                      }}
                    />
                  )}
                  <FadeIn
                    direction="up"
                    delay={0.66 + i * 0.15}
                    duration={0.8}
                    scale={0.95}
                    margin="0px 0px -20% 0px"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <StatCounter
                        value={stat.value}
                        className="font-hero font-bold text-[#070606] leading-none"
                        style={{ fontSize: "32px" }}
                      />
                      <span
                        className="font-body text-[#070606] tracking-wider leading-tight"
                        style={{ fontSize: "16px" }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  </FadeIn>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN — image card (488x586), unfolds from flat-on-the-ground to facing the viewer as the section scrolls in */}
          <div className="flex justify-center lg:justify-end">
            <motion.div
              style={{
                width: "min(488px, 100%)",
                aspectRatio: "488 / 586",
                borderRadius: "16px",
                overflow: "hidden",
                background:
                  "linear-gradient(135deg, #1a0440 0%, #2d0878 48%, #0e0222 100%)",
                position: "relative",
                transformPerspective: 900,
                transformOrigin: "50% 0%",
                rotateX: imageRotateX,
                opacity: imageOpacity,
              }}
            >
              {/* Team image — hidden via onError when file is absent */}
              <img
                src={data.image}
                alt="TruS team at work"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
