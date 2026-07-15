/**
 * FooterSection — no Crystal T dependencies.
 *
 * Layout hierarchy (top → bottom):
 *   1. Large TRUS background word  — block element, HORIZONTALLY CENTERED,
 *                                     with a top-darker linear-gradient overlay.
 *                                     Pulled up with a negative bottom margin so
 *                                     its lower portion sits UNDER the column grid.
 *   2. Content grid                 — Company | Legal | Contact Us
 *                                     Desktop/tablet (sm and up): 3 columns, one row,
 *                                     in this order (Company first, Contact Us last).
 *                                     Mobile (< sm): STACKS into a single column,
 *                                     Company → Legal → Contact Us top to bottom.
 *   3. Divider
 *   4. Bottom bar                  — copyright (dynamic year) + social icon links
 *
 * Typography:
 *   Column titles → DM Sans 700 (var(--font-hero))
 *   Everything else → Inter 400 (var(--font-body))
 *
 * TRUS sizing:
 *   font-size: clamp(60px, 11.5vw, 165px)
 *   At 1440 px viewport → fontSize ≈ 165 px → TRUS word ≈ 450 px wide
 *   Controlled by `fontSize` on the motion.span inside #footer-trus-block
 *   Wrapped in a flex container (justify-content:center) so the logo sits
 *   centered horizontally regardless of viewport width.
 *
 * TRUS overlap with columns:
 *   #footer-trus-block has a negative marginBottom (-23px) which pulls the
 *   column grid up so it visually overlaps the bottom of the TRUS logo —
 *   the logo now dips slightly UNDER the column content instead of sitting
 *   fully above it. The column grid section is a later sibling in normal
 *   flow, so it paints on top of the overlapped area automatically (no
 *   z-index needed). Adjust the value to control how much overlap.
 *
 * TRUS overlay:
 *   A relative wrapper hugs the image exactly (display:inline-block) so the
 *   gradient overlay matches the logo's bounds instead of the full row width.
 *   Gradient: linear-gradient(to bottom, #070606 0%, #07060699 30%, #0706061A 50%)
 *   → darkest at the top, fading toward the bottom (lighter/less opaque).
 *
 * TRUS scroll fade:
 *   Starts at opacity 0.03 (dim / inactive).
 *   Fades to 0.16 when the footer enters view (useInView, once:false).
 *   Transition: 1.8 s easeInOut — premium "turning on" feel.
 *   Resets on scroll out so re-entry re-plays the fade.
 *
 * Column row / mobile stacking:
 *   `grid-cols-1 sm:grid-cols-3` — below the `sm` breakpoint (640px) the grid
 *   is a single column, so Company, Legal, and Contact Us each take their own
 *   full-width row, stacked top to bottom in that order. At `sm` and above it
 *   becomes a fixed 3-column row (never wraps), Company at the start, Contact
 *   Us at the end, Legal in the middle.
 *
 * Link hover behavior (Company / Legal / Contact Us):
 *   All links share the FooterLink component — on hover, text turns solid
 *   white and a white underline sweeps in left → right, sized to the TEXT
 *   itself (not the full column width) via `alignSelf: "flex-start"`.
 *
 * Social icons:
 *   `social.icon` in siteConfig must be a real `import`ed asset (see
 *   site.config.ts) — a plain string path like "@/assets/facebook.svg" is
 *   never resolved by the bundler and 404s when used as an <img src>.
 *
 * T journey: fully removed. Will be redesigned from scratch later.
 */

import { useRef } from "react";
import { siteConfig } from "@/config/site.config";
import trusLogo from "@/assets/footer-logo.svg";

// Shared style tokens

/** DM Sans Bold — used for all column section titles */
const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-hero)", // DM Sans
  fontSize: "16px",
  fontWeight: 700,
  color: "#FFFFFF",
  letterSpacing: "0.09em",
  lineHeight: "100%",
  margin: "0 0 24px 0",
};

/** Inter Regular — used for all body-level text in the footer */
const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", // Inter
  fontWeight: 400,
  lineHeight: "100%",
};

const FOOTER_LINK_COLOR = "rgba(191, 191, 191, 1)";

/**
 * Underline sweeps left → right on hover — same pattern as Navbar NavLink.
 * On hover: text turns solid white + underline sweeps in (also white),
 * sized to the text width only.
 * Used for every link in the Company / Legal / Contact Us columns.
 */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative inline-block"
      style={{
        ...bodyStyle,
        fontSize: "14px",
        color: FOOTER_LINK_COLOR,
        textDecoration: "none",
        transition: "color 0.2s ease",
        alignSelf: "flex-start", // prevents stretching when parent is a flex column
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = "#FFFFFF";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.color = FOOTER_LINK_COLOR;
      }}
    >
      {label}
      <span
        className="absolute -bottom-0.5 left-0 h-px rounded-full w-0 group-hover:w-full"
        style={{ background: "#FFFFFF" }}
        aria-hidden="true"
      />
    </a>
  );
}

export function FooterSection() {
  const { footer } = siteConfig;

  // TRUS fade-in: triggers when the footer enters the viewport.
  // once:false so re-entry re-plays the "turning on" effect.
  const footerRef = useRef<HTMLElement>(null);

  return (
    <footer id="footer" ref={footerRef} style={{ background: "#000000" }}>
      <div
        id="footer-trus-block"
        aria-hidden="true"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginBottom: "-23px", // pulls the column grid up so the logo dips under it
        }}
      >
        <div style={{ position: "relative", display: "inline-block" }}>
          <img src={trusLogo} style={{ display: "block", margin: "0 auto" }} />
          {/* Top-darker gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, #070606 0%, #07060699 30%, #0706061A 50%)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* 2. Footer content — later in DOM order, so it naturally paints on
          top of the overlapped part of the logo above. */}
      <div
        className="mx-auto w-full max-w-300 px-5 relative"
        style={{ paddingBottom: "60px" }}
      >
        {/* Mobile (< sm): 1 column, stacked Company → Legal → Contact Us.
            sm and up: fixed 3-column row that never wraps —
            Company (start) | Legal (middle) | Contact Us (end) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 md:gap-36">
          {/* Company */}
          <div>
            <h4 style={titleStyle}>{footer.firstColumn}</h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {footer.company.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={titleStyle}>{footer.secondColumn}</h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {footer.legal.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 style={titleStyle}>{footer.thirdColumn}</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <FooterLink
                href={`mailto:${footer.contact.email}`}
                label={footer.contact.email}
              />
              <FooterLink
                href={`tel:${footer.contact.phone}`}
                label={footer.contact.phone}
              />
              <p
                style={{
                  ...bodyStyle,
                  fontSize: "14px",
                  color: FOOTER_LINK_COLOR,
                  margin: 0,
                  whiteSpace: "pre-line",
                }}
              >
                {footer.contact.address}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #FFFFFF4D",
            margin: "23px 0 12px",
          }}
        />

        {/* 4. Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          {/* Copyright — year is dynamic, never hardcoded */}
          <p
            style={{
              ...bodyStyle,
              fontSize: "14px",
              color: FOOTER_LINK_COLOR,
              margin: 0,
            }}
          >
            © {new Date().getFullYear()} TruS. All rights reserved.
          </p>

          {/* Social icon links */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {footer.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={social.icon}
                  alt={social.label}
                  style={{ width: "30px", height: "30px", display: "block" }}
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
