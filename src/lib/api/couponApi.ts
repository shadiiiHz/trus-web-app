/**
 * Client for the apply-coupon webhook (n8n-backed). The discount depends on
 * the cart (billing cycle + services + quantities), so it is calculated by
 * the backend for exactly the cart that was sent.
 */
import axios from "axios";
import { apiUrl } from "@/lib/api/config";
import {
  authHeaders,
  AuthApiError,
  payloadToAuthApiError,
  toAuthApiError,
} from "@/lib/api/authApi";
import type { BillingPeriod } from "@/components/select-services/types";

const APPLY_COUPON_URL = apiUrl("/billing/coupon/apply");

export interface CouponCartItem {
  /** The service's `workflow_id`. */
  workflowId: string;
  quantity: number;
}

export interface CouponResult {
  code: string;
  /** Percentage off the services total (0–100), when the backend sends one. */
  percentOff?: number;
  /** Fixed amount off, in the cart's currency, when the backend sends one. */
  discountAmount?: number;
}

function toNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function firstNumber(raw: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const n = toNumber(raw[key]);
    if (n !== undefined) return n;
  }
  return undefined;
}

/**
 * `POST /billing/coupon/apply`. The response shape isn't confirmed yet, so
 * the discount is read from whichever of the usual fields the backend sends
 * (a fixed amount, or a percentage), at the root or in a `coupon` / `data`
 * object. Rejects with an `AuthApiError` when the backend refuses the code.
 */
export async function applyCoupon(
  code: string,
  billing: BillingPeriod,
  items: CouponCartItem[],
  signal?: AbortSignal,
): Promise<CouponResult> {
  const couponCode = code.trim();
  try {
    const { data } = await axios.post(
      APPLY_COUPON_URL,
      {
        billing_cycle: billing.toUpperCase(),
        items: items.map((item) => ({ workflow_id: item.workflowId, quantity: item.quantity })),
        coupon_code: couponCode,
      },
      { headers: { "Content-Type": "application/json", ...authHeaders() }, signal },
    );
    const payload = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    if (!payload || payload.success === false) throw payloadToAuthApiError(payload);

    const nested = [payload.coupon, payload.data].find(
      (v): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v),
    );
    const raw = { ...payload, ...nested };
    return {
      code: (typeof raw.coupon_code === "string" && raw.coupon_code) || couponCode.toUpperCase(),
      discountAmount: firstNumber(raw, [
        "discount_usd",
        "discount_amount_usd",
        "discount_total_usd",
        "discount_amount",
        "discount",
      ]),
      percentOff: firstNumber(raw, ["percent_off", "discount_percent", "percentage"]),
    };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/** Documented backend error codes for the apply-coupon endpoint (besides the session ones). */
export type CouponErrorCode =
  | "VALIDATION_ERROR"
  | "SERVICE_NOT_FOUND"
  | "QUANTITY_BELOW_BASE"
  | "INVALID_COUPON"
  | "COUPON_NOT_APPLICABLE";

/** Which message a rejected apply-coupon call should show. */
export type CouponErrorKind =
  | "codeRequired"
  | "codeInvalid"
  | "codeNotApplicable"
  | "noServices"
  | "serviceUnavailable"
  | "quantityBelowBase"
  | "other";

/**
 * Maps the endpoint's error codes to a message. `VALIDATION_ERROR` carries
 * its detail in `errors[]`; only the user-fixable ones (missing coupon code,
 * nothing selected) get their own message, the rest mean a bug in the request.
 */
export function couponErrorKind(error: AuthApiError): CouponErrorKind {
  switch (error.code) {
    case "INVALID_COUPON":
      return "codeInvalid";
    case "COUPON_NOT_APPLICABLE":
      return "codeNotApplicable";
    case "SERVICE_NOT_FOUND":
      return "serviceUnavailable";
    case "QUANTITY_BELOW_BASE":
      return "quantityBelowBase";
    case "VALIDATION_ERROR": {
      const codes = error.fieldErrors?.map((e) => e.code) ?? [];
      if (codes.includes("COUPON_CODE_REQUIRED")) return "codeRequired";
      if (codes.includes("ITEMS_REQUIRED")) return "noServices";
      return "other";
    }
    default:
      return "other";
  }
}

/** The part of the services total a coupon takes off (never more than the total). */
export function couponDiscount(coupon: CouponResult | null, total: number): number {
  if (!coupon) return 0;
  const off =
    coupon.discountAmount ?? (coupon.percentOff !== undefined ? (total * coupon.percentOff) / 100 : 0);
  return Math.min(Math.max(0, off), total);
}
