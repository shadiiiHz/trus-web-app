import { useMutation } from "@tanstack/react-query";
import { downloadInvoices } from "@/lib/api/invoiceApi";
import { useInvoiceErrorHandler } from "./useInvoiceErrorHandler";

/**
 * `GET /billing/invoice/download` for one or more invoices. `download`
 * resolves `true` once every PDF was handed to the browser; any failure is
 * already reported (toast, or logout for a dead session) and resolves `false`.
 */
export function useDownloadInvoices() {
  const handleError = useInvoiceErrorHandler();
  const mutation = useMutation({ mutationFn: (invoiceIds: string[]) => downloadInvoices(invoiceIds) });

  const download = async (invoiceIds: string[]): Promise<boolean> => {
    try {
      await mutation.mutateAsync(invoiceIds);
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  return { download, isLoading: mutation.isPending };
}
