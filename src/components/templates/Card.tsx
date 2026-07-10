import { memo, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { createCurvedPlaneGeometry, applyCornerTwist } from "./geometry";
import { DEPTH_MAX_SCALE, DEPTH_MIN_SCALE, integrateUFromLUT, scaleFromRad } from "./ribbonMath";

export interface CardProps {
  index: number;
  image: string;
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
  /** Shared arc-length LUT (one per angleStep, built once in the parent
   * and passed down) so every card reuses the same table instead of
   * each rebuilding its own. */
  arcLengthLUT: Float32Array;
}

interface PositionParams {
  radius: number;
  bulge: number;
  angleStep: number;
  waveAmplitude: number;
  waveFrequency: number;
  verticalStride: number;
  arcLengthLUT: Float32Array;
}

// Extra straight-back push along Z for deeper cards. This is what
// actually prevents a tilted back card's corner from poking through
// the card in front of it — since spacing now shrinks in lockstep
// with scale (to keep the visual gap constant), we can't rely on
// spacing alone to avoid clipping, so we add real depth separation
// instead, which doesn't affect the on-screen gap.
const DEPTH_PUSH_STRENGTH = 0.35;

/**
 * Pure position function, hoisted to module scope so it (and the
 * `integrateU` lookup it uses) is never re-allocated as a closure inside
 * the per-frame callback — it used to be redefined 3x/frame/card (once
 * for the card's own position, twice more for the finite-difference
 * tangent), which is 60fps x 9 cards x 3 = a lot of throwaway closures.
 * Writes into `target` instead of allocating a new Vector3.
 */
function computeCardPosition(
  o: number,
  target: THREE.Vector3,
  p: PositionParams,
): number {
  const u = integrateUFromLUT(o, p.arcLengthLUT);
  const angleDeg = u * p.angleStep;
  const rad = THREE.MathUtils.degToRad(angleDeg);

  const x = Math.sin(rad) * p.radius;
  const z0 = Math.cos(rad) * p.radius - p.radius;
  const frontFactor = Math.cos(rad);
  const bulgeOffset = frontFactor * p.bulge * 0.4;

  const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
  const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);
  const depthPush = backAmountSmooth * p.radius * DEPTH_PUSH_STRENGTH;

  const zFinal = z0 - bulgeOffset - depthPush;

  // Uniform descent driven by the SAME arc-length parameter `u` used
  // for x/z above — guaranteed proportional front-to-back, so no seam.
  // Plus an OPTIONAL ripple on top; with waveAmplitude at its default of
  // 0 this is just `y = -u * verticalStride`, a perfectly smooth,
  // monotonic curve.
  const y =
    -u * p.verticalStride + Math.sin(u * p.waveFrequency) * p.waveAmplitude;

  target.set(x, y, zFinal);
  return rad;
}

function CardImpl({
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
  arcLengthLUT,
}: CardProps) {
  // Hover is only ever read inside the imperative useFrame loop below (to
  // nudge the target scale) — it never affects what gets rendered as
  // JSX. Keeping it as a plain ref instead of useState means hovering a
  // card no longer triggers a React re-render (and re-invocation of this
  // component) on every pointer enter/leave; the visual feedback is
  // already fully driven by the per-frame scale lerp.
  const hoveredRef = useRef(false);
  const scaleRef = useRef(1);
  const tiltRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useTexture(image);
  const height = (cardWidth * 7) / 9;
  const angleRad = THREE.MathUtils.degToRad(angleStep);
  const curvature = radius * (1 - Math.cos(angleRad / 2));

  const geo = useMemo(
    () => createCurvedPlaneGeometry(cardWidth, height, 16, 16, curvature),
    [cardWidth, height, curvature],
  );

  // Pre-allocated scratch vectors, reused every frame instead of being
  // allocated fresh. `getPosition` used to `new THREE.Vector3()` on every
  // call, and it was called 3x/frame/card (position + 2 tangent samples)
  // — ~1600 short-lived objects/sec across the ribbon, all pure GC
  // pressure. Writing into these instead removes that allocation entirely.
  const posVecRef = useRef(new THREE.Vector3());
  const posARef = useRef(new THREE.Vector3());
  const posBRef = useRef(new THREE.Vector3());
  const tangentRef = useRef(new THREE.Vector3());

  // Tracks the last twist amount actually written to the geometry, so we
  // can skip the (relatively expensive, full-buffer-upload) call to
  // `applyCornerTwist` when the change since last frame is imperceptible
  // — this is common for back-of-ribbon cards whose twist sits at ~0 for
  // many consecutive frames.
  const lastTwistRef = useRef<number | null>(null);

  // Mutated in place (cheap — just field assignment, no allocation)
  // instead of being rebuilt inside the per-frame callback, so
  // `computeCardPosition` above never needs a fresh params object. The
  // write happens in a layout effect (not during render) since refs are
  // meant to be read/written outside of render.
  const paramsRef = useRef<PositionParams>({
    radius,
    bulge,
    angleStep,
    waveAmplitude,
    waveFrequency,
    verticalStride,
    arcLengthLUT,
  });
  useLayoutEffect(() => {
    paramsRef.current.radius = radius;
    paramsRef.current.bulge = bulge;
    paramsRef.current.angleStep = angleStep;
    paramsRef.current.waveAmplitude = waveAmplitude;
    paramsRef.current.waveFrequency = waveFrequency;
    paramsRef.current.verticalStride = verticalStride;
    paramsRef.current.arcLengthLUT = arcLengthLUT;
  });

  useFrame((_, delta) => {
    const group = groupRef.current;
    const mat = materialRef.current;
    if (!group || !mat) return;

    // Clamp delta so a lagged/minimized tab doesn't cause a visible jump
    // when it comes back.
    const dt = Math.min(delta, 1 / 30);

    const offset = index - shiftRef.current;
    const params = paramsRef.current;

    const posVec = posVecRef.current;
    const posA = posARef.current;
    const posB = posBRef.current;
    const tangent = tangentRef.current;

    const rad = computeCardPosition(offset, posVec, params);

    const eps = 0.12;
    computeCardPosition(offset + eps, posA, params);
    computeCardPosition(offset - eps, posB, params);
    tangent.copy(posA).sub(posB).normalize();

    group.position.copy(posVec);
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
      (baseScale - DEPTH_MIN_SCALE) / (DEPTH_MAX_SCALE - DEPTH_MIN_SCALE),
      0,
      1,
    );

    // The saddle term is antisymmetric in nx (it flips sign between a
    // card's left edge and its right edge). Flipping the sign on every
    // other card cancels that flip out: it lands each card's
    // facing-edge corners on the SAME side as its neighbor's, so the
    // ribbon reads as continuous while each card still keeps its own
    // diagonal spiral shape internally.
    const parity = index % 2 === 0 ? 1 : -1;

    // Kept intentionally small — a fraction of the card's own curvature,
    // not of cardWidth — so it reads as a gentle extra twist in the
    // surface rather than a visible shape change.
    const cornerTwistAmount = curvature * 0.2 * frontness * parity;

    // Skip the (full-buffer, GPU-upload-triggering) geometry write when
    // the twist hasn't meaningfully changed since last frame — common
    // for cards sitting at the back of the ribbon where `frontness` (and
    // therefore the twist) sits at ~0 for many consecutive frames.
    const lastTwist = lastTwistRef.current;
    if (lastTwist === null || Math.abs(cornerTwistAmount - lastTwist) > 0.0005) {
      applyCornerTwist(geo, cornerTwistAmount);
      lastTwistRef.current = cornerTwistAmount;
    }

    const frontFactor = Math.cos(rad);
    const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
    const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);

    // Tilt is dialed back at max depth: 14deg plus the Z depth push above
    // is enough headroom to avoid overlap while still reading as a
    // natural curve.
    const maxTiltDegFront = 0;
    const maxTiltDegBack = 14;
    const maxTiltDeg = THREE.MathUtils.lerp(
      maxTiltDegFront,
      maxTiltDegBack,
      backAmountSmooth,
    );
    const maxTiltRad = THREE.MathUtils.degToRad(maxTiltDeg);

    // True tangent angle via atan2 — no arbitrary epsilon added to
    // tangent.y the way an `atan(x / (|y| + 0.25))` version would; that
    // biases the computed slope away from the curve's real tangent
    // whenever tangent.y is small. The tiny 1e-6 floor here only dodges
    // a literal divide-by-zero, not reshaping the slope.
    const safeY = Math.abs(tangent.y) < 1e-6 ? 1e-6 : tangent.y;
    const tiltRaw = THREE.MathUtils.clamp(
      Math.atan2(tangent.x, Math.abs(safeY)),
      -maxTiltRad,
      maxTiltRad,
    );

    // Frame-rate independent exponential smoothing toward the target tilt.
    const tiltSmoothing = 1 - Math.exp(-6 * dt);
    tiltRef.current = THREE.MathUtils.lerp(
      tiltRef.current,
      tiltRaw,
      tiltSmoothing,
    );
    // Never let the visible tilt exceed what's allowed at THIS instant,
    // even if the smoothing above hasn't fully caught up yet.
    tiltRef.current = THREE.MathUtils.clamp(
      tiltRef.current,
      -maxTiltRad,
      maxTiltRad,
    );
    group.rotation.z = tiltRef.current;

    const targetScale = baseScale * (hoveredRef.current ? 1.05 : 1);

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
        onPointerEnter={() => {
          hoveredRef.current = true;
        }}
        onPointerLeave={() => {
          hoveredRef.current = false;
        }}
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

// Every prop here is a primitive (or a stable ref/typed-array reference
// passed down from RibbonScene) that doesn't change on scroll, so memo
// means a Card only actually re-renders if its own inputs change — never
// just because the parent's unrelated scroll-progress state updated.
const Card = memo(CardImpl);
export default Card;
