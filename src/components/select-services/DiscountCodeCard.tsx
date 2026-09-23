import { useId, useState } from "react";
import type { SiteConfig } from "@/config/site.config";
import { showToast } from "@/lib/toast";
import { validateCoupon, type CouponResult } from "@/lib/mock/selectServices";

export interface DiscountCodeCardProps {
  copy: SiteConfig["selectServicesPage"]["discount"];
  onApply: (coupon: CouponResult) => void;
  /** Disables the apply button — e.g. while the account isn't `ready`. */
  disabled?: boolean;
}

type ErrorKey = keyof SiteConfig["selectServicesPage"]["discount"]["errors"];
type FieldErrors = Partial<Record<"code", ErrorKey>>;

const labelClass = "mb-2 block text-[14px] font-medium text-auth-text";

const inputClass =
  "h-10 w-full rounded-md border bg-white px-3 text-[16px] font-body text-auth-ink outline-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

export function DiscountCodeCard({ copy, onApply, disabled = false }: DiscountCodeCardProps) {
  const codeId = useId();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    const nextErrors: FieldErrors = {};
    if (!code.trim()) nextErrors.code = "codeRequired";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const coupon = await validateCoupon(code);
      if (!coupon) {
        setErrors({ code: "codeInvalid" });
        return;
      }
      onApply(coupon);
      showToast(copy.success, "success");
    } catch {
      showToast(copy.errors.applyFailed, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col rounded-[12px] border border-auth-border-light bg-white p-6 font-body shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
    >
      <div className="border-b border-auth-divider pb-5">
        <h2 className="text-[16px] leading-6 font-semibold text-auth-heading">{copy.heading}</h2>
        <p className="mt-0.5 text-[14px] leading-5 text-auth-muted">{copy.subtitle}</p>
      </div>

      <div className="mt-6">
        <label htmlFor={codeId} className={labelClass}>
          {copy.codeLabel}
        </label>
        <input
          id={codeId}
          name="discountCode"
          type="text"
          autoComplete="off"
          placeholder={copy.codePlaceholder}
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            clearError("code");
          }}
          aria-invalid={Boolean(errors.code)}
          className={`${inputClass} ${errors.code ? "border-red-400" : "border-auth-border"}`}
        />
        {errors.code && (
          <p className="mt-1.5 text-[13px] text-red-500">{copy.errors[errors.code]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-6 h-10 cursor-pointer self-end rounded-md bg-auth-primary px-8 text-[14px] font-semibold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-auth-primary"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
