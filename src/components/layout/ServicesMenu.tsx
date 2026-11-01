import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ICON_MARKUP } from "@/components/services/serviceIcons";
import { getServicesMenu } from "@/config/servicesMenu.config";
import { siteConfig } from "@/config/site.config";
import { TrusServicesIcon } from "./TrusServicesIcon";

const OPEN_DELAY_MS = 0;
const CLOSE_DELAY_MS = 140;
/** How long a category switch is held back while the pointer is heading for the open sub-menu. */
const SWITCH_INTENT_MS = 350;

type Point = { x: number; y: number };

const sign = (p: Point, a: Point, b: Point) =>
  (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);

function inTriangle(p: Point, a: Point, b: Point, c: Point) {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);
  const neg = d1 < 0 || d2 < 0 || d3 < 0;
  const pos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(neg && pos);
}

/** Grid cells in Figma's column-major order: `index` is the position in `items` (-1 is the "Services" root). */
const GRID: readonly { index: number; icon: string }[] = [
  { index: -1, icon: "business-growth" },
  { index: 5, icon: "business-growth" },
  { index: 2, icon: "multilingual" },
  { index: 1, icon: "web-design" },
  { index: 3, icon: "branding" },
  { index: 0, icon: "seo" },
  { index: 4, icon: "social-media" },
  { index: 6, icon: "lead-email" },
  { index: 7, icon: "youtube" },
];

/**
 * Desktop navbar "Services" item: the link itself plus a hover / focus mega-menu (Figma: 1279×290 dark card hung 1px
 * below the bar, a 3×3 grid of the main services beside a list of the AI agents under the hovered one). The card is
 * positioned against the navbar container (the wrapper is not `relative`) and the wrapper stretches to the bar's height
 * so the pointer never leaves the item while moving into it.
 */
export function ServicesMenu({ children }: { children: ReactNode }) {
  const { root, items } = getServicesMenu();
  const copy = siteConfig.nav.servicesMenu;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const switchTimer = useRef<number | undefined>(undefined);
  const pendingIndex = useRef<number | null>(null);
  const pointer = useRef<Point>({ x: 0, y: 0 });
  const anchor = useRef<Point | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  const schedule = (next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setOpen(next);
        if (!next) setActive(null);
      },
      next ? OPEN_DELAY_MS : CLOSE_DELAY_MS,
    );
  };

  const close = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
    setActive(null);
  };
  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(switchTimer.current);
    },
    [],
  );

  const cancelSwitch = () => {
    window.clearTimeout(switchTimer.current);
    pendingIndex.current = null;
  };

  /** True while the pointer is travelling from where it left the active item towards the sub-menu panel (safe triangle). */
  const headingToSub = () => {
    const col = subRef.current;
    const card = cardRef.current;
    const from = anchor.current;
    if (!col || !card || !from) return false;
    const c = col.getBoundingClientRect();
    const k = card.getBoundingClientRect();
    return inTriangle(
      pointer.current,
      from,
      { x: c.left, y: k.top },
      { x: c.left, y: k.bottom },
    );
  };

  const activate = (index: number | null) => {
    if (index === active) return cancelSwitch();
    if (active !== null && showSubNow() && headingToSub()) {
      pendingIndex.current = index;
      window.clearTimeout(switchTimer.current);
      switchTimer.current = window.setTimeout(() => {
        setActive(pendingIndex.current);
        pendingIndex.current = null;
      }, SWITCH_INTENT_MS);
      return;
    }
    cancelSwitch();
    setActive(index);
  };

  const showSubNow = () => !!items[active ?? -1]?.children?.length;

  // Re-evaluated on every pointer move over the grid: once the pointer stops heading to the panel, switch right away.
  const onGridMove = (e: React.MouseEvent) => {
    pointer.current = { x: e.clientX, y: e.clientY };
    if (pendingIndex.current === null) {
      anchor.current = pointer.current;
    } else if (!headingToSub()) {
      const next = pendingIndex.current;
      cancelSwitch();
      setActive(next);
    }
  };

  const activeItem = active !== null ? items[active] : undefined;
  // The right-hand list only exists for a main service that has sub-services (the ones with an arrow).
  const showSub = !!activeItem?.children?.length;

  return (
    <div
      className="group/menu flex h-full items-center"
      data-menu-open={open}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onFocus={() => schedule(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null))
          schedule(false);
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
        className="absolute left-5 top-full z-50 w-[calc(100%-41px)]"
      >
        <div
          ref={cardRef}
          role="menu"
          aria-label={root.label}
          className="relative box-border flex h-[290px] w-full overflow-hidden rounded-2xl border border-[#303037] bg-[#121217] pl-8 pr-8 pt-3 font-body"
        >
          <span
            className="absolute left-[890px] top-[23px] h-px w-px bg-[#303037]"
            aria-hidden="true"
          />

          <div className="w-[915px] shrink-0 max-xl:w-0 max-xl:flex-1">
            <p className="flex h-9 items-center text-xs font-bold uppercase leading-[15px] text-[#707075]">
              {copy.explore}
            </p>
            <ul
              className="mt-3 grid grid-flow-col grid-rows-3 gap-3 max-xl:grid-cols-3 xl:grid-cols-[299px_296px_297px]"
              role="none"
              onMouseMove={onGridMove}
              onMouseLeave={cancelSwitch}
            >
              {GRID.map(({ index, icon }) => {
                const item = index < 0 ? root : items[index];
                const hasChildren = !!item.children?.length;
                const isActive = index >= 0 && active === index;
                return (
                  <li key={item.label} role="none" className="min-h-[58px]">
                    <Link
                      to={item.href}
                      onClick={close}
                      role="menuitem"
                      aria-haspopup={hasChildren ? "menu" : undefined}
                      aria-expanded={hasChildren ? isActive : undefined}
                      onMouseEnter={() => activate(index >= 0 ? index : null)}
                      onFocus={() => {
                        cancelSwitch();
                        setActive(index >= 0 ? index : null);
                      }}
                      className={`box-border flex h-full min-h-[58px] w-full items-center justify-between gap-3 rounded-[10px] border border-[#303037] p-3 text-base font-semibold leading-[19px] text-[#F8F8FA] outline-none transition-colors hover:bg-[#22192F] focus-visible:bg-[#22192F] ${isActive ? "bg-[#22192F]" : "bg-[#19191F]"}`}
                    >
                      <span
                        className={`flex min-w-0 items-center ${index === 2 ? "gap-2.5" : "gap-3"}`}
                      >
                        {index < 0 ? (
                          <TrusServicesIcon className="shrink-0 text-white" />
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 43 43"
                            fill="none"
                            aria-hidden="true"
                            className="shrink-0 text-white"
                            dangerouslySetInnerHTML={{
                              __html: ICON_MARKUP[icon] ?? "",
                            }}
                          />
                        )}
                        <span className="min-w-0">{item.label}</span>
                      </span>
                      {hasChildren && (
                        <svg
                          aria-hidden="true"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0"
                        >
                          <path
                            d="M10 17L15 12L10 7"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className="ml-3 h-[246px] w-px shrink-0 bg-[#303037]"
            aria-hidden="true"
          />

          <div
            ref={subRef}
            className="ml-3 min-w-[213px]"
            onMouseEnter={cancelSwitch}
          >
            {showSub && activeItem?.children && (
              <>
                <p className="flex h-9 items-center px-2 text-xs font-bold leading-[15px] text-[#707075]">
                  {activeItem.label}
                </p>
                <ul
                  className="mt-3 flex flex-col gap-1"
                  role="menu"
                  aria-label={activeItem.label}
                >
                  {activeItem.children.map((child) => (
                    <li key={child.label} role="none" className="min-h-9">
                      <Link
                        to={child.href}
                        onClick={close}
                        role="menuitem"
                        className="box-border flex min-h-9 w-fit max-w-full items-center rounded-md border border-transparent p-2 text-sm font-medium leading-5 text-white outline-none transition-colors hover:border-[#303037] hover:bg-[#22192F] focus-visible:border-[#303037] focus-visible:bg-[#22192F] "
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ServicesMenu;
