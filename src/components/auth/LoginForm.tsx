import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail } from "lucide-react";
// import { Check } from "lucide-react"; // used by the disabled "remember me" checkbox
import { Button } from "@/components/ui/Button";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
import type { SiteConfig } from "@/config/site.config";
import { AuthApiError, reportApiError } from "@/lib/api/authApi";
import { useLogin } from "@/hooks/auth/useLogin";
import { resolveNextPage } from "@/lib/api/nextPage";

export interface LoginFormProps {
  copy: SiteConfig["auth"]["login"];
}

type FieldErrorKey = keyof SiteConfig["auth"]["login"]["errors"];
type FieldErrors = Partial<Record<"email" | "password", FieldErrorKey>>;

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "w-full rounded-md border border-auth-border bg-white pl-11 pr-11 py-2.5 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-auth-required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/**
 * Placeholder icon for the password field.
 * Swap the <path>/content inside this <svg> with your own artwork.
 * Keep `className={iconClass}` (or pass it through) so positioning/sizing
 * inside the input stays correct.
 */
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
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function LoginForm({ copy }: LoginFormProps) {
  const navigate = useNavigate();
  const { mutate: loginMutate } = useLogin();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // const [rememberMe, setRememberMe] = useState(false); // remember me disabled for now

  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus((prev) => (prev === "success" ? "idle" : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!email.trim()) {
      nextErrors.email = "emailRequired";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "emailInvalid";
    }
    if (!password) nextErrors.password = "passwordRequired";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setStatus("submitting");

    try {
      const result = await loginMutate({
        email: email.trim(),
        password,
      });

      setStatus("success");
      setPassword("");

      // The backend always sends `next_page` now: "/service" when the
      // account is `ready`, "/complete-profile" when it still isn't
      // (resolved to our own /edit-account route).
      if (result.nextPage) {
        navigate(resolveNextPage(result.nextPage));
      } else if (!result.ready) {
        navigate("/edit-account");
      }
    } catch (error) {
      if (error instanceof AuthApiError && error.code === "EMAIL_NOT_VERIFIED") {
        navigate(error.nextPage ? resolveNextPage(error.nextPage) : "/check-your-email", {
          state: { variant: "register", email: email.trim() },
        });
      } else {
        reportApiError(
          error,
          {
            INVALID_INPUT: copy.errors.invalidInput,
            INVALID_CREDENTIALS: copy.errors.invalidCredentials,
          },
          copy.errors.loginFailed,
        );
        setStatus("idle");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Email */}
      <div>
        <label
          htmlFor={emailId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.emailLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <Mail className={iconClass} aria-hidden="true" />
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
            className={`${inputBaseClass} pr-4 ${
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

      {/* Password */}
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
            autoComplete="current-password"
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
            className={`${inputBaseClass} ${
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
        {errors.password && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[errors.password]}
          </p>
        )}
      </div>

      {/* Remember me / Forgot password */}
      <div className="flex items-center justify-end">
        {/* Remember me — disabled for now
        <label className="flex cursor-pointer items-center gap-2 text-body-sm font-medium font-body text-auth-text select-none">
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer h-4 w-4 shrink-0 appearance-none rounded border border-auth-border transition-colors duration-150 checked:border-brand-accent checked:bg-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            />
            <Check
              size={12}
              strokeWidth={3}
              className="pointer-events-none absolute text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
            />
          </span>
          {copy.rememberMe}
        </label>
        */}
        <Link
          to="/forgot-password"
          className="text-body-sm font-medium text-auth-primary underline underline-offset-2"
        >
          {copy.forgotPassword}
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        disabled={status === "submitting"}
        className="mt-1 w-full rounded-md py-3.5 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? copy.submitting : copy.submit}
      </Button>

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

      <p className="text-center text-body-sm font-body font-normal text-auth-muted">
        {copy.noAccount}{" "}
        <Link
          to="/register"
          className="font-semibold text-auth-primary underline underline-offset-2"
        >
          {copy.signUp}
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
