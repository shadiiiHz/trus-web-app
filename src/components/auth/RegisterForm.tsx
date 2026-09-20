import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
import type { SiteConfig } from "@/config/site.config";

export interface RegisterFormProps {
  copy: SiteConfig["auth"]["register"];
  status: "idle" | "submitting" | "success";
  onStatusChange: (status: "idle" | "submitting" | "success") => void;
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

type FieldErrorKey = keyof SiteConfig["auth"]["register"]["errors"];
type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "username"
  | "password"
  | "confirmPassword"
  | "captcha";
type FieldErrors = Partial<Record<FieldName, FieldErrorKey>>;

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "w-full rounded-md border border-auth-border bg-white py-2.5 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-auth-primary" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

function UsernameIcon({ className }: { className?: string }) {
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
        d="M16.6673 17.5C16.6673 16.337 16.6673 15.7555 16.5238 15.2824C16.2006 14.217 15.3669 13.3834 14.3016 13.0602C13.8284 12.9167 13.247 12.9167 12.084 12.9167H7.91732C6.75435 12.9167 6.17286 12.9167 5.6997 13.0602C4.63436 13.3834 3.80068 14.217 3.47752 15.2824C3.33398 15.7555 3.33398 16.337 3.33398 17.5M13.7507 6.25C13.7507 8.32107 12.0717 10 10.0007 10C7.92958 10 6.25065 8.32107 6.25065 6.25C6.25065 4.17893 7.92958 2.5 10.0007 2.5C12.0717 2.5 13.7507 4.17893 13.7507 6.25Z"
        stroke="var(--color-auth-icon)"
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

export function RegisterForm({
  copy,
  status,
  onStatusChange,
}: RegisterFormProps) {
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const usernameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const captchaId = useId();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [resending, setResending] = useState(false);

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
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "firstNameRequired";
    if (!lastName.trim()) nextErrors.lastName = "lastNameRequired";
    if (!email.trim()) {
      nextErrors.email = "emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "emailInvalid";
    }
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
    onStatusChange("submitting");
    window.setTimeout(() => {
      onStatusChange("success");
      setPassword("");
      setConfirmPassword("");
      refreshCaptcha();
    }, 700);
  };

  const handleResend = () => {
    setResending(true);
    window.setTimeout(() => {
      setResending(false);
    }, 700);
  };

  if (status === "success") {
    return (
      <Button
        type="button"
        variant="primary"
        onClick={handleResend}
        className="mx-auto rounded-md px-6 py-2.5 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
      >
        {resending ? copy.resending : copy.resend}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={firstNameId}
            className="mb-2 block text-body-sm font-medium text-auth-text"
          >
            {copy.firstNameLabel}
            <RequiredMark />
          </label>
          <input
            id={firstNameId}
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={copy.firstNamePlaceholder}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearError("firstName");
            }}
            aria-invalid={Boolean(errors.firstName)}
            className={`${inputBaseClass} px-4 ${
              errors.firstName ? "border-red-400" : "border-auth-border"
            }`}
          />
          {errors.firstName && (
            <p className="mt-1.5 text-[13px] text-red-500">
              {copy.errors[errors.firstName]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={lastNameId}
            className="mb-2 block text-body-sm font-medium text-auth-text"
          >
            {copy.lastNameLabel}
            <RequiredMark />
          </label>
          <input
            id={lastNameId}
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={copy.lastNamePlaceholder}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearError("lastName");
            }}
            aria-invalid={Boolean(errors.lastName)}
            className={`${inputBaseClass} px-4 ${
              errors.lastName ? "border-red-400" : "border-auth-border"
            }`}
          />
          {errors.lastName && (
            <p className="mt-1.5 text-[13px] text-red-500">
              {copy.errors[errors.lastName]}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={emailId}
            className="mb-2 block text-body-sm font-medium text-auth-text"
          >
            {copy.emailLabel}
            <RequiredMark />
          </label>
          <div className={fieldWrapClass}>
            <Mail className={iconClass} />
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError("email");
              }}
              aria-invalid={Boolean(errors.email)}
              className={`${inputBaseClass} pl-11 pr-4 ${
                errors.email ? "border-red-400" : "border-auth-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[13px] text-red-500">
              {copy.errors[errors.email]}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={usernameId}
            className="mb-2 block text-body-sm font-medium text-auth-text"
          >
            {copy.usernameLabel}
            <RequiredMark />
          </label>
          <div className={fieldWrapClass}>
            <UsernameIcon className={iconClass} />
            <input
              id={usernameId}
              name="username"
              type="text"
              autoComplete="username"
              placeholder={copy.usernamePlaceholder}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError("username");
              }}
              aria-invalid={Boolean(errors.username)}
              className={`${inputBaseClass} pl-11 pr-4 ${
                errors.username ? "border-red-400" : "border-auth-border"
              }`}
            />
          </div>
          {errors.username && (
            <p className="mt-1.5 text-[13px] text-red-500">
              {copy.errors[errors.username]}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.passwordLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <PasswordIcon className={iconClass} />
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={copy.passwordPlaceholder}
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
              showPassword ? copy.hidePasswordAria : copy.showPasswordAria
            }
            className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password === "passwordRequired" && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors.passwordRequired}
          </p>
        )}
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
      </div>

      <div>
        <label
          htmlFor={confirmPasswordId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.confirmPasswordLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <PasswordIcon className={iconClass} />
          <input
            id={confirmPasswordId}
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={copy.confirmPasswordPlaceholder}
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
              errors.confirmPassword ? "border-red-400" : "border-auth-border"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            aria-label={
              showConfirmPassword
                ? copy.hidePasswordAria
                : copy.showPasswordAria
            }
            className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[errors.confirmPassword]}
          </p>
        )}
      </div>

      {/* Captcha code display + refresh */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-16.5 flex-1 select-none items-center justify-center gap-2.5 rounded-xl border border-auth-border bg-white shadow-xs"
          aria-hidden="true"
        >
          {captcha.split("").map((char, i) => (
            <span key={i} className="text-[40px] font-bold text-auth-heading">
              {char}
            </span>
          ))}
        </div>
        <motion.button
          type="button"
          onClick={refreshCaptcha}
          aria-label={copy.refreshCaptchaAria}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-auth-border bg-white text-auth-icon-strong shadow-[0_1px_2px_0_rgba(0,0,0,0.05),inset_0_-2px_0_0_rgba(0,0,0,0.05)] transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <RotateCw size={20} />
        </motion.button>
      </div>

      <div>
        <label
          htmlFor={captchaId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.captchaLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <ShieldCheck className={iconClass} aria-hidden="true" />
          <input
            id={captchaId}
            name="captcha"
            type="text"
            autoComplete="off"
            placeholder={copy.captchaPlaceholder}
            value={captchaInput}
            onChange={(e) => {
              setCaptchaInput(e.target.value);
              clearError("captcha");
            }}
            aria-invalid={Boolean(errors.captcha)}
            className={`${inputBaseClass} pl-11 pr-4 ${
              errors.captcha ? "border-red-400" : "border-auth-border"
            }`}
          />
        </div>
        {errors.captcha && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[errors.captcha]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-1 w-full rounded-md py-3.5 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
      >
        {status === "submitting" ? copy.submitting : copy.submit}
      </Button>
    </form>
  );
}

export default RegisterForm;
