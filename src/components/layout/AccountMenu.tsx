import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import editAccountIcon from "@/assets/account-menu/edit-account.svg";
import changePasswordIcon from "@/assets/account-menu/change-password.svg";
import serviceManagementIcon from "@/assets/account-menu/service-management.svg";
import downloadInvoiceIcon from "@/assets/account-menu/download-invoice.svg";
import logOutIcon from "@/assets/account-menu/log-out.svg";
import type { SiteConfig } from "@/config/site.config";
import { useAuth } from "@/hooks/useAuth";
import { showToast } from "@/lib/toast";

export interface AccountMenuProps {
  copy: SiteConfig["nav"]["account"];
  className?: string;
}

/**
 * Replaces the header's Login button once a session is authenticated.
 * The square before the name is a placeholder for the logo the person
 * uploads on the Edit Account page — there's no such image yet, so it just
 * renders empty.
 */
export function AccountMenu({ copy, className = "" }: AccountMenuProps) {
  const navigate = useNavigate();
  const { displayName, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  // Horizontal nudge (px) that keeps the menu inside the viewport — the
  // design's -left-10 offset overflows the right edge whenever the trigger
  // sits close to it (every desktop width below ~1330px).
  const [shiftX, setShiftX] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Room needed for the full menu (Figma: Height Hug ≈ 206px) plus the 14px
  // gap below the trigger. Flip above the trigger when there isn't enough
  // space below — e.g. the mobile menu's trigger sits near the bottom of
  // the viewport.
  const MENU_HEIGHT_ESTIMATE = 230;
  // Matches the menu's fixed w-[200px].
  const MENU_WIDTH = 200;
  // Minimum distance kept between the menu and either side of the viewport.
  const VIEWPORT_GUTTER = 8;

  // Layout effect so the direction/nudge are applied before the menu is
  // first painted — no one-frame flash in the wrong spot.
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const rootRect = rootRef.current?.getBoundingClientRect();
      if (!rootRect) return;
      const spaceBelow = window.innerHeight - rootRect.bottom;
      const up = spaceBelow < MENU_HEIGHT_ESTIMATE && rootRect.top > spaceBelow;
      // Only flip up when there's genuinely more room up there — on a short
      // viewport neither side may fit, and the bigger side clips less.
      setOpenUp(up);

      // Where the menu would sit un-nudged: right-aligned to the trigger
      // when opening up, 40px (-left-10) left of it when opening down.
      const left = up ? rootRect.right - MENU_WIDTH : rootRect.left - 40;
      const maxLeft =
        document.documentElement.clientWidth - VIEWPORT_GUTTER - MENU_WIDTH;
      setShiftX(
        Math.max(VIEWPORT_GUTTER, Math.min(left, maxLeft)) - left,
      );
    };

    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

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

  const close = () => setOpen(false);

  const handleDownloadInvoice = () => {
    close();
    showToast("Coming soon", "info");
  };

  const handleLogOut = () => {
    close();
    logout();
    navigate("/login");
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-body font-normal text-brand-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {/* Logo placeholder — swapped for the account's uploaded logo once that exists. */}
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 rounded-md border border-white/15 bg-white/10"
        />
        <span className="max-w-40 truncate font-medium">{displayName}</span>
        <ChevronDown
          size={12}
          strokeWidth={4}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={menuId}
          style={shiftX ? { transform: `translateX(${shiftX}px)` } : undefined}
          role="menu"
          aria-label="Account menu"
          // Figma: Flow Vertical, Width Hug (200px), Height Hug (206px),
          // Radius 8px, Border 1px — width is fixed, height just hugs the
          // (now-compact) rows below to land at the same ~206px.
          className={`absolute z-50 w-[200px] overflow-hidden rounded-lg border border-auth-border-light bg-white py-2 shadow-2xl ${
            openUp
              ? "right-0 bottom-[calc(100%+14px)]"
              : "top-[calc(100%+14px)] -left-10"
          }`}
        >
          <MenuLink
            to={copy.editAccount.href}
            icon={editAccountIcon}
            label={copy.editAccount.label}
            onClick={close}
          />
          <MenuLink
            to={copy.changePassword.href}
            icon={changePasswordIcon}
            label={copy.changePassword.label}
            onClick={close}
          />
          <MenuLink
            to={copy.serviceManagement.href}
            icon={serviceManagementIcon}
            label={copy.serviceManagement.label}
            onClick={close}
          />
          <MenuButton
            icon={downloadInvoiceIcon}
            label={copy.downloadInvoice}
            onClick={handleDownloadInvoice}
          />

          <div className="my-1 h-px bg-auth-border-light" aria-hidden="true" />

          <MenuButton
            icon={logOutIcon}
            label={copy.logOut}
            onClick={handleLogOut}
          />
        </div>
      )}
    </div>
  );
}

// px-4/py-2 + gap-2 + leading-5 text is tuned so 5 of these rows + the
// divider + the container's own py-2 add up to Figma's Height: Hug (206px)
// at this fixed 200px width.
const rowClass =
  "flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-body font-semibold leading-5 text-auth-heading transition-colors hover:bg-auth-surface cursor-pointer";

function MenuLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string;
  icon: string;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <Link to={to} role="menuitem" onClick={onClick} className={rowClass}>
      <img
        src={icon}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      />
      {label}
    </Link>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={rowClass}
    >
      <img
        src={icon}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

export default AccountMenu;
