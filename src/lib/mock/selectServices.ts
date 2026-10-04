/**
 * Mock data for the Select Services page.
 *
 * Billing options will come from the
 * backend, which isn't ready yet. Everything here mirrors the shape we expect
 * the API to return, so swapping the mock for a real fetch only means
 * replacing these function bodies. (The services list and invoices are real — see
 * `@/lib/api/servicesApi`.)
 */

export interface BillingOptions {
  /** Discount shown on the "Yearly" toggle ("Save 20%"). */
  yearlySavePercent: number;
}

/** TODO: replace with the real billing-options endpoint once the backend ships it. */
export async function fetchBillingOptions(): Promise<BillingOptions> {
  return { yearlySavePercent: 20 };
}
