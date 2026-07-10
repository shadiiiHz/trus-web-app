import * as THREE from "three";

// ---------------------------------------------------------------------
// Depth falloff (front/back scale curve)
// ---------------------------------------------------------------------
// Pure, module-scope math shared by RibbonScene/Card so it's defined once
// instead of being redefined inside every Card's render/frame closure.
export const DEPTH_MIN_SCALE = 0.55;
export const DEPTH_MAX_SCALE = 1.0;

export function scaleFromRad(rad: number): number {
  const frontFactor = Math.cos(rad);
  const backAmount = THREE.MathUtils.clamp((1 - frontFactor) / 2, 0, 1);
  const backAmountSmooth = backAmount * backAmount * (3 - 2 * backAmount);
  return THREE.MathUtils.lerp(DEPTH_MAX_SCALE, DEPTH_MIN_SCALE, backAmountSmooth);
}

// ---------------------------------------------------------------------
// Arc-length lookup table
// ---------------------------------------------------------------------
// `integrateU` used to numerically re-integrate `du/do = scale(rad(u))`
// from scratch (36 Euler steps) on EVERY call — and it was being called
// 3x per card per frame (once for the card's own position, twice more
// for the finite-difference tangent). That's ~108 trig-heavy iterations
// per card per frame, ~972/frame across 9 cards, 60x/sec.
//
// The integrand only depends on `angleStep` (via `rad = u * angleStep`),
// which never changes during the component's lifetime. So instead of
// re-solving the same ODE every frame, we solve it ONCE into a dense
// table and look it up (with linear interpolation) afterwards — turning
// an O(steps) computation into an O(1) one, with no visible change in
// the curve itself (the table resolution is much finer than the old
// per-call step count).
export const LUT_RANGE = 40; // must cover the largest |offset| the ribbon can produce
export const LUT_SAMPLES = 2000; // resolution — far finer than the old 36-step integration

export function buildArcLengthLUT(angleStep: number): Float32Array {
  const table = new Float32Array(LUT_SAMPLES + 1);
  const dO = LUT_RANGE / LUT_SAMPLES;
  let u = 0;
  table[0] = 0;
  for (let i = 1; i <= LUT_SAMPLES; i++) {
    const rad = THREE.MathUtils.degToRad(u * angleStep);
    const s = scaleFromRad(rad);
    u += s * dO;
    table[i] = u;
  }
  return table;
}

/** O(1) lookup replacing the old per-call Euler integration. */
export function integrateUFromLUT(o: number, table: Float32Array): number {
  const sign = Math.sign(o) || 1;
  const absO = Math.min(Math.abs(o), LUT_RANGE);
  const idx = (absO / LUT_RANGE) * LUT_SAMPLES;
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, LUT_SAMPLES);
  const frac = idx - i0;
  const u = table[i0] + (table[i1] - table[i0]) * frac;
  return sign * u;
}
