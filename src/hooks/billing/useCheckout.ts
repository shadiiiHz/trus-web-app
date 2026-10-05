import { useMutation } from "@tanstack/react-query";
import { checkout, type CheckoutRequest } from "@/lib/api/checkoutApi";

/** `POST /billing/checkout`; `mutate` is a promise-returning `mutateAsync`, like the auth mutations. */
export function useCheckout() {
  const mutation = useMutation({
    mutationFn: (request: CheckoutRequest) => checkout(request),
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}
