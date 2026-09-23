/**
 * Client for the public (unauthenticated) lookup webhooks (n8n-backed) —
 * option lists for form dropdowns such as timezones and jobs.
 */
import axios from "axios";
import type { SelectOption } from "@/components/ui/Select";

const TIMEZONES_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/public/timezones";
const JOBS_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/public/jobs";

/** n8n webhook nodes sometimes wrap a single item in an array — unwrap it. */
function unwrap(data: unknown): Record<string, unknown> | undefined {
  return (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
}

function toOptions(list: unknown): SelectOption[] {
  if (!Array.isArray(list)) return [];
  return list.filter(
    (item): item is SelectOption =>
      typeof item?.value === "string" && typeof item?.label === "string",
  );
}

async function fetchOptions(url: string, key: string, signal?: AbortSignal) {
  const { data } = await axios.get(url, { signal });
  return toOptions(unwrap(data)?.[key]);
}

/** `GET /public/timezones` — IANA timezones, e.g. `{ value: "Asia/Tehran", label: "Tehran — Asia" }`. */
export function fetchTimezones(signal?: AbortSignal): Promise<SelectOption[]> {
  return fetchOptions(TIMEZONES_URL, "timezones", signal);
}

/** `GET /public/jobs` — job / business types, e.g. `{ value: "Dentist", label: "Dentist" }`. */
export function fetchJobs(signal?: AbortSignal): Promise<SelectOption[]> {
  return fetchOptions(JOBS_URL, "jobs", signal);
}
