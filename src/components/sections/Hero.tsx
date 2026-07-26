import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionValue } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { parseHeadline } from "@/utils/text";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
        className="relative z-10 mx-auto w-full max-w-300 px-5 flex"
        style={{
          minHeight: "100svh",
          paddingTop: "88px",
          paddingBottom: "80px",
        }}
      >
        <div
          className="grid w-full grid-cols-1 lg:grid-cols-[1fr_1.3fr] items-center"
          style={{ gridTemplateRows: "1fr" }}
        >
          {/* LEFT COLUMN — copy */}
          <div className="relative z-20 flex flex-col gap-6 lg:gap-7">
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

          {/* RIGHT COLUMN — video (hidden on mobile, lg+ only). self-stretch
              fills the full row height (overriding the grid's items-center)
              so the video covers its entire half edge-to-edge; overflow-hidden
              still hard-clips it to this half. */}
          <motion.div
            className="relative z-0 hidden lg:flex self-stretch overflow-hidden"
            style={{
              opacity: orbitOpacity,
            }}
          >
            <HeroVideo onReady={onVideoReady} />
          </motion.div>
        </div>
      </div>

      {/* Bottom label */}
      <BottomLabel prefix={data.badgePrefix} />
    </section>
  );
}

/** Right-side Hero visual — fills its entire column edge-to-edge. */
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
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        pointerEvents: "none", // never block left-column clicks
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // The source clip has ~20% black padding above/below the map
          // graphic itself; cover alone still shows that padding since it
          // only crops horizontally here. Scale past cover to crop it out
          // too, so the visible content (not just the box) fills the frame.
          transformOrigin: "50% 48%",
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

function BottomLabel({ prefix }: { prefix: string }) {
  const titles = siteConfig.services.items.map((item) => item.title);

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
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

        <RotatingServiceTitle titles={titles} />
      </div>
    </div>
  );
}

/** Cycles through service titles, crossfading/sliding one into the next. */
function RotatingServiceTitle({
  titles,
  interval = 2200,
}: {
  titles: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (titles.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % titles.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [titles.length, interval]);

  // Reserve width for the longest title so the box never shrinks/grows —
  // that keeps the prefix + dot to its left perfectly still while only
  // this side animates.
  const longestTitle = titles.reduce(
    (longest, title) => (title.length > longest.length ? title : longest),
    "",
  );

  return (
    <span className="relative inline-grid" style={{ height: "1.3em" }}>
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 font-body font-medium tracking-[0.22em] uppercase whitespace-nowrap"
        style={{ fontSize: "14px" }}
      >
        {longestTitle}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={titles[index]}
          initial={shouldReduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduce ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: shouldReduce ? 0 : 0.35, ease: "easeOut" }}
          className="col-start-1 row-start-1 text-left font-body font-medium text-white tracking-[0.22em] uppercase whitespace-nowrap"
          style={{ fontSize: "14px" }}
        >
          {titles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default HeroSection;
