import { motion, MotionValue, useTransform } from "framer-motion";

export interface WhyUsCardProps {
  number: string;
  label: string;
  title: string;
  bullets: string[];
  /**
   * Scroll-driven pulse value (0 → 1 → 0).
   * Produced by the parent via a 3-stop useTransform on sectionProgress.
   * 0 = fully inactive, 1 = peak activation.
   */
  borderProgress: MotionValue<number>;
  /** Fill the parent's width instead of the fixed 320 px (mobile stack). */
  fluid?: boolean;
}

/**
 * Why Us card — 320 px wide, auto height (min 340 px), #0D0D0D background.
 *
 * Border states:
 *   Inactive : thin static rgba(255,255,255,0.20) perimeter
 *   Active   : linear-gradient #FFFFFF → #5B2BB9 border wrapper + rotating
 *              conic-gradient sweep that completes one full pass over the
 *              rise-and-fall of borderProgress.
 *
 * All motion values are derived directly from the parent's MotionValue —
 * no springs, no state, no effects.
 */
export function WhyUsCard({
  number,
  label,
  title,
  bullets,
  borderProgress,
  fluid = false,
}: WhyUsCardProps) {
  // Derived motion values
  // Active gradient border — fades in/out linearly with the pulse
  const borderOpacity = useTransform(borderProgress, [0, 1], [0, 1]);

  // Outer glow halo — slightly softer rise so the border is always more prominent
  const glowOpacity = useTransform(borderProgress, [0, 1], [0, 0.55]);

  // Sweep arc — one full rotation over the 0→1 rise, reverses on 1→0 fall
  // This creates a "scan in / scan out" cadence that matches the T movement
  const sweepRotate = useTransform(borderProgress, [0, 1], [0, 360]);
  const sweepOpacity = useTransform(
    borderProgress,
    [0, 0.12, 0.88, 1],
    [0, 1, 1, 0],
  );

  return (
    <div
      style={{
        position: "relative",
        width: fluid ? "100%" : "320px",
        flexShrink: 0,
      }}
    >
      {/* Outer ambient glow halo */}
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-14px",
          borderRadius: "30px",
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(135,93,217,0.50) 0%, transparent 68%)",
          filter: "blur(12px)",
          opacity: glowOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Border + sweep wrapper (overflow:hidden clips sweep to card shape) */}
      <div
        style={{
          position: "relative",
          padding: "1px",
          borderRadius: "17px" /* 16 inner + 1 border */,
          overflow: "hidden",
        }}
      >
        {/* Static inactive border — always visible at ~20 % white */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "17px",
            background: "rgba(255,255,255,0.20)",
            pointerEvents: "none",
          }}
        />

        {/* Active gradient border — fades in over the inactive layer */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(91,43,185,0.95) 100%)",
            opacity: borderOpacity,
            pointerEvents: "none",
          }}
        />

        {/*
          Rotating sweep — a bright conic arc pivoting around the card centre.
          overflow:hidden on the parent clips it to the card rectangle, so only
          the 1 px border gap ever shows the light.
        */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(210,170,255,0.90) 22deg, transparent 44deg, transparent 360deg)",
            rotate: sweepRotate,
            opacity: sweepOpacity,
            pointerEvents: "none",
          }}
        />

        {/* Inner card content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: fluid ? undefined : "257px",
            borderRadius: "16px",
            background: "#0D0D0D",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "9px",
            overflow: "hidden",
          }}
        >
          {/* Subtle top-left light leak — always on, very faint */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "55%",
              height: "45%",
              background:
                "radial-gradient(ellipse at 8% 8%, rgba(185,140,255,0.06) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />

          {/* Card number */}
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: 1.3,
              letterSpacing: "0.01em",
              textTransform: "uppercase",
              color: "#9F7EE1",
            }}
          >
            {number} — {label}
          </span>

          <h3
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "20px",
              lineHeight: 1.25,
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            {title}
          </h3>

          <ul
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: 1.3,
              color: "#BFBFBF",
              margin: 0,
              paddingLeft: "18px",
              listStyle: "disc",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default WhyUsCard;
