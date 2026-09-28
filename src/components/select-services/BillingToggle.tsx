import type { BillingPeriod } from "./types";

export interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  labels: Record<BillingPeriod, string>;
  ariaLabel: string;
  /** Yearly discount from the backend; the "Save X%" badge is hidden while it's unknown or 0. */
  yearlySavePercent?: number | null;
  /** Badge text with a `{percent}` placeholder, e.g. "Save {percent}%". */
  saveLabel: string;
}

const periods: BillingPeriod[] = ["monthly", "yearly"];

/** Monthly / Yearly segmented control in the page header. */
export function BillingToggle({
  value,
  onChange,
  labels,
  ariaLabel,
  yearlySavePercent,
  saveLabel,
}: BillingToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex h-10 min-w-[218px] shrink-0 self-start sm:self-auto items-center rounded-lg border border-auth-border-light bg-white p-[3px]"
    >
      {periods.map((period) => {
        const active = value === period;
        return (
          <button
            key={period}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(period)}
            className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-4 text-[12px] transition-colors duration-150 ${
              active
                ? "bg-[#FAFAFA] font-semibold text-auth-heading shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]"
                : "font-medium text-[#525252] hover:text-auth-heading"
            }`}
          >
            {labels[period]}
            {period === "yearly" && !!yearlySavePercent && (
              <span className="font-semibold text-[#16A34A]">
                {saveLabel.replace("{percent}", String(yearlySavePercent))}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
