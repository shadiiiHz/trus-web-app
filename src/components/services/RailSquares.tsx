import { useState, type ReactNode } from "react";
import {
  TABS_ENTER_DURATION_MS,
  TABS_ENTER_EASE,
  TABS_ENTER_STAGGER_MS,
} from "@/components/templates/templateGridReveal.constants";

/**
 * Pieces shared by the right-edge rails of the services pages (`ServicesRail`, `SocialServicesRail`): white 56×56
 * squares that open into a purple pill with the title on hover, and a fixed column that pops them in and out.
 */

const SQUARE = 56;
const PURPLE = "#5B2BB9";
const LABEL_FONT = '700 16px "Inter", sans-serif';
// Figma pill: 16px padding, title, 12px gap, 24px icon, 16px padding. The 56px icon cell already holds 16px on each side of the icon.
const LABEL_LEFT_MARGIN = 16;
const LABEL_ICON_OVERLAP = -4;

// Measuring the rendered text keeps every language's pill sized to its title.
let measureCtx: CanvasRenderingContext2D | null | undefined;
function openWidth(label: string): number {
  if (measureCtx === undefined) measureCtx = document.createElement("canvas").getContext("2d");
  let text = label.length * 9;
  if (measureCtx) {
    measureCtx.font = LABEL_FONT;
    text = measureCtx.measureText(label).width;
  }
  return LABEL_LEFT_MARGIN + Math.ceil(text) + 12 + 24 + 16;
}

export function RailButton({
  label,
  icon,
  isActive = false,
  index,
  revealed,
  onSelect,
}: {
  label: string;
  icon: ReactNode;
  /** Keeps the purple tint (never opens by itself). */
  isActive?: boolean;
  /** Position in the rail: sets the entrance delay, so the squares cascade top to bottom. */
  index: number;
  /** Plays the pop-in (and its reverse) when the rail enters or leaves. */
  revealed: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  // Every square starts closed and opens only on hover.
  const tinted = hovered || isActive;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      aria-current={isActive ? "true" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        alignSelf: "flex-end",
        flexShrink: 0,
        height: SQUARE,
        width: hovered ? openWidth(label) : SQUARE,
        padding: 0,
        border: "none",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        background: tinted ? PURPLE : "#FFFFFF",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.14)",
        // Same pop-in as the template category squares: each square slides, scales and rotates in with a per-index delay.
        opacity: revealed ? 1 : 0,
        transform: revealed ? "none" : "translateX(28px) scale(0.55) rotate(12deg)",
        transformOrigin: "center right",
        transition:
          `width 0.3s ease, background-color 0.3s ease, ` +
          `opacity ${TABS_ENTER_DURATION_MS}ms ${TABS_ENTER_EASE} ${index * TABS_ENTER_STAGGER_MS}ms, ` +
          `transform ${TABS_ENTER_DURATION_MS}ms ${TABS_ENTER_EASE} ${index * TABS_ENTER_STAGGER_MS}ms`,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          marginLeft: LABEL_LEFT_MARGIN,
          marginRight: LABEL_ICON_OVERLAP,
          lineHeight: "19px",
          color: "#FFFFFF",
          fontFamily: "var(--font-body)",
          fontSize: 16,
          fontWeight: 700,
          whiteSpace: "nowrap",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: SQUARE,
          height: SQUARE,
          flexShrink: 0,
          color: tinted ? "#FFFFFF" : PURPLE,
          transition: "color 0.2s ease",
        }}
      >
        {icon}
      </span>
    </button>
  );
}

/** Fixed column on the right edge holding the squares; hides itself (and its clicks) once the last one has left. */
export function RailColumn({
  label,
  visible,
  count,
  children,
}: {
  label: string;
  visible: boolean;
  count: number;
  children: ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      style={{
        position: "fixed",
        top: "55%",
        right: 4,
        transform: "translateY(-50%)",
        zIndex: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        pointerEvents: visible ? "auto" : "none",
        visibility: visible ? "visible" : "hidden",
        transition: visible ? "none" : `visibility 0ms ${TABS_ENTER_DURATION_MS + (count - 1) * TABS_ENTER_STAGGER_MS}ms`,
      }}
    >
      {children}
    </nav>
  );
}
