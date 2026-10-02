import { queryOptions } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api/authApi";

/**
 * Shared by the header (logo) and the edit-account form so a reload that
 * needs both issues a single `GET /auth/profile`. `staleTime: 0` keeps every
 * `fetchQuery` fresh — only concurrent in-flight requests are deduplicated.
 */
export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: ({ signal }) => fetchProfile(signal),
  staleTime: 0,
});
