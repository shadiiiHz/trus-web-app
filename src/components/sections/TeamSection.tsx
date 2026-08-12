import { useState, useEffect, useRef } from "react";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/motion/FadeIn";
import { TeamMemberCard, type CardState } from "@/components/team/TeamMemberCard";
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

// All three columns share one width so the row-1 gap (card0 ↔ card1) and
// row-2 gap (card2 ↔ card3) read as the same 20px — a card sitting in a
// wider/narrower column than its neighbour would throw the two off.
const CARD_W = 337;
const CARD_H = 294;
const ENTRANCE_DISTANCE = 640;

// Height of the fixed site Navbar (h-18 = 72px + 1px bottom border), plus
// breathing room. Vertically centering the grid across the full 100vh (the
// old approach) shrinks the available room on short viewports and can still
// clip the eyebrow/heading under the navbar — so instead, like
// ServicesSection, the grid is anchored a flat distance from the sticky
// panel's own top. That clearance holds regardless of viewport height.
const NAVBAR_CLEARANCE = 100;

interface TeamDesktopGridProps {
  eyebrow: string;
  heading: string[];
  /** Full 8-member roster — the grid derives its own visible page from scroll. */
  members: Member[];
  hoveredId: string | null;
  onHoverChange: (id: string | null) => void;
  page: 0 | 1;
  onPageChange: (page: 0 | 1) => void;
  cardState: (id: string, visibleMembers: Member[]) => CardState;
  onMobileClick: (id: string) => void;
}

// How long (in viewport heights) the section stays pinned while the user
// scrolls through it — just entrance, a hold, then exit (see the progress
// keyframes below). Which page shows is arrow-only, not scroll-driven.
// TUNING: raise this to require more scrolling before the cards arrive/leave.
const PIN_VH = 340;

// Mounted only once isDesktop flips true. Owns its own pin/sticky scroll
// container so the section locks in place while the user scrolls, giving
// them a settled moment to look at the cards, then releases naturally once
// they've scrolled past it (scrollYProgress reaching 1 unpins it, same as
// scrolling any other content out of view). Paging between the two sets of
// members is handled entirely by the arrows, independent of scroll.
function TeamDesktopGrid({
  eyebrow,
  heading,
  members,
  hoveredId,
  onHoverChange,
  page,
  onPageChange,
  cardState,
  onMobileClick,
}: TeamDesktopGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const [cardsSettled, setCardsSettled] = useState(false);
  const pinRef = useRef<HTMLDivElement>(null);

  // Progress across the pinned scroll range: 0 when the pin engages
  // (wrapper top hits viewport top), 1 when it releases (wrapper bottom
  // hits viewport bottom) — exactly the sticky panel's on-screen lifetime.
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  // 1 = off-screen, 0 = settled in place. Cards arrive during the first
  // slice of the pin, hold through the middle (where paging happens), then
  // leave gradually over the final quarter, so the exit needs real scroll
  // distance instead of snapping away right before the section unpins.
  const tent = useTransform(scrollYProgress, [0, 0.1, 0.75, 1], [1, 0, 0, 1]);
  const smoothTent = useSpring(tent, { stiffness: 55, damping: 20, mass: 0.9 });

  useMotionValueEvent(smoothTent, "change", (v) => {
    setCardsSettled(v < 0.02);
  });

  const rightX = useTransform(smoothTent, (v) => v * ENTRANCE_DISTANCE);
  const leftX = useTransform(smoothTent, (v) => v * -ENTRANCE_DISTANCE);
  const panelY = useTransform(smoothTent, (v) => v * 24);

  const arrowsEnabled = shouldReduceMotion || cardsSettled;

  // Which page is showing is arrow-driven only — scrolling through the
  // pinned section never changes it, it just lets the cards settle in view.
  const visibleMembers = members.slice(page * 4, page * 4 + 4);
  const activeId = hoveredId ?? visibleMembers[0].id;
  const activeMember = members.find((m) => m.id === activeId) ?? visibleMembers[0];

  const boundCardProps = (m: Member) => ({
    image: m.image,
    name: m.name,
    state: cardState(m.id, visibleMembers),
    onMouseEnter: () => onHoverChange(m.id),
    onMouseLeave: () => onHoverChange(null),
    onClick: () => onMobileClick(m.id),
  });

  // The only way the page changes — a plain state flip, no scroll involved.
  function handleArrowClick() {
    onPageChange(page === 0 ? 1 : 0);
    onHoverChange(null);
  }

  // Diagonal staircase composition, flush to the left edge of the section:
  //   col →      [337px]      [337px]        [337px]
  //   row 0:     heading      card[0]         card[1]
  //   row 1:     card[2]      card[3]         info panel
  //
  // Carousel arrows sit left-aligned beneath the heading (col 0).
  // Top row (card[0], card[1]) slides in from/out to off-screen right;
  // bottom row (card[2], card[3]) slides in from/out to off-screen left.
  const grid = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${CARD_W}px ${CARD_W}px ${CARD_W}px`,
        gridTemplateRows: `${CARD_H}px ${CARD_H}px`,
        gap: "20px",
        width: "fit-content",
      }}
    >
      {/* [row 0, col 0] Eyebrow + heading, with carousel arrows left-aligned beneath */}
      <div
        style={{
          gridColumn: 1,
          gridRow: 1,
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
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "12px",
            marginTop: "auto",
            paddingTop: "40px",
          }}
        >
          <TeamCarouselArrow
            direction="left"
            onClick={handleArrowClick}
            disabled={!arrowsEnabled}
          />
          <TeamCarouselArrow
            direction="right"
            onClick={handleArrowClick}
            disabled={!arrowsEnabled}
          />
        </div>

        <div
          style={{
            position: "absolute",
            top: 55,
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

      {/* [row 0, col 2] Card[0] — top row, tracks scroll in from/out to off-screen right */}
      <motion.div
        style={{
          gridColumn: 2,
          gridRow: 1,
          x: shouldReduceMotion ? 0 : rightX,
        }}
      >
        <TeamMemberCard
          {...boundCardProps(visibleMembers[0])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 0, col 3] Card[1] — top row, tracks scroll in from/out to off-screen right */}
      <motion.div
        style={{
          gridColumn: 3,
          gridRow: 1,
          x: shouldReduceMotion ? 0 : rightX,
        }}
      >
        <TeamMemberCard
          {...boundCardProps(visibleMembers[1])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 1, col 1] Card[2] — bottom row, tracks scroll in from/out to off-screen left */}
      <motion.div
        style={{
          gridColumn: 1,
          gridRow: 2,
          x: shouldReduceMotion ? 0 : leftX,
        }}
      >
        <TeamMemberCard
          {...boundCardProps(visibleMembers[2])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 1, col 2] Card[3] — bottom row, tracks scroll in from/out to off-screen left */}
      <motion.div
        style={{
          gridColumn: 2,
          gridRow: 2,
          x: shouldReduceMotion ? 0 : leftX,
        }}
      >
        <TeamMemberCard
          {...boundCardProps(visibleMembers[3])}
          style={{ width: "100%", height: CARD_H }}
        />
      </motion.div>

      {/* [row 1, col 3] Info panel */}
      <motion.div
        style={{
          gridColumn: 3,
          gridRow: 2,
          height: CARD_H,
          display: "flex",
          alignItems: "center",
          y: shouldReduceMotion ? 0 : panelY,
        }}
      >
        <TeamInfoPanel member={activeMember} />
      </motion.div>
    </div>
  );

  // Reduced motion: render the grid in normal flow, no pin/sticky lock —
  // scroll-jacking a section is itself a motion effect some users disable.
  if (shouldReduceMotion) {
    return (
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: "1320px", padding: "0 20px" }}
      >
        {grid}
      </div>
    );
  }

  // The pin wrapper and sticky panel span the full section width (not the
  // 1320px content column) so overflow:hidden clips at the section's edges
  // instead of a few hundred px in — otherwise the entrance/exit slide hits
  // that inner boundary almost immediately and cards fade out mid-slide
  // instead of sliding past it. The 1320px column is reproduced just for
  // the grid, inside the sticky panel, so its on-screen position is
  // unchanged.
  return (
    <div ref={pinRef} style={{ height: `${PIN_VH}vh`, position: "relative" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: "1320px",
            padding: "0 20px",
            paddingTop: `${NAVBAR_CLEARANCE}px`,
          }}
        >
          {grid}
        </div>
      </div>
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

  // Carousel state — the desktop grid pages itself as the user scrolls
  // through the pinned section (or via its arrows); mobile just needs the
  // same page to compute its own default-active card, below.
  const [page, setPage] = useState<0 | 1>(0);
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
  function cardState(id: string, forVisibleMembers: Member[]): CardState {
    if (hoveredId === id) return "hovered";
    if (hoveredId !== null) return "dim";
    if (mobileId === id) return "active";
    if (mobileId === null && id === forVisibleMembers[0].id) return "active";
    return "idle";
  }

  function handleMobileClick(id: string) {
    setMobileId((prev) => (prev === id ? null : id));
  }

  // Shared card bindings (mobile layout only — the desktop grid binds its
  // own cards internally so it can derive visibleMembers from scroll).
  const cardProps = (m: Member) => ({
    image: m.image,
    name: m.name,
    state: cardState(m.id, visibleMembers),
    onMouseEnter: () => setHoveredId(m.id),
    onMouseLeave: () => setHoveredId(null),
    onClick: () => handleMobileClick(m.id),
  });

  const desktopLayout = (
    <TeamDesktopGrid
      eyebrow={eyebrow}
      heading={heading}
      members={members}
      hoveredId={hoveredId}
      onHoverChange={setHoveredId}
      page={page}
      onPageChange={setPage}
      cardState={cardState}
      onMobileClick={handleMobileClick}
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
        paddingTop: "180px",
        paddingBottom: "180px",
      }}
    >
      {/*
        Decorative layer, clipped on its own — kept off the <section> itself
        because overflow:hidden on an ancestor breaks position:sticky, and
        the desktop grid below pins itself via sticky while the user scrolls.
      */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Purple radial glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "55%",
            transform: "translate(-50%, -50%)",
            width: "860px",
            height: "480px",
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.09) 0%, transparent 72%)",
          }}
        />

        {/* Dark Crystal T watermark — bottom-right */}
        <div
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
          }}
        >
          T
        </div>
      </div>

      {/* Content — desktop's pin/sticky grid spans the full section width
          itself (see TeamDesktopGrid) so its exit slide isn't clipped by a
          narrower container; mobile stays in the standard content column. */}
      {isDesktop ? (
        <div className="relative w-full" style={{ zIndex: 1 }}>
          {desktopLayout}
        </div>
      ) : (
        <div
          className="relative mx-auto w-full"
          style={{ maxWidth: "1320px", padding: "0 20px", zIndex: 1 }}
        >
          {mobileLayout}
        </div>
      )}
    </section>
  );
}

export default TeamSection;
