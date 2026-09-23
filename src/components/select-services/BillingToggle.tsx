import type { BillingPeriod } from "./types";

export interface BillingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  labels: Record<BillingPeriod, string>;
  ariaLabel: string;
}

const periods: BillingPeriod[] = ["monthly", "yearly"];

/** Monthly / Yearly segmented control in the page header. */
export function BillingToggle({ value, onChange, labels, ariaLabel }: BillingToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex h-10 w-[218px] shrink-0 items-center rounded-lg border border-auth-border-light bg-white p-[3px]"
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
            className={`h-full flex-1 cursor-pointer rounded-md text-[12px] transition-colors duration-150 ${
              active
                ? "bg-auth-surface font-semibold text-auth-heading shadow-[0_1px_2px_0_rgba(0,0,0,0.06)]"
                : "font-medium text-auth-text hover:text-auth-heading"
            }`}
          >
            {labels[period]}
          </button>
        );
      })}
    </div>
  );
}
