/**
 * Mock data for the Select Services page.
 *
 * The services list (and coupon validation) will come from the backend,
 * which isn't ready yet. Everything here mirrors the shape we expect the
 * API to return, so swapping the mock for a real fetch only means replacing
 * `fetchSelectableServices()` / `validateCoupon()` bodies — the page and its
 * components already consume these types.
 */

export interface SelectableService {
  id: string;
  name: string;
  /** Short description, first line of the "Description" column. */
  description: string;
  /** What the base plan includes, second (muted) line of the "Description" column. */
  includedAmount: string;
  /** Icon URL from the backend. `null` renders the empty placeholder square. */
  icon: string | null;
  /** Monthly price (USD) per unit of quantity. */
  unitPrice: number;
  /** Muted line under the unit price, e.g. "per extra post/month". */
  unitLabel: string;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  /** Whether the service starts checked. */
  defaultSelected: boolean;
  /** Whether the account already has an active subscription to this service. */
  purchased: boolean;
  /** Billing period of the active subscription; `null` when not purchased. */
  purchasedBilling: "monthly" | "yearly" | null;
  /** Invoice of the active subscription; `null` when there's none to show. */
  invoiceId: string | null;
}

/** Yearly billing = this many months of the monthly price (i.e. two months free). */
export const YEARLY_MONTHS = 10;

const MOCK_SERVICES: SelectableService[] = [
  {
    id: "manual-post-creation",
    name: "Manual Post Creation",
    description: "Create image or video manually",
    includedAmount: "(2 posts per day included)",
    icon: null,
    unitPrice: 499,
    unitLabel: "per extra post/month",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
    purchased: true,
    purchasedBilling: "monthly",
    invoiceId: "inv-1001",
  },
  {
    id: "auto-post-creation",
    name: "Auto Post Creation",
    description: "Create posts automatically",
    includedAmount: "(1 post per day included)",
    icon: null,
    unitPrice: 140,
    unitLabel: "per extra post/month",
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
    purchased: true,
    purchasedBilling: "yearly",
    invoiceId: "inv-1002",
  },
  {
    id: "newsletter-creation",
    name: "Newsletter Creation",
    description: "Create and send newsletters",
    includedAmount: "(1 newsletter per day included)",
    icon: null,
    unitPrice: 299,
    unitLabel: "per extra newsletter/month",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
    purchased: false,
    purchasedBilling: null,
    invoiceId: null,
  },
  {
    id: "audience-selection",
    name: "Audience Selection",
    description: "Manage your target audiences",
    includedAmount: "(up to 8 audiences included)",
    icon: null,
    unitPrice: 192,
    unitLabel: "per extra audience",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
    purchased: false,
    purchasedBilling: null,
    invoiceId: null,
  },
  {
    id: "lead-finder",
    name: "Lead Finder",
    description: "Automatically find and collect leads",
    includedAmount: "every night (included)",
    icon: null,
    unitPrice: 99,
    unitLabel: "per additional run/month",
    defaultQuantity: 1,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
    purchased: true,
    purchasedBilling: "monthly",
    invoiceId: "inv-1003",
  },
  {
    id: "telegram-daily-publishing",
    name: "Telegram Daily Publishing",
    description: "Publish to your Telegram group",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 78,
    unitLabel: "per extra publish/month",
    defaultQuantity: 5,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
    purchased: true,
    purchasedBilling: "yearly",
    invoiceId: "inv-1004",
  },
  {
    id: "x-daily-publishing",
    name: "X Daily Publishing",
    description: "Publish to your X account",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 235,
    unitLabel: "per extra publish/month",
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
    purchased: false,
    purchasedBilling: null,
    invoiceId: null,
  },
  {
    id: "instagram-daily-publishing",
    name: "Instagram Daily Publishing",
    description: "Publish to Instagram",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 126,
    unitLabel: "per extra publish/month",
    defaultQuantity: 4,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
    purchased: true,
    purchasedBilling: "monthly",
    invoiceId: "inv-1005",
  },
  {
    id: "linkedin-daily-publishing",
    name: "LinkedIn Daily Publishing",
    description: "LinkedIn publishing",
    includedAmount: "(1/day)",
    icon: null,
    unitPrice: 80,
    unitLabel: "per extra publish/month",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
    purchased: false,
    purchasedBilling: null,
    invoiceId: null,
  },
];

/** TODO: replace with the real services endpoint once the backend ships it. */
export async function fetchSelectableServices(): Promise<SelectableService[]> {
  return MOCK_SERVICES;
}

export interface BillingOptions {
  /** Discount shown on the "Yearly" toggle ("Save 20%"). */
  yearlySavePercent: number;
}

/** TODO: replace with the real billing-options endpoint once the backend ships it. */
export async function fetchBillingOptions(): Promise<BillingOptions> {
  return { yearlySavePercent: 20 };
}

export interface CouponResult {
  code: string;
  /** Percentage off the services total (0–100). */
  percentOff: number;
}

const MOCK_COUPONS: Record<string, number> = {
  TRUS10: 10,
  WELCOME20: 20,
};

/**
 * TODO: replace with the real coupon endpoint once the backend ships it.
 * Resolves `null` for an unknown code.
 */
export async function validateCoupon(code: string): Promise<CouponResult | null> {
  const normalized = code.trim().toUpperCase();
  const percentOff = MOCK_COUPONS[normalized];
  return percentOff === undefined ? null : { code: normalized, percentOff };
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
