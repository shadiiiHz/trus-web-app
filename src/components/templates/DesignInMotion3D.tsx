import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createCurvedPlaneGeometry, applyCornerTwist } from "./geometry";
import { CameraRig } from "./CameraRig";
import SlideText from "./SlideText";
import TemplateGridReveal from "./TemplateGridReveal";

gsap.registerPlugin(ScrollTrigger);

export interface DesignTemplate {
  id: number;
  image: string;
  title?: string;
}

interface CardProps {
  index: number;
  total: number;
  image: string;
  title?: string;
  cardWidth: number;
  radius: number;
  bulge: number;
  angleStep: number;
  /** Amplitude (world units) of the optional sinusoidal ripple added on
   * top of the ribbon's vertical descent. 0 = perfectly smooth, uniform
   * descent — a straight line traced along the top or bottom edge of
   * every card will read as one continuous curve with no waviness. */
  waveAmplitude: number;
  /** Frequency of that ripple. Has no visible effect while
   * `waveAmplitude` is 0. */
  waveFrequency: number;
  /** Global multiplier on vertical descent speed. Scaling the WHOLE
   * curve by one constant keeps it proportional everywhere (front and
   * back), so this only changes how steep the ribbon looks overall —
   * it can never re-introduce a front/back mismatch. */
  verticalStride: number;
  shiftRef: React.MutableRefObject<number>;
}

function Card({
  index,
  image,
  cardWidth,
  radius,
  bulge,
  angleStep,
  waveAmplitude,
  waveFrequency,
  verticalStride,
  shiftRef,
}: CardProps) {
  const [hovered, setHovered] = useState(false);
  const scaleRef = useRef(1);
  const tiltRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useTexture(image);
  const height = (cardWidth * 7) / 9;
  const angleRad = THREE.MathUtils.degToRad(angleStep);
  const curvature = radius * (1 - Math.cos(angleRad / 2));

  const geo = useMemo(
    () => createCurvedPlaneGeometry(cardWidth, height, 32, 32, curvature),
    [cardWidth, height, curvature],
  );

  useFrame((_, delta) => {
    const group = groupRef.current;
    const mat = materialRef.current;
    if (!group || !mat) return;

    // Clamp delta so a lagged/minimized tab doesn't cause a visible jump
    // when it comes back.
    const dt = Math.min(delta, 1 / 30);

    const offset = index - shiftRef.current;

    // Depth scale: how much a card shrinks the further "back" it rotates.
    // Lower `minScale` = stronger, more dramatic depth falloff.
    const minScale = 0.55;
    const maxScale = 1.0;

    // scale as a function of the ACTUAL displayed angle (rad), not raw index.
    const scaleFromRad = (rad: number) => {
      const frontFactor = Math.cos(rad);
      const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
      const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);
      return THREE.MathUtils.lerp(maxScale, minScale, backAmountSmooth);
    };

    // Self-consistent arc-length warp: du/do = scale(displayed angle at u).
    // Uses the SAME falloff as the visual scale (no separate spacing floor)
    // so the perceived gap between any two neighboring cards stays
    // constant no matter how deep they are — a card that's half the size
    // also sits half the (perceived) distance from its neighbor.
    //
    // THIS is now the ONLY arc-length curve. Previously the vertical (y)
    // axis integrated its OWN separate curve (`integrateVerticalU` /
    // `verticalStepFromRad`) with different front/back target values than
    // this one. Two independently-tuned curves can each look "smooth" on
    // their own and still be mutually INCONSISTENT — the ratio between how
    // fast a card moves sideways (x/z) vs. how fast it drops (y) changed
    // unevenly from card to card. That inconsistency, not either curve on
    // its own, is what read as a "staircase": the back looked fine because
    // `backVerticalStep` happened to equal `minScale` (the same value
    // `scaleFromRad` settles to at the back — matching ratio, by
    // coincidence), but the front used an unrelated constant (0.5) instead
    // of `maxScale` (1.0), breaking that proportionality exactly where
    // cards are biggest and the mismatch is most visible.
    //
    // Fix: reuse this exact curve for BOTH axes (`u` drives x/z as before,
    // and now `y = -u * verticalStride`). Scaling the whole result by one
    // global constant preserves proportionality everywhere, so the back
    // keeps looking exactly as it does today, and the front now follows
    // the identical rule instead of a disconnected one.
    const integrateU = (o: number) => {
      const steps = 36;
      const sign = Math.sign(o) || 1;
      const absO = Math.abs(o);
      const dO = absO / steps;
      let u = 0;
      for (let i = 0; i < steps; i++) {
        const rad = THREE.MathUtils.degToRad(u * angleStep);
        const s = scaleFromRad(rad);
        u += s * dO;
      }
      return sign * u;
    };

    // Extra straight-back push along Z for deeper cards. This is what
    // actually prevents a tilted back card's corner from poking through
    // the card in front of it — since spacing now shrinks in lockstep
    // with scale (to keep the visual gap constant), we can't rely on
    // spacing alone to avoid clipping, so we add real depth separation
    // instead, which doesn't affect the on-screen gap.
    const depthPushStrength = 0.35;

    const getPosition = (o: number) => {
      const u = integrateU(o);
      const angleDeg = u * angleStep;
      const rad = THREE.MathUtils.degToRad(angleDeg);

      const x = Math.sin(rad) * radius;
      const z0 = Math.cos(rad) * radius - radius;
      const frontFactor = Math.cos(rad);
      const bulgeOffset = frontFactor * bulge * 0.4;

      const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
      const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);
      const depthPush = backAmountSmooth * radius * depthPushStrength;

      const zFinal = z0 - bulgeOffset - depthPush;

      // Uniform descent driven by the SAME arc-length parameter `u` used
      // for x/z above (see note on integrateU) — guaranteed proportional
      // front-to-back, so no seam. `verticalStride` just scales the whole
      // thing uniformly (steeper/shallower ribbon overall) without ever
      // reintroducing a mismatch. Plus an OPTIONAL ripple on top; with
      // waveAmplitude at its default of 0 this is just
      // `y = -u * verticalStride`, a perfectly smooth, monotonic curve.
      const y =
        -u * verticalStride + Math.sin(u * waveFrequency) * waveAmplitude;

      return { pos: new THREE.Vector3(x, y, zFinal), rad, u };
    };

    const { pos, rad } = getPosition(offset);

    const eps = 0.12;
    const a = getPosition(offset + eps).pos;
    const b = getPosition(offset - eps).pos;
    const tangent = a.sub(b).normalize();

    group.position.copy(pos);
    group.rotation.y = rad;

    // baseScale is needed both for the card's own scale AND to drive the
    // corner-stretch intensity below by the card's actual position in the
    // ribbon (front = big/close = tab fully visible, back = small/far =
    // tab shrinks in lockstep) — computed once here and reused for both.
    const baseScale = scaleFromRad(rad);

    // Corner "twist" — a saddle-shaped Z offset (see geometry.ts) that
    // reads as a small piece of a continuous spiral rather than a random
    // per-corner effect. `frontness` remaps baseScale's [minScale,
    // maxScale] range to [0, 1], so the twist is strongest at the true
    // front and fades away by max depth — same depth logic as everything
    // else on this card, just a much smaller, Z-only amount.
    const frontness = THREE.MathUtils.clamp(
      (baseScale - minScale) / (maxScale - minScale),
      0,
      1,
    );

    // The saddle term is antisymmetric in nx (it flips sign between a
    // card's left edge and its right edge). That means, with a single
    // fixed sign for every card, card i's right-edge corner and card
    // i+1's left-edge corner — the two corners that face each other
    // across the gap in the ribbon — always land on OPPOSITE sides
    // (one dips in while its neighbor lifts out), which is exactly the
    // "not uniform" seam the ribbon showed. Flipping the sign on every
    // other card cancels that flip out: it lands each card's
    // facing-edge corners on the SAME side as its neighbor's, so the
    // ribbon reads as continuous while each card still keeps its own
    // diagonal spiral shape internally.
    const parity = index % 2 === 0 ? 1 : -1;

    // Kept intentionally small — a fraction of the card's own curvature,
    // not of cardWidth — so it reads as a gentle extra twist in the
    // surface rather than a visible shape change. Flip the base sign
    // (separately from `parity`) if the overall twist direction doesn't
    // match the way this ribbon actually spirals.
    const cornerTwistAmount = curvature * 0.2 * frontness * parity;
    applyCornerTwist(geo, cornerTwistAmount);

    const frontFactor = Math.cos(rad);
    const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
    const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);

    // Tilt is also dialed back a bit at max depth versus before, since
    // combined with the stronger scale falloff, full tilt on a
    // still-fairly-large "just past front" card was the main clipping
    // culprit. 14deg (was 18) plus the Z depth push above is enough
    // headroom to avoid overlap while still reading as a natural curve.
    const maxTiltDegFront = 0;
    const maxTiltDegBack = 14;
    const maxTiltDeg = THREE.MathUtils.lerp(
      maxTiltDegFront,
      maxTiltDegBack,
      backAmountSmooth,
    );
    const maxTiltRad = THREE.MathUtils.degToRad(maxTiltDeg);

    // True tangent angle via atan2 — no arbitrary epsilon added to
    // tangent.y the way the old `atan(x / (|y| + 0.25))` version did.
    // That epsilon biased the computed slope away from the curve's real
    // tangent whenever tangent.y was small, which is exactly what could
    // make a tilted card's top/bottom edge fall slightly off the true
    // curve and read as a kink. atan2 stays exact everywhere (the tiny
    // 1e-6 floor is only to dodge a literal divide-by-zero, not to
    // reshape the slope), so the tilt now always matches the ribbon's
    // real direction of travel until it hits the maxTiltRad clamp.
    const safeY = Math.abs(tangent.y) < 1e-6 ? 1e-6 : tangent.y;
    const tiltRaw = THREE.MathUtils.clamp(
      Math.atan2(tangent.x, Math.abs(safeY)),
      -maxTiltRad,
      maxTiltRad,
    );

    // Frame-rate independent exponential smoothing toward the target tilt.
    // Lower factor (e.g. 6) = heavier/laggier and smoother,
    // higher factor = snappier.
    const tiltSmoothing = 1 - Math.exp(-6 * dt);
    tiltRef.current = THREE.MathUtils.lerp(
      tiltRef.current,
      tiltRaw,
      tiltSmoothing,
    );
    // Never let the visible tilt exceed what's allowed at THIS instant,
    // even if the smoothing above hasn't fully caught up yet (e.g. a fast
    // scroll flick can leave tiltRef holding a larger "back" tilt for a
    // frame or two after the card has already reached the front, where
    // maxTiltRad shrinks toward 0). Without this clamp, a front card
    // could visibly show leftover slope from when it was still deep in
    // the ribbon — which is exactly the "too much up/down slope up front"
    // effect.
    tiltRef.current = THREE.MathUtils.clamp(
      tiltRef.current,
      -maxTiltRad,
      maxTiltRad,
    );
    group.rotation.z = tiltRef.current;

    const targetScale = baseScale * (hovered ? 1.05 : 1);

    const scaleSmoothing = 1 - Math.exp(-8 * dt);
    scaleRef.current = THREE.MathUtils.lerp(
      scaleRef.current,
      targetScale,
      scaleSmoothing,
    );

    group.scale.setScalar(scaleRef.current);
  });

  return (
    <group ref={groupRef}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <primitive object={geo} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Smooths the raw scroll-driven shift value into a lagged "display" value.
 * Gives the whole ribbon a gentle inertia/weight instead of tracking the
 * scrollbar 1:1. Runs once per frame regardless of card count.
 */
function ShiftDriver({
  rawShiftRef,
  displayShiftRef,
}: {
  rawShiftRef: React.MutableRefObject<number>;
  displayShiftRef: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    // Lower factor = heavier/laggier, higher = snappier.
    const smoothing = 1 - Math.exp(-5 * dt);
    displayShiftRef.current = THREE.MathUtils.lerp(
      displayShiftRef.current,
      rawShiftRef.current,
      smoothing,
    );
  });
  return null;
}

interface DesignInMotion3DProps {
  /** Your 9 template cards, in the order they should travel through. */
  templates: DesignTemplate[];
  /** Card width in three.js world units (not px — tune alongside camera distance/fov). */
  cardWidth?: number;
  /** Base radius of the vertical-axis spiral, in world units. */
  radius?: number;
  /** How much the radius bulges out front / curls in at the back, in world units. Keep < radius. */
  bulge?: number;
  /** Degrees of rotation around the vertical axis per card step. */
  angleStep?: number;
  /** Diagonal tilt of the whole ribbon (deg), rotated on the Z axis. */
  stageTiltDeg?: number;
  /** Extra top-down perspective on the ribbon (deg), rotated on the X axis. */
  stagePitchDeg?: number;
  /** How many card-widths of empty run-up/run-out to scroll through before/after the ribbon. */
  edgePadding?: number;
  scrollPerCard?: number;
  /** How long (in viewport heights) the pinned scroll-scrub lasts. */
  scrollLength?: number;
  /** Camera field of view (deg). */
  fov?: number;
  /** Camera distance from the origin along Z. */
  cameraDistance?: number;
  pinTargetRef?: React.RefObject<HTMLElement | null>;
  RightWord?: string;
  LeftWord?: string;
  ribbonVisibilityPadding?: number;
  /** Where (0-1 of total scroll) the ribbon-exit / grid-enter sequence starts. */
  gridRevealStart?: number;
  /**
   * Fraction of the [gridRevealStart, 1] tail dedicated to the ribbon fading
   * out completely BEFORE the grid starts entering (and vice-versa on
   * reverse scroll). 0.35 = ribbon uses the first 35% of that tail to fully
   * disappear, then the grid uses the remaining 65% to fully appear.
   */
  ribbonExitFrac?: number;
  /**
   * Amplitude (world units) of an optional sinusoidal ripple layered on
   * top of the ribbon's vertical descent. Default 0 keeps the descent
   * perfectly uniform, so a line traced along the top or bottom edge of
   * every card reads as one smooth, unbroken curve. Raise this only if
   * you deliberately want the ribbon to undulate.
   */
  waveAmplitude?: number;
  /** Frequency of the optional ripple above. */
  waveFrequency?: number;
  /**
   * Global multiplier on how fast the ribbon descends per card, applied
   * identically front-to-back (see note in Card). Raise for a steeper /
   * more spread-out ribbon, lower for a tighter one. Default 1 matches
   * the current back-card spacing exactly, since that spacing already
   * follows this same rule.
   */
  verticalStride?: number;
}

// Default ripple amplitude as a fraction of card width. Tying it to
// `cardWidth` (rather than a fixed world-unit constant) is what keeps the
// ripple looking consistent if cardWidth is ever changed — a fixed
// constant would look proportionally too strong/weak depending on card
// size. 0.6 is the value that reads as a smooth, uniform ribbon at the
// front instead of a staircase.
const DEFAULT_WAVE_AMPLITUDE_RATIO = 0.6;

export default function DesignInMotion3D({
  templates,
  cardWidth = 4,
  radius = 7,
  bulge = 1.8,
  angleStep = 33,
  stageTiltDeg = -14,
  stagePitchDeg = 5,
  edgePadding = 3.5,
  scrollPerCard = 0.55,
  scrollLength = 10,
  fov = 35,
  cameraDistance = 10,
  pinTargetRef,
  RightWord,
  LeftWord,
  ribbonVisibilityPadding = -30,
  gridRevealStart = 0.8,
  ribbonExitFrac = 0,
  waveAmplitude,
  waveFrequency = 0.4,
  verticalStride = 1,
}: DesignInMotion3DProps) {
  // Default tied to cardWidth (see DEFAULT_WAVE_AMPLITUDE_RATIO above)
  // rather than a fixed number, so it stays proportional if cardWidth
  // changes. Still fully overridable via the waveAmplitude prop.
  const effectiveWaveAmplitude =
    waveAmplitude ?? cardWidth * DEFAULT_WAVE_AMPLITUDE_RATIO;
  const localSectionRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(-edgePadding);
  const displayShiftRef = useRef(-edgePadding);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLHeadingElement>(null);
  const templatesRef = useRef<HTMLHeadingElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gridProgress, setGridProgress] = useState(0);

  // Lenis: smooth scroll only for the lifetime of this component.
  // Destroyed completely on unmount, so it never leaks into the rest
  // of the project.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const triggerEl = pinTargetRef?.current ?? localSectionRef.current;
    if (!triggerEl) return;

    const total = templates.length;

    const bufferPad = 12;

    const shiftStart = -edgePadding - bufferPad;
    const shiftEnd = total - 1 + edgePadding + bufferPad;

    shiftRef.current = shiftStart;
    displayShiftRef.current = shiftStart;

    const totalShiftRange = shiftEnd - shiftStart;
    const computedScrollLength = totalShiftRange * scrollPerCard;
    const effectiveScrollLength = scrollLength ?? computedScrollLength;

    const ribbonStartFrac = ribbonVisibilityPadding / totalShiftRange;
    const ribbonEndFrac = 1 - ribbonVisibilityPadding / totalShiftRange;

    const tailRange = 1 - gridRevealStart;
    const ribbonExitEnd = gridRevealStart + tailRange * ribbonExitFrac;

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: () => `+=${effectiveScrollLength * window.innerHeight}`,
      scrub: 1,
      pin: triggerEl,
      anticipatePin: 1,

      onUpdate: (self) => {
        shiftRef.current = gsap.utils.interpolate(
          shiftStart,
          shiftEnd,
          self.progress,
        );

        const ribbonProgress = THREE.MathUtils.clamp(
          (self.progress - ribbonStartFrac) / (ribbonEndFrac - ribbonStartFrac),
          0,
          1,
        );
        setScrollProgress(ribbonProgress);

        const grid = THREE.MathUtils.clamp(
          (self.progress - ribbonExitEnd) / (1 - ribbonExitEnd),
          0,
          1,
        );
        setGridProgress(grid);
      },
    });

    return () => {
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    templates.length,
    edgePadding,
    scrollPerCard,
    scrollLength,
    pinTargetRef,
    gridRevealStart,
    ribbonExitFrac,
    angleStep,
  ]);

  return (
    <section
      ref={localSectionRef}
      className="relative h-screen w-full"
      style={{ zIndex: 1 }}
    >
      <SlideText
        ref={designRef}
        direction="right"
        progress={scrollProgress}
        className="top-[27%]"
      >
        <h2 className="text-[120px] font-bold uppercase text-[#AAAAAA]">
          {RightWord}
        </h2>
      </SlideText>

      <SlideText
        ref={templatesRef}
        direction="left"
        progress={scrollProgress}
        className="top-[50%]"
      >
        <h2 className="text-[120px] font-bold uppercase text-[#AAAAAA]">
          {LeftWord}
        </h2>
      </SlideText>

      <Suspense fallback={null}>
        <div
          ref={canvasWrapperRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1,
            transition: "none",
          }}
        >
          <Canvas
            style={{ position: "fixed", inset: 0 }}
            dpr={[1, 2]}
            camera={{ position: [0, 0, cameraDistance], fov }}
            gl={{ antialias: true, alpha: true }}
          >
            <CameraRig
              stageTiltDeg={stageTiltDeg}
              stagePitchDeg={stagePitchDeg}
              cameraDistance={cameraDistance}
            />
            <ShiftDriver
              rawShiftRef={shiftRef}
              displayShiftRef={displayShiftRef}
            />
            {templates.map((tpl, i) => (
              <Card
                key={tpl.id}
                index={i}
                total={templates.length}
                image={tpl.image}
                title={tpl.title}
                cardWidth={cardWidth}
                radius={radius}
                bulge={bulge}
                angleStep={angleStep}
                waveAmplitude={effectiveWaveAmplitude}
                waveFrequency={waveFrequency}
                verticalStride={verticalStride}
                shiftRef={displayShiftRef}
              />
            ))}
          </Canvas>
        </div>
        <TemplateGridReveal progress={gridProgress} />
      </Suspense>
    </section>
  );
}
