import { useQuery } from "@tanstack/react-query";
import { fetchSelectableServices } from "@/lib/api/servicesApi";

/**
 * `GET /billing/services`. Always refetched on mount (`staleTime: 0`) so
 * purchased flags and prices are never stale after a payment.
 */
export function useSelectableServices(enabled: boolean) {
  return useQuery({
    queryKey: ["billing", "services"],
    queryFn: ({ signal }) => fetchSelectableServices(signal),
    enabled,
    staleTime: 0,
  });
}
