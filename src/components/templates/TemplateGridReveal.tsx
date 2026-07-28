import { useMemo } from "react";
import CategoryTabs from "@/components/templates/CategoryTabs";
import RevealGridCard from "@/components/templates/RevealGridCard";
import { siteConfig } from "@/config/site.config";
import { CATEGORY_SWITCH_DURATION } from "@/components/templates/templateGridReveal.constants";
import { useCategoryCrossfade } from "./useCategoryCrossfade";
import { useCardRevealAnimation } from "./useCardRevealAnimation";

interface TemplateGridRevealProps {
  progress: number;
}

type Category = typeof siteConfig.templateCategories.categories[number]["id"];

const MAX_CARDS = 6;

export default function TemplateGridReveal({
  progress,
}: TemplateGridRevealProps) {
  const { categories, templates, heading } = siteConfig.templateCategories;

  const { activeCategory, setActiveCategory, displayedCategory, gridVisible } =
    useCategoryCrossfade<Category>(templates, "all" as Category);

  // The cards to actually render, based on `displayedCategory` (not the
  // just-clicked `activeCategory`) so content only changes while hidden.
  const activeTemplates = useMemo(() => {
    return (templates[displayedCategory] ?? templates.all ?? []).slice(
      0,
      MAX_CARDS,
    );
  }, [displayedCategory, templates]);

  const { sectionRef, headerWrapRef, tabsWrapRef, setCardRef, setHovered } =
    useCardRevealAnimation({ progress, cardCount: MAX_CARDS });

  return (
    <div
      ref={sectionRef}
      className="w-full h-screen flex flex-col items-center justify-center"
      style={{
        position: "absolute",
        inset: 0,
        // Guarantees a gray-background gap below the grid (on top of
        // whatever margin the vertical centering already leaves), so the
        // next section never appears to start right where the cards end.
        pointerEvents: "none",
      }}
    >
      <div
        ref={headerWrapRef}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: 0,
        }}
      >
        <div>
          <h2
            className="text-section-title"
            style={{
              lineHeight: "1.15",
              color: "#070606",
              margin: 0,
              marginBottom: "20px",
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
        </div>
      </div>
      <div
        ref={tabsWrapRef}
        className="shrink-0 mb-4"
        style={{ opacity: 0, transition: "none" }}
      >
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={(category) => setActiveCategory(category as Category)}
        />
      </div>

      <div className="min-h-0 z-4" style={{ perspective: "1200px" }}>
        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns: "repeat(3, 387px)",
            gridTemplateRows: "repeat(2, 280px)",
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? "scale(1)" : "scale(0.98)",
            transition: `opacity ${CATEGORY_SWITCH_DURATION}ms ease, transform ${CATEGORY_SWITCH_DURATION}ms ease`,
          }}
        >
          {activeTemplates.map((tpl, i) => (
            <RevealGridCard
              key={tpl.id}
              image={tpl.image}
              link={tpl.link}
              cardRef={setCardRef(i)}
              onHoverStart={() => setHovered(i)}
              onHoverEnd={() => setHovered(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
