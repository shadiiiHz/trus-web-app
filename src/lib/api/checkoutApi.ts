/**
 * Client for the Pay Now checkout webhook (n8n-backed). The backend prices
 * the cart itself, so the client only sends the billing cycle, the selected
 * services with their quantities and the (optional) coupon code.
 */
import axios from "axios";
import { apiUrl } from "@/lib/api/config";
import {
  authHeaders,
  AuthApiError,
  payloadToAuthApiError,
  toAuthApiError,
} from "@/lib/api/authApi";
import type { CouponCartItem } from "@/lib/api/couponApi";
import type { BillingPeriod } from "@/components/select-services/types";

const CHECKOUT_URL = apiUrl("/billing/checkout");

export interface CheckoutRequest {
  billing: BillingPeriod;
  items: CouponCartItem[];
  couponCode?: string | null;
}

/** Lower-cased `order_status` from the response, e.g. `being_created`. */
export type OrderStatus = string;

export interface OrderServiceItem {
  id: string;
  name: string;
  status: OrderStatus;
}

/** The order exactly as the checkout response describes it. */
export interface OrderResult {
  orderId: string;
  /** Name to greet the customer with; the page falls back to the account's display name. */
  userName: string | null;
  services: OrderServiceItem[];
  currency: string;
  amount: number;
  discount: number;
  couponCode: string | null;
  finalAmount: number;
  invoiceId: string | null;
  /** Direct-download link to the invoice PDF. */
  invoicePdfUrl: string | null;
}

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : typeof value === "number" ? String(value) : null;

const num = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

/**
 * `POST /billing/checkout`. Everything shown afterwards comes from the
 * response (`order_id`, `order_status`, `services[]`, `subtotal_usd`,
 * `discount_usd`, `total_usd`, `invoice_pdf_url`); nothing is filled in from
 * the cart. Rejects with an `AuthApiError` on any documented failure.
 */
export async function checkout(
  request: CheckoutRequest,
  signal?: AbortSignal,
): Promise<OrderResult> {
  try {
    const { data } = await axios.post(
      CHECKOUT_URL,
      {
        billing_cycle: request.billing.toUpperCase(),
        items: request.items.map((item) => ({ workflow_id: item.workflowId, quantity: item.quantity })),
        ...(request.couponCode ? { coupon_code: request.couponCode } : {}),
      },
      { headers: { "Content-Type": "application/json", ...authHeaders() }, signal },
    );
    const payload = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    if (!payload || payload.success === false) throw payloadToAuthApiError(payload);

    const orderStatus: OrderStatus = (str(payload.order_status) ?? "").toLowerCase();
    const services = Array.isArray(payload.services) ? payload.services : [];

    // Amounts are USD (`*_usd` fields).
    const invoiceTotals = (payload.invoice ?? {}) as Record<string, unknown>;
    const couponTotals = (payload.coupon ?? {}) as Record<string, unknown>;
    const amount = num(payload.subtotal_usd) ?? num(invoiceTotals.subtotal_usd) ?? 0;
    const discount =
      num(payload.discount_usd) ?? num(invoiceTotals.discount_usd) ?? num(couponTotals.discount_usd) ?? 0;
    const finalAmount =
      num(payload.total_usd) ?? num(invoiceTotals.total_usd) ?? Math.max(0, amount - discount);

    // `coupon` / `invoice` are nested objects; the flat fields are kept as a fallback.
    const coupon = (payload.coupon ?? {}) as Record<string, unknown>;
    const invoice = (payload.invoice ?? {}) as Record<string, unknown>;

    return {
      orderId: str(payload.order_id) ?? "",
      userName: null,
      services: services.map((item) => {
        const service = (item ?? {}) as Record<string, unknown>;
        const id = str(service.workflow_id) ?? "";
        return { id, name: str(service.display_name) ?? id, status: orderStatus };
      }),
      currency: "USD",
      amount,
      discount,
      couponCode: str(coupon.code) ?? str(payload.coupon_code) ?? null,
      finalAmount,
      invoiceId: str(invoice.invoice_id) ?? str(payload.invoice_id),
      invoicePdfUrl: str(invoice.pdf_url) ?? str(payload.invoice_pdf_url),
    };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/** Documented backend error codes for the checkout endpoint (besides the session ones). */
export type CheckoutErrorCode =
  | "ACCOUNT_NOT_READY"
  | "VALIDATION_ERROR"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_ALREADY_PURCHASED"
  | "QUANTITY_BELOW_BASE"
  | "INVALID_COUPON"
  | "COUPON_NOT_APPLICABLE"
  | "PAYMENT_REQUIRED"
  | "PDF_GENERATION_FAILED";

/** Which message a rejected checkout call should show. */
export type CheckoutErrorKind =
  | "accountNotReady"
  | "noServices"
  | "serviceUnavailable"
  | "serviceAlreadyPurchased"
  | "quantityBelowBase"
  | "couponInvalid"
  | "couponNotApplicable"
  | "paymentRequired"
  | "pdfFailed"
  | "other";

/**
 * Maps the endpoint's error codes to a message. `VALIDATION_ERROR` carries
 * its detail in `errors[]`; only "nothing selected" is user-fixable, the
 * rest (bad cycle, missing id, duplicate, bad quantity) mean a request bug.
 */
export function checkoutErrorKind(error: AuthApiError): CheckoutErrorKind {
  switch (error.code) {
    case "ACCOUNT_NOT_READY":
      return "accountNotReady";
    case "SERVICE_NOT_FOUND":
      return "serviceUnavailable";
    case "SERVICE_ALREADY_PURCHASED":
      return "serviceAlreadyPurchased";
    case "QUANTITY_BELOW_BASE":
      return "quantityBelowBase";
    case "INVALID_COUPON":
      return "couponInvalid";
    case "COUPON_NOT_APPLICABLE":
      return "couponNotApplicable";
    case "PAYMENT_REQUIRED":
      return "paymentRequired";
    case "PDF_GENERATION_FAILED":
      return "pdfFailed";
    case "VALIDATION_ERROR":
      return error.fieldErrors?.some((e) => e.code === "ITEMS_REQUIRED") ? "noServices" : "other";
    default:
      return "other";
  }
}
