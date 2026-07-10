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

type Category = keyof typeof siteConfig.templateCategories.templates;

const MAX_CARDS = 6;

export default function TemplateGridReveal({
  progress,
}: TemplateGridRevealProps) {
  const { categories, templates, eyebrow, heading } =
    siteConfig.templateCategories;

  const { activeCategory, setActiveCategory, displayedCategory, gridVisible } =
    useCategoryCrossfade<Category>(templates, "All" as Category);

  // The cards to actually render, based on `displayedCategory` (not the
  // just-clicked `activeCategory`) so content only changes while hidden.
  const activeTemplates = useMemo(() => {
    return (templates[displayedCategory] ?? templates.All ?? []).slice(
      0,
      MAX_CARDS,
    );
  }, [displayedCategory, templates]);

  const { sectionRef, headerWrapRef, tabsWrapRef, setCardRef, setHovered } =
    useCardRevealAnimation({ progress, cardCount: MAX_CARDS });

  return (
    <div
      ref={sectionRef}
      className="w-full h-full flex flex-col items-center justify-center"
      style={{
        position: "absolute",
        inset: 0,
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
          <p
            className="text-section-label"
            style={{
              fontWeight: 400,
              lineHeight: "20px",
              color: "#9F7EE1",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              margin: 0,
            }}
          >
            {eyebrow}
          </p>
          <h2
            className="text-section-title"
            style={{
              lineHeight: "67.2px",
              color: "#070606",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "993px",
            height: "1px",
            background: "rgba(112, 112, 117, 0.3)",
            marginTop: "18px",
            marginBottom: "24px",
          }}
          aria-hidden="true"
        />
      </div>
      <div
        ref={tabsWrapRef}
        className="shrink-0 mb-8"
        style={{ opacity: 0, transition: "none" }}
      >
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onChange={(category) => setActiveCategory(category as Category)}
        />
      </div>

      <div
        className="w-full max-w-5xl min-h-0 z-4"
        style={{ perspective: "1200px" }}
      >
        <div
          className="grid grid-cols-3 grid-rows-2 gap-4 w-full"
          style={{
            opacity: gridVisible ? 1 : 0,
            transform: gridVisible ? "scale(1)" : "scale(0.98)",
            transition: `opacity ${CATEGORY_SWITCH_DURATION}ms ease, transform ${CATEGORY_SWITCH_DURATION}ms ease`,
          }}
        >
          {activeTemplates.map((tpl, i) => (
            <RevealGridCard
              key={tpl.id}
              image={tpl.image}
              name={tpl.name}
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
