import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { resolveSectionLink } from "@/lib/navigation";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/i18n";
import { LANGUAGES, selectLocale } from "@/components/layout/LanguageSwitch";
import { EASE_PREMIUM, DURATION_MD } from "@/motion/variants";
import GradientButton from "@/components/ui/GradientButton";
import trusLogo from "@/assets/logo.png";
import editAccountIcon from "@/assets/account-menu/edit-account.svg";
import changePasswordIcon from "@/assets/account-menu/change-password.svg";
import serviceManagementIcon from "@/assets/account-menu/service-management.svg";
import downloadInvoiceIcon from "@/assets/account-menu/download-invoice.svg";

type Nav = SiteConfig["nav"];

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  data: Nav;
  isHome: boolean;
  /** Section id (or "" for Home) currently active on the home page. */
  activeSection: string;
  pathname: string;
}

const rowBase =
  "flex w-full items-center rounded-lg text-left font-body text-[17px] leading-6 text-white transition-colors hover:bg-[rgba(159,126,225,0.1)] hover:text-[#936EDD]";

const rowActive = "bg-[rgba(159,126,225,0.1)] !text-[#936EDD]";

/** Full-screen mobile navigation (Figma: Main menu / Language / Account). */
export function MobileMenu({
  open,
  onClose,
  data,
  isHome,
  activeSection,
  pathname,
}: MobileMenuProps) {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<"menu" | "language">("menu");
  const [accountOpen, setAccountOpen] = useState(false);

  const close = () => {
    onClose();
    // Reset after the exit animation so the panel doesn't flash a different view.
    window.setTimeout(() => {
      setView("menu");
      setAccountOpen(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          data-lenis-prevent
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain lg:hidden"
          style={{
            background:
              "radial-gradient(120% 60% at 20% 30%, rgba(60, 28, 110, 0.22) 0%, rgba(5, 5, 5, 0) 60%), #050505",
          }}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
        >
          <div className="flex h-19.75 shrink-0 items-center justify-between border-b border-white/25 bg-black pr-7 pl-9">
            <a href="/" aria-label="TruS — home" className="outline-none">
              <img
                src={trusLogo}
                alt="TruS"
                className="block h-8"
                style={{ width: "auto" }}
              />
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-white"
            >
              <X size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {view === "language" ? (
            <LanguagePanel
              title={data.language}
              onBack={() => setView("menu")}
              onPick={() => setView("menu")}
            />
          ) : (
            <div className="flex flex-1 flex-col px-5.25 pb-10">
              {isAuthenticated ? (
                <AccountCard
                  copy={data.account}
                  open={accountOpen}
                  onToggle={() => setAccountOpen((o) => !o)}
                  onClose={close}
                />
              ) : null}

              <p
                className={`border-b border-white/15 pb-2.5 font-body uppercase text-[#a3a3a3] ${
                  isAuthenticated
                    ? "mt-9 text-[12px] leading-4"
                    : "mt-11.5 text-[14px] leading-5"
                }`}
              >
                {data.mainMenu}
              </p>

              <ul
                role="list"
                className={`flex flex-col ${isAuthenticated ? "mt-2.5 gap-2.25" : "mt-4.5 gap-px"}`}
              >
                {data.links.map((link) => {
                  const isPageLink = link.href.startsWith("/");
                  const sectionId = link.href === "#" ? "" : link.href.slice(1);
                  const active = isHome
                    ? activeSection === sectionId
                    : isPageLink && pathname === link.href;
                  const to = resolveSectionLink(link.href, isHome);
                  const className = `${rowBase} px-4.5 ${
                    isAuthenticated ? "h-11" : "h-12"
                  } ${active ? `font-semibold ${rowActive}` : "font-normal"}`;
                  return (
                    <li key={link.label}>
                      {to ? (
                        <Link
                          to={to}
                          onClick={close}
                          className={className}
                          aria-current={active ? "page" : undefined}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          onClick={close}
                          className={className}
                          aria-current={active ? "page" : undefined}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>

              {!isAuthenticated && (
                <>
                  <LanguageTrigger onClick={() => setView("language")} />
                  <GradientButton
                    text={data.cta.label}
                    href={data.cta.href}
                    className="mt-6.5 w-full justify-center"
                    style={{ height: 44, borderRadius: 8 }}
                  />
                </>
              )}

              {isAuthenticated && (
                <LanguageTrigger onClick={() => setView("language")} />
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlagBox({
  Flag,
  width,
  height,
}: {
  Flag: (typeof LANGUAGES)[number]["Flag"];
  width: number;
  height: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[4px]"
      style={{ width, height }}
    >
      <Flag fit="slice" />
    </span>
  );
}

function LanguageTrigger({ onClick }: { onClick: () => void }) {
  const locale = useLocale();
  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Language: ${current.name}. Open language menu`}
      className="mt-6.75 flex h-15.5 w-full cursor-pointer items-center border-t border-white/15 px-4.5 text-white"
    >
      <span className="font-body !text-[16px] leading-6 !font-normal">{current.label}</span>
      <span className="ml-3.25">
        <FlagBox Flag={current.Flag} width={36} height={26} />
      </span>
      <ChevronRight
        size={20}
        strokeWidth={2}
        className="ml-auto mr-1.5"
        aria-hidden="true"
      />
    </button>
  );
}

function LanguagePanel({
  title,
  onBack,
  onPick,
}: {
  title: string;
  onBack: () => void;
  onPick: () => void;
}) {
  const locale = useLocale();
  return (
    <div className="flex flex-1 flex-col px-5.25 pb-10">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="mt-12.5 flex w-full cursor-pointer items-center gap-3.5 border-b border-white/15 px-3.5 pb-2.5 text-left"
      >
        <ChevronLeft size={20} strokeWidth={2} className="text-white" aria-hidden="true" />
        <span className="font-body text-[14px] leading-5 text-[#BFBFBF]">{title}</span>
      </button>
      <ul role="listbox" aria-label={title} className="mt-3.5 flex flex-col gap-4.5">
        {LANGUAGES.map((lang) => {
          const selected = lang.code === locale;
          return (
            <li key={lang.code} role="none">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  if (!selected) selectLocale(lang.code);
                  onPick();
                }}
                className={`${rowBase} h-12 cursor-pointer justify-between px-4.5 pr-3.5 !text-[16px] !font-normal ${
                  selected ? rowActive : ""
                }`}
              >
                {lang.name}
                <FlagBox Flag={lang.Flag} width={38} height={27} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AccountCard({
  copy,
  open,
  onToggle,
  onClose,
}: {
  copy: Nav["account"];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { displayName, logoUrl, logout } = useAuth();
  const [brokenLogoUrl, setBrokenLogoUrl] = useState<string | null>(null);
  const showLogo = Boolean(logoUrl) && logoUrl !== brokenLogoUrl;

  const itemClass =
    "flex h-12 w-full cursor-pointer items-center gap-3.5 px-4.5 text-left font-body text-[14px] leading-5 font-medium text-white";

  return (
    <div className="mt-12 overflow-hidden rounded-xl border border-white/6 bg-[rgba(159,126,225,0.1)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-17.5 w-full cursor-pointer items-center px-4.5 text-white"
      >
        <span
          aria-hidden="true"
          className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white/10"
        >
          {showLogo && (
            <img
              src={logoUrl!}
              alt=""
              width={36}
              height={36}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={() => setBrokenLogoUrl(logoUrl)}
            />
          )}
        </span>
        <span className="ml-3 min-w-0 flex-1 truncate text-left font-body text-[16px] leading-6 font-semibold">
          {displayName}
        </span>
        <ChevronDown
          size={20}
          strokeWidth={2}
          className={`mr-1.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mx-4.5 border-t border-white/15 pb-3.5 pt-1.5">
          <AccountLink to={copy.editAccount.href} icon={editAccountIcon} onClick={onClose} className={itemClass}>
            {copy.editAccount.label}
          </AccountLink>
          <AccountLink to={copy.changePassword.href} icon={changePasswordIcon} onClick={onClose} className={itemClass}>
            {copy.changePassword.label}
          </AccountLink>
          <AccountLink to={copy.serviceManagement.href} icon={serviceManagementIcon} onClick={onClose} className={itemClass}>
            {copy.serviceManagement.label}
          </AccountLink>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              onClose();
              showToast("Coming soon", "info");
            }}
          >
            <img src={downloadInvoiceIcon} alt="" width={20} height={20} className="h-5 w-5 shrink-0" />
            {copy.downloadInvoice}
          </button>
          <button
            type="button"
            className={`${itemClass} !text-[#DC2626]`}
            onClick={() => {
              onClose();
              logout();
              navigate("/login");
            }}
          >
            <LogOutIcon />
            {copy.logOut}
          </button>
        </div>
      )}
    </div>
  );
}

function AccountLink({
  to,
  icon,
  onClick,
  className,
  children,
}: {
  to: string;
  icon: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} onClick={onClick} className={className}>
      <img src={icon} alt="" width={20} height={20} className="h-5 w-5 shrink-0" aria-hidden="true" />
      {children}
    </Link>
  );
}

function LogOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
      <path
        d="M13.3333 5.83333L17.5 10L13.3333 14.1667M17.5 10H7.5M7.5 2.5H6.5C5.09987 2.5 4.3998 2.5 3.86502 2.77248C3.39462 3.01217 3.01217 3.39462 2.77248 3.86502C2.5 4.3998 2.5 5.09987 2.5 6.5V13.5C2.5 14.9001 2.5 15.6002 2.77248 16.135C3.01217 16.6054 3.39462 16.9878 3.86502 17.2275C4.3998 17.5 5.09987 17.5 6.5 17.5H7.5"
        stroke="currentColor"
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default MobileMenu;
