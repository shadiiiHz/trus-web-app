import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import CategoryTabs from "@/components/templates/CategoryTabs";
import { siteConfig } from "@/config/site.config";

interface TemplateGridRevealProps {
  progress: number;
}

type CardRole = "corner" | "middle";

// Roles for a 2-row x 3-col (6 card) grid:
//   0(corner) 1(middle) 2(corner)
//   3(corner) 4(middle) 5(corner)
const ROLE_MAP: CardRole[] = [
  "corner", // 0 top-left
  "middle", // 1 top-middle
  "corner", // 2 top-right
  "corner", // 3 bottom-left
  "middle", // 4 bottom-middle
  "corner", // 5 bottom-right
];

const CORNER_DIR: Record<number, { x: 1 | -1; y: 1 | -1 }> = {
  0: { x: -1, y: -1 }, // top-left
  2: { x: 1, y: -1 }, // top-right
  3: { x: -1, y: 1 }, // bottom-left
  5: { x: 1, y: 1 }, // bottom-right
};

// Top-middle (1) drops in from above. Bottom-middle (4) is not listed
// here, so it falls through to the "from below" default in
// getFromVars — which is what we want for a card sitting in the
// bottom row.
const MIDDLE_FROM_ABOVE = new Set<number>([1]);

// No more left/right "middle-row" cards now that the grid is 2 rows
// instead of 3 — every "middle" card comes from directly above/below,
// never from the side. Kept as an empty map (rather than deleting the
// mechanism) in case a future layout reintroduces side-entry cards.
const MIDDLE_SIDE: Record<number, 1 | -1> = {};

// ---------------------------------------------------------------------
// TUNING KNOBS
// ---------------------------------------------------------------------

// Smaller => each card's own transition takes up MORE of `progress`
// (span = 1 - STAGGER_WINDOW), which reads as slower / heavier.
// Bigger  => cards are more spread apart from each other, but each one
// individually settles faster.
const STAGGER_WINDOW = 0.1; // was 0.18 — cards now take ~0.9 of progress to settle

// Softer, more "weighted" curve: slow start, slow finish.
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Flutter (the wind-blown wobble while a card is still settling). Bigger
// amplitude/frequency + a second harmonic layered on top makes it read
// like paper/cloth catching a breeze instead of a mechanical jitter.
const FLUTTER_ROT_Y = 26;
const FLUTTER_ROT_X = 16;
const FLUTTER_ROT_Z = 9;
const FLUTTER_SKEW_X = 7;
const FLUTTER_SKEW_Y = 4.5;
const FLUTTER_POS_X = 20;
const FLUTTER_POS_Y = 13;
const FLUTTER_SCALE_WOBBLE = 0.07; // was 0.03 baked inline below
const FLUTTER_SPEED = 0.6; // was 0.4 — livelier, more visible wind speed
const UNSETTLE_POWER = 1.15; // was 2.2 — flutter stays visible longer as the card settles
// Weight of the second, higher-frequency harmonic relative to the main
// wave (0 = pure single sine, 1 = equally strong second wave).
const HARMONIC_MIX = 0.45;

// Tabs bar: fades in on its own, later and slower schedule than the cards.
// It only starts appearing once the cards are mostly done settling.
const TABS_FADE_START = 0.72; // was 0.55
const TABS_FADE_END = 0.85; // was 0.95

// Hover reaction: how much a card scales up when hovered, and how quickly
// that reaction eases in and out (0-1 per frame, higher = snappier).
const HOVER_SCALE_BOOST = 0.04;
const HOVER_EASE_SPEED = 0.12;

// How the grid fades/scales out and back in when the user switches
// category tabs. Duration is in ms and must match the CSS transition
// duration used on the grid wrapper below.
const CATEGORY_SWITCH_DURATION = 260;

// Safety cap: if a category's images take unusually long to load (slow
// network, huge file), don't leave the grid hidden forever — reveal it
// anyway after this many ms even if preloading hasn't resolved yet.
const PRELOAD_TIMEOUT_MS = 2500;

// How much lag/inertia the incoming `progress` prop gets before driving
// any animation. Lower = heavier/laggier and smoother, higher = snappier
// and closer to a 1:1 scroll response.
const PROGRESS_SMOOTHING_RATE = 8;

const POINTER_ENABLE_PROGRESS = 0.85;

const WIND_SEED = [0.13, 0.71, 0.42, 0.95, 0.24, 0.63, 0.08, 0.86, 0.37];

type Category = keyof typeof siteConfig.templateCategories.templates;

/**
 * Preloads and decodes a list of image URLs so they're actually ready to
 * paint the instant they're swapped into the DOM — not just requested.
 * `img.decode()` resolves only once the browser has fully decoded the
 * image, which is what prevents the old category's cards from lingering
 * on screen while the new ones are still streaming in.
 *
 * Individual failures (broken url, decode error) are swallowed so one bad
 * image can't block the rest of the category from revealing.
 */
function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      const img = new Image();
      img.src = url;
      return img.decode ? img.decode().catch(() => undefined) : Promise.resolve(undefined);
    }),
  );
}

/** Resolves after `ms` milliseconds — used as a safety cap alongside preloading. */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function TemplateGridReveal({
  progress,
}: TemplateGridRevealProps) {
  const { categories, templates, eyebrow, heading } =
    siteConfig.templateCategories;
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const tabsWrapRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<Category>(
    "All" as Category,
  );
  // What's actually rendered in the grid right now. Only updates once the
  // fade-out has finished AND the next category's images are preloaded,
  // so the swap happens while invisible and paints instantly when shown.
  const [displayedCategory, setDisplayedCategory] = useState<Category>(
    "All" as Category,
  );
  const [gridVisible, setGridVisible] = useState(true);
  const isFirstRenderRef = useRef(true);

  const progressRef = useRef(progress);
  // The smoothed value actually driving every animation below. Even if
  // the incoming `progress` prop jumps frame to frame (fast scroll, low
  // frame rate, etc.), this keeps every card's motion continuous and
  // lagged, like it has a bit of inertia.
  const smoothedProgressRef = useRef(progress);
  const rafRef = useRef<number | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  const hoverAmountRef = useRef<number[]>([]);
  const pointerEventsEnabledRef = useRef(false);

  // The cards to actually render, based on `displayedCategory` (not the
  // just-clicked `activeCategory`) so content only changes while hidden.
  const activeTemplates = useMemo(() => {
    return templates[displayedCategory] ?? templates.All ?? [];
  }, [displayedCategory, templates]);

  function handleCategoryChange(category: string) {
    setActiveCategory(category as Category);
  }

  // Preload every category's images up front (in the background) so that,
  // by the time the user actually switches tabs, the images are already in
  // the browser's cache and the per-switch preload below resolves near
  // instantly instead of triggering a fresh download.
  useEffect(() => {
    const allUrls = Object.values(templates)
      .flat()
      .slice(0, 200) // sane upper bound, just in case
      .map((t) => t.image);
    preloadImages(allUrls);
  }, [templates]);

  // Crossfade: hide the grid, wait for the next category's images to be
  // fully decoded (not just requested), swap its content, then reveal it.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      setDisplayedCategory(activeCategory);
      return;
    }

    setGridVisible(false);
    let cancelled = false;

    const hideTimeout = window.setTimeout(() => {
      const nextTemplates = templates[activeCategory] ?? templates.All ?? [];
      const urls = nextTemplates.slice(0, 6).map((t) => t.image);

      // Race the real preload against a safety timeout, so a slow network
      // or a stuck image can never leave the grid hidden indefinitely.
      Promise.race([preloadImages(urls), delay(PRELOAD_TIMEOUT_MS)]).then(
        () => {
          if (cancelled) return;

          setDisplayedCategory(activeCategory);
          // Wait a couple frames so the browser paints the new, already-
          // decoded content before we flip opacity back on — otherwise
          // there's no transition to animate from.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!cancelled) setGridVisible(true);
            });
          });
        },
      );
    }, CATEGORY_SWITCH_DURATION);

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimeout);
    };
  }, [activeCategory, templates]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const total = cardRefs.current.length || activeTemplates.length;
    const staggerWindow = STAGGER_WINDOW;
    const perCardStagger = total > 1 ? staggerWindow / (total - 1) : 0;

    const getFromVars = (i: number) => {
      const role = ROLE_MAP[i];

      if (role === "corner") {
        const dir = CORNER_DIR[i];
        return {
          fromX: dir.x * vw * 0.6,
          fromY: dir.y * vh * 0.6,
          fromScale: 0.55,
          fromRotate: dir.x * dir.y * 8,
        };
      }

      const side = MIDDLE_SIDE[i];
      if (side !== undefined) {
        return {
          fromX: side * vw * 0.6,
          fromY: 0,
          fromScale: 0.7,
          fromRotate: side * 6,
        };
      }

      const fromAbove = MIDDLE_FROM_ABOVE.has(i);
      return {
        fromX: 0,
        fromY: fromAbove ? -vh * 1 : vh * 1,
        fromScale: 0.7,
        fromRotate: 0,
      };
    };

    const startTime = performance.now();
    let lastTime = startTime;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      // Frame-rate independent exponential smoothing of the incoming
      // progress value — gives the whole reveal a bit of weight/inertia
      // instead of tracking the scrollbar 1:1.
      const progressSmoothing = 1 - Math.exp(-PROGRESS_SMOOTHING_RATE * dt);
      smoothedProgressRef.current = gsap.utils.interpolate(
        smoothedProgressRef.current,
        progressRef.current,
        progressSmoothing,
      );

      const currentProgress = smoothedProgressRef.current;
      const elapsed = (now - startTime) / 1000;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const { fromX, fromY, fromScale, fromRotate } = getFromVars(i);

        const cardStart = i * perCardStagger;
        const cardEnd = cardStart + (1 - staggerWindow);
        const span = Math.max(cardEnd - cardStart, 0.0001);
        const local = gsap.utils.clamp(
          0,
          1,
          (currentProgress - cardStart) / span,
        );
        const eased = easeInOutCubic(local);

        const unsettle = 1 - eased;

        const windAmp = Math.pow(unsettle, UNSETTLE_POWER);

        const seed = WIND_SEED[i % WIND_SEED.length];
        const freq1 = (2.4 + seed * 1.8) * FLUTTER_SPEED;
        const freq2 = (3.7 + seed * 2.3) * FLUTTER_SPEED;
        // Second, higher-frequency harmonic layered on top of the main
        // wave — this is what keeps the flutter from looking like a
        // single mechanical oscillation and makes it read as "wind".
        const freq3 = freq1 * 2.3;
        const freq4 = freq2 * 1.8;
        const phase = seed * Math.PI * 2;

        const wave = (base: number, harmonic: number, p: number) =>
          Math.sin(base) + HARMONIC_MIX * Math.sin(harmonic + p);

        const flutterRotY =
          wave(elapsed * freq1 + phase, elapsed * freq3 + phase * 1.7, 0.6) *
          FLUTTER_ROT_Y *
          windAmp;
        const flutterRotX =
          wave(
            elapsed * freq2 + phase * 1.3,
            elapsed * freq4 + phase * 0.8,
            1.1,
          ) *
          FLUTTER_ROT_X *
          windAmp;
        const flutterRotZ =
          wave(
            elapsed * (freq1 * 0.6) + phase * 0.7,
            elapsed * freq3 * 0.7 + phase,
            0.4,
          ) *
          FLUTTER_ROT_Z *
          windAmp;
        const flutterSkewX =
          wave(
            elapsed * freq2 * 0.8 + phase,
            elapsed * freq4 * 0.9 + phase,
            0.9,
          ) *
          FLUTTER_SKEW_X *
          windAmp;
        const flutterSkewY =
          wave(
            elapsed * freq1 * 0.9 + phase * 1.6,
            elapsed * freq3 * 0.6 + phase * 1.2,
            0.3,
          ) *
          FLUTTER_SKEW_Y *
          windAmp;

        const flutterX =
          wave(
            elapsed * freq1 * 1.1 + phase,
            elapsed * freq3 * 0.8 + phase * 1.4,
            0.5,
          ) *
          FLUTTER_POS_X *
          windAmp;
        const flutterY =
          wave(
            elapsed * freq2 * 1.05 + phase * 0.5,
            elapsed * freq4 * 0.75 + phase,
            0.8,
          ) *
          FLUTTER_POS_Y *
          windAmp;

        // Smoothly ease the hover amount toward 1 (hovered) or 0 (not),
        // so the reaction doesn't snap instantly.
        const isHovered = hoveredIndexRef.current === i;
        const prevHoverAmount = hoverAmountRef.current[i] ?? 0;
        const hoverAmount = gsap.utils.clamp(
          0,
          1,
          gsap.utils.interpolate(
            prevHoverAmount,
            isHovered ? 1 : 0,
            HOVER_EASE_SPEED,
          ),
        );
        hoverAmountRef.current[i] = hoverAmount;

        const x = gsap.utils.interpolate(fromX, 0, eased) + flutterX;
        const y = gsap.utils.interpolate(fromY, 0, eased) + flutterY;

        const scale =
          gsap.utils.interpolate(fromScale, 1, eased) *
          (1 +
            Math.sin(elapsed * freq1 + phase) *
              FLUTTER_SCALE_WOBBLE *
              windAmp) *
          (1 + hoverAmount * HOVER_SCALE_BOOST);

        const rotate =
          gsap.utils.interpolate(fromRotate, 0, eased) + flutterRotZ;

        gsap.set(card, {
          x,
          y,
          scale,
          rotation: rotate,
          rotationX: flutterRotX,
          rotationY: flutterRotY,
          skewX: flutterSkewX,
          skewY: flutterSkewY,
          transformPerspective: 700,
          transformOrigin: "center center",
          boxShadow: `0 ${10 + hoverAmount * 20}px ${
            24 + hoverAmount * 30
          }px rgba(0,0,0,${0.25 + hoverAmount * 0.2})`,
          zIndex: isHovered ? 10 : 1,
        });
      });

      // Tabs / heading opacity, driven by the same smoothed progress so
      // everything settles in perfect sync with the cards. Applied
      // directly to the DOM instead of through React state to avoid a
      // re-render every frame.
      const tabsOpacity = gsap.utils.clamp(
        0,
        1,
        (currentProgress - TABS_FADE_START) /
          (TABS_FADE_END - TABS_FADE_START),
      );

      if (headerWrapRef.current) {
        gsap.set(headerWrapRef.current, { opacity: tabsOpacity });
      }
      if (tabsWrapRef.current) {
        gsap.set(tabsWrapRef.current, {
          opacity: tabsOpacity,
          y: (1 - tabsOpacity) * 20,
        });
      }

      // Flip pointer-events on the whole section only when it actually
      // changes, so we're not touching the DOM every frame for nothing.
      // Tied to `tabsOpacity` itself (not a separate progress threshold)
      // so clicking becomes possible exactly when the tabs have finished
      // fading in.
      const shouldEnablePointerEvents = tabsOpacity >= POINTER_ENABLE_PROGRESS;
      if (
        shouldEnablePointerEvents !== pointerEventsEnabledRef.current &&
        sectionRef.current
      ) {
        pointerEventsEnabledRef.current = shouldEnablePointerEvents;
        sectionRef.current.style.pointerEvents = shouldEnablePointerEvents
          ? "auto"
          : "none";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeTemplates]);

  return (
    <div
      ref={sectionRef}
      className="w-full h-full flex flex-col items-center justify-center"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <div
        ref={headerWrapRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: 0,
        }}
      >
        <div>
          <p
            className="text-section-label"
            style={{
              fontWeight: 400,
              lineHeight: "20px",
              color: "#9F7EE1",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              margin: 0,
            }}
          >
            {eyebrow}
          </p>
          <h2
            className="text-section-title"
            style={{
              lineHeight: "67.2px",
              color: "#070606",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "993px",
            height: "1px",
            background: "rgba(112, 112, 117, 0.3)",
            marginTop: "18px",
            marginBottom: "24px",
          }}
          aria-hidden="true"
        />
      </div>
      <div
        ref={tabsWrapRef}
        className="shrink-0 mb-8"
        style={{ opacity: 0, transition: "none" }}
      >
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={handleCategoryChange}
        />
      </div>

      <div
        className="w-full max-w-5xl min-h-0 z-4"
        style={{ perspective: "1200px" }}
      >
        <div
          className="grid grid-cols-3 grid-rows-2 gap-4 w-full"
          style={{
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? "scale(1)" : "scale(0.98)",
            transition: `opacity ${CATEGORY_SWITCH_DURATION}ms ease, transform ${CATEGORY_SWITCH_DURATION}ms ease`,
          }}
        >
          {activeTemplates.slice(0, 6).map((tpl, i) => (
            <div
              key={tpl.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onMouseEnter={() => {
                hoveredIndexRef.current = i;
              }}
              onMouseLeave={() => {
                hoveredIndexRef.current = null;
              }}
              className="group relative overflow-hidden aspect-210/120 rounded-2xl bg-[#111] shadow-xl will-change-transform"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={tpl.image}
                alt={tpl.name}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
