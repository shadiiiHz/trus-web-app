import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { DURATION_SM, EASE_PREMIUM } from "@/motion/variants";
import { fetchCaptcha, getCaptchaErrorKey, verifyCaptcha } from "@/lib/api/authApi";
import { showToast } from "@/lib/toast";
import { validateCoupon, type CouponResult } from "@/lib/mock/selectServices";

export interface DiscountCodeCardProps {
  copy: SiteConfig["selectServicesPage"]["discount"];
  onApply: (coupon: CouponResult) => void;
}

type ErrorKey = keyof SiteConfig["selectServicesPage"]["discount"]["errors"];
type FieldErrors = Partial<Record<"code" | "captcha", ErrorKey>>;

const labelClass = "mb-2 block text-[14px] font-medium text-auth-text";

const inputClass =
  "h-10 w-full rounded-md border bg-white px-3 text-[16px] font-body text-auth-ink outline-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors duration-200 placeholder:text-auth-placeholder focus:border-brand-accent";

export function DiscountCodeCard({ copy, onApply }: DiscountCodeCardProps) {
  const codeId = useId();
  const captchaId = useId();

  const [code, setCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const loadCaptchaChallenge = async () => {
    try {
      const challenge = await fetchCaptcha();
      setCaptchaImage(challenge.image);
      setChallengeId(challenge.challengeId);
    } catch {
      setCaptchaImage(null);
      setChallengeId(null);
    } finally {
      setCaptchaLoading(false);
    }
  };

  const refreshCaptcha = () => {
    setCaptchaLoading(true);
    setCaptchaInput("");
    loadCaptchaChallenge();
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCaptchaChallenge();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!code.trim()) nextErrors.code = "codeRequired";
    if (!captchaInput.trim()) nextErrors.captcha = "captchaRequired";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !challengeId) return;

    setSubmitting(true);
    try {
      await verifyCaptcha(challengeId, captchaInput.trim());
      const coupon = await validateCoupon(code);
      if (!coupon) {
        setErrors({ code: "codeInvalid" });
        refreshCaptcha();
        return;
      }
      onApply(coupon);
      showToast(copy.success, "success");
      setCaptchaInput("");
      refreshCaptcha();
    } catch (error) {
      const captchaErrorKey = getCaptchaErrorKey(error);
      if (captchaErrorKey) {
        setErrors((prev) => ({ ...prev, captcha: captchaErrorKey }));
      } else {
        showToast(copy.errors.applyFailed, "error");
      }
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col rounded-[12px] border border-auth-border-light bg-white p-6 font-body"
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

      <div className="mt-6 flex items-center gap-4">
        <div
          className="flex h-16.5 flex-1 select-none items-center justify-center overflow-hidden rounded-lg border border-auth-border-light bg-auth-surface"
          aria-hidden="true"
        >
          {captchaLoading ? (
            <span className="text-body-sm text-auth-muted">…</span>
          ) : captchaImage ? (
            <img src={captchaImage} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-[13px] text-red-500">
              {copy.errors.captchaLoadError}
            </span>
          )}
        </div>
        <motion.button
          type="button"
          onClick={refreshCaptcha}
          aria-label={copy.refreshCaptchaAria}
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: DURATION_SM, ease: EASE_PREMIUM }}
          className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-auth-border bg-white text-auth-icon-strong shadow-[0_1px_2px_0_rgba(0,0,0,0.05),inset_0_-2px_0_0_rgba(0,0,0,0.05)] transition-colors hover:border-brand-accent hover:text-brand-accent"
        >
          <RotateCw size={18} />
        </motion.button>
      </div>

      <div className="mt-4">
        <label htmlFor={captchaId} className={labelClass}>
          {copy.captchaLabel}
        </label>
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
          className={`${inputClass} ${errors.captcha ? "border-red-400" : "border-auth-border"}`}
        />
        {errors.captcha && (
          <p className="mt-1.5 text-[13px] text-red-500">{copy.errors[errors.captcha]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || captchaLoading}
        className="mt-6 h-10 cursor-pointer self-end rounded-md bg-auth-primary px-8 text-[14px] font-semibold text-white transition-colors hover:bg-auth-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
