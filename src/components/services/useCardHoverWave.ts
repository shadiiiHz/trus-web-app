import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import {
  FLUTTER_POS_X,
  FLUTTER_POS_Y,
  FLUTTER_ROT_X,
  FLUTTER_ROT_Y,
  FLUTTER_ROT_Z,
  FLUTTER_SKEW_X,
  FLUTTER_SKEW_Y,
  FLUTTER_SPEED,
  HARMONIC_MIX,
  HOVER_EASE_SPEED,
  HOVER_FLUTTER_RATIO,
  HOVER_SCALE_BOOST,
  WIND_SEED,
} from "@/components/templates/templateGridReveal.constants";

const wave = (base: number, harmonic: number, p: number) =>
  Math.sin(base) + HARMONIC_MIX * Math.sin(harmonic + p);

let nextSeedIndex = 0;

/**
 * Same hover reaction the template grid cards get (see
 * useCardRevealAnimation): the card eases up by HOVER_SCALE_BOOST, rides a
 * faint wind-flutter wave and deepens its shadow, then eases back on leave.
 * The rAF loop only runs while the card is hovered or still settling.
 */
export function useCardHoverWave(ref: RefObject<HTMLElement | null>) {
  const seedIndex = useRef(nextSeedIndex++);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seed = WIND_SEED[seedIndex.current % WIND_SEED.length];
    const freq1 = (2.4 + seed * 1.8) * FLUTTER_SPEED;
    const freq2 = (3.7 + seed * 2.3) * FLUTTER_SPEED;
    const freq3 = freq1 * 2.3;
    const freq4 = freq2 * 1.8;
    const phase = seed * Math.PI * 2;

    let hovered = false;
    let hoverAmount = 0;
    let raf: number | null = null;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      hoverAmount = gsap.utils.clamp(
        0,
        1,
        gsap.utils.interpolate(hoverAmount, hovered ? 1 : 0, HOVER_EASE_SPEED),
      );

      if (!hovered && hoverAmount < 0.001) {
        gsap.set(card, { clearProps: "transform,boxShadow,zIndex" });
        raf = null;
        return;
      }

      const amp = hoverAmount * HOVER_FLUTTER_RATIO;

      gsap.set(card, {
        x:
          wave(
            elapsed * freq1 * 1.1 + phase,
            elapsed * freq3 * 0.8 + phase * 1.4,
            0.5,
          ) *
          FLUTTER_POS_X *
          amp,
        y:
          wave(
            elapsed * freq2 * 1.05 + phase * 0.5,
            elapsed * freq4 * 0.75 + phase,
            0.8,
          ) *
          FLUTTER_POS_Y *
          amp,
        scale: 1 + hoverAmount * HOVER_SCALE_BOOST,
        rotation:
          wave(
            elapsed * (freq1 * 0.6) + phase * 0.7,
            elapsed * freq3 * 0.7 + phase,
            0.4,
          ) *
          FLUTTER_ROT_Z *
          amp,
        rotationX:
          wave(
            elapsed * freq2 + phase * 1.3,
            elapsed * freq4 + phase * 0.8,
            1.1,
          ) *
          FLUTTER_ROT_X *
          amp,
        rotationY:
          wave(elapsed * freq1 + phase, elapsed * freq3 + phase * 1.7, 0.6) *
          FLUTTER_ROT_Y *
          amp,
        skewX:
          wave(
            elapsed * freq2 * 0.8 + phase,
            elapsed * freq4 * 0.9 + phase,
            0.9,
          ) *
          FLUTTER_SKEW_X *
          amp,
        skewY:
          wave(
            elapsed * freq1 * 0.9 + phase * 1.6,
            elapsed * freq3 * 0.6 + phase * 1.2,
            0.3,
          ) *
          FLUTTER_SKEW_Y *
          amp,
        transformPerspective: 700,
        transformOrigin: "center center",
        boxShadow: `0 ${hoverAmount * 20}px ${hoverAmount * 30}px rgba(0,0,0,${
          hoverAmount * 0.45
        })`,
        zIndex: 10,
      });

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf === null) raf = requestAnimationFrame(tick);
    };
    const onEnter = () => {
      hovered = true;
      start();
    };
    const onLeave = () => {
      hovered = false;
      start();
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointerleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ref]);
}
