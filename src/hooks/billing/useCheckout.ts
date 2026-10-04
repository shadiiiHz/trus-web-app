import { useMutation } from "@tanstack/react-query";
import { checkout, type CheckoutFallback, type CheckoutRequest } from "@/lib/api/checkoutApi";

interface CheckoutVariables {
  request: CheckoutRequest;
  fallback: CheckoutFallback;
}

/** `POST /billing/checkout`; `mutate` is a promise-returning `mutateAsync`, like the auth mutations. */
export function useCheckout() {
  const mutation = useMutation({
    mutationFn: ({ request, fallback }: CheckoutVariables) => checkout(request, fallback),
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}
