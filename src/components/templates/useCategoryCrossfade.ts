import { useEffect, useRef, useState } from "react";
import {
  CATEGORY_SWITCH_DURATION,
  PRELOAD_TIMEOUT_MS,
} from "@/components/templates/templateGridReveal.constants";
import { delay, preloadImages } from "./imagePreload";

interface TemplateItem {
  image: string;
}

/**
 * Drives a crossfade between categories of a template grid: hides the
 * grid, waits for the next category's images to be fully decoded (not
 * just requested), swaps its content, then reveals it. Also preloads
 * every category up front so the per-switch preload resolves near
 * instantly once the browser cache is warm.
 */
export function useCategoryCrossfade<C extends string>(
  templates: Record<string, TemplateItem[]>,
  initialCategory: C,
) {
  const [activeCategory, setActiveCategory] = useState<C>(initialCategory);
  // What's actually rendered right now. Only updates once the fade-out has
  // finished AND the next category's images are preloaded, so the swap
  // happens while invisible and paints instantly when shown.
  const [displayedCategory, setDisplayedCategory] = useState<C>(initialCategory);
  const [gridVisible, setGridVisible] = useState(true);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const allUrls = Object.values(templates)
      .flat()
      .slice(0, 200) // sane upper bound, just in case
      .map((t) => t.image);
    preloadImages(allUrls);
  }, [templates]);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      setDisplayedCategory(activeCategory);
      return;
    }

    setGridVisible(false);
    let cancelled = false;

    const hideTimeout = window.setTimeout(() => {
      const nextTemplates = templates[activeCategory] ?? templates.all ?? [];
      const urls = nextTemplates.slice(0, 6).map((t) => t.image);

      // Race the real preload against a safety timeout, so a slow network
      // or a stuck image can never leave the grid hidden indefinitely.
      Promise.race([preloadImages(urls), delay(PRELOAD_TIMEOUT_MS)]).then(
        () => {
          if (cancelled) return;

          setDisplayedCategory(activeCategory);
          // Wait a couple frames so the browser paints the new, already-
          // decoded content before we flip opacity back on — otherwise
          // there's no transition to animate from.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!cancelled) setGridVisible(true);
            });
          });
        },
      );
    }, CATEGORY_SWITCH_DURATION);

    return () => {
      cancelled = true;
      window.clearTimeout(hideTimeout);
    };
  }, [activeCategory, templates]);

  return {
    activeCategory,
    setActiveCategory,
    displayedCategory,
    gridVisible,
  };
}
