import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { getServicesMenu } from "@/config/servicesMenu.config";
import { resolveSectionLink } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/i18n";
import { LANGUAGES, selectLocale } from "@/components/layout/LanguageSwitch";
import { EASE_PREMIUM, DURATION_MD } from "@/motion/variants";
import GradientButton from "@/components/ui/GradientButton";
import trusLogo from "@/assets/logo.png";
import editAccountIcon from "@/assets/account-menu/edit-account.svg";
import changePasswordIcon from "@/assets/account-menu/change-password.svg";
import serviceManagementIcon from "@/assets/account-menu/service-management.svg";

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

const LINE = "border-[rgba(112,112,117,0.3)]";
const HERO_BG =
  "radial-gradient(120% 60% at 20% 30%, rgba(60, 28, 110, 0.22) 0%, rgba(5, 5, 5, 0) 60%), #0b0a10";

const rowBase =
  "box-border flex w-full cursor-pointer items-center justify-between rounded-lg border border-transparent px-4 text-left font-body text-[16px] font-normal leading-4 text-white transition-colors hover:bg-[rgba(159,126,225,0.1)]";

const rowActive =
  "!bg-[#22192F] !border-[rgba(159,126,225,0.1)] !font-bold";

type View = "menu" | "language" | "services";

/** Full-screen mobile navigation (Figma: Main menu / Language / Services / Account). */
export function MobileMenu({
  open,
  onClose,
  data,
  isHome,
  activeSection,
  pathname,
}: MobileMenuProps) {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<View>("menu");
  const [accountOpen, setAccountOpen] = useState(false);

  const close = () => {
    onClose();
    // Reset after the exit animation so the panel doesn't flash a different view.
    window.setTimeout(() => {
      setView("menu");
      setAccountOpen(false);
    }, 300);
  };

  const backToMenu = () => setView("menu");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          data-lenis-prevent
          className="fixed inset-0 z-60 flex flex-col overflow-y-auto overscroll-contain bg-[#121217] lg:hidden"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
        >
          <div className="box-border flex h-18 shrink-0 items-center justify-between gap-4 border-b border-white/30 bg-[#070606] px-5 py-4">
            <a href="/" aria-label="TruS — home" className="outline-none">
              <img
                src={trusLogo}
                alt="TruS"
                className="block h-10"
                style={{ width: "auto" }}
              />
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-white"
            >
              <X size={22} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div
            className={`flex flex-1 flex-col gap-6 px-5 ${
              isAuthenticated && view === "menu" ? "py-10" : "py-5"
            }`}
            style={{ background: HERO_BG }}
          >
            {view === "language" ? (
              <LanguagePanel title={data.language} onBack={backToMenu} onPick={backToMenu} />
            ) : view === "services" ? (
              <ServicesPanel title={data.mainMenu} onBack={backToMenu} onNavigate={close} />
            ) : (
              <>
                {isAuthenticated ? (
                  <AccountCard
                    copy={data.account}
                    open={accountOpen}
                    onToggle={() => setAccountOpen((o) => !o)}
                    onClose={close}
                  />
                ) : null}

                <div className={`flex flex-col ${isAuthenticated ? "gap-2" : "gap-4"}`}>
                  <p
                    className={`box-border flex items-center border-b ${LINE} px-4 pb-2 font-body text-[#BFBFBF] ${
                      isAuthenticated
                        ? "h-6 text-[12px] uppercase leading-4"
                        : "h-14 text-[14px] leading-4"
                    }`}
                  >
                    {data.mainMenu}
                  </p>

                  <ul role="list" className={`flex flex-col ${isAuthenticated ? "gap-2" : ""}`}>
                    {data.links.map((link) => {
                      const isPageLink = link.href.startsWith("/");
                      const sectionId = link.href === "#" ? "" : link.href.slice(1);
                      const active = isHome
                        ? activeSection === sectionId
                        : isPageLink && pathname === link.href;
                      const to = resolveSectionLink(link.href, isHome);
                      const height = isAuthenticated && !active ? "h-10" : "h-11";
                      const className = `${rowBase} ${height} ${active ? rowActive : ""}`;
                      return (
                        <li key={link.label}>
                          {link.href === "/services" ? (
                            <button
                              type="button"
                              onClick={() => setView("services")}
                              className={className}
                              aria-haspopup="menu"
                              aria-current={active ? "page" : undefined}
                            >
                              {link.label}
                              <ChevronRight size={24} strokeWidth={1.875} className="shrink-0" aria-hidden="true" />
                            </button>
                          ) : to ? (
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
                </div>

                <LanguageTrigger onClick={() => setView("language")} />

                {!isAuthenticated && (
                  <GradientButton
                    text={data.cta.label}
                    href={data.cta.href}
                    className="w-full justify-center"
                    style={{ height: 40, borderRadius: 8 }}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlagBox({ Flag, bordered = true }: { Flag: (typeof LANGUAGES)[number]["Flag"]; bordered?: boolean }) {
  return (
    <span
      className={`box-border inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] ${
        bordered ? "border-[0.5px] border-white" : ""
      }`}
      style={{ width: 32, height: 22.59 }}
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
      className="box-border flex h-14 w-full cursor-pointer items-center justify-between p-4 text-white"
    >
      <span className="flex items-center gap-2.5">
        <span className="font-body text-[16px] leading-4 font-normal">{current.label}</span>
        <FlagBox Flag={current.Flag} bordered={false} />
      </span>
      <ChevronRight size={24} strokeWidth={1.875} className="shrink-0" aria-hidden="true" />
    </button>
  );
}

function BackHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      aria-label="Back"
      className={`box-border flex h-14 w-full cursor-pointer items-center gap-2.5 border-b ${LINE} px-2 pb-2 text-left`}
    >
      <ChevronLeft size={24} strokeWidth={1.875} className="shrink-0 text-[#BFBFBF]" aria-hidden="true" />
      <span className="font-body text-[14px] leading-4 text-[#BFBFBF]">{title}</span>
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
    <div className="flex flex-col gap-3">
      <BackHeader title={title} onBack={onBack} />
      <ul role="listbox" aria-label={title} className="flex flex-col gap-4">
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
                className={`${rowBase} h-11 gap-3 ${selected ? rowActive : ""} !font-normal`}
              >
                <span className="leading-[19px]">{lang.name}</span>
                <FlagBox Flag={lang.Flag} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Index into `items` per row, in the desktop mega-menu's grid order (-1 is the "Services" root). */
const SERVICES_ORDER = [-1, 5, 2, 1, 3, 0, 4, 6, 7];

/** Services drill-down: rows with sub-services expand inline. */
function ServicesPanel({
  title,
  onBack,
  onNavigate,
}: {
  title: string;
  onBack: () => void;
  onNavigate: () => void;
}) {
  const { root, items } = getServicesMenu();
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <BackHeader title={title} onBack={onBack} />
      <ul role="list" className="flex flex-col">
        {SERVICES_ORDER.map((index) => {
          const item = index < 0 ? root : items[index];
          const hasChildren = !!item.children?.length;
          const isOpen = expanded === index;
          return (
            <li key={item.label}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className={`${rowBase} h-11 ${isOpen ? rowActive : ""}`}
                >
                  {item.label}
                  <ChevronRight
                    size={24}
                    strokeWidth={1.875}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Link to={item.href} onClick={onNavigate} className={`${rowBase} h-11`}>
                  {item.label}
                </Link>
              )}
              {hasChildren && isOpen && (
                <ul role="list" className={`ml-4 flex flex-col border-l ${LINE}`}>
                  {item.children!.map((child) => (
                    <li key={child.label}>
                      <Link
                        to={child.href}
                        onClick={onNavigate}
                        className="flex h-10 w-full items-center rounded-lg px-4 font-body text-[16px] leading-4 text-white transition-colors hover:bg-[rgba(159,126,225,0.1)]"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
    "flex h-9 w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left font-body text-[14px] leading-5 font-medium text-white transition-colors hover:bg-[rgba(159,126,225,0.1)]";

  return (
    <div className="box-border flex flex-col gap-2 rounded-lg border border-[rgba(159,126,225,0.1)] bg-[#22192F] p-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex h-8 w-full cursor-pointer items-center justify-between text-white"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[rgba(0,0,0,0.12)] bg-white/10"
          >
            {showLogo && (
              <img
                src={logoUrl!}
                alt=""
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => setBrokenLogoUrl(logoUrl)}
              />
            )}
          </span>
          <span
            className={`min-w-0 truncate text-left font-body text-[16px] leading-4 ${
              open ? "font-semibold" : "font-normal"
            }`}
          >
            {displayName}
          </span>
        </span>
        <ChevronDown
          size={24}
          strokeWidth={1.875}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <>
          <div className={`border-t ${LINE}`} aria-hidden="true" />
          <div className="flex flex-col gap-2">
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
        </>
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
