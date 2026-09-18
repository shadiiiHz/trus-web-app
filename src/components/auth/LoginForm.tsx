import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, EyeOff, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
import type { SiteConfig } from "@/config/site.config";

export interface LoginFormProps {
  copy: SiteConfig["auth"]["login"];
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

type FieldErrors = Partial<Record<"username" | "password" | "captcha", string>>;

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-[#A3A3A3]";

const inputBaseClass =
  "w-full rounded-md border border-[#D4D4D4] bg-white pl-11 pr-11 py-2.5 text-[16px] font-body text-[#737373] outline-none transition-colors duration-200 placeholder:text-[#737373] focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-[#063060]" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

/**
 * Placeholder icon for the username field.
 * Swap the <path>/content inside this <svg> with your own artwork.
 * Keep `className={iconClass}` (or pass it through) so positioning/sizing
 * inside the input stays correct.
 */
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
        stroke="#A3A3A3"
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
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
        stroke="#A3A3A3"
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function LoginForm({ copy }: LoginFormProps) {
  const usernameId = useId();
  const passwordId = useId();
  const captchaId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    setStatus((prev) => (prev === "success" ? "idle" : prev));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!username.trim()) nextErrors.username = copy.errors.usernameRequired;
    if (!password) nextErrors.password = copy.errors.passwordRequired;
    if (!captchaInput.trim()) {
      nextErrors.captcha = copy.errors.captchaRequired;
    } else if (captchaInput.trim().toUpperCase() !== captcha) {
      nextErrors.captcha = copy.errors.captchaMismatch;
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
      refreshCaptcha();
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Username */}
      <div>
        <label
          htmlFor={usernameId}
          className="mb-2 block text-body-sm font-medium text-[#404040]"
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
            className={`${inputBaseClass} pr-4 ${
              errors.username ? "border-red-400" : "border-[#D4D4D4]"
            }`}
          />
        </div>
        {errors.username && (
          <p className="mt-1.5 text-[13px] text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor={passwordId}
          className="mb-2 block text-body-sm font-medium text-[#404040]"
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
            style={{ color: "#B8B8B8", caretColor: "#737373" }}
            className={`${inputBaseClass} ${
              errors.password ? "border-red-400" : "border-[#D4D4D4]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-[#9CA3AF] transition-colors hover:text-[#1F2430]"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-[13px] text-red-500">{errors.password}</p>
        )}
      </div>

      {/* Remember me / Forgot password */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-body-sm font-medium font-body text-[#404040] select-none">
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer h-4 w-4 shrink-0 appearance-none rounded border border-[#D4D4D4] transition-colors duration-150 checked:border-brand-accent checked:bg-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
            />
            <Check
              size={12}
              strokeWidth={3}
              className="pointer-events-none absolute text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
            />
          </span>
          {copy.rememberMe}
        </label>
        <a
          href="#"
          className="text-body-sm font-medium text-[#5B2BB9] underline underline-offset-2"
        >
          {copy.forgotPassword}
        </a>
      </div>

      {/* Captcha code display + refresh */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-[66px] flex-1 select-none items-center justify-center gap-2.5 rounded-md border border-[#D4D4D4] bg-white"
          aria-hidden="true"
        >
          {captcha.split("").map((char, i) => (
            <span key={i} className="text-[20px] font-bold text-[#171717]">
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
          className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md border border-[#D4D4D4] bg-white text-[#1F2430] transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <RotateCw size={20} />
        </motion.button>
      </div>

      {/* Captcha input */}
      <div>
        <label
          htmlFor={captchaId}
          className="mb-2 block text-body-sm font-medium text-[#404040]"
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
            className={`${inputBaseClass} pr-4 ${
              errors.captcha ? "border-red-400" : "border-[#D4D4D4]"
            }`}
          />
        </div>
        {errors.captcha && (
          <p className="mt-1.5 text-[13px] text-red-500">{errors.captcha}</p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-1 w-full rounded-md py-3.5 text-[16px] font-semibold !bg-[#5B2BB9] hover:!bg-[#4a2296]"
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

      <p className="text-center text-body-sm font-body font-normal text-[#525252]">
        {copy.noAccount}{" "}
        <a
          href="#"
          className="font-semibold text-[#5B2BB9] underline underline-offset-2"
        >
          {copy.signUp}
        </a>
      </p>
    </form>
  );
}

export default LoginForm;
