/**
 * Base URL for the n8n webhook backend. Set `VITE_API_BASE_URL` in `.env`
 * (or the hosting provider's env settings) to point the app at a different
 * backend without touching the code. Trailing slashes are stripped.
 */
const DEFAULT_API_BASE_URL = "https://n8n.srv1879006.hstgr.cloud/webhook";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/** Builds a full endpoint URL from a path like `/auth/login`. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
