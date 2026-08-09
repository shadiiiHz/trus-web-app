import type { CSSProperties } from "react";

interface SeeMoreLinkProps {
  label: string
  href: string
  /** Positions the link relative to whatever the caller wraps it in. */
  style?: CSSProperties
}

export function SeeMoreLink({ label, href, style }: SeeMoreLinkProps) {
  return (
    <a
      href={href}
      className="group text-body font-body font-medium text-[#9F7EE1] flex items-center justify-center gap-2 text-left leading-3.5 underline decoration-[#9F7EE1] underline-offset-6 decoration-0"
      style={style}
    >
      <span className="inline-flex">
        {label}
      </span>
    </a>
  );
}