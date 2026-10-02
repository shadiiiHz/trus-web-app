import { useQuery } from "@tanstack/react-query";
import { fetchJobs, fetchTimezones } from "@/lib/api/publicApi";

/** Option lists practically never change, so they're fetched once per visit and cached. */
const OPTIONS_STALE_TIME = Infinity;

export function useTimezones() {
  return useQuery({
    queryKey: ["public", "timezones"],
    queryFn: ({ signal }) => fetchTimezones(signal),
    staleTime: OPTIONS_STALE_TIME,
  });
}

export function useJobs() {
  return useQuery({
    queryKey: ["public", "jobs"],
    queryFn: ({ signal }) => fetchJobs(signal),
    staleTime: OPTIONS_STALE_TIME,
  });
}
