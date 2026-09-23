import { Minus, Plus } from "lucide-react";

export interface QuantityStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decreaseAria: string;
  increaseAria: string;
}

const stepButtonClass =
  "flex h-full w-[34px] cursor-pointer items-center justify-center text-auth-placeholder transition-colors hover:text-auth-heading disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-auth-placeholder";

export function QuantityStepper({
  value,
  min,
  max,
  onChange,
  decreaseAria,
  increaseAria,
}: QuantityStepperProps) {
  return (
    <div className="flex h-[34px] w-[142px] items-center justify-between rounded-md border border-auth-border bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseAria}
        className={stepButtonClass}
      >
        <Minus size={16} strokeWidth={1.5} />
      </button>
      <span className="flex-1 text-center text-[13px] text-auth-text tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseAria}
        className={stepButtonClass}
      >
        <Plus size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
