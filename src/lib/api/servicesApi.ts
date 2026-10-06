/**
 * Client for the billing services webhook (n8n-backed): the list of services
 * the Select Services page shows, plus the price calculation for them.
 */
import axios from "axios";
import { apiUrl } from "@/lib/api/config";
import { defaultLocale, type Locale } from "@/i18n";
import { authHeaders, AuthApiError, toAuthApiError, toDisplayableImageUrl } from "@/lib/api/authApi";

const SERVICES_URL = apiUrl("/billing/services");

/** Documented backend codes for the get-services endpoint. */
export type ServicesErrorCode =
  | "SESSION_REQUIRED"
  | "ACCOUNT_DISABLED"
  | "INVALID_SESSION";

/** True for the codes that mean the session can't be used any more (log in again). */
export function isSessionError(error: unknown): error is AuthApiError {
  return (
    error instanceof AuthApiError &&
    (error.code === "SESSION_REQUIRED" ||
      error.code === "INVALID_SESSION" ||
      error.code === "ACCOUNT_DISABLED")
  );
}

export interface SelectableService {
  id: string;
  name: string;
  /**
   * Translated description plus the included amount, separated by a newline
   * ("Description\n(2 posts per day included)"); the table shows it on two lines.
   */
  description: string;
  /** Icon URL from the backend. `null` renders the empty placeholder square. */
  icon: string | null;
  /** Quantity included in the base price — also the minimum the user can pick. */
  baseQuantity: number;
  maxQuantity: number;
  monthlyBasePriceUsd: number;
  monthlyExtraUnitPriceUsd: number;
  yearlyBasePriceUsd: number;
  yearlyExtraUnitPriceUsd: number;
  /** Muted line under the unit price, e.g. "per extra post/month". */
  unitLabel: string;
  /** Whether the account already has an active subscription to this service. */
  purchased: boolean;
  /** Billing period of the active subscription; `null` when not purchased. */
  purchasedBilling: "monthly" | "yearly" | null;
  /** Invoice of the active subscription; `null` when there's none to show. */
  invoiceId: string | null;
}

/** Raw service as the backend sends it (snake_case, prices in USD). */
export interface BackendService {
  base_quantity?: number | string | null;
  monthly_base_price_usd?: number | string | null;
  monthly_extra_unit_price_usd?: number | string | null;
  yearly_base_price_usd?: number | string | null;
  yearly_extra_unit_price_usd?: number | string | null;
  [key: string]: unknown;
}

export interface ServicePrice {
  quantity: number;
  extra_quantity: number;
  monthly_total_usd: number;
  yearly_total_usd: number;
}

/**
 * The backend's price formula: the base price covers `base_quantity`, and
 * every unit above it is charged at the extra-unit price. Works on the raw
 * backend fields, exactly as the backend documents it.
 */
export function calculateServicePrice(
  service: BackendService,
  selectedQuantity?: number | string | null,
): ServicePrice {
  const baseQuantity = Number(service.base_quantity || 0);
  const quantity = Math.max(baseQuantity, Number(selectedQuantity || baseQuantity));
  const extraQuantity = Math.max(0, quantity - baseQuantity);

  const monthlyTotal =
    Number(service.monthly_base_price_usd || 0) +
    extraQuantity * Number(service.monthly_extra_unit_price_usd || 0);
  const yearlyTotal =
    Number(service.yearly_base_price_usd || 0) +
    extraQuantity * Number(service.yearly_extra_unit_price_usd || 0);

  return {
    quantity,
    extra_quantity: extraQuantity,
    monthly_total_usd: monthlyTotal,
    yearly_total_usd: yearlyTotal,
  };
}

const DEFAULT_MAX_QUANTITY = 99;

function str(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return value === null || value === "" || Number.isNaN(n) ? fallback : n;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The response shape isn't confirmed yet, so the list is read from the root
 * array or from a `services` / `data` / `items` key of the (possibly
 * array-wrapped) envelope.
 */
function extractList(data: unknown): { list: unknown[]; envelope?: Record<string, unknown> } {
  const first = Array.isArray(data) ? data[0] : data;
  if (Array.isArray(data) && !(isRecord(first) && ("success" in first || "services" in first))) {
    return { list: data };
  }
  if (!isRecord(first)) return { list: [] };
  const list = [first.services, first.data, first.items].find(Array.isArray);
  return { list: (list as unknown[] | undefined) ?? [], envelope: first };
}

/** Wording for the backend's `quantity_period` (what `base_quantity` is counted per). */
const PERIOD_LABELS: Record<string, { unit: string }> = {
  DAY: { unit: "per day" },
  NIGHT: { unit: "per night" },
  MONTH: { unit: "per month" },
  ACCOUNT: { unit: "per account" },
};

function toService(raw: Record<string, unknown>): SelectableService | null {
  const id = str(raw.workflow_id) || str(raw.id) || str(raw.service_id) || str(raw.code);
  const name = str(raw.display_name) || str(raw.name) || str(raw.title);
  if (!id || !name) return null;

  const iconUrl = str(raw.icon_url) || str(raw.icon_key) || str(raw.icon);
  const billing = (str(raw.billing_cycle) || str(raw.purchased_billing)).toLowerCase();
  const baseQuantity = num(raw.base_quantity);
  const period = PERIOD_LABELS[str(raw.quantity_period).toUpperCase()];
  return {
    id,
    name,
    description: str(raw.description),
    icon: iconUrl ? toDisplayableImageUrl(iconUrl) : null,
    baseQuantity,
    maxQuantity: Math.max(baseQuantity, num(raw.max_quantity, DEFAULT_MAX_QUANTITY)),
    monthlyBasePriceUsd: num(raw.monthly_base_price_usd),
    monthlyExtraUnitPriceUsd: num(raw.monthly_extra_unit_price_usd),
    yearlyBasePriceUsd: num(raw.yearly_base_price_usd),
    yearlyExtraUnitPriceUsd: num(raw.yearly_extra_unit_price_usd),
    unitLabel: str(raw.unit_label) || (period ? `per extra unit ${period.unit}` : "per extra unit"),
    purchased: raw.purchased === true,
    purchasedBilling: /^month/.test(billing) ? "monthly" : /^(year|annual)/.test(billing) ? "yearly" : null,
    invoiceId: str(raw.invoice_id) || null,
  };
}

export interface ServicesResult {
  services: SelectableService[];
  /** ISO currency code the backend prices are in (the `*_usd` fields' unit); `USD` when absent. */
  currency: string;
}

/**
 * `GET /billing/services?lang=…` — needs the session token; rejects with an
 * `AuthApiError` (see `ServicesErrorCode`). The backend translates the
 * description for `lang` (tr/de/ru/es/fr); English is the default, so no
 * `lang` is sent for it.
 */
export async function fetchSelectableServices(
  locale: Locale = defaultLocale,
  signal?: AbortSignal,
): Promise<ServicesResult> {
  try {
    const { data } = await axios.get(SERVICES_URL, {
      headers: authHeaders(),
      params: locale === defaultLocale ? undefined : { lang: locale },
      signal,
    });
    const { list, envelope } = extractList(data);
    if (envelope?.success === false) {
      throw new AuthApiError(
        str(envelope.code) || "NETWORK_ERROR",
        str(envelope.message) || "Request failed.",
      );
    }
    const services = list
      .filter(isRecord)
      .map(toService)
      .filter((service): service is SelectableService => service !== null);
    return { services, currency: str(envelope?.currency).toUpperCase() || "USD" };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/** Price of one service for the chosen quantity, via the backend's formula. */
export function servicePricing(service: SelectableService, quantity: number): ServicePrice {
  return calculateServicePrice(
    {
      base_quantity: service.baseQuantity,
      monthly_base_price_usd: service.monthlyBasePriceUsd,
      monthly_extra_unit_price_usd: service.monthlyExtraUnitPriceUsd,
      yearly_base_price_usd: service.yearlyBasePriceUsd,
      yearly_extra_unit_price_usd: service.yearlyExtraUnitPriceUsd,
    },
    quantity,
  );
}
