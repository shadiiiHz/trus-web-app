import { memo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import type { DesignTemplate } from "./types";
import Card from "./Card";

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

export interface RibbonSceneProps {
  templates: DesignTemplate[];
  cardWidth: number;
  radius: number;
  bulge: number;
  angleStep: number;
  waveAmplitude: number;
  waveFrequency: number;
  verticalStride: number;
  stageTiltDeg: number;
  stagePitchDeg: number;
  fov: number;
  cameraDistance: number;
  /** Raw, unsmoothed scroll-driven shift — owned by the parent so its
   * ScrollTrigger setup effect can reset it directly. */
  rawShiftRef: React.MutableRefObject<number>;
  /** Lagged/smoothed shift actually consumed by every Card — also owned
   * by the parent (and reset alongside `rawShiftRef`) so both stay in
   * sync across ribbon re-configuration. */
  displayShiftRef: React.MutableRefObject<number>;
  arcLengthLUT: Float32Array;
}

/**
 * The whole WebGL ribbon, split out of DesignInMotion3D so it can be:
 *  - lazy-loaded as its own chunk (three.js/@react-three/fiber/drei are
 *    heavy — no reason to ship them in the initial bundle before the
 *    user has scrolled anywhere near this section), and
 *  - memoized independently of the text-overlay scroll state
 *    (`scrollProgress`/`gridProgress`) that lives in the parent, so this
 *    subtree never re-renders just because a SlideText/GridReveal
 *    progress value ticked — every prop here is a primitive or a stable
 *    ref/typed-array passed down once.
 */
function RibbonScene({
  templates,
  cardWidth,
  radius,
  bulge,
  angleStep,
  waveAmplitude,
  waveFrequency,
  verticalStride,
  stageTiltDeg,
  stagePitchDeg,
  fov,
  cameraDistance,
  rawShiftRef,
  displayShiftRef,
  arcLengthLUT,
}: RibbonSceneProps) {
  return (
    <Canvas
      style={{ position: "fixed", inset: 0 }}
      dpr={1}
      camera={{ position: [0, 0, cameraDistance], fov }}
      gl={{ antialias: true, alpha: true }}
    >
      <CameraRig
        stageTiltDeg={stageTiltDeg}
        stagePitchDeg={stagePitchDeg}
        cameraDistance={cameraDistance}
      />
      <ShiftDriver rawShiftRef={rawShiftRef} displayShiftRef={displayShiftRef} />
      {templates.map((tpl, i) => (
        <Card
          key={tpl.id}
          index={i}
          image={tpl.image}
          cardWidth={cardWidth}
          radius={radius}
          bulge={bulge}
          angleStep={angleStep}
          waveAmplitude={waveAmplitude}
          waveFrequency={waveFrequency}
          verticalStride={verticalStride}
          shiftRef={displayShiftRef}
          arcLengthLUT={arcLengthLUT}
        />
      ))}
    </Canvas>
  );
}

export default memo(RibbonScene);
