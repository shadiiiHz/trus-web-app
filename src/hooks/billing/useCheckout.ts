import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkout, type CheckoutRequest } from "@/lib/api/checkoutApi";

/** `POST /billing/checkout`; `mutate` is a promise-returning `mutateAsync`, like the auth mutations. */
export function useCheckout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: CheckoutRequest) => checkout(request),
    // Purchased flags, prices and invoices change after a checkout, so mark them stale.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["billing"] }),
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}