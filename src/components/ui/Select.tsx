import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  ariaInvalid?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  /** Show an "x" button to clear the current value back to the placeholder. */
  clearable?: boolean;
  clearAriaLabel?: string;
}

/**
 * Button + listbox dropdown standing in for a native `<select>`. Native
 * select popups are OS-rendered and can't take a border-radius or
 * box-shadow in most browsers, so anywhere the opened list needs to look
 * like the rest of the UI (rounded corners, elevation) this is used instead.
 */
export function Select({
  id,
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  ariaInvalid,
  disabled,
  className = "",
  triggerClassName = "",
  panelClassName = "",
  clearable = false,
  clearAriaLabel = "Clear selection",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={ariaInvalid}
        aria-label={ariaLabel}
        className={`truncate text-left ${triggerClassName}`}
      >
        {selected ? selected.label : placeholder}
      </button>

      {clearable && selected && (
        <button
          type="button"
          onClick={clear}
          aria-label={clearAriaLabel}
          className="absolute right-9 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-[#A3A3A3] transition-colors hover:text-[#404040]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-60 overflow-auto rounded-xl border border-[#E5E5E5] bg-white py-1.5 shadow-xl ${panelClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => choose(option)}
                  className={`block w-full whitespace-nowrap px-4 py-2 text-left text-[15px] font-body transition-colors ${
                    isSelected
                      ? "bg-[#F5F1FC] font-medium text-[#5B2BB9]"
                      : "text-[#171717] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Select;
