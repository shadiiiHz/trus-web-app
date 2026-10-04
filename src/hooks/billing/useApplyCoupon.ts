import { useMutation } from "@tanstack/react-query";
import { applyCoupon, type CouponCartItem } from "@/lib/api/couponApi";
import type { BillingPeriod } from "@/components/select-services/types";

interface ApplyCouponVariables {
  code: string;
  billing: BillingPeriod;
  items: CouponCartItem[];
}

/** `POST /billing/coupon/apply`; `mutate` is a promise-returning `mutateAsync`, like the auth mutations. */
export function useApplyCoupon() {
  const mutation = useMutation({
    mutationFn: ({ code, billing, items }: ApplyCouponVariables) => applyCoupon(code, billing, items),
  });

  return { mutate: mutation.mutateAsync, isLoading: mutation.isPending };
}
