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
  },
  {
    id: "x-daily-publishing",
    name: "X Daily Publishing",
    description: "Publish to your X (Twitter) account",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 235,
    unitLabel: "per extra publish/month",
    defaultQuantity: 2,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
  },
  {
    id: "instagram-daily-publishing",
    name: "Instagram Daily Publishing",
    description: "Publish to your Instagram account",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 126,
    unitLabel: "per extra publish/month",
    defaultQuantity: 4,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: true,
  },
  {
    id: "linkedin-daily-publishing",
    name: "LinkedIn Daily Publishing",
    description: "Publish to your LinkedIn account",
    includedAmount: "(1 time per day included)",
    icon: null,
    unitPrice: 80,
    unitLabel: "per extra publish/month",
    defaultQuantity: 3,
    minQuantity: 1,
    maxQuantity: 99,
    defaultSelected: false,
  },
];

/** TODO: replace with the real services endpoint once the backend ships it. */
export async function fetchSelectableServices(): Promise<SelectableService[]> {
  return MOCK_SERVICES;
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
