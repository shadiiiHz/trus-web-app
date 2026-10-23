import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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
  const card = (
    <div
      data-service-card
      style={{
        width: fluid ? "100%" : `${width}px`,
        minWidth: fluid ? 0 : `${width}px`,
        height: fluid || height === undefined ? "auto" : `${height}px`,
        borderRadius: "16px",
        padding: "8px",
        background: dark ? "#000000" : "#FFFFFF",
        border: dark ? "1px solid rgba(255,255,255,0.3)" : "none",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          color: dark ? "#9F7EE1" : "#5B2BB9",
          width: fluid ? "43px" : "40px",
          height: fluid ? "43px" : "40px",
          flexShrink: 0,
          marginBottom: "5px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: fluid ? "clamp(15px, 4.2vw, 20px)" : "14px",
          lineHeight: fluid ? "1.3" : "100%",
          color: dark ? "#FFFFFF" : "#070606",
          margin: 0,
          letterSpacing: "-4%"
        }}
      >
        {title}
      </h3>

      <ul
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontSize: fluid ? "clamp(14px, 3.9vw, 18px)" : "14px",
          lineHeight: fluid ? "1.43" : "19px",
          color: dark ? "#BFBFBF" : "#5A5A5A",
          margin: 0,
          paddingLeft: fluid ? "24px" : "20px",
          listStyleType: "disc",
        }}
      >
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
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
