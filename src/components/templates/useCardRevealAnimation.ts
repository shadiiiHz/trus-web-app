import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  CORNER_DIR,
  FLUTTER_POS_X,
  FLUTTER_POS_Y,
  FLUTTER_ROT_X,
  FLUTTER_ROT_Y,
  FLUTTER_ROT_Z,
  FLUTTER_SCALE_WOBBLE,
  FLUTTER_SKEW_X,
  FLUTTER_SKEW_Y,
  FLUTTER_SPEED,
  HARMONIC_MIX,
  HOVER_EASE_SPEED,
  HOVER_SCALE_BOOST,
  MIDDLE_FROM_ABOVE,
  MIDDLE_SIDE,
  POINTER_ENABLE_PROGRESS,
  PROGRESS_SMOOTHING_RATE,
  ROLE_MAP,
  STAGGER_WINDOW,
  TABS_FADE_END,
  TABS_FADE_START,
  UNSETTLE_POWER,
  WIND_SEED,
  easeInOutCubic,
} from "@/components/templates/templateGridReveal.constants";

interface FromVars {
  fromX: number;
  fromY: number;
  fromScale: number;
  fromRotate: number;
}

interface WindProfile {
  freq1: number;
  freq2: number;
  freq3: number;
  freq4: number;
  phase: number;
}

function computeFromVars(i: number, vw: number, vh: number): FromVars {
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
}

// Per-card wind parameters only depend on the card's index, never on time,
// so they're derived once up front rather than recomputed every frame.
function computeWindProfile(i: number): WindProfile {
  const seed = WIND_SEED[i % WIND_SEED.length];
  const freq1 = (2.4 + seed * 1.8) * FLUTTER_SPEED;
  const freq2 = (3.7 + seed * 2.3) * FLUTTER_SPEED;
  // Second, higher-frequency harmonic layered on top of the main wave —
  // this is what keeps the flutter from looking like a single mechanical
  // oscillation and makes it read as "wind".
  const freq3 = freq1 * 2.3;
  const freq4 = freq2 * 1.8;
  const phase = seed * Math.PI * 2;
  return { freq1, freq2, freq3, freq4, phase };
}

const wave = (base: number, harmonic: number, p: number) =>
  Math.sin(base) + HARMONIC_MIX * Math.sin(harmonic + p);

interface UseCardRevealAnimationArgs {
  progress: number;
  cardCount: number;
}

/**
 * Drives the whole card-reveal effect: settling cards in from off-screen,
 * a wind-blown flutter while they're still unsettled, hover reactions, and
 * the tabs/header fade-in — all on a single requestAnimationFrame loop
 * fed by a smoothed copy of `progress` so it never tracks the scrollbar
 * 1:1.
 */
export function useCardRevealAnimation({
  progress,
  cardCount,
}: UseCardRevealAnimationArgs) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerWrapRef = useRef<HTMLDivElement>(null);
  const tabsWrapRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const total = cardRefs.current.length || cardCount;
    const staggerWindow = STAGGER_WINDOW;
    const perCardStagger = total > 1 ? staggerWindow / (total - 1) : 0;

    // Static per-card values, computed once instead of every frame.
    const fromVarsByIndex = Array.from({ length: total }, (_, i) =>
      computeFromVars(i, vw, vh),
    );
    const windProfileByIndex = Array.from({ length: total }, (_, i) =>
      computeWindProfile(i),
    );

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

        const { fromX, fromY, fromScale, fromRotate } = fromVarsByIndex[i];
        const { freq1, freq2, freq3, freq4, phase } = windProfileByIndex[i];

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
        (currentProgress - TABS_FADE_START) / (TABS_FADE_END - TABS_FADE_START),
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
  }, [cardCount]);

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  };

  const setHovered = (i: number | null) => {
    hoveredIndexRef.current = i;
  };

  return {
    sectionRef,
    headerWrapRef,
    tabsWrapRef,
    setCardRef,
    setHovered,
  };
}
