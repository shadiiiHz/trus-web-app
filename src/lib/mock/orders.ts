/**
 * Mock for the "Pay now" response.
 *
 * The payment/order endpoint isn't built yet. `createOrder()` returns the
 * shape the Order Status page expects from it, so wiring the real endpoint
 * only means replacing this function's body — the page and its components
 * already consume these types.
 */

export type OrderStatus = "being_created";

export interface OrderServiceItem {
  id: string;
  name: string;
  status: OrderStatus;
}

export interface OrderRequest {
  services: { id: string; name: string; quantity: number; period: "monthly" | "yearly" }[];
  couponCode: string | null;
  autoRenew: boolean;
  /** Totals as the client calculated them (the real backend will compute its own). */
  currency: string;
  amount: number;
  discount: number;
}

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
}

/** TODO: replace with the real pay-now endpoint once the backend ships it. */
export async function createOrder(request: OrderRequest): Promise<OrderResult> {
  return {
    orderId: `TRS-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
    userName: null,
    services: request.services.map((s) => ({ id: s.id, name: s.name, status: "being_created" })),
    currency: request.currency,
    amount: request.amount,
    discount: request.discount,
    couponCode: request.couponCode,
    finalAmount: Math.max(0, request.amount - request.discount),
    invoiceId: null,
  };
}
