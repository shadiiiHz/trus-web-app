import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCardHoverWave } from "@/components/services/useCardHoverWave";

interface ServiceCardProps {
  icon: ReactNode;
  title: string;
  bullets: string[];
  /** Fill the parent's width and hug content (mobile carousel slide). */
  fluid?: boolean;
  /** Dark outlined variant (mobile carousel, alternating). */
  dark?: boolean;
  /** Desktop only: explicit card width in px (viewport-scaled by the section). */
  width?: number;
  /** Link the whole card to a service detail page. */
  href?: string;
  /** Desktop only: explicit height in px (tallest card of the set); hugs content when omitted. */
  height?: number;
}

export function ServiceCard({
  icon,
  title,
  bullets,
  fluid = false,
  dark = false,
  width = 305,
  href,
  height,
}: ServiceCardProps) {
  // Every Figma metric (designed at a 305px card) scales with the card width.
  const s = fluid ? 1 : width / 305;
  const cardRef = useRef<HTMLDivElement>(null);
  useCardHoverWave(cardRef);

  const card = (
    <div
      ref={cardRef}
      data-service-card
      style={{
        width: fluid ? "100%" : `${width}px`,
        minWidth: fluid ? 0 : `${width}px`,
        height: "auto",
        minHeight: fluid || height === undefined ? undefined : `${height}px`,
        borderRadius: `${16 * s}px`,
        padding: `${12 * s}px`,
        background: dark ? "#000000" : "#FFFFFF",
        border: dark ? "1px solid rgba(255,255,255,0.3)" : "none",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: `${8 * s}px`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          color: dark ? "#9F7EE1" : "#5B2BB9",
          width: `${38 * s}px`,
          height: `${38 * s}px`,
          flexShrink: 0,
          marginBottom: 0,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          alignSelf: "stretch",
          gap: `${4 * s}px`,
        }}
      >
      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: `${13.5 * s}px`,
          lineHeight: `${16 * s}px`,
          color: dark ? "#FFFFFF" : "#070606",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>

      <ul
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: `${13 * s}px`,
          lineHeight: `${18 * s}px`,
          color: dark ? "#BFBFBF" : "#5A5A5A",
          margin: 0,
          paddingLeft: `${18 * s}px`,
          listStyleType: "disc",
        }}
      >
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      </div>
    </div>
  );

  if (!href) return card;
  return (
    <Link
      to={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={title}
      style={{ display: "flex", flexShrink: 0, width: fluid ? "100%" : undefined, color: "inherit", textDecoration: "none" }}
    >
      {card}
    </Link>
  );
}
