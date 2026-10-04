/**
 * Client for the download-invoice webhook (n8n-backed). On success the
 * backend answers with the PDF itself (`application/pdf`, attachment), not
 * JSON; failures are the usual JSON error envelope.
 */
import axios from "axios";
import { apiUrl } from "@/lib/api/config";
import { authHeaders, AuthApiError, payloadToAuthApiError, toAuthApiError } from "@/lib/api/authApi";

const INVOICE_DOWNLOAD_URL = apiUrl("/billing/invoice/download");
const SERVICE_INVOICES_URL = apiUrl("/billing/service-invoices");

export interface ServiceInvoice {
  id: string;
  /** Human-facing invoice number, e.g. "INV-2026-0001". */
  number: string;
  /** 1-based position within its kind ("Month 3", "Year 1"). */
  sequence: number;
  /** Billing period bounds as ISO dates (`YYYY-MM-DD`); null while the backend hasn't set them. */
  periodStart: string | null;
  periodEnd: string | null;
  /** When the invoice was issued (`YYYY-MM-DD`), shown in place of a missing period. */
  issuedAt: string | null;
  /** The backend marks the invoice of the running period. */
  isCurrent: boolean;
  /** Amount in USD. */
  amount: number;
}

export interface ServiceInvoices {
  /** `service.purchased` from the response. */
  purchased: boolean;
  monthly: ServiceInvoice[];
  annual: ServiceInvoice[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown): string =>
  typeof value === "string" ? value : typeof value === "number" ? String(value) : "";

const firstText = (raw: Record<string, unknown>, keys: string[]): string =>
  keys.map((key) => text(raw[key])).find(Boolean) ?? "";

const firstAmount = (raw: Record<string, unknown>, keys: string[]): number => {
  for (const key of keys) {
    const n = Number(raw[key]);
    if (raw[key] !== null && raw[key] !== "" && raw[key] !== undefined && !Number.isNaN(n)) return n;
  }
  return 0;
};

/** Backend dates may carry a time part; the modal wants `YYYY-MM-DD`. */
const isoDate = (value: string): string | null => (/^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null);

/** The invoice item shape isn't confirmed yet, so the usual field names are all accepted. */
function toInvoice(raw: unknown, index: number): ServiceInvoice | null {
  if (!isRecord(raw)) return null;
  const id = firstText(raw, ["invoice_id", "id"]);
  if (!id) return null;
  const sequence = Number(raw.sequence ?? raw.period_number ?? raw.index ?? /\d+/.exec(text(raw.label))?.[0]);
  return {
    id,
    number: firstText(raw, ["invoice_number", "number", "invoice_no"]) || id,
    sequence: Number.isInteger(sequence) && sequence > 0 ? sequence : index + 1,
    periodStart: isoDate(firstText(raw, ["period_start", "billing_period_start", "start_date", "starts_at"])),
    periodEnd: isoDate(firstText(raw, ["period_end", "billing_period_end", "end_date", "ends_at"])),
    issuedAt: isoDate(firstText(raw, ["issued_at", "created_at"])),
    isCurrent: raw.is_current === true,
    amount: firstAmount(raw, ["amount_usd", "amount", "total_usd", "total"]),
  };
}

const toInvoices = (value: unknown): ServiceInvoice[] =>
  (Array.isArray(value) ? value : [])
    .map(toInvoice)
    .filter((invoice): invoice is ServiceInvoice => invoice !== null);

/**
 * `GET /billing/service-invoices?workflow_id=…`: the monthly and yearly
 * invoices of one service. A valid service without invoices is not an
 * error — both lists just come back empty. Rejects with an `AuthApiError`.
 */
export async function fetchServiceInvoices(workflowId: string, signal?: AbortSignal): Promise<ServiceInvoices> {
  try {
    const { data } = await axios.get(SERVICE_INVOICES_URL, {
      params: { workflow_id: workflowId },
      headers: authHeaders(),
      signal,
    });
    const payload = Array.isArray(data) ? data[0] : data;
    if (!isRecord(payload) || payload.success === false) {
      throw payloadToAuthApiError(isRecord(payload) ? payload : undefined);
    }
    return {
      purchased: isRecord(payload.service) && payload.service.purchased === true,
      monthly: toInvoices(payload.monthly_invoices), annual: toInvoices(payload.yearly_invoices),
    };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/** Filename from a `Content-Disposition` header, if it carries one. */
function filenameFromDisposition(header: unknown): string | null {
  if (typeof header !== "string") return null;
  const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(header);
  const name = match?.[1] ?? match?.[2];
  if (!name) return null;
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/** Errors arrive as a JSON body, but the request asked for a blob — read it back. */
async function blobToAuthApiError(error: unknown): Promise<AuthApiError> {
  const data = (error as { response?: { data?: unknown } }).response?.data;
  if (data instanceof Blob) {
    try {
      const payload = JSON.parse(await data.text()) as Record<string, unknown>;
      return payloadToAuthApiError(Array.isArray(payload) ? payload[0] : payload);
    } catch {
      /* not JSON — fall through to the generic mapping */
    }
  }
  return toAuthApiError(error);
}

/**
 * `GET /billing/invoice/download?invoice_id=…` and hands the PDF to the
 * browser as a download. Rejects with an `AuthApiError` on any backend error.
 */
export async function downloadInvoice(invoiceId: string, signal?: AbortSignal): Promise<void> {
  try {
    const response = await axios.get<Blob>(INVOICE_DOWNLOAD_URL, {
      params: { invoice_id: invoiceId },
      headers: authHeaders(),
      responseType: "blob",
      signal,
    });
    // A 200 can still carry an error envelope instead of a PDF.
    if (!String(response.headers["content-type"] ?? "").includes("application/pdf")) {
      try {
        const payload = JSON.parse(await response.data.text()) as Record<string, unknown>;
        if (payload.success === false) throw payloadToAuthApiError(payload);
      } catch (error) {
        if (error instanceof AuthApiError) throw error;
      }
    }

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = filenameFromDisposition(response.headers["content-disposition"]) ?? `${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    throw error instanceof AuthApiError ? error : await blobToAuthApiError(error);
  }
}

/** Downloads several invoices one after another (one PDF per id). */
export async function downloadInvoices(invoiceIds: string[]): Promise<void> {
  for (const id of invoiceIds) await downloadInvoice(id);
}

/** Documented backend error codes for the download-invoice endpoint (besides the session ones). */
export type InvoiceErrorCode =
  | "INVOICE_ID_REQUIRED"
  | "INVOICE_NOT_FOUND"
  | "INVOICE_PDF_NOT_READY"
  | "WORKFLOW_ID_REQUIRED"
  | "SERVICE_NOT_FOUND";

export type InvoiceErrorKind = "notFound" | "notReady" | "serviceNotFound" | "other";

/** Which message a rejected invoice call (download or list) should show. */
export function invoiceErrorKind(error: AuthApiError): InvoiceErrorKind {
  switch (error.code) {
    case "INVOICE_NOT_FOUND":
      return "notFound";
    case "INVOICE_PDF_NOT_READY":
      return "notReady";
    case "SERVICE_NOT_FOUND":
      return "serviceNotFound";
    default:
      return "other";
  }
}
