import { useState, type Ref } from "react";
import {
  Gavel,
  Scissors,
  Dumbbell,
  Home,
  type LucideIcon,
} from "lucide-react";
import {
  TABS_ENTER_DURATION_MS,
  TABS_ENTER_EASE,
  TABS_ENTER_STAGGER_MS,
} from "@/components/templates/templateGridReveal.constants";

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

/** Props shape lucide-react icons accept — matched here so custom SVGs are drop-in compatible. */
interface IconProps {
  size?:        number
  strokeWidth?: number
  color?:       string
  style?:       React.CSSProperties
}

/** Custom "all" icon (grid: top bar + two lower panels), not available in lucide-react. */
function AllIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M2.93103 1.5H21.069C21.5834 1.5 22 1.91664 22 2.43103V5.91377C22 6.42815 21.5834 6.8448 21.069 6.8448H2.93103C2.41665 6.8448 2 6.42815 2 5.91377V2.43103C2 1.91664 2.41665 1.5 2.93103 1.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M2.96212 9.77593H6.93453C7.1898 9.77593 7.43419 9.87757 7.61497 10.0576C7.79497 10.2384 7.89661 10.4827 7.89661 10.738V21.5379C7.89661 21.7932 7.79497 22.0376 7.61497 22.2184C7.43418 22.3984 7.1898 22.5 6.93453 22.5H2.96212C2.70685 22.5 2.46246 22.3984 2.28168 22.2184C2.10168 22.0376 2.00004 21.7932 2.00004 21.5379V10.738C2.00004 10.2065 2.43065 9.77593 2.96212 9.77593Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M12.1621 9.77593H20.9759C21.5415 9.77593 22 10.2344 22 10.8V21.4758C22 22.0414 21.5415 22.5 20.9759 22.5H12.1621C11.5965 22.5 11.138 22.0414 11.138 21.4758V10.8C11.138 10.2345 11.5965 9.77593 12.1621 9.77593Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

/** Custom restaurant icon (fork + knife), not available in lucide-react. */
function RestaurantIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M3 1.99927V8.99983C3 10.0999 3.9 11 5 11H9C9.53043 11 10.0391 10.7893 10.4142 10.4142C10.7893 10.0391 11 9.5303 11 8.99983V1.99927M7 1.99927V22.0009M21 15.0003V1.99927C19.6739 1.99927 18.4021 2.52609 17.4645 3.46385C16.5268 4.40161 16 5.67348 16 6.99967V13.0001C16 14.1002 16.9 15.0003 18 15.0003H21ZM21 15.0003V22.0009"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Custom clinic icon (house + plus), not available in lucide-react. */
function ClinicIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M3.18579 9.15746C3.06333 9.42137 2.99993 9.70882 3 9.99975V18.9997C3 19.5302 3.21071 20.0389 3.58579 20.414C3.96086 20.789 4.46957 20.9997 5 20.9997H19C19.5304 20.9997 20.0391 20.789 20.4142 20.414C20.7893 20.0389 21 19.5302 21 18.9997V9.99975C21.0001 9.70882 20.9367 9.42137 20.8142 9.15746C20.6918 8.89356 20.5132 8.65954 20.291 8.47175L13.291 2.47175C12.93 2.16666 12.4726 1.99927 12 1.99927C11.5274 1.99927 11.07 2.16666 10.709 2.47175L3.709 8.47175C3.4868 8.65954 3.30824 8.89356 3.18579 9.15746Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path d="M9 12H15M12 9V15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, LucideIcon | React.FC<IconProps>> = {
  all:         AllIcon,
  lawyers:     Gavel,
  restaurant:  RestaurantIcon,
  clinics:     ClinicIcon,
  barbershops: Scissors,
  fitness:     Dumbbell,
  realEstate:  Home,
};

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
  const Icon = CATEGORY_ICONS[cat.id] ?? AllIcon;

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
        background:     hovered ? PURPLE : '#FFFFFF',
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
          color={hovered ? '#FFFFFF' : '#000000'}
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
