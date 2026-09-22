/**
 * Maps a backend `next_page` value to the route that actually serves it.
 * The backend's naming doesn't always match ours — it calls the
 * profile-completion step "/complete-profile" (served at "/edit-account")
 * and the post-login destination "/service" (served at "/select-services")
 * — so callers resolve through here instead of navigating to `next_page`
 * verbatim. Anything not in the map passes through unchanged.
 */
const NEXT_PAGE_ROUTE_MAP: Record<string, string> = {
  "/complete-profile": "/edit-account",
  "/service": "/select-services",
};

export function resolveNextPage(nextPage: string): string {
  return NEXT_PAGE_ROUTE_MAP[nextPage] ?? nextPage;
}
