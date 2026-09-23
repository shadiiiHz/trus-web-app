
import { YEARLY_MONTHS, type SelectableService } from "@/lib/mock/selectServices";
import type { BillingPeriod } from "./types";

export function servicePrice(
  service: SelectableService,
  quantity: number,
  period: BillingPeriod,
): number {
  const monthly = service.unitPrice * quantity;
  return period === "yearly" ? monthly * YEARLY_MONTHS : monthly;
}

/** "$499", "$4990", "$44.9" — no thousands separator, matching the design. */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    useGrouping: false,
  })}`;
}
