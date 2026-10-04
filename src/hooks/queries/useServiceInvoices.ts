import { useQuery } from "@tanstack/react-query";
import { fetchServiceInvoices } from "@/lib/api/invoiceApi";

/** `GET /billing/service-invoices` for one service; refetched on every open so a fresh payment shows up. */
export function useServiceInvoices(workflowId: string) {
  return useQuery({
    queryKey: ["billing", "service-invoices", workflowId],
    queryFn: ({ signal }) => fetchServiceInvoices(workflowId, signal),
    staleTime: 0,
    retry: false,
  });
}
