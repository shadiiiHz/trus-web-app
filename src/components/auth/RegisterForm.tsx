import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye, EyeOff, Mail, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
import type { SiteConfig } from "@/config/site.config";
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
export interface RegisterFormProps {
  copy: SiteConfig["auth"]["register"];
}

// Characters that read unambiguously at small sizes — no 0/O or 1/I.
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CAPTCHA_LENGTH = 5;

function generateCaptcha(): string {
  let code = "";
  for (let i = 0; i < CAPTCHA_LENGTH; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

// Structural (non-translated) dropdown/select data — presentation only.
const COUNTRY_CODES = [
  { value: "US", dial: "+1" },
  { value: "UK", dial: "+44" },
  { value: "DE", dial: "+49" },
  { value: "FR", dial: "+33" },
  { value: "AE", dial: "+971" },
  { value: "TR", dial: "+90" },
] as const;

const TIMEZONE_OPTIONS = [
  { value: "utc-8", label: "(UTC-08:00) Pacific Time" },
  { value: "utc-5", label: "(UTC-05:00) Eastern Time" },
  { value: "utc+0", label: "(UTC+00:00) London" },
  { value: "utc+1", label: "(UTC+01:00) Berlin, Paris" },
  { value: "utc+3:30", label: "(UTC+03:30) Tehran" },
  { value: "utc+4", label: "(UTC+04:00) Dubai" },
  { value: "utc+5:30", label: "(UTC+05:30) Mumbai" },
  { value: "utc+8", label: "(UTC+08:00) Singapore, Beijing" },
  { value: "utc+9", label: "(UTC+09:00) Tokyo" },
] as const;

const INDUSTRY_OPTIONS = [
  "Technology",
  "E-commerce & Retail",
  "Healthcare",
  "Real Estate",
  "Education",
  "Finance & Banking",
  "Legal",
  "Restaurant & Food",
  "Fitness & Wellness",
  "Marketing & Advertising",
  "Other",
] as const;

const LOGO_PALETTE = [
  "#875DD9",
  "#2563EB",
  "#059669",
  "#DB2777",
  "#EA580C",
  "#0EA5E9",
];

type FieldErrorKey = keyof SiteConfig["auth"]["register"]["errors"];
type FieldName =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "brandName"
  | "telegramUsername"
  | "timezone"
  | "industry"
  | "jobTitle"
  | "logo"
  | "username"
  | "password"
  | "confirmPassword"
  | "captcha";
type FieldErrors = Partial<Record<FieldName, FieldErrorKey>>;

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 z-10 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "h-10 w-full rounded-md border border-auth-border bg-white px-4 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

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

function PasswordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1673 9.16667V6.66667C14.1673 4.36548 12.3018 2.5 10.0007 2.5C7.69946 2.5 5.83398 4.36548 5.83398 6.66667V9.16667M7.33398 17.5H12.6673C14.0674 17.5 14.7675 17.5 15.3023 17.2275C15.7727 16.9878 16.1552 16.6054 16.3948 16.135C16.6673 15.6002 16.6673 14.9001 16.6673 13.5V13.1667C16.6673 11.7665 16.6673 11.0665 16.3948 10.5317C16.1552 10.0613 15.7727 9.67883 15.3023 9.43915C14.7675 9.16667 14.0674 9.16667 12.6673 9.16667H7.33398C5.93385 9.16667 5.23379 9.16667 4.69901 9.43915C4.2286 9.67883 3.84615 10.0613 3.60647 10.5317C3.33398 11.0665 3.33398 11.7665 3.33398 13.1667V13.5C3.33398 14.9001 3.33398 15.6002 3.60647 16.135C3.84615 16.6054 4.2286 16.9878 4.69901 17.2275C5.23379 17.5 5.93385 17.5 7.33398 17.5Z"
        stroke="var(--color-auth-icon)"
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
}: {
  title: string;
  badge?: string;
  subtitle: string;
  required?: boolean;
}) {
  return (
    <div className="mb-6 font-body">
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
      <div className="mt-4 h-px bg-auth-divider" />
    </div>
  );
}

export function RegisterForm({ copy }: RegisterFormProps) {
  const navigate = useNavigate();

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
  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const linkedinId = useId();
  const instagramId = useId();
  const xHandleId = useId();
  const telegramChannelId = useId();
  const captchaId = useId();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [countryCode, setCountryCode] = useState<string>(
    COUNTRY_CODES[0].value,
  );
  const selectedCountryDial =
    COUNTRY_CODES.find((c) => c.value === countryCode)?.dial ?? "";
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [telegramChannel, setTelegramChannel] = useState("");

  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const passwordRequirements = [
    { key: "minLength" as const, test: (value: string) => value.length >= 8 },
    { key: "hasNumber" as const, test: (value: string) => /\d/.test(value) },
    {
      key: "hasLetter" as const,
      test: (value: string) => /[a-zA-Z]/.test(value),
    },
  ];
  const meetsAllRequirements = passwordRequirements.every(({ test }) =>
    test(password),
  );

  const clearError = (field: FieldName) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus((prev) => (prev === "success" ? "idle" : prev));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const applyLogoFile = (file: File | undefined | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    clearError("logo");
  };

  const handleGenerateLogo = () => {
    const initial = (brandName.trim()[0] ?? "T").toUpperCase();
    const color = LOGO_PALETTE[Math.floor(Math.random() * LOGO_PALETTE.length)];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" rx="100" fill="${color}"/><text x="50%" y="54%" font-family="Inter, sans-serif" font-size="90" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">${initial}</text></svg>`;
    setLogoPreview(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
    clearError("logo");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "firstNameRequired";
    if (!lastName.trim()) nextErrors.lastName = "lastNameRequired";
    if (!phone.trim()) nextErrors.phone = "phoneRequired";
    if (!email.trim()) {
      nextErrors.email = "emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "emailInvalid";
    }
    if (!brandName.trim()) nextErrors.brandName = "brandNameRequired";
    if (!telegramUsername.trim())
      nextErrors.telegramUsername = "telegramUsernameRequired";
    if (!timezone) nextErrors.timezone = "timezoneRequired";
    if (!industry) nextErrors.industry = "industryRequired";
    if (!jobTitle.trim()) nextErrors.jobTitle = "jobTitleRequired";
    if (!logoPreview) nextErrors.logo = "logoRequired";
    if (!username.trim()) nextErrors.username = "usernameRequired";
    if (!password) {
      nextErrors.password = "passwordRequired";
    } else if (!meetsAllRequirements) {
      nextErrors.password = "passwordInvalid";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "confirmPasswordRequired";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "confirmPasswordMismatch";
    }
    if (!captchaInput.trim()) {
      nextErrors.captcha = "captchaRequired";
    } else if (captchaInput.trim().toUpperCase() !== captcha) {
      nextErrors.captcha = "captchaMismatch";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      refreshCaptcha();
      return;
    }

    // No backend wired up yet — simulate the round trip so the button's
    // loading state reads correctly once a real request lands here.
    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
      setPassword("");
      setConfirmPassword("");
      refreshCaptcha();
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[660px_660px] lg:items-start">
        {/* Left column */}
        <div className="flex flex-col gap-6">
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
                      options={COUNTRY_CODES.map((c) => ({
                        value: c.value,
                        label: c.value,
                      }))}
                      className="h-10"
                      triggerClassName="flex h-10 items-center bg-transparent pl-3 pr-7 text-[16px] text-auth-ink outline-none"
                      panelClassName="min-w-[72px]"
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
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder={`${selectedCountryDial} ${copy.business.phonePlaceholder}`}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearError("phone");
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    className="min-w-0 flex-1 bg-transparent pr-3 text-[16px] font-body text-auth-ink outline-none placeholder:text-auth-placeholder"
                  />
                </div>
              </Field>

              <Field
                id={emailId}
                label={copy.business.emailLabel}
                required
                error={errors.email && copy.errors[errors.email]}
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    aria-invalid={Boolean(errors.email)}
                    className={`${inputBaseClass} pl-11 ${
                      errors.email ? "border-red-400" : "border-auth-border"
                    }`}
                  />
                </div>
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
                id={websiteId}
                label={copy.business.websiteLabel}
                className="sm:col-span-2"
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
                    className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-body text-auth-ink outline-none placeholder:text-auth-placeholder"
                  />
                </div>
              </Field>

              <Field
                id={timezoneId}
                label={copy.business.timezoneLabel}
                required
                error={errors.timezone && copy.errors[errors.timezone]}
                className="sm:col-span-2"
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
                    options={TIMEZONE_OPTIONS}
                    placeholder={copy.business.timezonePlaceholder}
                    ariaInvalid={Boolean(errors.timezone)}
                    className="w-full"
                    triggerClassName={`${selectBaseClass} pl-11 ${
                      timezone ? "text-auth-ink" : "text-auth-placeholder"
                    } ${errors.timezone ? "border-red-400" : "border-auth-border"}`}
                    clearable
                    clearAriaLabel={`Clear ${copy.business.timezoneLabel}`}
                  />
                  <ChevronDownIcon />
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
                    options={INDUSTRY_OPTIONS.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                    placeholder={copy.business.industryPlaceholder}
                    ariaInvalid={Boolean(errors.industry)}
                    className="w-full"
                    triggerClassName={`${selectBaseClass} pl-4 ${
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
                required
                error={errors.jobTitle && copy.errors[errors.jobTitle]}
              >
                <input
                  id={jobTitleId}
                  name="jobTitle"
                  type="text"
                  autoComplete="organization-title"
                  placeholder={copy.business.jobTitlePlaceholder}
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    clearError("jobTitle");
                  }}
                  aria-invalid={Boolean(errors.jobTitle)}
                  className={`${inputBaseClass} ${
                    errors.jobTitle ? "border-red-400" : "border-auth-border"
                  }`}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionHeader
              title={copy.logo.title}
              subtitle={copy.logo.subtitle}
              required
            />

            <div className="flex flex-col items-center gap-8 sm:flex-row">
              <img
                src={logoPreview ?? businessLogoPlaceholder}
                alt=""
                className="h-[178px] w-[178px] shrink-0 self-center rounded-full object-cover"
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
                  className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 px-4 py-4 text-center transition-colors ${
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

                  <p className="text-[14px]">
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
                  <div className="absolute bottom-3 -right-5 h-14 w-auto">
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
                  <button
                    type="button"
                    onClick={handleGenerateLogo}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-auth-border bg-white px-6 py-2 text-body-sm font-semibold text-auth-text transition-colors hover:border-brand-accent hover:text-brand-accent"
                  >
                    <img
                      src={generateLogo}
                      alt=""
                      className="h-[16] w-auto"
                      aria-hidden="true"
                    />
                    {copy.logo.generateButton}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Card>
            <SectionHeader
              title={copy.account.title}
              subtitle={copy.account.subtitle}
            />

            <div className="flex flex-col gap-4">
              <Field
                id={usernameId}
                label={copy.account.usernameLabel}
                required
                error={errors.username && copy.errors[errors.username]}
              >
                <input
                  id={usernameId}
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder={copy.account.usernamePlaceholder}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError("username");
                  }}
                  aria-invalid={Boolean(errors.username)}
                  className={`${inputBaseClass} ${
                    errors.username ? "border-red-400" : "border-auth-border"
                  }`}
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  id={passwordId}
                  label={copy.account.passwordLabel}
                  required
                  error={
                    errors.password === "passwordRequired"
                      ? copy.errors.passwordRequired
                      : undefined
                  }
                >
                  <div className={fieldWrapClass}>
                    <PasswordIcon className={iconClass} />
                    <input
                      id={passwordId}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={copy.account.passwordPlaceholder}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("password");
                      }}
                      aria-invalid={Boolean(errors.password)}
                      style={{
                        color: showPassword ? "var(--color-auth-ink)" : "var(--color-auth-masked)",
                        caretColor: "var(--color-auth-placeholder)",
                      }}
                      className={`${inputBaseClass} pl-11 pr-11 ${
                        errors.password ? "border-red-400" : "border-auth-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword
                          ? copy.account.hidePasswordAria
                          : copy.account.showPasswordAria
                      }
                      className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password === "passwordInvalid" && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      {passwordRequirements
                        .filter(({ test }) => !test(password))
                        .map(({ key }) => (
                          <p key={key} className="text-[13px] text-red-500">
                            {copy.requirements[key]}
                          </p>
                        ))}
                    </div>
                  )}
                </Field>

                <Field
                  id={confirmPasswordId}
                  label={copy.account.confirmPasswordLabel}
                  required
                  error={
                    errors.confirmPassword &&
                    copy.errors[errors.confirmPassword]
                  }
                >
                  <div className={fieldWrapClass}>
                    <PasswordIcon className={iconClass} />
                    <input
                      id={confirmPasswordId}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={copy.account.confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearError("confirmPassword");
                      }}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      style={{
                        color: showConfirmPassword ? "var(--color-auth-ink)" : "var(--color-auth-masked)",
                        caretColor: "var(--color-auth-placeholder)",
                      }}
                      className={`${inputBaseClass} pl-11 pr-11 ${
                        errors.confirmPassword
                          ? "border-red-400"
                          : "border-auth-border"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={
                        showConfirmPassword
                          ? copy.account.hidePasswordAria
                          : copy.account.showPasswordAria
                      }
                      className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </Field>
              </div>
            </div>

            <div className="mt-6">
              <SectionHeader
                title={copy.social.title}
                badge={copy.social.optionalBadge}
                subtitle={copy.social.subtitle}
              />
            </div>

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
          </Card>

          <Card>
            <SectionHeader
              title={copy.captcha.title}
              subtitle={copy.captcha.subtitle}
              required
            />

            <div className="flex items-center gap-3">
              <div
                className="flex h-[108px] flex-1 select-none items-center justify-center gap-3 rounded-lg border border-auth-border bg-auth-surface shadow-xs"
                aria-hidden="true"
              >
                {captcha.split("").map((char, i) => (
                  <span
                    key={i}
                    className="text-[40px] font-bold tracking-normal text-auth-heading"
                  >
                    {char}
                  </span>
                ))}
              </div>
              <motion.button
                type="button"
                onClick={refreshCaptcha}
                aria-label={copy.captcha.refreshAria}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-auth-border bg-white text-auth-icon-strong transition-colors hover:border-brand-accent hover:text-brand-accent"
              >
                <RotateCw size={20} />
              </motion.button>
            </div>

            <Field
              id={captchaId}
              label={copy.captcha.inputLabel}
              error={errors.captcha && copy.errors[errors.captcha]}
              className="mt-4"
            >
              <input
                id={captchaId}
                name="captcha"
                type="text"
                autoComplete="off"
                placeholder={copy.captcha.placeholder}
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  clearError("captcha");
                }}
                aria-invalid={Boolean(errors.captcha)}
                className={`${inputBaseClass} ${
                  errors.captcha ? "border-red-400" : "border-auth-border"
                }`}
              />
            </Field>
          </Card>
        </div>
      </div>

      {status === "success" && (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
          className="text-center text-body-sm font-medium text-emerald-600"
          role="status"
        >
          {copy.success}
        </motion.p>
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
          className="rounded-md !px-4 !py-2 text-body-sm font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
        >
          {status === "submitting" ? copy.submitting : copy.submit}
        </Button>
      </div>
    </form>
  );
}

export default RegisterForm;
