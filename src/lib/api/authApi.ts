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
import { getAuthSession } from "@/lib/api/session";

const CAPTCHA_IMAGE_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth-captcha";
const CAPTCHA_VERIFY_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/captcha/verify";
const REGISTER_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth/register";
const LOGIN_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth/login";
const RESEND_VERIFICATION_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/resend-verification";
const PROFILE_UPDATE_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/profile/update";
const PROFILE_URL = "https://n8n.srv1879006.hstgr.cloud/webhook/auth/profile";
const CHANGE_PASSWORD_URL =
  "https://n8n.srv1879006.hstgr.cloud/webhook/auth/change-password";

const client = axios.create({
  headers: { "Content-Type": "application/json" },
});

/** Documented backend codes for the register endpoint (used to build its `messages` map — see `reportApiError`). */
export type RegisterErrorCode =
  | "INVALID_INPUT"
  | "INVALID_EMAIL"
  | "EMAIL_EXISTS"
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
/** One entry of a `VALIDATION_ERROR` response's `errors` list, e.g. `{ field: "first_name", code: "FIRST_NAME_REQUIRED" }`. */
export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

export class AuthApiError extends Error {
  code: string;
  /** Per-field errors from a `VALIDATION_ERROR` response, keyed by the backend's snake_case field name. */
  fieldErrors?: ApiFieldError[];
  /** Per-field validation detail strings the backend sends as-is (e.g. `validation_errors`); shown verbatim, not translated. */
  details?: string[];
  /** The frontend route the backend says to continue on (e.g. `/check-your-email` for `EMAIL_NOT_VERIFIED`), if it sent one. */
  nextPage?: string;

  constructor(
    code: string,
    message: string,
    details?: string[],
    nextPage?: string,
  ) {
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
export function getCaptchaErrorKey(
  error: unknown,
): CaptchaErrorKey | undefined {
  if (!(error instanceof AuthApiError)) return undefined;
  return CAPTCHA_ERROR_CODE_KEYS[
    error.code as keyof typeof CAPTCHA_ERROR_CODE_KEYS
  ];
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

function toFieldErrors(value: unknown): ApiFieldError[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const list = value.filter(
    (item): item is ApiFieldError =>
      typeof item?.field === "string" && typeof item?.code === "string",
  );
  return list.length ? list : undefined;
}

function payloadToAuthApiError(
  payload: BackendEnvelope | undefined,
): AuthApiError {
  const code =
    typeof payload?.code === "string" && payload.code
      ? payload.code
      : "NETWORK_ERROR";
  const details = Array.isArray(payload?.validation_errors)
    ? payload.validation_errors.filter(
        (item): item is string => typeof item === "string",
      )
    : undefined;
  const nextPage =
    typeof payload?.next_page === "string" ? payload.next_page : undefined;
  const apiError = new AuthApiError(
    code,
    payload?.message ?? "Request failed.",
    details,
    nextPage,
  );
  apiError.fieldErrors = toFieldErrors(payload?.errors);
  return apiError;
}

function toAuthApiError(error: unknown): AuthApiError {
  const axiosError = error as AxiosError<unknown>;
  if (!axiosError.response) {
    return new AuthApiError("NETWORK_ERROR", "Network request failed.");
  }
  return payloadToAuthApiError(unwrap(axiosError.response.data));
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
  password: string;
  confirmPassword: string;
  captchaToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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
      throw new AuthApiError(
        "INVALID_CAPTCHA",
        "CAPTCHA is invalid or expired.",
      );
    }

    return {
      captchaToken: payload.captcha_token,
      expiresIn: payload.expires_in,
    };
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
  /** Login sends the names without the underscore. */
  firstname?: unknown;
  lastname?: unknown;
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
    // Login sends `firstname`/`lastname`; other endpoints may use
    // `first_name`/`last_name`, at the root or nested under `user`.
    firstName:
      toName(raw.firstname) ??
      toName(raw.first_name) ??
      toName(raw.user?.firstname) ??
      toName(raw.user?.first_name),
    lastName:
      toName(raw.lastname) ??
      toName(raw.last_name) ??
      toName(raw.user?.lastname) ??
      toName(raw.user?.last_name),
  };
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<AuthSessionResult> {
  try {
    const { data } = await client.post(REGISTER_URL, {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
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
export async function loginUser(
  payload: LoginPayload,
): Promise<AuthSessionResult> {
  try {
    const { data } = await client.post(LOGIN_URL, {
      email: payload.email,
      password: payload.password,
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

export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  /** Full international number, dial code included (e.g. `+49123456789`). */
  phone: string;
  brandName: string;
  telegramUsername: string;
  website: string;
  timezone: string;
  job: string;
  jobTitle: string;
  linkedinPageName: string;
  instagramHandle: string;
  xHandle: string;
  telegramChannelName: string;
  /** Logo image, sent as a binary file part. */
  logo?: Blob | null;
}

/**
 * Documented backend codes for the profile update endpoint. `VALIDATION_ERROR`
 * carries per-field detail in `AuthApiError.fieldErrors`.
 */
export type ProfileUpdateErrorCode =
  | "INVALID_SESSION"
  | "VALIDATION_ERROR"
  | "INVALID_CAPTCHA"
  | "PROFILE_INCOMPLETE";

/** Profile update success: whether the account is now `ready`, and where to go next. */
export interface ProfileUpdateResult {
  /** `undefined` when the backend didn't say (e.g. an empty response body). */
  ready?: boolean;
  nextPage?: string;
}

/**
 * Sent as multipart/form-data so the logo can go up as the raw image binary
 * alongside the text fields. The session token authenticates the request.
 */
export async function updateProfile(
  payload: ProfileUpdatePayload,
): Promise<ProfileUpdateResult> {
  const form = new FormData();
  const fields: Record<string, string> = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    brand_name: payload.brandName,
    telegram_username: payload.telegramUsername,
    website: payload.website,
    timezone: payload.timezone,
    job: payload.job,
    job_title: payload.jobTitle,
    linkedin_page_name: payload.linkedinPageName,
    instagram_handle: payload.instagramHandle,
    x_handle: payload.xHandle,
    telegram_channel_name: payload.telegramChannelName,
  };
  for (const [key, value] of Object.entries(fields)) form.append(key, value);
  if (payload.logo) {
    const name = payload.logo instanceof File ? payload.logo.name : "logo.svg";
    form.append("logo", payload.logo, name);
  }

  try {
    const { data } = await axios.post(PROFILE_UPDATE_URL, form, {
      headers: authHeaders(),
    });
    const result = unwrap(data);
    if (result?.success === false) throw payloadToAuthApiError(result);
    return {
      ready: typeof result?.ready === "boolean" ? result.ready : undefined,
      nextPage:
        typeof result?.next_page === "string" ? result.next_page : undefined,
    };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

/** `Authorization: Bearer <session token>` for the endpoints that need a signed-in user. */
function authHeaders(): Record<string, string> | undefined {
  const token = getAuthSession()?.token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/** The signed-in user's profile, as the Edit Account form shows it. Missing fields come back as "". */
export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  /** Full international number, dial code included (e.g. `+49123456789`). */
  phone: string;
  brandName: string;
  telegramUsername: string;
  website: string;
  timezone: string;
  job: string;
  jobTitle: string;
  linkedinPageName: string;
  instagramHandle: string;
  xHandle: string;
  telegramChannelName: string;
  /** URL of the current logo image, if one has been uploaded. */
  logoUrl: string;
}

/**
 * Google Drive share/download links (`drive.google.com/uc?export=view&id=…`,
 * `/file/d/<id>/view`, `open?id=…`) redirect to a download response that
 * browsers refuse to render in an `<img>`. Drive's thumbnail endpoint serves
 * the same public file as a plain image, so those links are rewritten to it.
 * Any other URL is returned unchanged.
 */
export function toDisplayableImageUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== "drive.google.com") return url;

  const id =
    parsed.searchParams.get("id") ??
    parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
  return id
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w512`
    : url;
}

function str(value: unknown): string {
  return typeof value === "string"
    ? value
    : typeof value === "number"
      ? String(value)
      : "";
}

/** Documented backend codes for the get-profile endpoint. */
export type ProfileErrorCode = "SESSION_REQUIRED" | "ACCOUNT_DISABLED";

/**
 * `GET /auth/profile`. The exact response shape isn't confirmed yet, so the
 * profile is read from the root or from a nested `profile` / `user` / `data`
 * object, whichever the backend sends.
 */
export async function fetchProfile(signal?: AbortSignal): Promise<UserProfile> {
  try {
    const { data } = await axios.get(PROFILE_URL, {
      headers: authHeaders(),
      signal,
    });
    const payload = unwrap(data);
    if (payload?.success === false) throw payloadToAuthApiError(payload);

    const nested = [payload?.profile, payload?.user, payload?.data].find(
      (value): value is Record<string, unknown> =>
        typeof value === "object" && value !== null && !Array.isArray(value),
    );
    const raw: Record<string, unknown> = { ...payload, ...nested };

    return {
      email: str(raw.email),
      firstName: str(raw.first_name),
      lastName: str(raw.last_name),
      phone: str(raw.phone),
      brandName: str(raw.brand_name),
      telegramUsername: str(raw.telegram_username),
      website: str(raw.website),
      timezone: str(raw.timezone),
      job: str(raw.job),
      jobTitle: str(raw.job_title),
      linkedinPageName: str(raw.linkedin_page_name),
      instagramHandle: str(raw.instagram_handle),
      xHandle: str(raw.x_handle),
      telegramChannelName: str(raw.telegram_channel_name),
      logoUrl: toDisplayableImageUrl(str(raw.logo_url) || str(raw.logo)),
    };
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** `POST /auth/change-password` for the signed-in user. */
export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<void> {
  try {
    const { data } = await client.post(
      CHANGE_PASSWORD_URL,
      {
        current_password: payload.currentPassword,
        new_password: payload.newPassword,
        confirm_password: payload.confirmPassword,
      },
      { headers: authHeaders() },
    );
    const result = unwrap(data);
    if (result?.success === false) throw payloadToAuthApiError(result);
  } catch (error) {
    throw error instanceof AuthApiError ? error : toAuthApiError(error);
  }
}
