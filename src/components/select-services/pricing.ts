import type { SelectableService } from "@/lib/api/servicesApi";
import { servicePricing } from "@/lib/api/servicesApi";
import type { BillingPeriod } from "./types";

export function servicePrice(
  service: SelectableService,
  quantity: number,
  period: BillingPeriod,
): number {
  const { monthly_total_usd, yearly_total_usd } = servicePricing(service, quantity);
  return period === "yearly" ? yearly_total_usd : monthly_total_usd;
}

/**
 * "$499", "$4990", "$44.9" — no thousands separator, matching the design.
 * `currency` is the ISO code the backend sends (defaults to USD); an unknown
 * code falls back to USD rather than throwing.
 */
export function formatMoney(amount: number, currency = "USD"): string {
  const options = {
    style: "currency",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: false,
  } as const;
  try {
    return amount.toLocaleString("en-US", { ...options, currency });
  } catch {
    return amount.toLocaleString("en-US", { ...options, currency: "USD" });
  }
}
