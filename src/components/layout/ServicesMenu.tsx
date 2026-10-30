import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getServicesMenu } from "@/config/servicesMenu.config";

const OPEN_DELAY_MS = 0;
const CLOSE_DELAY_MS = 140;

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`size-5 shrink-0 ${className}`}
    >
      <path d="M7.5 5L12.5 10L7.5 15" />
    </svg>
  );
}

/**
 * Desktop navbar "Services" item: the link itself plus a hover / focus mega-menu (Figma: 442×340 card, a 200px list of
 * the main services beside a 242px list of the AI agents under the hovered one). The wrapper stretches to the navbar's
 * height so the card hangs 2px below the bar and the pointer never leaves the item while moving into it.
 */
export function ServicesMenu({ children }: { children: ReactNode }) {
  const { root, items } = getServicesMenu();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const schedule = (next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(next);
      if (!next) setActive(null);
    }, next ? OPEN_DELAY_MS : CLOSE_DELAY_MS);
  };

  const close = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setActive(null);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const activeItem = active !== null ? items[active] : undefined;
  // The right-hand list only exists for a main service that has sub-services (the ones with an arrow).
  const showSub = !!activeItem?.children?.length;

  return (
    <div
      className="group/menu relative flex h-full items-center"
      data-menu-open={open}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onFocus={() => schedule(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) schedule(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      {children}

      {/* Always mounted (just hidden) so the first hover after page load doesn't pay for mounting and laying out the card. */}
      <motion.div
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, visibility: "visible" }
            : { opacity: 0, y: -6, transitionEnd: { visibility: "hidden" } }
        }
        style={{ visibility: "hidden" }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="absolute -left-3.5 top-full z-50"
      >
            <div
              role="menu"
              aria-label={root.label}
              className={`box-border flex min-h-[340px] ${showSub ? "w-[442px]" : "w-[202px]"} items-stretch overflow-hidden rounded-lg border border-black/10 bg-[#FAFAFA] text-[#1E1E1E] shadow-[0_12px_16px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03),0_2px_2px_-1px_rgba(0,0,0,0.04)]`}
            >
              <div className="box-border flex flex-1 items-stretch border border-[#E5E5E5] bg-white">
                <ul className={`box-border flex w-[200px] shrink-0 flex-col py-2 ${showSub ? "border-r border-black/10" : ""}`} role="none">
                  {[root, ...items].map((item, i) => {
                    const index = i - 1; // root is -1
                    const hasChildren = !!item.children?.length;
                    const isActive = index >= 0 && active === index;
                    return (
                      <li key={item.label} className="flex min-h-9 items-center px-1.5" role="none">
                        <Link
                          to={item.href}
                          onClick={close}
                          role="menuitem"
                          aria-haspopup={hasChildren ? "menu" : undefined}
                          aria-expanded={hasChildren ? isActive : undefined}
                          onMouseEnter={() => setActive(index >= 0 ? index : null)}
                          onFocus={() => setActive(index >= 0 ? index : null)}
                          className={`flex min-h-9 flex-1 items-center justify-between gap-2 rounded-md p-2 font-body text-[14px] font-medium leading-5 outline-none transition-colors hover:bg-[#FAFAFA] focus-visible:bg-[#FAFAFA] ${isActive ? "bg-[#FAFAFA]" : ""}`}
                        >
                          <span>{item.label}</span>
                          {hasChildren && <Chevron />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {showSub && (
                <div className="box-border flex flex-1 flex-col pl-4 pr-4 pt-2">
                  {activeItem?.children && (
                    <div className="w-full" role="none">
                      <p className="flex h-9 items-center font-body text-[14px] font-bold leading-[22px]">{activeItem.label}</p>
                      <div className="h-px w-full bg-black/10" aria-hidden="true" />
                      <ul role="menu" aria-label={activeItem.label}>
                        {activeItem.children.map((child) => (
                          <li key={child.label} role="none">
                            <Link
                              to={child.href}
                              onClick={close}
                              role="menuitem"
                              className="flex min-h-9 items-center py-1.5 font-body text-[14px] font-normal leading-[22px] outline-none transition-colors hover:text-brand-accent focus-visible:text-brand-accent"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                )}
              </div>
            </div>
      </motion.div>
    </div>
  );
}

export default ServicesMenu;
