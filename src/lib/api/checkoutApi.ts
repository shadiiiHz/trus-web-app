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
import type { OrderResult } from "@/lib/mock/orders";
import type { BillingPeriod } from "@/components/select-services/types";

const CHECKOUT_URL = apiUrl("/billing/checkout");

export interface CheckoutRequest {
  billing: BillingPeriod;
  items: CouponCartItem[];
  couponCode?: string | null;
}

/** What the page already knows about the cart, used where the response leaves a field out. */
export interface CheckoutFallback {
  serviceNames: Record<string, string>;
  currency: string;
  amount: number;
  discount: number;
  couponCode: string | null;
}

const str = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value : typeof value === "number" ? String(value) : null;

const num = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const firstNumber = (raw: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const n = num(raw[key]);
    if (n !== undefined) return n;
  }
  return undefined;
};

/**
 * `POST /billing/checkout`. The success response shape isn't confirmed yet,
 * so the order is read from whichever usual fields the backend sends (at the
 * root or in an `order` / `data` object) and filled in from the cart where
 * one is missing. Rejects with an `AuthApiError` on any documented failure.
 */
export async function checkout(
  request: CheckoutRequest,
  fallback: CheckoutFallback,
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

    const nested = [payload.order, payload.data].find(
      (v): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v),
    );
    const raw = { ...payload, ...nested };

    const amount = firstNumber(raw, ["amount", "subtotal", "subtotal_usd", "amount_usd"]) ?? fallback.amount;
    const discount =
      firstNumber(raw, ["discount", "discount_usd", "discount_amount", "discount_amount_usd"]) ?? fallback.discount;
    const finalAmount =
      firstNumber(raw, ["final_amount", "final_amount_usd", "total", "total_usd"]) ?? Math.max(0, amount - discount);

    return {
      orderId: str(raw.order_id) ?? str(raw.order_number) ?? str(raw.id) ?? "",
      userName: str(raw.user_name),
      services: request.items.map((item) => ({
        id: item.workflowId,
        name: fallback.serviceNames[item.workflowId] ?? item.workflowId,
        status: "being_created" as const,
      })),
      currency: str(raw.currency) ?? fallback.currency,
      amount,
      discount,
      couponCode: str(raw.coupon_code) ?? fallback.couponCode,
      finalAmount,
      invoiceId: str(raw.invoice_id),
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
