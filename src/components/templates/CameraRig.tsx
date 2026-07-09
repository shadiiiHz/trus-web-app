import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";

export function CameraRig({
  stageTiltDeg,
  stagePitchDeg,
  cameraDistance,
}: {
  stageTiltDeg: number;
  stagePitchDeg: number;
  cameraDistance: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const tiltRad = THREE.MathUtils.degToRad(stageTiltDeg);
    const pitchRad = THREE.MathUtils.degToRad(stagePitchDeg);

    camera.up.set(Math.sin(tiltRad), Math.cos(tiltRad), 0);

    camera.position.set(
      0,
      Math.sin(pitchRad) * cameraDistance,
      Math.cos(pitchRad) * cameraDistance,
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, stageTiltDeg, stagePitchDeg, cameraDistance]);

  return null;
}