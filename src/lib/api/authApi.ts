/**
 * Client for the auth captcha + registration webhooks (n8n-backed).
 *
 * Flow the backend expects: fetch a captcha image, verify the user's
 * answer to get a short-lived `captcha_token`, then submit that token
 * along with the registration fields. The token is single-use — a
 * fresh captcha challenge is required after any failed attempt.
 */
import axios, { type AxiosError } from "axios";
import { showToast } from "@/lib/toast";

const CAPTCHA_IMAGE_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth-captcha";
const CAPTCHA_VERIFY_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/captcha/verify";
const REGISTER_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth/register";
const LOGIN_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth/login";
const RESEND_VERIFICATION_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/resend-verification";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

/** Documented backend codes for the register endpoint (used to build its `messages` map — see `reportApiError`). */
export type RegisterErrorCode =
  | "INVALID_INPUT"
  | "INVALID_EMAIL"
  | "EMAIL_EXISTS"
  | "INVALID_USERNAME"
  | "USERNAME_EXISTS"
  | "INVALID_CAPTCHA";

/**
 * Confirmed backend codes for the login endpoint. Any other code the
 * backend sends is still passed through as-is by `toAuthApiError` (nothing
 * is allowlisted per-endpoint) — LoginForm just doesn't have a translated
 * message for it, so it falls back to a generic one via `reportApiError`.
 */
export type LoginErrorCode =
  | "INVALID_INPUT"
  | "INVALID_CAPTCHA"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED";

/**
 * Thrown for both known backend error codes and network/parse failures.
 * `code` is a plain string (not narrowed to `RegisterErrorCode`) so this
 * same class — and `reportApiError` below — can be reused by any other
 * auth endpoint added later (login, forgot-password, ...), each with its
 * own set of backend error codes.
 */
export class AuthApiError extends Error {
  code: string;
  /** Per-field validation detail strings the backend sends as-is (e.g. `validation_errors`); shown verbatim, not translated. */
  details?: string[];
  /** The frontend route the backend says to continue on (e.g. `/check-your-email` for `EMAIL_NOT_VERIFIED`), if it sent one. */
  nextPage?: string;

  constructor(code: string, message: string, details?: string[], nextPage?: string) {
    super(message);
    this.code = code;
    this.details = details;
    this.nextPage = nextPage;
  }
}

/**
 * Reusable across every form: shows a toast for whatever error a form's
 * submit handler catches. `messages` maps that form's own backend error
 * codes (as documented next to its API function, e.g. `RegisterErrorCode`)
 * to the copy it should display; `fallback` covers `NETWORK_ERROR` and any
 * code not in the map. Field-level validation errors are a separate
 * concern and are not touched here — keep those as local `useState` in
 * the form, set only from client-side validation.
 *
 * When the backend also sends per-field `details` (e.g. "Password must
 * contain a special character"), those are appended below the mapped
 * message so the user sees exactly what the backend rejected.
 */
export function reportApiError(
  error: unknown,
  messages: Record<string, string>,
  fallback: string,
): void {
  const code = error instanceof AuthApiError ? error.code : "NETWORK_ERROR";
  const details = error instanceof AuthApiError ? error.details : undefined;
  const base = messages[code] ?? fallback;
  const text = details?.length ? [base, ...details].join("\n") : base;
  showToast(text, "error", details?.length ? 8000 : undefined);
}

/**
 * Backend codes for a rejected/expired/missing CAPTCHA answer, shared by
 * the register and login endpoints. Mapped to a form's own `errors` copy
 * key of the same name (e.g. `copy.errors.captchaExpired`) so the message
 * renders under the CAPTCHA field like any other field-level error,
 * instead of the generic toast `reportApiError` shows for other codes.
 */
const CAPTCHA_ERROR_CODE_KEYS = {
  CAPTCHA_REQUIRED: "captchaRequired",
  INVALID_CAPTCHA: "captchaInvalid",
  INCORRECT_CAPTCHA: "captchaIncorrect",
  CAPTCHA_EXPIRED: "captchaExpired",
  CAPTCHA_TOO_MANY_ATTEMPTS: "captchaTooManyAttempts",
} as const;

export type CaptchaErrorKey =
  (typeof CAPTCHA_ERROR_CODE_KEYS)[keyof typeof CAPTCHA_ERROR_CODE_KEYS];

/** Returns the `errors` copy key for a CAPTCHA-specific backend code, or `undefined` for any other error. */
export function getCaptchaErrorKey(error: unknown): CaptchaErrorKey | undefined {
  if (!(error instanceof AuthApiError)) return undefined;
  return CAPTCHA_ERROR_CODE_KEYS[error.code as keyof typeof CAPTCHA_ERROR_CODE_KEYS];
}

interface BackendEnvelope {
  success?: boolean;
  code?: string;
  message?: string;
  [key: string]: unknown;
}

/** n8n webhook nodes sometimes wrap a single item in an array — unwrap it. */
function unwrap(data: unknown): BackendEnvelope {
  return (Array.isArray(data) ? data[0] : data) as BackendEnvelope;
}

function toAuthApiError(error: unknown): AuthApiError {
  const axiosError = error as AxiosError<unknown>;
  if (!axiosError.response) {
    return new AuthApiError("NETWORK_ERROR", "Network request failed.");
  }

  const payload = unwrap(axiosError.response.data);
  const code = typeof payload?.code === "string" && payload.code ? payload.code : "NETWORK_ERROR";
  const details = Array.isArray(payload?.validation_errors)
    ? payload.validation_errors.filter((item): item is string => typeof item === "string")
    : undefined;
  const nextPage = typeof payload?.next_page === "string" ? payload.next_page : undefined;
  return new AuthApiError(code, payload?.message ?? "Request failed.", details, nextPage);
}

export interface CaptchaChallenge {
  challengeId: string;
  image: string;
  expiresIn: number;
}

export interface CaptchaVerification {
  captchaToken: string;
  expiresIn: number;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  captchaToken: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  captchaToken: string;
}

export async function fetchCaptcha(): Promise<CaptchaChallenge> {
  try {
    const { data } = await client.get(CAPTCHA_IMAGE_URL);
    const payload = unwrap(data) as {
      challenge_id: string;
      image: string;
      expires_in: number;
    };
    return {
      challengeId: payload.challenge_id,
      image: payload.image,
      expiresIn: payload.expires_in,
    };
  } catch (error) {
    throw toAuthApiError(error);
  }
}

export async function verifyCaptcha(
  challengeId: string,
  answer: string,
): Promise<CaptchaVerification> {
  try {
    const { data } = await client.post(CAPTCHA_VERIFY_URL, {
      challenge_id: challengeId,
      answer,
    });
    const payload = unwrap(data) as {
      verified: boolean;
      captcha_token: string;
      expires_in: number;
    };

    if (!payload.verified) {
      throw new AuthApiError("INVALID_CAPTCHA", "CAPTCHA is invalid or expired.");
    }

    return { captchaToken: payload.captcha_token, expiresIn: payload.expires_in };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/**
 * Shared shape of a register/login success payload: a short-lived
 * `session_token` plus a `ready` flag saying whether the account still
 * needs the complete-profile step, and (when `ready` is false) the
 * `next_page` route to send the user to for it. `AuthContext.authenticate`
 * consumes this directly.
 */
export interface AuthSessionResult {
  success: boolean;
  sessionToken?: string;
  expiresAt?: string;
  ready: boolean;
  nextPage?: string;
  firstName?: string;
  lastName?: string;
}

interface RawUserNames {
  first_name?: unknown;
  last_name?: unknown;
}

interface RawAuthSessionPayload extends RawUserNames {
  success?: boolean;
  session_token?: string;
  expires_at?: string;
  ready?: boolean;
  next_page?: string;
  user?: RawUserNames;
}

/** Trimmed string, or undefined for anything missing/empty/non-string. */
function toName(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function toAuthSessionResult(raw: RawAuthSessionPayload): AuthSessionResult {
  return {
    success: raw.success ?? true,
    sessionToken: raw.session_token,
    expiresAt: raw.expires_at,
    ready: raw.ready ?? true,
    nextPage: raw.next_page,
    // n8n may send the names at the root or nested under `user`.
    firstName: toName(raw.first_name) ?? toName(raw.user?.first_name),
    lastName: toName(raw.last_name) ?? toName(raw.user?.last_name),
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthSessionResult> {
  try {
    const { data } = await client.post(REGISTER_URL, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      username: payload.username,
      password: payload.password,
      confirm_password: payload.confirmPassword,
      captcha_token: payload.captchaToken,
    });
    return toAuthSessionResult(unwrap(data) as RawAuthSessionPayload);
  } catch (error) {
    throw toAuthApiError(error);
  }
}

/**
 * The exact fields the login endpoint sends back on success haven't been
 * confirmed yet, so this is parsed defensively the same way as
 * `registerUser`'s response — any field the backend doesn't (yet) send just
 * comes back `undefined`/defaulted, nothing throws over it.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthSessionResult> {
  try {
    const { data } = await client.post(LOGIN_URL, {
      username: payload.username,
      password: payload.password,
      captcha_token: payload.captchaToken,
    });
    return toAuthSessionResult(unwrap(data) as RawAuthSessionPayload);
  } catch (error) {
    throw toAuthApiError(error);
  }
}

/** Confirmed backend codes for the resend-verification endpoint. */
export type ResendVerificationErrorCode = "EMAIL_ALREADY_VERIFIED";

export async function resendVerificationEmail(email: string): Promise<void> {
  try {
    await client.post(RESEND_VERIFICATION_URL, { email });
  } catch (error) {
    throw toAuthApiError(error);
  }
}
