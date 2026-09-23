import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  /** Shown on the trigger and as the option's main text. */
  label: string;
  /** Extra text after the label, shown in the open list only. */
  description?: string;
  /** Right-aligned secondary text, shown in the open list only. */
  hint?: string;
  /** Extra terms the search box matches on (not displayed). */
  keywords?: string;
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
  /** Show a search box at the top of the open list. */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
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
  searchable = false,
  searchPlaceholder = "Search",
  noResultsText = "No results",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleOptions =
    searchable && normalizedQuery
      ? options.filter((option) =>
          [option.label, option.description, option.hint, option.keywords, option.value]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : options;

  const toggle = () => {
    setQuery("");
    setOpen((o) => !o);
  };

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

  // Open on the current choice rather than the top of a long list.
  useEffect(() => {
    if (!open) return;
    const list = rootRef.current?.querySelector<HTMLElement>('[role="listbox"]');
    const current = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    // Scrolls only the list (not the page), centring the selected option.
    if (list && current) {
      list.scrollTop = current.offsetTop - (list.clientHeight - current.offsetHeight) / 2;
    }
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
        onClick={toggle}
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
        <div
          className={`absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-[#E5E5E5] bg-white shadow-xl ${panelClassName}`}
        >
          {searchable && (
            <div className="relative border-b border-[#EDEDED] p-2">
              <Search
                className="pointer-events-none absolute left-4.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]"
                aria-hidden="true"
              />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter picks the first match instead of submitting the form.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (visibleOptions[0]) choose(visibleOptions[0]);
                  }
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-controls={listboxId}
                className="h-9 w-full rounded-md border border-[#E5E5E5] bg-white pl-8 pr-3 text-[14px] font-body text-[#171717] outline-none transition-colors placeholder:text-[#A3A3A3] focus:border-brand-accent"
              />
            </div>
          )}
          <ul
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className="relative max-h-60 overflow-auto py-1.5"
          >
            {visibleOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(option)}
                    className={`flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-[15px] font-body transition-colors ${
                      isSelected
                        ? "bg-[#F5F1FC] font-medium text-[#5B2BB9]"
                        : "text-[#171717] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    <span className="shrink-0">{option.label}</span>
                    {option.description && (
                      <span className="min-w-0 truncate text-[#737373]">
                        {option.description}
                      </span>
                    )}
                    {option.hint && (
                      <span className="ml-auto shrink-0 pl-3 text-[14px] text-[#737373]">
                        {option.hint}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {visibleOptions.length === 0 && (
              <li className="px-4 py-2 text-[14px] font-body text-[#A3A3A3]">
                {noResultsText}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Select;
