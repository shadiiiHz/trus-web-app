import { useEffect } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/config/site.config";
import { CATEGORY_ICONS } from "@/components/templates/categoryIcons";
import { useCategoryCrossfade } from "@/components/templates/useCategoryCrossfade";
import { delay, preloadImages } from "@/components/templates/imagePreload";

const PURPLE = "#5B2BB9";
const CARD_COUNT = 6;

/**
 * Mobile / tablet Template Categories — category icon tiles above a 2-column
 * grid of six templates, with a link through to the full gallery. Replaces the
 * desktop's pinned 3D ribbon and docked side rail.
 */
export default function TemplatesMobile({ onReady }: { onReady?: () => void }) {
  const { heading, categories, templates, seeMore } =
    siteConfig.templateCategories;
  const { activeCategory, setActiveCategory, displayedCategory, gridVisible } =
    useCategoryCrossfade<string>(templates, "all");

  const activeLabel =
    categories.find((c) => c.id === activeCategory)?.label ?? "";
  const categoryHref =
    activeCategory === "all"
      ? seeMore.href
      : `${seeMore.href}?category=${encodeURIComponent(activeCategory)}`;

  const cards = (templates[displayedCategory] ?? templates.all ?? []).slice(
    0,
    CARD_COUNT,
  );

  // Gate the page preloader on the first grid being decoded (capped so a
  // slow image can never hold the loader).
  useEffect(() => {
    const first = (templates.all ?? []).slice(0, CARD_COUNT).map((t) => t.image);
    Promise.race([preloadImages(first), delay(4000)]).then(() => onReady?.());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      id="templates"
      aria-label="Template Categories"
      className="relative overflow-hidden"
      style={{ background: "#E3E3E3" }}
    >
      <div
        className="mx-auto w-full max-w-330 px-5"
        style={{
          paddingTop: "clamp(48px, 14vw, 88px)",
          paddingBottom: "clamp(48px, 14.6vw, 80px)",
        }}
      >
        <h2
          className="font-hero font-bold text-center m-0"
          style={{
            fontSize: "clamp(26px, 6.9vw, 38px)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "#070606",
          }}
        >
          {heading}
        </h2>

        {/* Category tiles */}
        <div
          role="tablist"
          aria-label="Template categories"
          className="flex justify-between"
          style={{ marginTop: "clamp(24px, 7vw, 40px)", gap: 6 }}
        >
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] ?? CATEGORY_ICONS.all;
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={cat.label}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center justify-center border-0 p-0 cursor-pointer"
                style={{
                  flex: "1 1 0",
                  maxWidth: 64,
                  aspectRatio: "1 / 1",
                  borderRadius: "clamp(12px, 3.6vw, 18px)",
                  background: isActive ? PURPLE : "#FFFFFF",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  transition: "background-color 0.25s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <Icon
                  size={24}
                  strokeWidth={1.8}
                  color={isActive ? "#FFFFFF" : PURPLE}
                />
              </button>
            );
          })}
        </div>

        {/* Active category name, left-aligned under the tabs. "All Templates"
            always links to the unfiltered gallery; other categories link to
            the gallery pre-filtered to that category. */}
        <div
          className="flex items-center justify-between"
          style={{ marginTop: "clamp(8px, 2.5vw, 12px)" }}
        >
          <Link
            to={categoryHref}
            className="font-body font-semibold"
            style={{ fontSize: "clamp(15px, 3.7vw, 19px)", color: PURPLE }}
          >
            {activeLabel}
          </Link>
          {/* Always the unfiltered gallery, whatever category is active. */}
          <Link
            to={seeMore.href}
            className="font-body font-semibold underline underline-offset-4"
            style={{ fontSize: "clamp(15px, 3.7vw, 19px)", color: PURPLE }}
          >
            {seeMore.label}
          </Link>
        </div>

        {/* Template grid */}
        <div
          className="grid grid-cols-2"
          style={{
            columnGap: "clamp(10px, 3.1vw, 16px)",
            rowGap: "clamp(12px, 3.6vw, 18px)",
            marginTop: "clamp(20px, 6vw, 32px)",
            opacity: gridVisible ? 1 : 0,
            transition: "opacity 0.25s ease",
          }}
        >
          {Array.from({ length: CARD_COUNT }, (_, i) => cards[i]).map((t, i) =>
            !t ? (
              // Empty slot — keeps the grid at its full six-card height when a
              // category has fewer templates, so the section never shrinks.
              <div
                key={`empty-${i}`}
                aria-hidden="true"
                style={{ aspectRatio: "195 / 142", visibility: "hidden" }}
              />
            ) : (
            <a
              key={t.id}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden bg-[#111]"
              style={{
                aspectRatio: "195 / 142",
                borderRadius: "4.42px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
              }}
            >
              <img
                src={t.image}
                alt={t.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover block"
              />
            </a>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
