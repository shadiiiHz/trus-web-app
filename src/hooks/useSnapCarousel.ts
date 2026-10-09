import { useCallback, useRef, useState } from "react";

/**
 * State for a one-slide-per-view scroll-snap carousel: which slide is
 * centred (from scroll position) and a smooth `goTo` for pagination dots.
 * Slides must be full-width of the scroller with `gap` px between them.
 */
export function useSnapCarousel(gap: number) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / (el.clientWidth + gap));
    setActive((prev) => (prev === next ? prev : next));
  }, [gap]);

  const goTo = useCallback(
    (i: number) => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollTo({ left: i * (el.clientWidth + gap), behavior: "smooth" });
    },
    [gap],
  );

  return { scrollerRef, active, onScroll, goTo };
}
