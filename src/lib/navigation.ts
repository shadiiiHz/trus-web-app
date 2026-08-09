/**
 * Resolves how an in-page link should navigate given the current route.
 *
 * - Path links (e.g. "/templates") route via react-router as-is.
 * - Hash links (e.g. "#about") scroll in-page as a plain anchor while on the
 *   home page, but on any other route ("/templates") there's no matching
 *   section to scroll to — those need to route back to Home first, carrying
 *   the hash along ("/#about") so Home can scroll to it once mounted (see
 *   the scroll-to-hash effect in HomePage).
 * - Anything else (mailto:, tel:, external URLs) is left alone.
 *
 * Returns `null` when a plain anchor is enough (unchanged legacy behaviour).
 */
export function resolveSectionLink(href: string, isHome: boolean): string | null {
  if (href.startsWith("/")) return href;
  if (href.startsWith("#") && !isHome) return href === "#" ? "/" : `/${href}`;
  return null;
}
