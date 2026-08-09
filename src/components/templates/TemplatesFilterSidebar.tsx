import { Check } from "lucide-react";
import { CATEGORY_ICONS } from "@/components/templates/categoryIcons";

const PURPLE = "#9F7EE1";
const DIVIDER_COLOR = "rgba(112, 112, 117, 0.3)";

/** Search icon, per Figma spec — the lucide "Search" icon's geometry doesn't match. */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.5001 14.5001L11.2451 11.2451M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z"
        stroke="#707075"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Trash icon, per Figma spec — the lucide "Trash2" icon's geometry doesn't match. */
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9.83333 2.83352V11.0008C9.83333 11.3103 9.71042 11.6071 9.49162 11.8259C9.27283 12.0447 8.97609 12.1676 8.66667 12.1676H2.83333C2.52391 12.1676 2.22717 12.0447 2.00838 11.8259C1.78958 11.6071 1.66667 11.3103 1.66667 11.0008V2.83352M0.5 2.83352H11M3.41667 2.83352V1.66676C3.41667 1.35732 3.53958 1.06055 3.75838 0.841736C3.97717 0.622926 4.27391 0.5 4.58333 0.5H6.91667C7.22609 0.5 7.52283 0.622926 7.74162 0.841736C7.96042 1.06055 8.08333 1.35732 8.08333 1.66676V2.83352"
        stroke="#070606"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface CategoryFilterItem {
  id: string;
  label: string;
  count: number;
}

export interface TemplatesGalleryLabels {
  categoriesLabel: string;
  searchPlaceholder: string;
  styleLabel: string;
  featuresLabel: string;
  clearAllFilters: string;
  resultsFound: string;
  noResults: string;
  styleOptions: { dark: string; light: string };
  layoutOptions: { onePage: string; multiPage: string };
}

interface TemplatesFilterSidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categories: CategoryFilterItem[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  styleCounts: Record<"Light" | "Dark", number>;
  activeStyles: Set<"Light" | "Dark">;
  onToggleStyle: (style: "Light" | "Dark") => void;
  layoutCounts: Record<"One Page" | "Multi Page", number>;
  activeLayouts: Set<"One Page" | "Multi Page">;
  onToggleLayout: (layout: "One Page" | "Multi Page") => void;
  onClearAll: () => void;
  /** Sticks to the viewport while the page scrolls, offset below the fixed Navbar. */
  stickyTop: number;
  labels: TemplatesGalleryLabels;
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded"
      style={{
        border: checked ? "none" : "1.5px solid #d1d5db",
        background: checked ? "#936EDD" : "transparent",
      }}
    >
      {checked && <Check size={12} strokeWidth={3} color="#ffffff" />}
    </span>
  );
}

/** Hairline separator between sidebar sections, per design spec. */
function Divider() {
  return (
    <div
      aria-hidden="true"
      className="mb-3.5 mt-3 h-px"
      style={{ background: DIVIDER_COLOR }}
    />
  );
}

export default function TemplatesFilterSidebar({
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
  stickyTop,
  labels,
}: TemplatesFilterSidebarProps) {
  return (
    <aside
      className="w-[272px] shrink-0 self-start rounded-xl bg-white p-6"
      style={{
        position: "sticky",
        top: stickyTop,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <h3 className="font-hero text-body-sm font-bold tracking-wide text-[#070606]">
        {labels.categoriesLabel}
      </h3>

      <div className="relative mt-3">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] py-2 pr-3 pl-9 font-body text-[13px] text-[#111827] outline-none placeholder:text-[#707075] placeholder:text-body-sm placeholder:font-body focus:border-[#875dd9]"
        />
      </div>

      <nav
        className="mt-3 flex flex-col gap-1"
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
              className="flex items-center justify-between rounded-md px-3 py-2 text-left transition-colors text-body-sm"
              style={{
                background: isActive
                  ? "rgba(159, 126, 225, 0.2)"
                  : "transparent",
                color: isActive ? "#9F7EE1" : "#374151",
              }}
            >
              <span className="flex items-center gap-2.5 font-body text-[14px]">
                {Icon && <Icon size={13} strokeWidth={1.8} color={PURPLE} />}
                <span
                  style={{ fontWeight: isActive ? 700 : 400 }}
                  className="font-medium"
                >
                  {cat.label}
                </span>
              </span>
              <span className="font-body text-label text-[#707075] font-normal">
                {cat.count}
              </span>
            </button>
          );
        })}
      </nav>

      <Divider />

      <h3 className="font-hero text-body-sm font-bold tracking-wide text-[#070606]">
        {labels.styleLabel}
      </h3>
      <div className="mt-3 flex flex-col gap-2.5">
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
            className="flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2.5 font-body text-body-sm text-[#070606]">
              <Checkbox checked={activeStyles.has(style)} />
              {styleLabel}
            </span>
            <span className="font-body text-[13px] text-[#707075] font-normal">
              {styleCounts[style]}
            </span>
          </button>
        ))}
      </div>

      <h3 className="mt-6 font-hero text-body-sm font-bold tracking-wide text-[#070606]">
        {labels.featuresLabel}
      </h3>
      <div className="mt-3 flex flex-col gap-2.5">
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
            className="flex items-center justify-between text-left"
          >
            <span className="flex items-center gap-2.5 font-body text-body-sm text-[#070606]">
              <Checkbox checked={activeLayouts.has(layout)} />
              {layoutLabel}
            </span>
            <span className="font-body text-[13px] text-[#707075]">
              {layoutCounts[layout]}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClearAll}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md border border-[#70707533] py-2.5 font-body text-body-sm font-bold text-[#070606] transition-colors hover:bg-[#f9fafb]"
      >
        <TrashIcon />
        {labels.clearAllFilters}
      </button>
    </aside>
  );
}
