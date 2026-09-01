import { useState, type Ref } from "react";
import {
  TABS_ENTER_DURATION_MS,
  TABS_ENTER_EASE,
  TABS_ENTER_STAGGER_MS,
} from "@/components/templates/templateGridReveal.constants";
import { CATEGORY_ICONS } from "@/components/templates/categoryIcons";

export interface CategoryTabItem {
  id:    string
  label: string
}

export interface CategoryTabsProps {
  categories:     readonly CategoryTabItem[]
  activeCategory: string
  onChange:       (category: string) => void
  /** Forwarded to the rail's root node so the scroll-driven fade below can animate it. */
  railRef?:       Ref<HTMLDivElement>
  /**
   * Fades the whole rail out whenever the Template section isn't on
   * screen at all (before scrolling to it, or after scrolling past it in
   * either direction) — the scroll-driven fade below only covers the
   * grid-settled/grid-exiting range *inside* the section, so without
   * this the rail could otherwise snap to its clamped scroll-progress
   * value the instant it's off-screen instead of fading. The rail is
   * `position: fixed`, so it stays mounted (and paintable) for the whole
   * page lifetime unless something gates it. Defaults to true so any
   * other consumer keeps today's behavior.
   */
  visible?:       boolean
  /**
   * Plays the one-shot cascading pop-in (each square, top to bottom)
   * when this flips to true — the "beautiful effect" layered on top of
   * the plain group fade above, only for the entrance. Owned by the
   * parent (TemplateSection), triggered once the section is entered.
   */
  revealed?:      boolean
}

const SQUARE = 56;
const PURPLE = "#5B2BB9";

const LABEL_FONT = '700 16px "Inter", sans-serif';
const LABEL_LEFT_MARGIN = 18;

// A character-count estimate doesn't hold across scripts (Cyrillic, accented
// Latin, ...) and clips labels whose glyphs run wider than Latin ones would.
// Measuring the actual rendered width keeps every language's pill sized
// correctly regardless of script or string length.
let measureCtx: CanvasRenderingContext2D | null | undefined;
const textWidthCache = new Map<string, number>();

function measureTextWidth(label: string): number {
  if (measureCtx === undefined) {
    measureCtx = typeof document === "undefined"
      ? null
      : document.createElement("canvas").getContext("2d");
  }
  if (!measureCtx) return label.length * 9;

  const cached = textWidthCache.get(label);
  if (cached !== undefined) return cached;

  measureCtx.font = LABEL_FONT;
  const width = measureCtx.measureText(label).width;
  textWidthCache.set(label, width);
  return width;
}

function openWidth(label: string): number {
  return SQUARE + LABEL_LEFT_MARGIN + Math.ceil(measureTextWidth(label)) + 2;
}

interface CategoryTabButtonProps {
  cat:      CategoryTabItem
  isActive: boolean
  onSelect: () => void
  /** This button's position in the rail — sets its entrance delay. */
  index:    number
  revealed: boolean
}

/**
 * A single 56x56 white square that expands into a purple pill on hover,
 * revealing the category title to the left of its (always-visible) icon.
 * Every square — including the active one — starts closed; only hovering
 * opens it.
 */
function CategoryTabButton({ cat, isActive, onSelect, index, revealed }: CategoryTabButtonProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = CATEGORY_ICONS[cat.id] ?? CATEGORY_ICONS.all;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'flex-end',
        alignSelf:      'flex-end',
        height:         SQUARE,
        width:          hovered ? openWidth(cat.label) : SQUARE,
        borderRadius:   '16px',
        border:         'none',
        padding:        0,
        cursor:         'pointer',
        overflow:       'hidden',
        background:     hovered || isActive ? PURPLE : '#FFFFFF',
        boxShadow:      '0 4px 14px rgba(0, 0, 0, 0.14)',
        // The one-shot pop-in (opacity/transform) gets its own duration,
        // bouncy ease and a per-index delay so squares cascade in top to
        // bottom; width/background-color keep the instant hover feel
        // untouched by that delay.
        opacity:        revealed ? 1 : 0,
        transform:      revealed ? 'none' : 'translateX(28px) scale(0.55) rotate(12deg)',
        transformOrigin: 'center right',
        transition:
          `width 0.3s ease, background-color 0.3s ease, ` +
          `opacity ${TABS_ENTER_DURATION_MS}ms ${TABS_ENTER_EASE} ${index * TABS_ENTER_STAGGER_MS}ms, ` +
          `transform ${TABS_ENTER_DURATION_MS}ms ${TABS_ENTER_EASE} ${index * TABS_ENTER_STAGGER_MS}ms`,
        WebkitTapHighlightColor: 'transparent',
        flexShrink:     0,
      }}
    >
      <span
        style={{
          marginLeft:  '18px',
          marginRight: 0,
          color:       '#FFFFFF',
          fontFamily:  'var(--font-body)',
          fontSize:    '16px',
          fontWeight:  700,
          whiteSpace:  'nowrap',
          opacity:     hovered ? 1 : 0,
          transition:  'opacity 0.2s ease',
        }}
      >
        {cat.label}
      </span>

      <span
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:          SQUARE,
          height:         SQUARE,
          flexShrink:     0,
        }}
      >
        <Icon
          size={20}
          strokeWidth={1.8}
          color={hovered || isActive ? '#FFFFFF' : PURPLE}
          style={{ transition: 'color 0.2s ease' }}
        />
      </span>
    </button>
  );
}

/**
 * Vertical rail of 7 category squares, docked to the right edge of the
 * Template section. Rendered as a normal (non-portaled) absolutely
 * positioned child inside the section, so it only ever appears there —
 * never over any other section of the page. Squares are right-aligned
 * (`alignItems: flex-end`) so hovering always grows a square leftward,
 * keeping every icon flush against the same right edge.
 */
export function CategoryTabs({ categories, activeCategory, onChange, railRef, visible = true, revealed = true }: CategoryTabsProps) {
  return (
    <div
      style={{
        position:       'fixed',
        top:            '55%',
        right:          '0',
        transform:      'translateY(-50%)',
        zIndex:         20,
        opacity:        visible ? 1 : 0,
        pointerEvents:  visible ? 'auto' : 'none',
        // The scroll-driven fade below (on `railRef`) only covers the
        // grid-settled/grid-exiting range *within* the section — outside
        // that range entirely (before the section, or after scrolling
        // past it either direction) it stays at whatever value scroll
        // progress happened to clamp to, with nothing to smoothly bring
        // it to 0. This outer layer is what actually fades the rail out
        // when leaving the section (any direction), instead of the old
        // hard `visibility` snap: `visibility` still does the real
        // hiding (so it can't linger interactive off-screen), just
        // delayed until *after* the opacity transition finishes fading
        // out, so the two together read as one smooth fade instead of a
        // cut. Fading in skips the delay so it becomes hit-testable
        // immediately.
        visibility:     visible ? 'visible' : 'hidden',
        transition:     visible
          ? 'opacity 400ms ease'
          : 'opacity 400ms ease, visibility 0ms 400ms',
      }}
    >
      <div
        ref={railRef}
        role="tablist"
        aria-label="Template categories"
        style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'flex-end',
          gap:            '4px',
          opacity:        0,
          pointerEvents:  'none',
        }}
      >
        {categories.map((cat, i) => (
          <CategoryTabButton
            key={cat.id}
            cat={cat}
            isActive={cat.id === activeCategory}
            onSelect={() => onChange(cat.id)}
            index={i}
            revealed={revealed}
          />
        ))}
      </div>
    </div>
  );
}

export default CategoryTabs
