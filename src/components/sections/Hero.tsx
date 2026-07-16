import { useEffect, useRef, useState } from "react";
import { motion, MotionValue } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { parseHeadline } from "@/utils/text";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import GradientButton from "../ui/GradientButton";
// import { BackgroundStars } from '@/components/hero/BackgroundStars'

export interface HeroSectionProps {
  data?: typeof siteConfig.hero;
  /** Scroll-driven opacity — fades the right visual out as the hero exits. */
  orbitOpacity?: MotionValue<number>;
  /** Fired once the hero video is buffered enough to play through. */
  onVideoReady?: () => void;
}

export function HeroSection({
  data = siteConfig.hero,
  orbitOpacity,
  onVideoReady,
}: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Hero"
    >
      {/* Background */}
      {/* <BackgroundStars /> */}

      {/* Main content grid */}
      <div
        className="relative z-10 mx-auto w-full max-w-300 px-5 flex items-center"
        style={{
          minHeight: "100svh",
          paddingTop: "88px",
          paddingBottom: "80px",
        }}
      >
        <div className="grid w-full grid-cols-1 lg:grid-cols-[65%_80%] items-center gap-4">
          {/* LEFT COLUMN — copy */}
          <div className="flex flex-col gap-6 lg:gap-7">
            <h1 className="flex flex-col gap-1">
              {data.headline.map((line, i) => {
                const segs = parseHeadline(line as string);
                const isLast = i === data.headline.length - 1;
                return (
                  <FadeIn key={line} delay={0.12 + i * 0.16} direction="up">
                    <span
                      className="block font-hero font-normal leading-[1.12] tracking-tight"
                      style={{ fontSize: "clamp(2rem, 2.7vw, 3.1rem)" }}
                    >
                      {segs.map((seg) =>
                        seg.accent ? (
                          <span
                            key={seg.text}
                            className="font-bold"
                            style={{
                              color: "var(--color-brand-accent)",
                              textShadow: "0 0 30px rgba(135,93,217,0.7)",
                            }}
                          >
                            <TypingAccent text={seg.text} />
                          </span>
                        ) : (
                          <span key={seg.text} className="text-brand-white">
                            {seg.text}
                          </span>
                        ),
                      )}
                      {isLast && <CursorBlink />}
                    </span>
                  </FadeIn>
                );
              })}
            </h1>

            <FadeIn delay={0.52} direction="up">
              <p
                className="font-body font-normal color-brand-white leading-relaxed"
                style={{ fontSize: "16px", maxWidth: "440px" }}
              >
                {data.body}
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn
              delay={0.68}
              direction="up"
              className="flex flex-wrap gap-3"
            >
              <Button
                variant="ghost"
                href={data.cta.secondary.href}
                className="h-11"
              >
                {data.cta.secondary.label}
              </Button>
              <GradientButton
                text={data.cta.primary.label}
                href={data.cta.primary.href}
              />
            </FadeIn>
          </div>

          {/* RIGHT COLUMN — video placeholder (hidden on mobile, lg+ only) */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            style={{
              opacity: orbitOpacity,
              x: 20,
              scale: 1.1,
              transformOrigin: "center right",
            }}
          >
            <HeroVideo onReady={onVideoReady} />
          </motion.div>
        </div>
      </div>

      {/* Bottom label */}
      <BottomLabel badge={data.badge} prefix={data.badgePrefix} />
    </section>
  );
}

/**
 * Temporary video placeholder — right-side Hero visual.
 *
 * "Floating in space" technique — three layers:
 *
 * 1. GLOW  — absolute div, bleeds 45 % beyond the video on every side,
 *            completely detached from any box boundary.
 *
 * 2. SIZE  — video is rendered at 130 % of the column width and shifted
 *            left by 15 % so it is centred. The extra 15 % on each side
 *            sits in the fade zone so the active galaxy content is still
 *            ~30 % larger than the old implementation.
 *
 * 3. MASK  — two intersecting linear gradients (one per axis) instead of
 *            a single radial gradient. This gives independent, precise
 *            control over each of the four edges with no ellipse maths:
 *              H: transparent → black 22 % … 78 % → transparent
 *              V: transparent → black 25 % … 75 % → transparent
 *            Combined with mix-blend-mode: screen (dark pixels → transparent)
 *            the edges dissolve completely — no rectangular frame.
 */
function HeroVideo({ onReady }: { onReady?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Signal readiness only once the video is buffered enough to play through,
  // so the loader hands off to a live galaxy rather than a frozen first frame.
  // Guards: a warm-cache check (events may have fired pre-mount), an `error`
  // path so a failed/404 video never blocks the loader, and a `canplay` grace
  // for conservative browsers that delay/skip `canplaythrough`.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onReady) return;

    let settled = false;
    let graceTimer: number | undefined;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(graceTimer);
      onReady();
    };

    // HAVE_ENOUGH_DATA already (e.g. cached on reload / HMR).
    if (video.readyState >= 4) {
      settle();
      return;
    }

    const onCanPlay = () => {
      graceTimer = window.setTimeout(settle, 2500);
    };

    video.addEventListener("canplaythrough", settle);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", settle);
    return () => {
      window.clearTimeout(graceTimer);
      video.removeEventListener("canplaythrough", settle);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", settle);
    };
  }, [onReady]);

  // Horizontal and vertical fade gradients — each fades its respective edges
  const maskH =
    "linear-gradient(to right,  transparent 0%, black 52%, black 78%, transparent 100%)";
  const maskV =
    "linear-gradient(to bottom, transparent 0%, black 15%, black 75%, transparent 100%)";

  return (
    // No maxWidth, no background, no border, no overflow:hidden.
    // overflow:visible (default) lets the video and glow bleed naturally.
    <div
      style={{
        position: "relative",
        width: "100%",
        pointerEvents: "none", // never block left-column clicks
      }}
    >
      {/* Atmospheric glow — intentionally larger than the video */}
      {/* <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          top:        '-28%',
          left:       '-35%',
          right:      '-28%',
          bottom:     '-45%',
          background:
            'radial-gradient(ellipse 55% 55% at 52% 45%,' +
            ' rgba(118,42,240,0.55) 0%,' +
            ' rgba(88,18,198,0.26) 38%,' +
            // ' rgba(55,8,145,0.10) 75%,' +
            ' transparent 70%)',
          filter:     'blur(32px)',
          zIndex:     0,
        }}
      /> */}

      {/* Video — 30 % wider than column, centred, all four edges faded */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "relative",
          zIndex: 1,
          display: "block",
          transform: "translateY(-5px)",
          // 30 % size increase: 130 % width, centred via negative left margin
          width: "190%",
          marginLeft: "-33%",
          height: "auto",
          // Screen blend — makes the video's dark background pixels
          // identical to the page background (effectively transparent)
          mixBlendMode: "screen",
          // Dual-axis mask: H gradient × V gradient = precise 4-edge fade
          WebkitMaskImage: `${maskH}, ${maskV}`,
          WebkitMaskComposite: "destination-in", // WebKit intersection
          maskImage: `${maskH}, ${maskV}`,
          maskComposite: "intersect", // standard
        }}
      >
        <source src="/map world 2k_v5_1.webm" type="video/mp4" />
      </video>
    </div>
  );
}

/** Types `text` out, pauses, deletes it letter by letter, then loops. */
function useTypewriter(text: string) {
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const TYPE_SPEED = 150;
    const DELETE_SPEED = 150;
    const PAUSE_AFTER_TYPE = 1400;
    const PAUSE_AFTER_DELETE = 400;

    let delay = deleting ? DELETE_SPEED : TYPE_SPEED;
    if (!deleting && length === text.length) delay = PAUSE_AFTER_TYPE;
    if (deleting && length === 0) delay = PAUSE_AFTER_DELETE;

    const id = window.setTimeout(() => {
      if (!deleting) {
        if (length < text.length) setLength((l) => l + 1);
        else setDeleting(true);
      } else {
        if (length > 0) setLength((l) => l - 1);
        else setDeleting(false);
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [length, deleting, text]);

  return text.slice(0, length);
}

function TypingAccent({ text }: { text: string }) {
  const display = useTypewriter(text);
  return <>{display}</>;
}

function CursorBlink() {
  return (
    <motion.span
      className="inline-block align-middle rounded-xs ml-1"
      style={{
        width: "3px",
        height: "0.82em",
        background: "var(--color-brand-accent)",
        boxShadow: "0 0 8px var(--color-brand-accent)",
      }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 1,
        repeat: Infinity,
        times: [0, 0.45, 0.5, 0.95],
        ease: "linear",
      }}
      aria-hidden="true"
    />
  );
}

function BottomLabel({ badge, prefix }: { badge: string; prefix: string }) {
  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
      <FadeIn delay={1.1} direction="up">
        <div className="flex items-center gap-3">
          <span
            className="font-body font-medium text-white tracking-[0.22em] uppercase"
            style={{ fontSize: "14px" }}
          >
            {prefix}
          </span>

          {/* Glowing dot */}
          <span
            className="relative flex items-center justify-center"
            style={{ width: "14px", height: "14px" }}
          >
            <span
              className="absolute rounded-full"
              style={{
                inset: "-4px",
                background:
                  "radial-gradient(circle, rgba(255,60,60,0.55) 0%, transparent 70%)",
                filter: "blur(3px)",
              }}
            />
            <span
              className="relative rounded-full"
              style={{
                width: "9px",
                height: "9px",
                background: "#ff3333",
                boxShadow:
                  "0 0 8px rgba(255,60,60,0.9), 0 0 16px rgba(255,60,60,0.5)",
              }}
            />
          </span>

          <span
            className="font-body font-medium text-white tracking-[0.22em] uppercase"
            style={{ fontSize: "14px" }}
          >
            {badge}
          </span>
        </div>
      </FadeIn>
    </div>
  );
}

export default HeroSection;
