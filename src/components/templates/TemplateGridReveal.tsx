import { useMemo, type Ref } from "react";
import RevealGridCard from "@/components/templates/RevealGridCard";
import { SeeMoreLink } from "@/components/templates/SeeMore";
import { siteConfig } from "@/config/site.config";
import {
  CATEGORY_SWITCH_DURATION,
  MAX_CARDS,
} from "@/components/templates/templateGridReveal.constants";

export type Category = typeof siteConfig.templateCategories.categories[number]["id"];

interface TemplateGridRevealProps {
  seeMore?: {
    label: string;
    href: string;
  };
  /** Which category's cards to actually show — see useCategoryCrossfade. */
  displayedCategory: Category;
  gridVisible: boolean;
  sectionRef: Ref<HTMLDivElement>;
  headerWrapRef: Ref<HTMLDivElement>;
  setCardRef: (i: number) => (el: HTMLDivElement | null) => void;
  setHovered: (i: number | null) => void;
}

export default function TemplateGridReveal({
  seeMore,
  displayedCategory,
  gridVisible,
  sectionRef,
  headerWrapRef,
  setCardRef,
  setHovered,
}: TemplateGridRevealProps) {
  const { templates, heading } = siteConfig.templateCategories;

  // The cards to actually render, based on `displayedCategory` (not the
  // just-clicked `activeCategory`) so content only changes while hidden.
  const activeTemplates = useMemo(() => {
    return (templates[displayedCategory] ?? templates.all ?? []).slice(
      0,
      MAX_CARDS,
    );
  }, [displayedCategory, templates]);

  return (
    <div
      ref={sectionRef}
      className="w-full h-screen flex flex-col items-center justify-center pt-20"
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
              marginBottom: "25px",
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h2>
        </div>
      </div>

      <div className="min-h-0 z-4" style={{ perspective: "1200px", position: "relative" }}>
        {/*
          Deliberately rendered as a sibling of the crossfading grid below,
          not inside it — it used to live inside that div and fade out/in
          on every category switch along with the cards, even though "see
          more" has nothing to do with which category is showing. Sitting
          here instead means it stays fully visible across switches, while
          still anchoring to the same (fixed-size) grid box: this wrapper
          sizes itself to that box since the grid is its only layout
          child, so "bottom: calc(100% + 24px)" / "right: 0" land in
          exactly the same spot as before — flush above the top-right
          card's right edge, never drifting as the screen gets wider.
        */}
        {seeMore && (
          <SeeMoreLink
            label={seeMore.label}
            href={seeMore.href}
            style={{
              position: "absolute",
              right: 0,
              bottom: "calc(100% + 24px)",
              zIndex: 2,
            }}
          />
        )}
        <div
          className="grid gap-5"
          style={{
            position: "relative",
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
