/**
 * FooterSection — no Crystal T dependencies.
 *
 * Layout hierarchy (top → bottom):
 *   1. Content row          — Left: logo + tagline + social icons (single column).
 *                             Right: Services | Company | Contact Us
 *                             Desktop/tablet (sm and up): 3 columns, one row,
 *                             in this order (Services first, Contact Us last).
 *                             Mobile (< sm): STACKS into a single column.
 *   2. Divider
 *   3. Bottom bar           — copyright (dynamic year) on the left,
 *                             Privacy Policy • Terms & Conditions • Powered by
 *                             Trust AI on the right.
 *
 * Typography:
 *   Column titles → DM Sans 700 (var(--font-hero))
 *   Everything else → Inter 400 (var(--font-body))
 *
 * Link hover behavior (Services / Company / Contact Us / bottom links):
 *   All links share the FooterLink component — on hover, text turns solid
 *   white and a white underline sweeps in left → right, sized to the TEXT
 *   itself (not the full column width) via `alignSelf: "flex-start"`.
 *
 * Social icons:
 *   `social.icon` in siteConfig must be a real `import`ed asset (see
 *   site.config.ts) — a plain string path like "@/assets/facebook.svg" is
 *   never resolved by the bundler and 404s when used as an <img src>.
 */

import { siteConfig } from "@/config/site.config";
import trusLogo from "@/assets/logo.svg";

// Shared style tokens

/** DM Sans Bold — used for all column section titles */
const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-hero)", // DM Sans
  fontSize: "16px",
  fontWeight: 700,
  color: "#FFFFFF",
  letterSpacing: "0.09em",
  lineHeight: "100%",
  margin: "0 0 14px 0",
};

/** Inter Regular — used for all body-level text in the footer */
const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)", // Inter
  fontWeight: 400,
  lineHeight: "100%",
  fontSize: "14px",
};

const FOOTER_LINK_COLOR = "rgba(191, 191, 191, 1)";

/**
 * Underline sweeps left → right on hover — same pattern as Navbar NavLink.
 * On hover: text turns solid white + underline sweeps in (also white),
 * sized to the text width only.
 * Used for every link in the footer.
 */
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative inline-block"
      style={{
        ...bodyStyle,
        color: FOOTER_LINK_COLOR,
        textDecoration: "none",
        transition: "color 0.2s ease",
        alignSelf: "flex-start", // prevents stretching when parent is a flex column
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
        className="absolute -bottom-0.5 left-0 h-px rounded-full w-0 group-hover:w-full transition-all duration-300"
        style={{ background: "#FFFFFF" }}
        aria-hidden="true"
      />
    </a>
  );
}

export function FooterSection() {
  const { footer } = siteConfig;

  return (
    <footer id="footer" style={{ background: "#000000" }}>
      <div
        className="mx-auto w-full max-w-300 px-5 relative"
        style={{ paddingTop: "60px", paddingBottom: "60px" }}
      >
        {/* Mobile (< lg): 1 column, stacked (logo block → columns block).
            lg and up: both blocks HUG their own content width (Figma:
            281px left block, 616px right block, 1200px total row) and
            `justify-between` fills whatever space is left between them —
            not a fixed gap — so the columns stay tight to each other while
            sitting far from the logo block. */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
          {/* Left: logo + tagline + social icons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "281px",
            }}
          >
            <img
              src={trusLogo}
              alt={siteConfig.name}
              width={134}
              height={53}
              style={{ width: "134px", height: "53px", marginBottom: "20px" }}
            />
            <p
              style={{
                ...bodyStyle,
                color: FOOTER_LINK_COLOR,
                margin: 0,
                marginBottom: "15px",
              }}
            >
              {footer.tagline}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {footer.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  style={{ display: "inline-flex", alignItems: "center" }}
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

          {/* Right: Services | Company | Contact Us — mobile stacks,
              sm and up: a row that hugs its own content width (~616px in
              Figma) with a tight, fixed gap between the 3 columns. */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
            {/* Services */}
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
                {footer.services.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
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
                {footer.company.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 style={{ ...titleStyle, marginBottom: 20 }}>
                {footer.thirdColumn}
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
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
                    color: FOOTER_LINK_COLOR,
                    margin: 0,
                    whiteSpace: "pre-line",
                    maxWidth: "225px",
                  }}
                >
                  {footer.contact.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #FFFFFF4D",
            margin: "60px 0 20px",
          }}
        />

        {/* 3. Bottom bar */}
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
              color: FOOTER_LINK_COLOR,
              margin: 0,
            }}
          >
            {footer.copyright.replace(
              "{year}",
              String(new Date().getFullYear()),
            )}
          </p>

          {/* Privacy Policy • Terms & Conditions • Powered by Trust AI */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {footer.bottomLinks.map((link, i) => (
              <div
                key={link.label}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {i > 0 && (
                  <span
                    style={{ ...bodyStyle, color: FOOTER_LINK_COLOR }}
                    aria-hidden="true"
                  >
                    •
                  </span>
                )}
                <FooterLink href={link.href} label={link.label} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
