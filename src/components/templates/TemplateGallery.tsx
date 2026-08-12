import { useMemo, useState } from "react";
import { siteConfig } from "@/config/site.config";
import TemplatesFilterSidebar from "@/components/templates/TemplatesFilterSidebar";
import TemplateGalleryCard from "@/components/templates/TemplateGalleryCard";

/** Fixed Navbar height (h-18, see Navbar.tsx) + breathing room above the sidebar while it's pinned. */
const SIDEBAR_STICKY_TOP = 72 + 24;

type StyleFilter = "Light" | "Dark";
type LayoutFilter = "One Page" | "Multi Page";

export default function TemplatesGallery() {
  const { categories, templates } = siteConfig.templateCategories;
  const gallery = siteConfig.templatesPage.gallery;

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeStyles, setActiveStyles] = useState<Set<StyleFilter>>(new Set());
  const [activeLayouts, setActiveLayouts] = useState<Set<LayoutFilter>>(new Set());
  const [search, setSearch] = useState("");

  const categoryLabelById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.label])),
    [categories],
  );

  // `templates.all` is the Home page ribbon's own curated order (see
  // site.config.ts) — the gallery's "All Templates" view and facet counts
  // use `templates.galleryAll` instead, which matches the Figma order and
  // is the complete 9-template inventory.
  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        label: cat.label,
        count: (
          cat.id === "all" ? templates.galleryAll : templates[cat.id]
        )?.length ?? templates.galleryAll.length,
      })),
    [categories, templates],
  );

  const styleCounts = useMemo(
    () => ({
      Dark: templates.galleryAll.filter((t) => t.style === "Dark").length,
      Light: templates.galleryAll.filter((t) => t.style === "Light").length,
    }),
    [templates],
  );

  const layoutCounts = useMemo(
    () => ({
      "One Page": templates.galleryAll.filter((t) => t.layout === "One Page")
        .length,
      "Multi Page": templates.galleryAll.filter(
        (t) => t.layout === "Multi Page",
      ).length,
    }),
    [templates],
  );

  const results = useMemo(() => {
    const pool =
      activeCategory === "all"
        ? templates.galleryAll
        : (templates[activeCategory] ?? templates.galleryAll);
    const query = search.trim().toLowerCase();

    return pool.filter(
      (tpl) =>
        (activeStyles.size === 0 || activeStyles.has(tpl.style)) &&
        (activeLayouts.size === 0 || activeLayouts.has(tpl.layout)) &&
        (query === "" || tpl.name.toLowerCase().includes(query)),
    );
  }, [templates, activeCategory, activeStyles, activeLayouts, search]);

  const toggleInSet = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const handleClearAll = () => {
    setActiveCategory("all");
    setActiveStyles(new Set());
    setActiveLayouts(new Set());
    setSearch("");
  };

  return (
    <section className="bg-gallery-bg py-12">
      {/* max-w-330 + px-5 together (not split across section/div) mirrors the
          Navbar's own `nav` element exactly, so this row's left/right content
          edges land on the same x-coordinates as the logo and the Login
          button — critical for the results grid's rightmost card to line up
          with the Login button's right edge below. */}
      <div className="mx-auto flex max-w-330 items-start gap-5 px-5">
        <TemplatesFilterSidebar
          search={search}
          onSearchChange={setSearch}
          categories={categoryOptions}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          styleCounts={styleCounts}
          activeStyles={activeStyles}
          onToggleStyle={(style) =>
            setActiveStyles((prev) => toggleInSet(prev, style))
          }
          layoutCounts={layoutCounts}
          activeLayouts={activeLayouts}
          onToggleLayout={(layout) =>
            setActiveLayouts((prev) => toggleInSet(prev, layout))
          }
          onClearAll={handleClearAll}
          stickyTop={SIDEBAR_STICKY_TOP}
          labels={gallery}
        />

        <div className="min-w-0 flex-1">
          <p className="mb-5 font-body text-body text-gallery-muted">
            {gallery.resultsFound.replace("{count}", String(results.length))}
          </p>

          {results.length > 0 ? (
            <div
              className="grid gap-x-5 gap-y-8"
              // Fixed 305px columns, per design spec (see TemplateGalleryCard).
              style={{ gridTemplateColumns: "repeat(3, 305px)" }}
            >
              {results.map((tpl) => (
                <TemplateGalleryCard
                  key={tpl.link}
                  image={tpl.image}
                  link={tpl.link}
                  name={tpl.name}
                  style={tpl.style}
                  layoutLabel={
                    tpl.layout === "One Page"
                      ? gallery.layoutOptions.onePage
                      : gallery.layoutOptions.multiPage
                  }
                  categoryLabel={
                    categoryLabelById.get(tpl.categoryId) ?? "Templates"
                  }
                />
              ))}
            </div>
          ) : (
            <p className="font-body text-[14px] text-gallery-subtle">
              {gallery.noResults}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
