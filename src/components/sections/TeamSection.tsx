import { useState, useEffect, useRef, type RefObject } from "react";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import {
  TeamMemberCard,
  type CardState,
  type TeamMemberCardProps,
} from "@/components/team/TeamMemberCard";
import { TeamInfoPanel } from "@/components/team/TeamInfoPanel";
import { TeamCarouselArrow } from "@/components/team/TeamCarouselArrow";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Type helpers
type Member = (typeof siteConfig.team.members)[number];
type CardBindings = Omit<TeamMemberCardProps, "style">;

// All three columns share one width so the row-1 gap (card0 ↔ card1) and
// row-2 gap (card2 ↔ card3) read as the same 20px — a card sitting in a
// wider/narrower column than its neighbour would throw the two off.
const CARD_W = 337;
const CARD_H = 294;
const ENTRANCE_DISTANCE = 640;

interface TeamDesktopGridProps {
  eyebrow: string;
  heading: string[];
  /** The 4 members currently visible on desktop (one page of the 8-member roster). */
  visibleMembers: Member[];
  hoveredId: string | null;
  togglePage: () => void;
  activeMember: Member;
  cardProps: (m: Member) => CardBindings;
  sectionRef: RefObject<HTMLElement | null>;
}

// Mounted only once isDesktop flips true. sectionRef points at the always-
// present <section> ancestor, so useScroll gets a populated ref immediately
// (a ref local to this component would attach to a still-null node on first
// mount, since this component itself only mounts after the desktop check).
function TeamDesktopGrid({
  eyebrow,
  heading,
  visibleMembers,
  hoveredId,
  togglePage,
  activeMember,
  cardProps,
  sectionRef,
}: TeamDesktopGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const [cardsSettled, setCardsSettled] = useState(false);

  // Tracks the section's entire time on screen, start to finish — not just
  // the entrance — so scrolling past the top reverses the same motion the
  // entrance used, and scrolling back down replays it.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // 1 = off-screen, 0 = settled in place. Plateaus through the middle of the
  // section's on-screen time (roughly when it's centered in the viewport),
  // so cards arrive, hold while the section reads as "in view", then reverse
  // back out as it exits.
  const tent = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [1, 0, 0, 1]);

  // Spring-smoothed so the motion visibly catches up to scroll instead of
  // snapping straight to it — slower, and legible as movement rather than a pop.
  const smoothTent = useSpring(tent, { stiffness: 55, damping: 20, mass: 0.9 });

  useMotionValueEvent(smoothTent, "change", (v) => {
    setCardsSettled(v < 0.02);
  });

  const rightX = useTransform(smoothTent, (v) => v * ENTRANCE_DISTANCE);
  const leftX = useTransform(smoothTent, (v) => v * -ENTRANCE_DISTANCE);
  const cardOpacity = useTransform(smoothTent, (v) =>
    Math.max(0, Math.min(1, 1 - v)),
  );
  const panelY = useTransform(smoothTent, (v) => v * 24);

  const arrowsEnabled = shouldReduceMotion || cardsSettled;

  // Diagonal staircase composition, centered as a block within the section:
  //   col →      [337px]      [337px]        [337px]
  //   row 0:     —            —               arrows
  //   row 1:     heading      card[0]         card[1]
  //   row 2:     card[2]      card[3]         info panel
  //
  // Top row (card[0], card[1]) slides in from/out to off-screen right;
  // bottom row (card[2], card[3]) slides in from/out to off-screen left.
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${CARD_W}px ${CARD_W}px ${CARD_W}px`,
        gridTemplateRows: `44px ${CARD_H}px ${CARD_H}px`,
        gap: "20px",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      {/* [row 0, col 3] Carousel arrows — sit above the top-right card */}
      <div
        style={{
          gridColumn: 3,
          gridRow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "12px",
        }}
      >
        <TeamCarouselArrow
          direction="left"
          onClick={togglePage}
          disabled={!arrowsEnabled}
        />
        <TeamCarouselArrow
          direction="right"
          onClick={togglePage}
          disabled={!arrowsEnabled}
        />
      </div>

      {/* [row 1, col 1] Eyebrow + heading */}
      <div
        style={{
          gridColumn: 1,
          gridRow: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: "6px",
        }}
      >
        <FadeIn direction="up" delay={0.08}>
          <p
            className="text-section-label"
            style={{
              fontWeight: 400,
              lineHeight: "20px",
              color: "#9F7EE1",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              margin: "0 0 14px 0",
            }}
          >
            {eyebrow}
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.16}>
          <h2
            className="text-section-title"
            style={{
              // Section-title system (DM Sans / 700) but capped: this editorial
              // heading lives in a fixed 337px column, so the full 42px clamp
              // would overflow. Size stays tuned to fit the column.
              fontSize: "clamp(24px, 2.3vw, 32px)",
              lineHeight: 1.18,
              color: "#FFFFFF",
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {heading.join("\n")}
          </h2>
        </FadeIn>
        <div
          style={{
            position: "absolute",
            top: -40,
            left: -80,
            width: "300px",
            height: "300px",
            zIndex: -1,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Glow */}
          <div
            style={{
              position: "absolute",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 50% 70%, rgba(124,58,237,0.25), transparent 60%)",
              filter: "blur(30px)",
              opacity: hoveredId ? 0.9 : 0.2,
              transform: hoveredId ? "scale(1.5)" : "scale(1)",
              transition: "all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
              mixBlendMode: "screen",
              animation: hoveredId
                ? "glowPulse 2.6s ease-in-out infinite"
                : "none",
            }}
          />
          <motion.video
            src="T_animation_glass_mood.webm"
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: hoveredId ? "scale(2.4) rotate(2deg)" : "scale(2)",
              transition: "all 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* [row 1, col 2] Card[0] — top row, tracks scroll in from/out to off-screen right */}
      <motion.div
        style={{
          gridColumn: 2,
          gridRow: 2,
          x: shouldReduceMotion ? 0 : rightX,
          opacity: shouldReduceMotion ? 1 : cardOpacity,
        }}
      >
        <TeamMemberCard
          {...cardProps(visibleMembers[0])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 1, col 3] Card[1] — top row, tracks scroll in from/out to off-screen right */}
      <motion.div
        style={{
          gridColumn: 3,
          gridRow: 2,
          x: shouldReduceMotion ? 0 : rightX,
          opacity: shouldReduceMotion ? 1 : cardOpacity,
        }}
      >
        <TeamMemberCard
          {...cardProps(visibleMembers[1])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 2, col 1] Card[2] — bottom row, tracks scroll in from/out to off-screen left */}
      <motion.div
        style={{
          gridColumn: 1,
          gridRow: 3,
          x: shouldReduceMotion ? 0 : leftX,
          opacity: shouldReduceMotion ? 1 : cardOpacity,
        }}
      >
        <TeamMemberCard
          {...cardProps(visibleMembers[2])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 2, col 2] Card[3] — bottom row, tracks scroll in from/out to off-screen left */}
      <motion.div
        style={{
          gridColumn: 2,
          gridRow: 3,
          x: shouldReduceMotion ? 0 : leftX,
          opacity: shouldReduceMotion ? 1 : cardOpacity,
        }}
      >
        <TeamMemberCard
          {...cardProps(visibleMembers[3])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 2, col 3] Info panel */}
      <motion.div
        style={{
          gridColumn: 3,
          gridRow: 3,
          height: CARD_H,
          display: "flex",
          alignItems: "center",
          y: shouldReduceMotion ? 0 : panelY,
          opacity: shouldReduceMotion ? 1 : cardOpacity,
        }}
      >
        <TeamInfoPanel member={activeMember} />
      </motion.div>
    </div>
  );
}

export function TeamSection() {
  const { eyebrow, heading, members } = siteConfig.team;
  const sectionRef = useRef<HTMLElement>(null);

  // Interaction state
  // hoveredId = null on desktop when no card is hovered → defaults to the
  // first member of the visible page. On mobile: click to select (click
  // same to deselect).
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileId, setMobileId] = useState<string | null>(null);

  // Carousel state — arrows page the desktop grid between the first 4 and
  // last 4 members of the roster (8 members total, 4 shown at a time).
  const [page, setPage] = useState<0 | 1>(0);
  const togglePage = () => {
    setPage((prev) => (prev === 0 ? 1 : 0));
    setHoveredId(null);
  };
  const visibleMembers = members.slice(page * 4, page * 4 + 4);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Active member: hovered (desktop) → mobile selected → first visible default
  const activeId = hoveredId ?? mobileId ?? visibleMembers[0].id;
  const activeMember = (members.find((m) => m.id === activeId) ??
    visibleMembers[0]) as Member;

  // Card state helper
  function cardState(id: string): CardState {
    if (hoveredId === id) return "hovered";
    if (hoveredId !== null) return "dim";
    if (mobileId === id) return "active";
    if (mobileId === null && id === visibleMembers[0].id) return "active";
    return "idle";
  }

  function handleMobileClick(id: string) {
    setMobileId((prev) => (prev === id ? null : id));
  }

  // Shared card bindings
  const cardProps = (m: Member) => ({
    image: m.image,
    name: m.name,
    state: cardState(m.id),
    onMouseEnter: () => setHoveredId(m.id),
    onMouseLeave: () => setHoveredId(null),
    onClick: () => handleMobileClick(m.id),
  });

  const desktopLayout = (
    <TeamDesktopGrid
      eyebrow={eyebrow}
      heading={heading}
      visibleMembers={visibleMembers}
      hoveredId={hoveredId}
      togglePage={togglePage}
      activeMember={activeMember}
      cardProps={cardProps}
      sectionRef={sectionRef}
    />
  );

  // Mobile layout
  const mobileLayout = (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Eyebrow + heading */}
      <div>
        <FadeIn direction="up" delay={0.08}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              fontWeight: 400,
              color: "#9F7EE1",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              margin: "0 0 12px 0",
            }}
          >
            {eyebrow}
          </p>
        </FadeIn>
        <FadeIn direction="up" delay={0.16}>
          <h2
            style={{
              fontFamily: "var(--font-hero)",
              fontSize: "28px",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#FFFFFF",
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {heading.join("\n")}
          </h2>
        </FadeIn>
      </div>

      {/* Horizontal scroll card row */}
      <FadeIn direction="up" delay={0.26}>
        <div
          style={{
            display: "flex",
            gap: "14px",
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "4px",
          }}
        >
          {members.map((m) => (
            <TeamMemberCard
              key={m.id}
              {...cardProps(m)}
              style={{ width: 220, height: 260, flexShrink: 0 }}
            />
          ))}
        </div>
      </FadeIn>

      {/* Info panel below cards */}
      <FadeIn direction="up" delay={0.36}>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 16,
            padding: "24px",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <TeamInfoPanel member={activeMember} />
        </div>
      </FadeIn>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="team"
      aria-label="Meet Our Team"
      style={{
        background: "var(--color-brand-bg)",
        position: "relative",
        overflow: "hidden",
        paddingTop: "180px",
        paddingBottom: "180px",
      }}
    >
      {/* Purple radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "40%",
          left: "55%",
          transform: "translate(-50%, -50%)",
          width: "860px",
          height: "480px",
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.09) 0%, transparent 72%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Dark Crystal T watermark — bottom-right */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-8%",
          right: "-2%",
          fontSize: "clamp(200px, 26vw, 380px)",
          fontFamily: "var(--font-hero)",
          fontWeight: 700,
          color: "rgba(135, 93, 217, 0.028)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        T
      </div>

      {/* Content container */}
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: "1200px", padding: "0 20px", zIndex: 1 }}
      >
        {isDesktop ? desktopLayout : mobileLayout}
      </div>
    </section>
  );
}

export default TeamSection;
