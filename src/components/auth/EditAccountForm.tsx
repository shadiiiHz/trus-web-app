import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { SiteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import {
  AuthApiError,
  fetchProfile,
  generateLogo as requestGeneratedLogo,
  reportApiError,
  type UserProfile,
  updateProfile,
} from "@/lib/api/authApi";
import { resolveNextPage } from "@/lib/api/nextPage";
import { getAuthSession } from "@/lib/api/session";
import { fetchJobs, fetchTimezones } from "@/lib/api/publicApi";
import { useLocale } from "@/i18n";
import {
  COUNTRY_DIAL_CODES,
  PRIMARY_DIAL_CODE_COUNTRY,
} from "@/lib/countryDialCodes";
import { showToast } from "@/lib/toast";
import businessLogoPlaceholder from "@/assets/auth/business-logo-placeholder.svg";
import uploadBadge from "@/assets/auth/upload-badge.svg";
import uploadBadgePointer from "@/assets/auth/upload-badge-pointer.svg";
import uploadIcon from "@/assets/auth/upload-icon.svg";
import socialLinkedIn from "@/assets/auth/social-linkedin.svg";
import socialInstagram from "@/assets/auth/social-instagram.svg";
import socialX from "@/assets/auth/social-x.svg";
import socialTelegram from "@/assets/auth/social-telegram.svg";
import generateLogo from "@/assets/auth/generate-logo.svg";
import uploadLogo from "@/assets/auth/upload-logo.svg";
// Starts as a copy of RegisterForm so the Edit Account page has its own,
// independently editable component going forward (pre-filling existing
// data, dropping/adjusting fields, wiring a real update call, etc.).
export interface EditAccountFormProps {
  copy: SiteConfig["auth"]["editAccount"];
}

// Structural (non-translated) dropdown/select data — presentation only.
const COUNTRY_CODES = COUNTRY_DIAL_CODES;

/** Country-code dropdown options: "DE  Germany  +49", searchable by any part. */
function buildCountryOptions(locale: string): SelectOption[] {
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames([locale, "en"], { type: "region" });
  } catch {
    names = undefined;
  }
  return COUNTRY_CODES.map((c) => {
    let name: string | undefined;
    try {
      name = names?.of(c.value);
    } catch {
      name = undefined;
    }
    return {
      value: c.value,
      label: c.value,
      description: name && name !== c.value ? name : undefined,
      hint: c.dial,
      // Lets "49" or "+49" both find Germany.
      keywords: `${c.dial} ${c.dial.slice(1)}`,
    };
  });
}

/** True when the number carries its own country code (`+49…` or `0049…`). */
function isInternational(value: string): boolean {
  return /^\s*(\+|00)/.test(value);
}

/**
 * Splits `+49123456789` (or `0049123456789`) into a known dial code's
 * country and the rest of the number.
 */
function splitPhone(full: string): { country?: string; number: string } {
  const compact = full.replace(/[^\d+]/g, "").replace(/^00/, "+");
  const match = [...COUNTRY_CODES]
    .filter((c) => compact.startsWith(c.dial))
    .sort(
      (a, b) =>
        b.dial.length - a.dial.length ||
        Number(PRIMARY_DIAL_CODE_COUNTRY[b.dial] === b.value) -
          Number(PRIMARY_DIAL_CODE_COUNTRY[a.dial] === a.value),
    )[0];
  return match
    ? { country: match.value, number: compact.slice(match.dial.length) }
    : { number: compact.replace(/^\+/, "") };
}

/** The website field shows `https://` as a fixed prefix, so only the rest is edited. */
function stripUrlScheme(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "");
}

function withUrlScheme(value: string): string {
  const rest = stripUrlScheme(value);
  return rest ? `https://${rest}` : "";
}

type FieldErrorKey = keyof SiteConfig["auth"]["editAccount"]["errors"];
type FieldName =
  | "firstName"
  | "lastName"
  | "phone"
  | "brandName"
  | "telegramUsername"
  | "timezone"
  | "industry"
  | "logo";
type FieldErrors = Partial<Record<FieldName, FieldErrorKey>>;

// Backend field name (profile update `VALIDATION_ERROR`) → form field + the
// copy key shown when the backend reports it as missing (`*_REQUIRED`).
const BACKEND_REQUIRED_FIELDS: Record<string, [FieldName, FieldErrorKey]> = {
  first_name: ["firstName", "firstNameRequired"],
  last_name: ["lastName", "lastNameRequired"],
  phone: ["phone", "phoneRequired"],
  timezone: ["timezone", "timezoneRequired"],
  telegram_username: ["telegramUsername", "telegramUsernameRequired"],
  brand_name: ["brandName", "brandNameRequired"],
  job: ["industry", "industryRequired"],
};

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-3 z-10 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "h-10 w-full rounded-md border border-auth-border bg-white pl-3 pr-4 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

const readOnlyClass = "border-auth-border focus:border-auth-border";

const selectBaseClass =
  "flex h-10 w-full items-center appearance-none rounded-md border border-auth-border bg-white pr-16 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-auth-primary" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3.5 z-10 h-4 w-4 text-auth-icon"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SocialFieldInfoIcon() {
  return (
    <svg
      className="pointer-events-none absolute right-3.5 z-10 h-4 w-4 text-auth-icon-muted"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6.06065 5.99998C6.21739 5.55442 6.52675 5.17872 6.93395 4.9394C7.34116 4.70009 7.81991 4.6126 8.28543 4.69245C8.75096 4.7723 9.17319 5.01433 9.47737 5.37566C9.78154 5.737 9.94802 6.19433 9.94732 6.66665C9.94732 7.99998 7.94732 8.66665 7.94732 8.66665M8.00065 11.3333H8.00732M14.6673 7.99998C14.6673 11.6819 11.6825 14.6666 8.00065 14.6666C4.31875 14.6666 1.33398 11.6819 1.33398 7.99998C1.33398 4.31808 4.31875 1.33331 8.00065 1.33331C11.6825 1.33331 14.6673 4.31808 14.6673 7.99998Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function Field({
  id,
  label,
  required,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-body-sm font-medium text-auth-text"
      >
        {label}
        {required && <RequiredMark />}
      </label>
      {children}
      {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-auth-border-light bg-white p-6 sm:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  badge,
  subtitle,
  required,
  divider = true,
  className = "",
}: {
  title: string;
  badge?: string;
  subtitle: string;
  required?: boolean;
  divider?: boolean;
  className?: string;
}) {
  return (
    <div className={`font-body ${divider ? "mb-6" : ""} ${className}`}>
      <h2 className="text-[16px] font-semibold text-auth-heading">
        {title}
        {required && <RequiredMark />}
        {badge && (
          <span className="ml-1 font-normal text-auth-heading">{badge}</span>
        )}
      </h2>
      <p className="mt-1 text-[14px] font-normal leading-snug text-auth-muted">
        {subtitle}
      </p>
      {divider && <div className="mt-4 h-px bg-auth-divider" />}
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

function SkeletonSectionHeader({ divider = true }: { divider?: boolean }) {
  return (
    <div className={divider ? "mb-6" : ""}>
      <SkeletonBlock className="h-5 w-44 rounded-md" />
      <SkeletonBlock className="mt-2.5 h-3.5 w-4/5 max-w-[420px] rounded-md" />
      {divider && <div className="mt-4 h-px bg-auth-divider" />}
    </div>
  );
}

function SkeletonField() {
  return (
    <div>
      <SkeletonBlock className="mb-2.5 h-3.5 w-24 rounded-md" />
      <SkeletonBlock className="h-10 w-full rounded-md" />
    </div>
  );
}

/** Mirrors the two top cards' layout while the profile and dropdown options load. */
function EditAccountSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-hidden="true">
      <Card>
        <SkeletonSectionHeader />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 10 }, (_, i) => (
            <SkeletonField key={i} />
          ))}
        </div>
      </Card>

      <Card>
        <SkeletonSectionHeader />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonField key={i} />
          ))}
        </div>

        <div className="mt-6">
          <SkeletonSectionHeader />
        </div>

        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <SkeletonBlock className="h-[146px] w-[146px] shrink-0 rounded-full" />
          <div className="flex w-full flex-1 flex-col gap-5">
            <SkeletonBlock className="h-[92px] w-full rounded-lg" />
            <div className="flex flex-col gap-3 sm:flex-row">
              <SkeletonBlock className="h-10 flex-1 rounded-md" />
              <SkeletonBlock className="h-10 flex-1 rounded-md" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function EditAccountForm({ copy }: EditAccountFormProps) {
  const navigate = useNavigate();
  const { logout, authenticate, setLogoUrl, refreshLogo } = useAuth();
  const locale = useLocale();
  const countryOptions = useMemo(() => buildCountryOptions(locale), [locale]);

  const firstNameId = useId();
  const lastNameId = useId();
  const phoneId = useId();
  const emailId = useId();
  const brandNameId = useId();
  const telegramUsernameId = useId();
  const websiteId = useId();
  const timezoneId = useId();
  const industryId = useId();
  const jobTitleId = useId();
  const linkedinId = useId();
  const instagramId = useId();
  const xHandleId = useId();
  const telegramChannelId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState<string>(
    COUNTRY_CODES[0].value,
  );
  const selectedCountryDial =
    COUNTRY_CODES.find((c) => c.value === countryCode)?.dial ?? "";
  const [phone, setPhone] = useState("");
  // Email identifies the account and cannot be changed here.
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezoneOptions, setTimezoneOptions] = useState<SelectOption[]>([]);
  const [industryOptions, setIndustryOptions] = useState<SelectOption[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [timezonesLoading, setTimezonesLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const isLoading = profileLoading || timezonesLoading || jobsLoading;
  const [jobTitle, setJobTitle] = useState("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<Blob | null>(null);
  // Link to a generated logo that couldn't be downloaded as a file; saved
  // with the profile on submit, like a picked file.
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState<string | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);

  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [telegramChannel, setTelegramChannel] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchTimezones(controller.signal)
      .then(setTimezoneOptions)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setTimezonesLoading(false);
      });
    fetchJobs(controller.signal)
      .then(setIndustryOptions)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setJobsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const applyProfile = (profile: UserProfile) => {
    setEmail(profile.email);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    // The backend stores the full international number but may drop the
    // leading "+" (e.g. "35811111111"), so read it as international either way.
    const { country, number } = splitPhone(
      isInternational(profile.phone) ? profile.phone : `+${profile.phone}`,
    );
    if (country) setCountryCode(country);
    setPhone(number);
    setBrandName(profile.brandName);
    setTelegramUsername(profile.telegramUsername);
    setWebsite(stripUrlScheme(profile.website));
    setTimezone(profile.timezone);
    setIndustry(profile.job);
    setJobTitle(profile.jobTitle);
    setLinkedin(profile.linkedinPageName);
    setInstagram(profile.instagramHandle);
    setXHandle(profile.xHandle);
    setTelegramChannel(profile.telegramChannelName);
    // The server already has this logo — only a newly picked one is re-sent.
    setLogoPreview(profile.logoUrl || null);
    setLogoFile(null);
    setGeneratedLogoUrl(null);
    // Keep the header's account menu showing the same logo.
    setLogoUrl(profile.logoUrl);
  };

  /**
   * Backend codes (profile get/update) that mean the current session can't
   * be used any more: sign out and send the user back to log in.
   */
  const handleSessionError = (error: unknown): boolean => {
    const code = error instanceof AuthApiError ? error.code : undefined;
    const message =
      code === "INVALID_SESSION" || code === "SESSION_REQUIRED"
        ? copy.errors.sessionExpired
        : code === "ACCOUNT_DISABLED"
          ? copy.errors.accountDisabled
          : undefined;
    if (!message) return false;
    showToast(message, "error");
    logout();
    navigate("/login", { replace: true });
    return true;
  };

  /**
   * `VALIDATION_ERROR` (profile update / generate logo): marks the fields
   * the backend reports as missing and toasts anything it can't map.
   */
  const showValidationErrors = (error: AuthApiError) => {
    const fieldErrors: FieldErrors = {};
    const unmapped: string[] = [];
    for (const item of error.fieldErrors ?? []) {
      const mapped = BACKEND_REQUIRED_FIELDS[item.field];
      if (mapped && item.code.endsWith("_REQUIRED")) {
        fieldErrors[mapped[0]] = mapped[1];
      } else if (item.message) {
        unmapped.push(item.message);
      }
    }
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
    if (unmapped.length || !Object.keys(fieldErrors).length) {
      showToast(
        [copy.errors.invalidInput, ...unmapped].join("\n"),
        "error",
        unmapped.length ? 8000 : undefined,
      );
    }
  };

  const loadProfile = async (signal?: AbortSignal) => {
    try {
      applyProfile(await fetchProfile(signal));
    } catch (error) {
      if (signal?.aborted) return;
      if (!handleSessionError(error)) {
        showToast(copy.errors.profileLoadError, "error");
      }
    } finally {
      if (!signal?.aborted) setProfileLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // Fills the form from the backend on mount; setState only runs after
    // the awaited request resolves, not synchronously within this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = (field: FieldName) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus((prev) => (prev === "success" ? "idle" : prev));
  };

  const applyLogoFile = (file: File | undefined | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    setLogoFile(file);
    setGeneratedLogoUrl(null);
    clearError("logo");
  };

  const handleGenerateLogo = async () => {
    if (isGeneratingLogo) return;
    // The logo is built from these, so both are checked together up front.
    const missing: FieldErrors = {};
    if (!brandName.trim()) missing.brandName = "brandNameRequired";
    if (!industry) missing.industry = "industryRequired";
    if (Object.keys(missing).length > 0) {
      setErrors((prev) => ({ ...prev, ...missing }));
      return;
    }

    setIsGeneratingLogo(true);
    try {
      const logo = await requestGeneratedLogo({
        brandName: brandName.trim(),
        job: industry,
        jobTitle: jobTitle.trim(),
        logoDescription: "",
      });
      // Only a preview: the account keeps its current logo (header included)
      // until the form is submitted.
      setLogoPreview(logo.logoUrl);
      setLogoFile(logo.file ?? null);
      setGeneratedLogoUrl(logo.file ? null : (logo.sourceUrl ?? null));
      clearError("logo");
    } catch (error) {
      const code = error instanceof AuthApiError ? error.code : undefined;
      if (handleSessionError(error)) {
        return;
      } else if (code === "VALIDATION_ERROR" && error instanceof AuthApiError) {
        showValidationErrors(error);
      } else {
        reportApiError(
          error,
          {
            LOGO_DAILY_LIMIT_REACHED: copy.errors.logoDailyLimitReached,
            LOGO_GENERATION_FAILED: copy.errors.logoGenerationFailed,
          },
          copy.errors.logoGenerationFailed,
        );
      }
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "firstNameRequired";
    if (!lastName.trim()) nextErrors.lastName = "lastNameRequired";
    if (!phone.trim()) nextErrors.phone = "phoneRequired";
    if (!brandName.trim()) nextErrors.brandName = "brandNameRequired";
    if (!telegramUsername.trim())
      nextErrors.telegramUsername = "telegramUsernameRequired";
    if (!timezone) nextErrors.timezone = "timezoneRequired";
    if (!industry) nextErrors.industry = "industryRequired";
    if (!logoPreview) nextErrors.logo = "logoRequired";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");

    try {
      const result = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `${selectedCountryDial}${phone.replace(/\D/g, "")}`,
        brandName: brandName.trim(),
        telegramUsername: telegramUsername.trim(),
        website: withUrlScheme(website),
        timezone,
        job: industry,
        jobTitle: jobTitle.trim(),
        linkedinPageName: linkedin.trim(),
        instagramHandle: instagram.trim(),
        xHandle: xHandle.trim(),
        telegramChannelName: telegramChannel.trim(),
        logo: logoFile,
        logoUrl: generatedLogoUrl,
      });

      // Keep the stored session's `ready` flag in step with the backend so
      // ready-gated pages (e.g. /select-services) let the user through.
      // An empty/partial response leaves the stored flag as it was.
      const session = getAuthSession();
      if (session && result.ready !== undefined) {
        authenticate({
          token: session.token,
          expiresAt: session.expiresAt,
          ready: result.ready,
          displayName: session.displayName,
        });
      }

      setStatus("success");
      showToast(copy.success, "success");
      if (result.nextPage) {
        // Leaving without re-reading the profile here, so let the header's
        // account menu pick up the newly saved logo on its own.
        refreshLogo();
        navigate(resolveNextPage(result.nextPage));
        return;
      }
      // Staying on the page: re-read what the server saved so the form
      // reflects the stored profile.
      await loadProfile();
    } catch (error) {
      const code = error instanceof AuthApiError ? error.code : undefined;
      if (handleSessionError(error)) {
        return;
      } else if (code === "VALIDATION_ERROR" && error instanceof AuthApiError) {
        showValidationErrors(error);
      } else if (code === "PROFILE_INCOMPLETE") {
        showToast(copy.errors.profileIncomplete, "error");
      } else {
        reportApiError(
          error,
          { INVALID_INPUT: copy.errors.invalidInput },
          copy.errors.genericError,
        );
      }
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {isLoading ? (
        <EditAccountSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <SectionHeader
              title={copy.business.title}
              subtitle={copy.business.subtitle}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id={firstNameId}
                label={copy.business.firstNameLabel}
                required
                error={errors.firstName && copy.errors[errors.firstName]}
              >
                <input
                  id={firstNameId}
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder={copy.business.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearError("firstName");
                  }}
                  aria-invalid={Boolean(errors.firstName)}
                  className={`${inputBaseClass} ${
                    errors.firstName ? "border-red-400" : "border-auth-border"
                  }`}
                />
              </Field>

              <Field
                id={lastNameId}
                label={copy.business.lastNameLabel}
                required
                error={errors.lastName && copy.errors[errors.lastName]}
              >
                <input
                  id={lastNameId}
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder={copy.business.lastNamePlaceholder}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearError("lastName");
                  }}
                  aria-invalid={Boolean(errors.lastName)}
                  className={`${inputBaseClass} ${
                    errors.lastName ? "border-red-400" : "border-auth-border"
                  }`}
                />
              </Field>

              <Field
                id={phoneId}
                label={copy.business.phoneLabel}
                required
                error={errors.phone && copy.errors[errors.phone]}
              >
                <div
                  className={`flex h-10 items-stretch rounded-md border bg-white transition-colors duration-200 focus-within:border-brand-accent ${
                    errors.phone ? "border-red-400" : "border-auth-border"
                  }`}
                >
                  <div className="relative shrink-0">
                    <Select
                      ariaLabel={copy.business.phoneLabel + " country code"}
                      value={countryCode}
                      onChange={setCountryCode}
                      options={countryOptions}
                      searchable
                      searchPlaceholder={copy.business.phoneSearchPlaceholder}
                      noResultsText={copy.business.phoneNoResults}
                      className="h-10"
                      triggerClassName="flex h-10 items-center bg-transparent pl-3 pr-7 text-[16px] text-auth-ink outline-none"
                      panelClassName="right-auto w-[300px]"
                    />
                    <svg
                      className="pointer-events-none absolute right-2 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-auth-icon"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.66667"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    aria-hidden="true"
                    className="flex select-none items-center pr-1.5 text-[16px] font-body text-auth-ink"
                  >
                    {selectedCountryDial}
                  </span>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-describedby={`${phoneId}-dial`}
                    placeholder={copy.business.phonePlaceholder}
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      clearError("phone");
                      // A pasted full number (+49… / 0049…) selects its
                      // country; only the local digits stay in the field,
                      // since the code is shown as the fixed prefix.
                      if (isInternational(value)) {
                        const { country, number } = splitPhone(value);
                        if (country) {
                          setCountryCode(country);
                          setPhone(number);
                          return;
                        }
                      }
                      setPhone(value.replace(/\D/g, ""));
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    className="min-w-0 flex-1 bg-transparent pr-3 text-[16px] font-body text-auth-ink outline-none placeholder:text-auth-placeholder"
                  />
                  <span id={`${phoneId}-dial`} className="sr-only">
                    {selectedCountryDial}
                  </span>
                </div>
              </Field>

              <Field
                id={emailId}
                label={copy.business.emailLabel}
                required
              >
                <div className={fieldWrapClass}>
                  <Mail className={iconClass} />
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={copy.business.emailPlaceholder}
                    value={email}
                    readOnly
                    aria-readonly="true"
                    className={`${inputBaseClass} ${readOnlyClass} pl-9`}
                  />
                </div>
              </Field>

              <Field
                id={timezoneId}
                label={copy.business.timezoneLabel}
                required
                error={errors.timezone && copy.errors[errors.timezone]}
              >
                <div className={fieldWrapClass}>
                  <Clock className={iconClass} />
                  <Select
                    id={timezoneId}
                    value={timezone}
                    onChange={(value) => {
                      setTimezone(value);
                      clearError("timezone");
                    }}
                    options={timezoneOptions}
                    placeholder={copy.business.timezonePlaceholder}
                    ariaInvalid={Boolean(errors.timezone)}
                    className="w-full"
                    triggerClassName={`${selectBaseClass} pl-9 ${
                      timezone ? "text-auth-ink" : "text-auth-placeholder"
                    } ${errors.timezone ? "border-red-400" : "border-auth-border"}`}
                    clearable
                    clearAriaLabel={`Clear ${copy.business.timezoneLabel}`}
                  />
                  <ChevronDownIcon />
                </div>
              </Field>

              <Field
                id={telegramUsernameId}
                label={copy.business.telegramUsernameLabel}
                required
                error={
                  errors.telegramUsername &&
                  copy.errors[errors.telegramUsername]
                }
              >
                <input
                  id={telegramUsernameId}
                  name="telegramUsername"
                  type="text"
                  autoComplete="off"
                  placeholder={copy.business.telegramUsernamePlaceholder}
                  value={telegramUsername}
                  onChange={(e) => {
                    setTelegramUsername(e.target.value);
                    clearError("telegramUsername");
                  }}
                  aria-invalid={Boolean(errors.telegramUsername)}
                  className={`${inputBaseClass} ${
                    errors.telegramUsername
                      ? "border-red-400"
                      : "border-auth-border"
                  }`}
                />
              </Field>

              <Field
                id={brandNameId}
                label={copy.business.brandNameLabel}
                required
                error={errors.brandName && copy.errors[errors.brandName]}
              >
                <input
                  id={brandNameId}
                  name="brandName"
                  type="text"
                  autoComplete="organization"
                  placeholder={copy.business.brandNamePlaceholder}
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    clearError("brandName");
                  }}
                  aria-invalid={Boolean(errors.brandName)}
                  className={`${inputBaseClass} ${
                    errors.brandName ? "border-red-400" : "border-auth-border"
                  }`}
                />
              </Field>

              <Field
                id={websiteId}
                label={copy.business.websiteLabel}
              >
                <div className="flex h-10 items-stretch overflow-hidden rounded-md border border-auth-border bg-white transition-colors duration-200 focus-within:border-brand-accent">
                  <span className="flex select-none items-center border-r border-auth-border px-3 text-[14px] text-auth-placeholder">
                    https://
                  </span>
                  <input
                    id={websiteId}
                    name="website"
                    type="text"
                    autoComplete="url"
                    placeholder={copy.business.websitePlaceholder}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="min-w-0 flex-1 text-ellipsis bg-transparent px-3 text-[16px] font-body text-auth-ink outline-none placeholder:text-auth-placeholder"
                  />
                </div>
              </Field>

              <Field
                id={industryId}
                label={copy.business.industryLabel}
                required
                error={errors.industry && copy.errors[errors.industry]}
              >
                <div className={fieldWrapClass}>
                  <Select
                    id={industryId}
                    value={industry}
                    onChange={(value) => {
                      setIndustry(value);
                      clearError("industry");
                    }}
                    options={industryOptions}
                    placeholder={copy.business.industryPlaceholder}
                    ariaInvalid={Boolean(errors.industry)}
                    className="w-full"
                    triggerClassName={`${selectBaseClass} pl-3 ${
                      industry ? "text-auth-ink" : "text-auth-placeholder"
                    } ${errors.industry ? "border-red-400" : "border-auth-border"}`}
                    clearable
                    clearAriaLabel={`Clear ${copy.business.industryLabel}`}
                  />
                  <ChevronDownIcon />
                </div>
              </Field>

              <Field
                id={jobTitleId}
                label={copy.business.jobTitleLabel}
              >
                <input
                  id={jobTitleId}
                  name="jobTitle"
                  type="text"
                  autoComplete="organization-title"
                  placeholder={copy.business.jobTitlePlaceholder}
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={`${inputBaseClass} border-auth-border`}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title={copy.social.title}
              badge={copy.social.optionalBadge}
              subtitle={copy.social.subtitle}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id={linkedinId} label={copy.social.linkedinLabel}>
                <div className={fieldWrapClass}>
                  <img
                    src={socialLinkedIn}
                    alt=""
                    className="pointer-events-none absolute left-3 h-6 w-6"
                    aria-hidden="true"
                  />
                  <input
                    id={linkedinId}
                    name="linkedin"
                    type="text"
                    autoComplete="off"
                    placeholder={copy.social.linkedinPlaceholder}
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className={`${inputBaseClass} pl-11 pr-10`}
                  />
                  <SocialFieldInfoIcon />
                </div>
              </Field>

              <Field id={instagramId} label={copy.social.instagramLabel}>
                <div className={fieldWrapClass}>
                  <img
                    src={socialInstagram}
                    alt=""
                    className="pointer-events-none absolute left-3 h-6 w-6"
                    aria-hidden="true"
                  />
                  <input
                    id={instagramId}
                    name="instagram"
                    type="text"
                    autoComplete="off"
                    placeholder={copy.social.instagramPlaceholder}
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className={`${inputBaseClass} pl-11 pr-10`}
                  />
                  <SocialFieldInfoIcon />
                </div>
              </Field>

              <Field id={xHandleId} label={copy.social.xHandleLabel}>
                <div className={fieldWrapClass}>
                  <img
                    src={socialX}
                    alt=""
                    className="pointer-events-none absolute left-3 h-6 w-6"
                    aria-hidden="true"
                  />
                  <input
                    id={xHandleId}
                    name="xHandle"
                    type="text"
                    autoComplete="off"
                    placeholder={copy.social.xHandlePlaceholder}
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    className={`${inputBaseClass} pl-11 pr-10`}
                  />
                  <SocialFieldInfoIcon />
                </div>
              </Field>

              <Field
                id={telegramChannelId}
                label={copy.social.telegramChannelLabel}
              >
                <div className={fieldWrapClass}>
                  <img
                    src={socialTelegram}
                    alt=""
                    className="pointer-events-none absolute left-3 h-6 w-6"
                    aria-hidden="true"
                  />
                  <input
                    id={telegramChannelId}
                    name="telegramChannel"
                    type="text"
                    autoComplete="off"
                    placeholder={copy.social.telegramChannelPlaceholder}
                    value={telegramChannel}
                    onChange={(e) => setTelegramChannel(e.target.value)}
                    className={`${inputBaseClass} pl-11 pr-10`}
                  />
                  <SocialFieldInfoIcon />
                </div>
              </Field>
            </div>

            <div className="mt-6">
              <SectionHeader
                title={copy.logo.title}
                subtitle={copy.logo.subtitle}
                required
              />
            </div>

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <img
                src={logoPreview ?? businessLogoPlaceholder}
                // Google-hosted images can refuse requests carrying a
                // cross-site Referer; fall back to the placeholder if the
                // image still can't load.
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src !== businessLogoPlaceholder) {
                    e.currentTarget.src = businessLogoPlaceholder;
                  }
                }}
                alt=""
                className="h-[146px] w-[146px] shrink-0 self-center rounded-full object-cover"
              />

              <div className="flex w-full flex-1 flex-col gap-5">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    applyLogoFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`relative flex cursor-pointer items-center justify-center gap-6 rounded-lg border-2 py-5 pl-4 pr-20 text-left transition-colors ${
                    isDragging
                      ? "border-brand-accent bg-auth-surface-hover"
                      : errors.logo
                        ? "border-red-300"
                        : "border-brand-accent-dim"
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-auth-border bg-white">
                    <img
                      src={uploadIcon}
                      alt=""
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="whitespace-nowrap text-[14px]">
                      <span className="font-semibold text-auth-primary">
                        {copy.logo.uploadCta}
                      </span>{" "}
                      <span className="text-auth-muted">
                        {copy.logo.uploadCtaRest}
                      </span>
                    </p>
                    <p className="text-[12px] text-auth-muted">
                      {copy.logo.uploadHint}
                    </p>
                  </div>
                  <div className="absolute -right-3 top-1/2 h-14 w-auto -translate-y-[62%]">
                    <div className="relative h-auto w-auto">
                      <img
                        src={uploadBadge}
                        alt=""
                        className="h-full w-auto"
                        aria-hidden="true"
                      />
                      <img
                        src={uploadBadgePointer}
                        alt=""
                        className="absolute right-8 top-10 h-4 w-4"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => applyLogoFile(e.target.files?.[0])}
                  />
                </div>
                {errors.logo && (
                  <p className="-mt-2 text-[13px] text-red-500">
                    {copy.errors[errors.logo]}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleGenerateLogo}
                    // Stays clickable after a backend error (e.g. the daily
                    // limit), so each click re-asks and shows the error again.
                    disabled={isGeneratingLogo}
                    aria-busy={isGeneratingLogo}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-auth-border bg-white px-6 py-2 text-body-sm font-semibold text-auth-text transition-colors hover:border-brand-accent hover:text-brand-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-auth-border disabled:hover:text-auth-text"
                  >
                    <img
                      src={generateLogo}
                      alt=""
                      className="h-[16] w-auto"
                      aria-hidden="true"
                    />
                    {isGeneratingLogo
                      ? copy.logo.generating
                      : copy.logo.generateButton}
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-auth-primary px-6 py-2 text-body-sm font-semibold text-white transition-colors hover:bg-auth-primary-hover"
                  >
                    <img
                      src={uploadLogo}
                      alt=""
                      className="h-[16] w-auto"
                      aria-hidden="true"
                    />
                    {copy.logo.uploadButton}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-md text-body-sm border border-auth-border bg-white px-4 py-2 font-semibold text-auth-text transition-colors hover:border-auth-icon"
        >
          {copy.cancel}
        </button>
        <Button
          type="submit"
          variant="primary"
          disabled={status === "submitting" || isLoading || isGeneratingLogo}
          className="rounded-md disabled:cursor-not-allowed disabled:opacity-60 !px-4 !py-2 text-body-sm font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
        >
          {status === "submitting" ? copy.submitting : copy.submit}
        </Button>
      </div>
    </form>
  );
}

export default EditAccountForm;
