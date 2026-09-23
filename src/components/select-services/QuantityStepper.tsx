function MinusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.16602 10H15.8327" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M9.99935 4.16663V15.8333M4.16602 9.99996H15.8327"
        stroke="currentColor"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface QuantityStepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  decreaseAria: string;
  increaseAria: string;
}

const stepButtonClass =
  "flex h-full w-[34px] cursor-pointer items-center justify-center text-[#A3A3A3] transition-colors hover:text-auth-heading disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[#A3A3A3]";

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
        <MinusIcon />
      </button>
      <span className="flex-1 text-center text-[14px] text-[#737373] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseAria}
        className={stepButtonClass}
      >
        <PlusIcon />
      </button>
    </div>
  );
}