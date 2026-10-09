import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionValue } from "framer-motion";
import { siteConfig } from "@/config/site.config";
import { parseHeadline } from "@/utils/text";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/FadeIn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import GradientButton from "../ui/GradientButton";
import "@/styles/hero.css";
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
      className="hero-section relative overflow-hidden"
      style={{ minHeight: "100svh" }}
      aria-label="Hero"
    >
      {/* Background */}
      {/* <BackgroundStars /> */}

      {/* Main content grid */}
      <div
        className="hero-container relative z-10 mx-auto w-full max-w-330 px-5 flex items-center"
      >
        <div
          className="hero-grid grid w-full grid-cols-1 lg:grid-cols-[62%_80%] 2xl:grid-cols-[69%_80%] items-center"
        >
          {/* LEFT COLUMN — copy */}
          <div
            className="hero-copy flex flex-col min-w-0"
          >
            <h1 className="flex flex-col gap-1 min-w-0">
              {data.headline.map((line, i) => {
                const segs = parseHeadline(line as string);
                const isLast = i === data.headline.length - 1;
                return (
                  <FadeIn
                    key={line}
                    delay={0.12 + i * 0.16}
                    direction="up"
                    className="min-w-0"
                  >
                    <span
                      className="hero-headline block font-hero font-normal text-[clamp(1.35rem,0.9rem+1.4vw,2.26rem)] leading-[1.12] tracking-tight wrap-break-word"
                      style={{
                        overflowWrap: "break-word",
                        maxWidth: "525px",
                      }}
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
                className="hero-body font-body font-normal color-brand-white leading-relaxed"
                style={{ maxWidth: "525px" }}
              >
                {data.body}
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn
              delay={0.68}
              direction="up"
              className="hero-ctas flex gap-3.5 lg:flex-wrap lg:gap-3"
            >
              <Button
                variant="ghost"
                href={data.cta.secondary.href}
                className="hero-cta h-11"
              >
                {data.cta.secondary.label}
              </Button>
              <GradientButton
                className="hero-cta"
                text={data.cta.primary.label}
                href={data.cta.primary.href}
              />
            </FadeIn>
          </div>

          {/* RIGHT COLUMN — world-map video (below the copy on mobile) */}
          <motion.div
            className="hero-visual flex items-center justify-center"
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
      <BottomLabel prefix={data.badgePrefix} />
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
        className="hero-video"
        style={{
          position: "relative",
          zIndex: 1,
          display: "block",
          transform: "translateY(-5px)",
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

function BottomLabel({ prefix }: { prefix: string }) {
  const titles = siteConfig.services.items.map((item) => item.title);
  const index = useCycleIndex(titles.length);
  // Mobile only (currently disabled, see below):
  // const prev = titles[(index - 1 + titles.length) % titles.length];

  return (
    // Mobile: the rotating services label is commented out — `hidden lg:flex`
    // hides the whole block below lg. To bring it back, change this to
    // `flex` (or `relative lg:absolute flex`) and restore the `prev` line above
    // plus the mobile-only <span> below.
    <div className="hero-bottom-label hidden lg:flex lg:absolute left-0 right-0 justify-center z-20 pointer-events-none">
      <div className="flex flex-col items-start gap-3.5 lg:flex-row lg:items-center lg:gap-3">
        {/* Mobile only: previous title stacked above the active one (disabled on mobile)
        <span
          aria-hidden="true"
          className="lg:hidden hero-ticker-text ml-7"
        >
          {prev}
        </span>
        */}

        <div className="flex items-center gap-2.5 lg:gap-3">
          <span
            className="hidden lg:inline font-body font-medium text-white tracking-[0.22em] uppercase"
            style={{ fontSize: "14px" }}
          >
            {prefix}
          </span>

          {/* Glowing dot — same on mobile and desktop */}
          <span
            className="relative flex items-center justify-center"
            style={{ width: "13.39px", height: "13.39px" }}
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(135,93,217,0.7)",
                boxShadow: "0 0 10px rgba(135,93,217,0.45)",
              }}
            />
            <span
              className="relative rounded-full"
              style={{
                width: "5px",
                height: "5px",
                background: "var(--color-brand-accent)",
                boxShadow: "0 0 8px var(--color-brand-accent)",
              }}
            />
          </span>

          <RotatingServiceTitle titles={titles} index={index} />
        </div>
      </div>
    </div>
  );
}

/** Index that advances through `count` items on a fixed interval. */
function useCycleIndex(count: number, interval = 2200) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => window.clearInterval(id);
  }, [count, interval]);

  return index;
}

/** Cycles through service titles, crossfading/sliding one into the next. */
function RotatingServiceTitle({
  titles,
  index,
}: {
  titles: string[];
  index: number;
}) {
  const shouldReduce = useReducedMotion();

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
        className="hero-rotating invisible col-start-1 row-start-1 font-body font-medium tracking-[0.22em] uppercase whitespace-nowrap"
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
          className="hero-rotating col-start-1 row-start-1 text-left font-body font-medium text-white tracking-[0.22em] uppercase whitespace-nowrap"
          style={{ fontSize: "14px" }}
        >
          {titles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default HeroSection;
