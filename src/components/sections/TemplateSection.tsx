import { memo, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site.config";
import DesignInMotion3D from "../templates/DesignInMotion3D";
import CategoryTabs from "../templates/CategoryTabs";
import type { Category } from "../templates/TemplateGridReveal";
import { useCategoryCrossfade } from "../templates/useCategoryCrossfade";
import { useCardRevealAnimation } from "../templates/useCardRevealAnimation";
import { MAX_CARDS, TABS_ENTER_DELAY_MS } from "../templates/templateGridReveal.constants";

type TemplateSectionProps = {
  onEnter?: () => void;
  onLeave?: () => void;
  onReady?: () => void;
};

function TemplateSection({ onEnter, onLeave, onReady }: TemplateSectionProps) {
  const {
    LeftWord,
    RightWord,
    tagline,
    sectionDes,
    templates,
    seeMore,
    categories,
  } = siteConfig.templateCategories;
  // Refs
  const sectionRef = useRef<HTMLElement>(null);

  // The full "all" pool feeds the category grid/tabs, but the 3D ribbon
  // only ever travels through the first 9 — more than that made the
  // spiral feel too long/cluttered.
  const ribbonTemplates = templates.all.slice(0, 9);

  // Owned here (rather than inside DesignInMotion3D) so CategoryTabs can be
  // rendered directly as a child of this section, instead of nested inside
  // DesignInMotion3D's own markup. `gridProgress` is computed by
  // DesignInMotion3D's scroll-trigger though, so it's mirrored down here
  // via onGridProgressChange to drive useCardRevealAnimation.
  const { activeCategory, setActiveCategory, displayedCategory, gridVisible } =
    useCategoryCrossfade<Category>(templates, "all" as Category);
  const [gridProgress, setGridProgress] = useState(1);
  const {
    sectionRef: gridSectionRef,
    headerWrapRef,
    tabsWrapRef,
    setCardRef,
    setHovered,
  } = useCardRevealAnimation({ progress: gridProgress, cardCount: MAX_CARDS });

  // The IntersectionObserver below drives onEnter/onLeave (e.g. hiding the
  // main nav while this section is roughly on screen) — a coarse ~60%
  // visibility check is exactly right for that.
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter?.();
        } else {
          onLeave?.();
        }
      },
      {
        threshold: 0.6,
      },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [onEnter, onLeave]);

  // CategoryTabs is rendered as a `position: fixed` rail (see CategoryTabs
  // itself) so it can dock to the viewport's right edge instead of being
  // clipped by this section's own layout. That only reads as "staying in
  // place within the section" for as long as the section itself is
  // actually pinned — the instant DesignInMotion3D's ScrollTrigger
  // releases the pin (either direction), the section starts scrolling
  // normally again and a still-fixed rail would visibly detach from it.
  // `isPinned` mirrors that pin's own active state exactly (see
  // `onPinnedChange`), rather than a coarser "still mostly visible"
  // check that can lag the real moment by a bit.
  const [isPinned, setIsPinned] = useState(false);

  // The tabs rail's fine-grained opacity still tracks scroll (see
  // useCardRevealAnimation's tabsWrapRef opacity: appears once the grid
  // has settled, fades back out — same as the heading — once the grid
  // flies away for the ribbon); `isPinned` above is the hard on/off gate
  // around that. `tabsRevealed` layers a one-shot "beautiful effect" on
  // top of *just the entrance*: each square cascades in individually
  // instead of the whole rail fading as one flat block. It waits
  // TABS_ENTER_DELAY_MS after the section is pinned, then plays once;
  // un-pinning resets it so returning later replays the same entrance.
  const [tabsRevealed, setTabsRevealed] = useState(false);

  useEffect(() => {
    if (!isPinned) return;
    const timer = window.setTimeout(() => {
      setTabsRevealed(true);
    }, TABS_ENTER_DELAY_MS);
    // Runs when `isPinned` next flips false (or on unmount): clears the
    // pending timer if it hadn't fired yet, and resets `tabsRevealed` so
    // the next visit replays the entrance from scratch. Doing the reset
    // here — rather than synchronously at the top of the next effect run
    // — avoids triggering an extra render pass during that run.
    return () => {
      window.clearTimeout(timer);
      setTabsRevealed(false);
    };
  }, [isPinned]);
  return (
    <>
      <section
        id="templates"
        ref={sectionRef}
        className="relative group"
        style={{
          background: "linear-gradient(to bottom, #D9D9D9 0%, #A3A3A3 100%)",
          overflow: "hidden",
        }}
        aria-label="Template Categories"
      >
        <div
          className="relative mx-auto w-full"
          style={{
            zIndex: 2,
          }}
        >
          {/* TEMPLATE */}
          <DesignInMotion3D
            templates={ribbonTemplates}
            pinTargetRef={sectionRef}
            displayedCategory={displayedCategory}
            gridVisible={gridVisible}
            gridSectionRef={gridSectionRef}
            headerWrapRef={headerWrapRef}
            setCardRef={setCardRef}
            setHovered={setHovered}
            onGridProgressChange={setGridProgress}
            onPinnedChange={setIsPinned}
            LeftWord={LeftWord}
            RightWord={RightWord}
            tagline={tagline}
            sectionDes={sectionDes}
            seeMore={seeMore}
            onReady={onReady}
          />
        </div>
      </section>
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onChange={(category) => setActiveCategory(category as Category)}
        railRef={tabsWrapRef}
        visible={isPinned}
        revealed={tabsRevealed}
      />
    </>
  );
}

export default memo(TemplateSection);
