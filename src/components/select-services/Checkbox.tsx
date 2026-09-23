import { Check } from "lucide-react";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Box size in px (16 in the table, 18 for "Auto Renew"). */
  size?: number;
  id?: string;
  "aria-label"?: string;
}

/** Purple-filled square checkbox shared by the services table and order summary. */
export function Checkbox({
  checked,
  onChange,
  size = 16,
  id,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        className="peer h-full w-full cursor-pointer appearance-none rounded-[4px] border border-auth-border bg-white transition-colors duration-150 checked:border-auth-primary checked:bg-auth-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
      />
      <Check
        size={size - 4}
        strokeWidth={3}
        className="pointer-events-none absolute text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
      />
    </span>
  );
}
