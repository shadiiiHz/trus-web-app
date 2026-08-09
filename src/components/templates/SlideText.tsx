"use client";

import { motion } from "framer-motion";
import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Props {
  direction: "left" | "right";
  progress: number;
  className?: string;
  children: React.ReactNode;
}

// The text is centered on a point offset `offscreen` vw from the viewport
// center (see `x` below), so getting its *edge* fully off-screen at
// progress 0 depends on how wide the rendered text itself is — a fixed vw
// distance was tuned against the (comparatively short) English words, but
// a longer word in another language — or the same word on a narrower
// viewport, where a fixed px font size eats up proportionally more of the
// screen — renders a wider box whose near edge can already sit inside the
// viewport at progress 0, reading as "entering too early". 50 is exactly
// enough to clear the viewport edge from center; +4 is a small safety
// margin on top of the text's own measured half-width.
const MIN_OFFSCREEN_VW = 50;
const OFFSCREEN_MARGIN_VW = 4;

const SlideText = forwardRef<HTMLDivElement, Props>(
  ({ direction, progress, className = "", children }, ref) => {
    const elRef = useRef<HTMLDivElement | null>(null);
    // Need our own ref to measure the rendered element (below) *and* to
    // forward whatever ref the caller passed in — motion.div only takes
    // one, so this callback ref writes to both.
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        elRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    const [offscreen, setOffscreen] = useState(73);

    useLayoutEffect(() => {
      const measure = () => {
        const el = elRef.current;
        if (!el || window.innerWidth === 0) return;
        const halfWidthVw = (el.offsetWidth / window.innerWidth) * 50;
        setOffscreen(Math.max(MIN_OFFSCREEN_VW + halfWidthVw + OFFSCREEN_MARGIN_VW, 73));
      };

      measure();

      const el = elRef.current;
      const resizeObserver = el ? new ResizeObserver(measure) : null;
      resizeObserver?.observe(el!);
      window.addEventListener("resize", measure);

      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener("resize", measure);
      };
    }, [children]);

    const t = THREE.MathUtils.smoothstep(progress, 0, 1);

    const baseX = THREE.MathUtils.lerp(offscreen, -offscreen, t);
    const x = direction === "right" ? baseX : -baseX;

    return (
      <motion.div
        ref={mergedRef}
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