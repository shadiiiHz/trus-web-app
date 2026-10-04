/**
 * Mock data for the Select Services page.
 *
 * Billing options and invoices will come from the
 * backend, which isn't ready yet. Everything here mirrors the shape we expect
 * the API to return, so swapping the mock for a real fetch only means
 * replacing these function bodies. (The services list is real — see
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

export interface ServiceInvoice {
  id: string;
  /** Human-facing invoice number, e.g. "INV-2026-0001". */
  number: string;
  /** 1-based position within its kind ("Month 3", "Year 1"). */
  sequence: number;
  /** Billing period bounds as ISO dates (`YYYY-MM-DD`). */
  periodStart: string;
  periodEnd: string;
  /** Amount in USD. */
  amount: number;
}

export interface ServiceInvoices {
  monthly: ServiceInvoice[];
  annual: ServiceInvoice[];
}

const MOCK_MONTHLY_AMOUNTS = [29, 79, 65, 24, 32];

/** TODO: replace with the real invoices endpoint once the backend ships it. */
export async function fetchServiceInvoices(serviceId: string): Promise<ServiceInvoices> {
  const monthly = MOCK_MONTHLY_AMOUNTS.map((amount, i) => {
    const month = String(i + 1).padStart(2, "0");
    const lastDay = new Date(Date.UTC(2026, i + 1, 0)).getUTCDate();
    return {
      id: `${serviceId}-m${i + 1}`,
      number: `INV-2026-${String(i + 1).padStart(4, "0")}`,
      sequence: i + 1,
      periodStart: `2026-${month}-01`,
      periodEnd: `2026-${month}-${lastDay}`,
      amount,
    };
  });
  return {
    monthly,
    annual: [
      {
        id: `${serviceId}-y1`,
        number: "INV-2026-Y001",
        sequence: 1,
        periodStart: "2026-01-01",
        periodEnd: "2026-12-31",
        amount: 395,
      },
    ],
  };
}

/** TODO: replace with the real invoice-download endpoint once the backend ships it. */
export async function downloadInvoices(invoiceIds: string[]): Promise<void> {
  void invoiceIds;
}
