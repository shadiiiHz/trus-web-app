import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SiteConfig } from "@/config/site.config";
import {
  getForgotPasswordErrorCode,
  reportApiError,
  requestPasswordReset,
} from "@/lib/api/authApi";


function BackIcon({ className }: { className?: string }) {
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
        d="M15.8327 10H4.16602M9.99935 4.16669L4.16602 10L9.99935 15.8334"
        stroke="var(--color-auth-icon)"
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export interface ForgotPasswordFormProps {
  copy: SiteConfig["auth"]["forgotPassword"];
  status: "idle" | "submitting";
  onStatusChange: (status: "idle" | "submitting") => void;
}

type FieldErrorKey = keyof SiteConfig["auth"]["forgotPassword"]["errors"];

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "w-full rounded-md border border-auth-border bg-white pl-11 pr-4 py-2.5 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-auth-required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function ForgotPasswordForm({
  copy,
  status,
  onStatusChange,
}: ForgotPasswordFormProps) {
  const navigate = useNavigate();
  const emailId = useId();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<FieldErrorKey | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("emailRequired");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("emailInvalid");
      return;
    }

    setError(undefined);
    onStatusChange("submitting");
    try {
      await requestPasswordReset(trimmedEmail);
      navigate("/check-your-email", {
        state: { variant: "forgotPassword", email: trimmedEmail },
      });
    } catch (err) {
      const code = getForgotPasswordErrorCode(err);
      if (code) {
        setError(code === "EMAIL_REQUIRED" ? "emailRequired" : "emailInvalid");
      } else {
        reportApiError(err, {}, copy.errors.requestFailed);
      }
    } finally {
      onStatusChange("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
              if (error) setError(undefined);
            }}
            aria-invalid={Boolean(error)}
            className={`${inputBaseClass} ${
              error ? "border-red-400" : "border-auth-border"
            }`}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[error]}
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

      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-1 text-center text-body-sm font-semibold text-auth-muted"
      >
        <BackIcon />
        {copy.backToLogin}
      </Link>
    </form>
  );
}

export default ForgotPasswordForm;
