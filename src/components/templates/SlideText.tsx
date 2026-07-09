"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import * as THREE from "three";

interface Props {
  direction: "left" | "right";
  progress: number;
  className?: string;
  children: React.ReactNode;
}

const SlideText = forwardRef<HTMLDivElement, Props>(
  ({ direction, progress, className = "", children }, ref) => {
    const offscreen = 200;
    const t = THREE.MathUtils.smoothstep(progress, 0, 1);

    const baseX = THREE.MathUtils.lerp(offscreen, -offscreen, t);
    const x = direction === "right" ? baseX : -baseX;

    return (
      <motion.div
        ref={ref}
        style={{
          left: "50%",
          x: `calc(-50% + ${x}vw)`,
        }}
        className={`absolute ${className}`}
      >
        {children}
      </motion.div>
    );
  },
);

SlideText.displayName = "SlideText";
export default SlideText;