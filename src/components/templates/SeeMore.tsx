import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

interface SeeMoreLinkProps {
  label: string
  href: string
  /** Positions the link relative to whatever the caller wraps it in. */
  style?: CSSProperties
}

const linkClassName =
  "group text-body font-body font-medium text-[#9F7EE1] flex items-center justify-center gap-2 text-left leading-3.5 underline decoration-[#9F7EE1] underline-offset-6 decoration-0";

export function SeeMoreLink({ label, href, style }: SeeMoreLinkProps) {
  // Path links (e.g. "/templates") navigate to a route in a new tab;
  // anything else (e.g. "#") falls back to a plain anchor.
  if (href.startsWith("/")) {
    return (
      <Link
        to={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        style={style}
      >
        <span className="inline-flex">{label}</span>
      </Link>
    );
  }

  return (
    <a href={href} className={linkClassName} style={style}>
      <span className="inline-flex">{label}</span>
    </a>
  );
}