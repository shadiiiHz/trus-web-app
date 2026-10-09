import { useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/templates/categoryIcons";
import {
  SearchIcon,
  TrashIcon,
  type TemplatesFilterSidebarProps,
} from "@/components/templates/TemplatesFilterSidebar";

const PURPLE = "#5B2BB9";
const ACTIVE_BG = "#EDE8F7";

type TemplatesFilterMobileProps = Omit<TemplatesFilterSidebarProps, "stickyTop">;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px]"
      style={
        checked
          ? { background: PURPLE }
          : { border: "1.5px solid #D1D5DB", background: "#fff" }
      }
    >
      {checked && <Check size={12} strokeWidth={3} color="#fff" />}
    </span>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="m-0 font-hero text-[14px] leading-5 font-bold uppercase tracking-[0.01em] text-gallery-ink">
      {children}
    </h3>
  );
}

/**
 * Mobile / tablet filter — a collapsible "Categories" card (search, category
 * list, style + feature checkboxes, clear-all). Replaces the desktop's sticky
 * side rail below the `lg` breakpoint.
 */
export default function TemplatesFilterMobile({
  search,
  onSearchChange,
  categories,
  activeCategory,
  onCategoryChange,
  styleCounts,
  activeStyles,
  onToggleStyle,
  layoutCounts,
  activeLayouts,
  onToggleLayout,
  onClearAll,
  labels,
}: TemplatesFilterMobileProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div
      className="overflow-hidden bg-white"
      style={{ borderRadius: 16, border: "1px solid rgba(112, 112, 117, 0.3)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex h-[58px] w-full cursor-pointer items-center justify-between border-0 bg-transparent px-4"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="font-hero text-[14px] font-bold uppercase tracking-[0.01em] text-gallery-ink">
          {labels.categoriesLabel}
        </span>
        <ChevronDown
          size={22}
          strokeWidth={2.2}
          color="var(--color-gallery-ink)"
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.25s ease",
          }}
        />
      </button>

      {/* grid-rows 0fr → 1fr animates the panel's natural height. */}
      <div
        id={panelId}
        className="grid"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.3s ease",
        }}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className="px-4 pb-4">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={labels.searchPlaceholder}
                aria-label={labels.searchPlaceholder}
                className="h-[38px] w-full rounded-[10px] border-0 bg-[#F4F4F5] pr-3 pl-10 font-body text-[15px] text-gallery-text outline-none placeholder:text-gallery-muted"
              />
            </div>

            <nav
              className="mt-4 flex flex-col"
              aria-label="Template categories"
            >
              {categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                const isActive = cat.id === activeCategory;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    aria-pressed={isActive}
                    className="flex h-10 cursor-pointer items-center justify-between rounded-[10px] border-0 px-2.5 text-left"
                    style={{
                      background: isActive ? ACTIVE_BG : "transparent",
                      color: isActive ? PURPLE : "var(--color-gallery-ink)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span className="flex items-center gap-2 font-body text-[15px]">
                      {Icon && <Icon size={14} strokeWidth={1.8} color={PURPLE} />}
                      <span className={isActive ? "font-bold" : "font-normal"}>
                        {cat.label}
                      </span>
                    </span>
                    <span className="font-body text-[14px] font-normal text-gallery-muted">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div aria-hidden="true" className="mt-2 h-px bg-[#E2E2E5]" />

            <div className="mt-2.5">
              <SectionTitle>{labels.styleLabel}</SectionTitle>
            </div>
            <div className="mt-1.5 flex flex-col">
              {(
                [
                  ["Dark", labels.styleOptions.dark],
                  ["Light", labels.styleOptions.light],
                ] as const
              ).map(([style, styleLabel]) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onToggleStyle(style)}
                  aria-pressed={activeStyles.has(style)}
                  className="flex h-[30px] cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                >
                  <span className="flex items-center gap-2.5 font-body text-[15px] text-gallery-ink">
                    <Checkbox checked={activeStyles.has(style)} />
                    {styleLabel}
                  </span>
                  <span className="font-body text-[14px] text-gallery-muted">
                    {styleCounts[style]}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3">
              <SectionTitle>{labels.featuresLabel}</SectionTitle>
            </div>
            <div className="mt-1.5 flex flex-col">
              {(
                [
                  ["One Page", labels.layoutOptions.onePage],
                  ["Multi Page", labels.layoutOptions.multiPage],
                ] as const
              ).map(([layout, layoutLabel]) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onToggleLayout(layout)}
                  aria-pressed={activeLayouts.has(layout)}
                  className="flex h-[30px] cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                >
                  <span className="flex items-center gap-2.5 font-body text-[15px] text-gallery-ink">
                    <Checkbox checked={activeLayouts.has(layout)} />
                    {layoutLabel}
                  </span>
                  <span className="font-body text-[14px] text-gallery-muted">
                    {layoutCounts[layout]}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClearAll}
              className="mt-4 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-white font-body text-[14px] font-bold text-gallery-ink"
              style={{ border: "1px solid #DCDCDF" }}
            >
              <TrashIcon />
              {labels.clearAllFilters}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
