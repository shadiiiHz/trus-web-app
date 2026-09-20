import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SiteConfig } from "@/config/site.config";


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
  status: "idle" | "submitting" | "success";
  onStatusChange: (status: "idle" | "submitting" | "success") => void;
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
  const usernameId = useId();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<FieldErrorKey | undefined>();
  const [resending, setResending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError("usernameRequired");
      return;
    }

    setError(undefined);
    // No backend wired up yet — simulate the round trip so the button's
    // loading state reads correctly once a real request lands here.
    onStatusChange("submitting");
    window.setTimeout(() => {
      onStatusChange("success");
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label
          htmlFor={usernameId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.usernameLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <Mail className={iconClass} aria-hidden="true" />
          <input
            id={usernameId}
            name="username"
            type="text"
            autoComplete="username"
            placeholder={copy.usernamePlaceholder}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
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
