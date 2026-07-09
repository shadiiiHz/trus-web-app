import * as THREE from "three";

interface CornerTwistData {
  signedWeight: Float32Array;
  baseZ: Float32Array;
}

export function createCurvedPlaneGeometry(
  width: number,
  height: number,
  segmentsX = 128,
  segmentsY = 64,
  curvature = 0.6,
  /** How tightly the twist concentrates right at the four corners vs.
   * spreading smoothly across the whole card. 1 = a pure mathematical
   * saddle (z = nx*ny), which already fades naturally to 0 along the
   * card's horizontal/vertical center-lines. Higher values pull the
   * effect in tighter toward just the corner tips. */
  cornerTwistPower = 1,
) {
  const geometry = new THREE.PlaneGeometry(
    width,
    height,
    segmentsX,
    segmentsY,
  );

  const position = geometry.attributes.position;
  const count = position.count;

  const signedWeight = new Float32Array(count);
  const baseZ = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);

    const nx = x / (width / 2);
    const ny = y / (height / 2);

    // Existing cylindrical bend across the width — unchanged.
    const edge = Math.abs(nx);
    const t = 1 - Math.pow(edge, 2.2);
    const soft = Math.sin(t * Math.PI * 0.5);
    const bend = soft * curvature;

    // The saddle term nx*ny is the correct small-twist linearization of
    // a helicoid (screw surface) — exactly the shape a small rectangular
    // patch takes if you twist it slightly around its own center. That's
    // why it reads as "part of a spiral" rather than an arbitrary
    // corner dimple: it's +1 at top-right/bottom-left, -1 at
    // top-left/bottom-right, and passes smoothly through 0 along both
    // center-lines — no clamping or dead zones needed. Raising the power
    // (while preserving sign) lets the same shape be pulled in tighter
    // toward the corner tips if a sharper look is wanted.
    const raw = nx * ny;
    const signed =
      Math.sign(raw) * Math.pow(Math.abs(raw), cornerTwistPower);

    signedWeight[i] = signed;
    baseZ[i] = bend;

    position.setZ(i, bend);
  }

  position.needsUpdate = true;

  // Store what's needed to re-derive the twist from scratch at any
  // intensity, without compounding on a previous frame's result.
  (geometry.userData as { cornerTwist?: CornerTwistData }).cornerTwist = {
    signedWeight,
    baseZ,
  };

  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Applies a saddle-shaped twist on top of the base bend: top-right /
 * bottom-left corners shift one way along Z, top-left / bottom-right
 * shift the other way, smoothly and symmetrically — the small-twist
 * approximation of a helicoid, which is what makes it read as a piece of
 * a continuous spiral rather than a random per-corner effect. X/Y
 * positions are never touched, only Z.
 *
 * `twistAmount` sets both the strength AND the handedness: positive
 * lifts top-right/bottom-left toward the viewer and dips the other pair
 * back; negative flips which pair does which. Pick the sign that matches
 * the direction your ribbon actually spirals in, so the twist reinforces
 * the turn instead of fighting it.
 *
 * Recomputed fresh from the base bend (`baseZ`) every call, so it's safe
 * to call every frame with a different, position-dependent amount — it
 * never accumulates on top of itself.
 *
 * Skips `computeVertexNormals()` on purpose: cards render with
 * `MeshBasicMaterial`, which ignores normals entirely, so recomputing
 * them every frame would be pure wasted cost.
 */
export function applyCornerTwist(
  geometry: THREE.BufferGeometry,
  twistAmount: number,
) {
  const data = (geometry.userData as { cornerTwist?: CornerTwistData })
    .cornerTwist;
  if (!data) return;

  const position = geometry.attributes.position as THREE.BufferAttribute;
  const { signedWeight, baseZ } = data;

  for (let i = 0; i < position.count; i++) {
    position.setZ(i, baseZ[i] + signedWeight[i] * twistAmount);
  }

  position.needsUpdate = true;
}
