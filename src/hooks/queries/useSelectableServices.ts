import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n";
import { fetchSelectableServices } from "@/lib/api/servicesApi";

/**
 * `GET /billing/services?lang=…` (refetched when the language changes). Always refetched on mount (`staleTime: 0`) so
 * purchased flags and prices are never stale after a payment.
 */
export function useSelectableServices(enabled: boolean) {
  const locale = useLocale();
  return useQuery({
    queryKey: ["billing", "services", locale],
    queryFn: ({ signal }) => fetchSelectableServices(locale, signal),
    enabled,
    staleTime: 0,
  });
}
