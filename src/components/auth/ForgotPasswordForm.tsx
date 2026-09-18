import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
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
        stroke="#A3A3A3"
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export interface ForgotPasswordFormProps {
  copy: SiteConfig["auth"]["forgotPassword"];
}

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-[#A3A3A3]";

const inputBaseClass =
  "w-full rounded-md border border-[#D4D4D4] bg-white pl-11 pr-4 py-2.5 text-[16px] font-body text-[#000000] outline-none transition-colors duration-200 placeholder:text-[#737373] focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-[#063060]" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function ForgotPasswordForm({ copy }: ForgotPasswordFormProps) {
  const usernameId = useId();

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError(copy.errors.usernameRequired);
      return;
    }

    setError(undefined);
    // No backend wired up yet — simulate the round trip so the button's
    // loading state reads correctly once a real request lands here.
    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <label
          htmlFor={usernameId}
          className="mb-2 block text-body-sm font-medium text-[#404040]"
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
              if (status === "success") setStatus("idle");
            }}
            aria-invalid={Boolean(error)}
            className={`${inputBaseClass} ${
              error ? "border-red-400" : "border-[#D4D4D4]"
            }`}
          />
        </div>
        {error && <p className="mt-1.5 text-[13px] text-red-500">{error}</p>}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-1 w-full rounded-md py-3.5 text-body font-semibold !bg-[#5B2BB9] hover:!bg-[#4a2296]"
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

      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-1.5 text-center text-body-sm font-semibold text-[#525252]"
      >
        <BackIcon />
        {copy.backToLogin}
      </Link>
    </form>
  );
}

export default ForgotPasswordForm;
