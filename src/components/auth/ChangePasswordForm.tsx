import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { SiteConfig } from "@/config/site.config";
import { passwordRequirements } from "@/lib/passwordRequirements";
import { AuthApiError, changePassword, reportApiError } from "@/lib/api/authApi";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";

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

function RequirementIcon({ met }: { met: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
        fill={met ? "var(--color-auth-success)" : "var(--color-auth-border)"}
      />
      <path
        d="M6.25 10L8.75 12.5L13.75 7.5"
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
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
        stroke-width="1.66667"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
export interface ChangePasswordFormProps {
  copy: SiteConfig["auth"]["changePassword"];
}

type FieldErrorKey = keyof SiteConfig["auth"]["changePassword"]["errors"];
type FieldErrors = Partial<
  Record<"currentPassword" | "newPassword" | "confirmPassword", FieldErrorKey>
>;

/** Backend `VALIDATION_ERROR` field codes shown under their field, keyed by code. */
const BACKEND_FIELD_ERRORS: Record<
  string,
  [keyof FieldErrors, FieldErrorKey]
> = {
  NEW_PASSWORD_SAME_AS_CURRENT: ["newPassword", "newPasswordSameAsCurrent"],
};

const fieldWrapClass = "relative flex items-center";

const iconClass =
  "pointer-events-none absolute left-4 h-4.5 w-4.5 text-auth-icon";

const inputBaseClass =
  "w-full rounded-md border border-auth-border bg-white pr-11 py-2.5 text-[16px] font-body text-auth-ink outline-none transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

function RequiredMark() {
  return (
    <span className="text-auth-required" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export function ChangePasswordForm({ copy }: ChangePasswordFormProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting">("idle");

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const meetsAllRequirements = passwordRequirements.every(({ test }) =>
    test(newPassword),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!currentPassword)
      nextErrors.currentPassword = "currentPasswordRequired";
    if (!newPassword) {
      nextErrors.newPassword = "newPasswordRequired";
    } else if (!meetsAllRequirements) {
      nextErrors.newPassword = "newPasswordInvalid";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "confirmPasswordRequired";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "confirmPasswordMismatch";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      showToast(copy.success, "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const code = error instanceof AuthApiError ? error.code : undefined;
      if (
        code === "INVALID_SESSION" ||
        code === "SESSION_REQUIRED" ||
        code === "ACCOUNT_DISABLED"
      ) {
        showToast(
          code === "ACCOUNT_DISABLED"
            ? copy.errors.accountDisabled
            : copy.errors.sessionExpired,
          "error",
        );
        logout();
        navigate("/login", { replace: true });
        return;
      }
      if (code === "VALIDATION_ERROR" && error instanceof AuthApiError) {
        const fieldErrors: FieldErrors = {};
        const unmapped: string[] = [];
        for (const item of error.fieldErrors ?? []) {
          const mapped = BACKEND_FIELD_ERRORS[item.code];
          if (mapped) {
            fieldErrors[mapped[0]] = mapped[1];
          } else if (item.message) {
            unmapped.push(item.message);
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
        if (unmapped.length || !Object.keys(fieldErrors).length) {
          showToast(
            unmapped.length
              ? unmapped.join("\n")
              : error.message || copy.errors.genericError,
            "error",
          );
        }
        return;
      }
      // Other backend codes aren't documented yet: show its own message
      // (e.g. a wrong current password) when it sends one.
      const backendMessage =
        error instanceof AuthApiError &&
        code !== "NETWORK_ERROR" &&
        error.message !== "Request failed."
          ? error.message
          : "";
      reportApiError(
        error,
        backendMessage ? { [code as string]: backendMessage } : {},
        copy.errors.genericError,
      );
    } finally {
      setStatus("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {/* Current password */}
      <div>
        <label
          htmlFor={currentPasswordId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.currentPasswordLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <input
            id={currentPasswordId}
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={copy.currentPasswordPlaceholder}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              clearError("currentPassword");
            }}
            aria-invalid={Boolean(errors.currentPassword)}
            style={{
              color: showCurrentPassword ? "var(--color-auth-ink)" : "var(--color-auth-masked)",
              caretColor: "var(--color-auth-placeholder)",
            }}
            className={`${inputBaseClass} pl-4 ${
              errors.currentPassword ? "border-red-400" : "border-auth-border"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((v) => !v)}
            aria-label={
              showCurrentPassword
                ? copy.hidePasswordAria
                : copy.showPasswordAria
            }
            className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
          >
            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.currentPassword && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[errors.currentPassword]}
          </p>
        )}
      </div>

      {/* New password */}
      <div>
        <label
          htmlFor={newPasswordId}
          className="mb-2 block text-body-sm font-medium text-auth-text"
        >
          {copy.newPasswordLabel}
          <RequiredMark />
        </label>
        <div className={fieldWrapClass}>
          <input
            id={newPasswordId}
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={copy.newPasswordPlaceholder}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearError("newPassword");
            }}
            aria-invalid={Boolean(errors.newPassword)}
            style={{
              color: showNewPassword ? "var(--color-auth-ink)" : "var(--color-auth-masked)",
              caretColor: "var(--color-auth-placeholder)",
            }}
            className={`${inputBaseClass} pl-4 ${
              errors.newPassword ? "border-red-400" : "border-auth-border"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            aria-label={
              showNewPassword ? copy.hidePasswordAria : copy.showPasswordAria
            }
            className="absolute right-3.5 flex h-4.5 w-4.5 items-center justify-center text-auth-icon-muted transition-colors hover:text-auth-icon-strong"
          >
            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="mt-1.5 text-[13px] text-red-500">
            {copy.errors[errors.newPassword]}
          </p>
        )}
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {passwordRequirements.map(({ key, test }) => {
            const met = test(newPassword);
            return (
              <li
                key={key}
                className="flex items-center gap-2 text-body-sm text-auth-muted"
              >
                <RequirementIcon met={met} />
                {copy.requirements[key]}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Confirm new password */}
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
            className={`${inputBaseClass} pl-11 ${
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

      <Button
        type="submit"
        variant="primary"
        disabled={status === "submitting"}
        className="mt-1 w-full rounded-md py-3.5 disabled:cursor-not-allowed disabled:opacity-60 text-body font-semibold !bg-auth-primary hover:!bg-auth-primary-hover"
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

export default ChangePasswordForm;
