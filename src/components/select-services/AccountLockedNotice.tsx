import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import type { SiteConfig } from "@/config/site.config";
import { DURATION_MD, EASE_PREMIUM } from "@/motion/variants";

export interface AccountLockedNoticeProps {
  copy: SiteConfig["selectServicesPage"]["locked"];
  /** Where the CTA sends the person to finish their profile. */
  href: string;
}

/**
 * Banner shown above Select Services while the account isn't `ready`: the
 * page stays browsable but its controls are disabled, so this explains why
 * and points straight at the fix.
 */
export function AccountLockedNotice({ copy, href }: AccountLockedNoticeProps) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION_MD, ease: EASE_PREMIUM }}
      className="relative flex flex-col gap-5 overflow-hidden rounded-[16px] bg-linear-to-r from-auth-primary via-[#6c3fd0] to-brand-accent px-6 py-5 shadow-[0_12px_32px_-12px_rgba(91,43,185,0.55)] ring-1 ring-white/10 ring-inset sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Soft light blobs for depth. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-white/15 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-[#c4a8ff]/25 blur-3xl"
      />

      <div className="relative flex items-start gap-4 sm:items-center">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-duration:2.4s]"
          />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm">
            <Lock size={20} strokeWidth={2.25} aria-hidden="true" />
          </span>
        </span>

        <div className="min-w-0">
          <p className="text-[16px] leading-6 font-semibold text-white">
            {copy.title}
          </p>
          <p className="mt-1 max-w-[640px] text-[14px] leading-5 text-white/80">
            {copy.description}
          </p>
        </div>
      </div>

      <Link
        to={href}
        className="group relative inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-md bg-white px-5 text-[14px] font-semibold text-auth-primary shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:self-center"
      >
        {copy.cta}
        <ArrowRight
          size={16}
          strokeWidth={2.5}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </motion.div>
  );
}
