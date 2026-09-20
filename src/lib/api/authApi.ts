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

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

/** Documented backend codes for the register endpoint (used to build its `messages` map — see `reportApiError`). */
export type RegisterErrorCode =
  | "INVALID_INPUT"
  | "INVALID_CAPTCHA"
  | "USERNAME_EXISTS"
  | "EMAIL_EXISTS";

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

  constructor(code: string, message: string, details?: string[]) {
    super(message);
    this.code = code;
    this.details = details;
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
  return new AuthApiError(code, payload?.message ?? "Request failed.", details);
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

export async function registerUser(payload: RegisterPayload): Promise<void> {
  try {
    await client.post(REGISTER_URL, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      username: payload.username,
      password: payload.password,
      confirm_password: payload.confirmPassword,
      captcha_token: payload.captchaToken,
    });
  } catch (error) {
    throw toAuthApiError(error);
  }
}

/**
 * The success response shape (session token, user info, ...) hasn't been
 * confirmed yet, so this just resolves the unwrapped payload as-is for the
 * caller to inspect once that's known — LoginForm currently only cares
 * whether this resolves or throws.
 */
export async function loginUser(payload: LoginPayload): Promise<unknown> {
  try {
    const { data } = await client.post(LOGIN_URL, {
      username: payload.username,
      password: payload.password,
      captcha_token: payload.captchaToken,
    });
    return unwrap(data);
  } catch (error) {
    throw toAuthApiError(error);
  }
}
