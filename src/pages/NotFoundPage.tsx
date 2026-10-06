import { useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { FadeIn } from "@/components/motion/FadeIn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { siteConfig } from "@/config/site.config";

export default function NotFoundPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const reduce = useReducedMotion();
  const { eyebrow, heading, subtitle, home, services } =
    siteConfig.notFoundPage;

  return (
    <div className="bg-brand-bg min-h-screen font-body antialiased text-brand-white">
      <Navbar />

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pt-18 pb-16">
        {/* Ambient brand-purple glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px] sm:h-[760px] sm:w-[760px]"
          style={{
            background:
              "radial-gradient(circle, rgba(135,93,217,0.55) 0%, rgba(83,40,168,0.25) 45%, transparent 70%)",
          }}
        />
        {/* Faint grid, masked to fade out toward the edges */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, #000 20%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 20%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto flex max-w-[640px] flex-col items-center text-center">
          <FadeIn direction="none" scale={0.92}>
            <motion.div
              aria-hidden
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="select-none text-[100px] font-bold leading-none tracking-tight sm:text-[190px]"
              style={{
                background:
                  "linear-gradient(180deg, #9d70f5 0%, #875dd9 45%, #5328a8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 0 40px rgba(135,93,217,0.45))",
              }}
            >
              404
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <span className="mt-2 inline-block rounded-full border border-brand-accent/40 bg-brand-accent/10 px-4 py-1 text-[13px] font-medium uppercase tracking-[0.14em] text-brand-accent-light">
              {eyebrow}
            </span>
          </FadeIn>

          <FadeIn delay={0.18}>
            <h1 className="mt-6 text-[28px] font-semibold leading-tight sm:text-[30px]">
              {heading}
            </h1>
            <p className="mt-3 text-body font-normal text-brand-muted">
              {subtitle}
            </p>
          </FadeIn>

          <FadeIn delay={0.26}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-[8px] px-6 py-3 text-[16px] font-medium text-white transition-opacity hover:opacity-90"
                style={{
                  background: "linear-gradient(90deg, #875DD9 0%, #5328A8 100%)",
                }}
              >
                {home}
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center rounded-[8px] border border-[rgba(255,255,255,0.5)] px-6 py-3 text-[16px] font-medium text-brand-white transition-colors hover:bg-[rgba(255,255,255,0.05)]"
              >
                {services}
              </Link>
            </div>
          </FadeIn>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
