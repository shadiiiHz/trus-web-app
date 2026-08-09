import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { buildArcLengthLUT } from "./ribbonMath";
import SlideText from "./SlideText";
import TemplateGridReveal, { type Category } from "./TemplateGridReveal";
import type { DesignTemplate } from "./types";

export type { DesignTemplate };

gsap.registerPlugin(ScrollTrigger);

// The heaviest dependencies in this feature (three.js, @react-three/fiber,
// @react-three/drei) live entirely inside RibbonScene. Loading it via
// `lazy` puts it in its own chunk so that JS isn't fetched/parsed until
// this section actually mounts, instead of bloating the initial bundle.
const RibbonScene = lazy(() => import("./RibbonScene"));

function ReadySignal({ onReady }: { onReady?: () => void }) {
  // `onReady` may be a fresh function identity on every parent render
  // (e.g. an inline arrow passed down from App). Reading the latest
  // value through a ref (kept current via its own effect) and firing
  // only on mount (empty deps below) means "ready" is reported exactly
  // once, instead of once per parent re-render.
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onReadyRef.current?.();
  }, []);
  return null;
}

interface DesignInMotion3DProps {
  onReady?: () => void;
  /** Your 6 template cards, in the order they should travel through. */
  templates: DesignTemplate[];
  /** Card width in three.js world units (not px — tune alongside camera distance/fov). */
  cardWidth?: number;
  /** Base radius of the vertical-axis spiral, in world units. */
  radius?: number;
  /** How much the radius bulges out front / curls in at the back, in world units. Keep < radius. */
  bulge?: number;
  /** Degrees of rotation around the vertical axis per card step. */
  angleStep?: number;
  /** Diagonal tilt of the whole ribbon (deg), rotated on the Z axis. */
  stageTiltDeg?: number;
  /** Extra top-down perspective on the ribbon (deg), rotated on the X axis. */
  stagePitchDeg?: number;
  /** How many card-widths of empty run-up/run-out to scroll through before/after the ribbon. */
  edgePadding?: number;
  scrollPerCard?: number;
  /** How long (in viewport heights) the pinned scroll-scrub lasts. */
  scrollLength?: number;
  /** Camera field of view (deg). */
  fov?: number;
  /** Camera distance from the origin along Z. */
  cameraDistance?: number;
  pinTargetRef?: React.RefObject<HTMLElement | null>;
  /**
   * Category-crossfade state and useCardRevealAnimation's refs, both
   * owned by the parent (TemplateSection) so CategoryTabs can be
   * rendered directly there instead of anywhere inside this component.
   * This component only needs `displayedCategory`/`gridVisible` (to
   * hand to TemplateGridReveal) and the animation refs/setters (also
   * for TemplateGridReveal) — it never touches `activeCategory` itself,
   * since it doesn't render CategoryTabs.
   */
  displayedCategory: Category;
  gridVisible: boolean;
  gridSectionRef: Ref<HTMLDivElement>;
  headerWrapRef: Ref<HTMLDivElement>;
  setCardRef: (i: number) => (el: HTMLDivElement | null) => void;
  setHovered: (i: number | null) => void;
  /**
   * Fires with the same grid-exit progress this component already tracks
   * locally (for its own tagline/sectionDes fades), so the parent can
   * mirror it into its own state and drive useCardRevealAnimation there
   * — that hook needs to run wherever CategoryTabs lives now.
   */
  onGridProgressChange?: (progress: number) => void;
  /**
   * Fires the instant the scroll-trigger's pin engages/releases — `true`
   * for the whole time the section is genuinely pinned (progress 0 to
   * 1), `false` the moment it isn't, in either direction. This is what
   * CategoryTabs' rail should key its own visibility off of: the rail
   * is `position: fixed`, which only reads as "staying in the middle of
   * the section" while the section itself is pinned in place — the
   * instant it un-pins and starts scrolling normally again, the section
   * moves out from under a still-fixed rail unless something hides it
   * right then, not on the lag of a coarser "still mostly visible"
   * check.
   */
  onPinnedChange?: (pinned: boolean) => void;
  RightWord?: string;
  LeftWord?: string;
  /** Two-line tagline shown centered between the two slide texts. */
  tagline?: string[];
  sectionDes: string[];
  seeMore?: {
    label: string;
    href: string;
  };
  /**
   * Where (0-1 of total scroll) the grid finishes flying out. The grid
   * stays fully shown (settled, motionless) from scroll start through
   * gridHoldEnd, then flies out over [gridHoldEnd, gridExitEnd] — that
   * span alone controls how fast/slow the exit itself reads, independent
   * of when the ribbon starts entering (see ribbonEnterFrac) or of how
   * long the initial hold lasts.
   */
  gridExitEnd?: number;
  /**
   * Where (0-1 of total scroll) the grid's hold ends and its exit begins
   * — see gridExitEnd. 0 means no hold at all (the exit starts
   * immediately at scroll start, the original behavior).
   */
  gridHoldEnd?: number;
  /**
   * How much the ribbon's entrance overlaps with the tail of the grid's
   * exit, as a fraction of [gridHoldEnd, gridExitEnd] (the exit window
   * itself, not counting the hold before it). 0 = the ribbon waits for
   * the grid to be completely gone before it starts entering (fully
   * sequential). Closer to 1 = the ribbon starts entering earlier, while
   * the grid is still on its way out — without changing how long the
   * grid itself takes to exit.
   */
  ribbonEnterFrac?: number;
  /**
   * Amplitude (world units) of an optional sinusoidal ripple layered on
   * top of the ribbon's vertical descent. Default 0 keeps the descent
   * perfectly uniform, so a line traced along the top or bottom edge of
   * every card reads as one smooth, unbroken curve. Raise this only if
   * you deliberately want the ribbon to undulate.
   */
  waveAmplitude?: number;
  /** Frequency of the optional ripple above. */
  waveFrequency?: number;
  /**
   * Global multiplier on how fast the ribbon descends per card, applied
   * identically front-to-back (see note in Card). Raise for a steeper /
   * more spread-out ribbon, lower for a tighter one. Default 1 matches
   * the current back-card spacing exactly, since that spacing already
   * follows this same rule.
   */
  verticalStride?: number;
}

// Default ripple amplitude as a fraction of card width. Tying it to
// `cardWidth` (rather than a fixed world-unit constant) is what keeps the
// ripple looking consistent if cardWidth is ever changed — a fixed
// constant would look proportionally too strong/weak depending on card
// size. 0.6 is the value that reads as a smooth, uniform ribbon at the
// front instead of a staircase.
const DEFAULT_WAVE_AMPLITUDE_RATIO = 0.6;

function DesignInMotion3D({
  onReady,
  templates,
  cardWidth = 4,
  radius = 7,
  bulge = 1.8,
  angleStep = 33,
  stageTiltDeg = -12,
  stagePitchDeg = 5,
  edgePadding = 3.5,
  scrollPerCard = 0.3,
  scrollLength = 7.5,
  fov = 35,
  cameraDistance = 10,
  pinTargetRef,
  displayedCategory,
  gridVisible,
  gridSectionRef,
  headerWrapRef,
  setCardRef,
  setHovered,
  onGridProgressChange,
  onPinnedChange,
  RightWord,
  LeftWord,
  tagline,
  sectionDes,
  seeMore,
  gridExitEnd = 0.28,
  gridHoldEnd = 0.08,
  ribbonEnterFrac = 0.5,
  waveAmplitude,
  waveFrequency = 0.4,
  verticalStride = 1,
}: DesignInMotion3DProps) {
  // Default tied to cardWidth (see DEFAULT_WAVE_AMPLITUDE_RATIO above)
  // rather than a fixed number, so it stays proportional if cardWidth
  // changes. Still fully overridable via the waveAmplitude prop.
  const effectiveWaveAmplitude =
    waveAmplitude ?? cardWidth * DEFAULT_WAVE_AMPLITUDE_RATIO;
  const localSectionRef = useRef<HTMLDivElement>(null);
  const shiftRef = useRef(-edgePadding);
  const displayShiftRef = useRef(-edgePadding);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLHeadingElement>(null);
  const templatesRef = useRef<HTMLHeadingElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const liveProgressRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  // Starts at 1 (grid fully shown) so the cards are already in place the
  // instant the section enters, before the first scroll-driven update.
  const [gridProgress, setGridProgress] = useState(1);

  // Built once per `angleStep` and shared by every card — see the LUT
  // note in ribbonMath.ts. `angleStep` essentially never changes at
  // runtime, so in practice this table is built exactly once.
  const arcLengthLUT = useMemo(() => buildArcLengthLUT(angleStep), [angleStep]);

  // Lenis: smooth scroll only for the lifetime of this component.
  // Destroyed completely on unmount, so it never leaks into the rest
  // of the project.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      anchors: true,
    });

    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenisRef.current = null;
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const triggerEl = pinTargetRef?.current ?? localSectionRef.current;
    if (!triggerEl) return;

    const total = templates.length;

    // Small run-up/run-out margin so the ribbon doesn't visibly clip at the
    // very start/end of the pin. Kept tight (vs. the old 12) so the first
    // cards are already swinging into frame as soon as the section is
    // entered, instead of the scroll spending most of its length on empty
    // lead-in/lead-out.
    const bufferPad = 9.5;

    const shiftStart = -edgePadding - bufferPad;
    const shiftEnd = total - 1 + edgePadding + bufferPad;

    shiftRef.current = shiftStart;
    displayShiftRef.current = shiftStart;

    const totalShiftRange = shiftEnd - shiftStart;
    const computedScrollLength = totalShiftRange * scrollPerCard;
    const effectiveScrollLength = scrollLength ?? computedScrollLength;

    // The grid stays fully shown (settled, motionless) from scroll start
    // through gridHoldEnd, then flies out over [gridHoldEnd, gridExitEnd]
    // — that span alone sets the grid's own exit speed. The ribbon starts
    // entering at ribbonEnterStart, which can sit earlier than
    // gridExitEnd (per ribbonEnterFrac, expressed as a fraction of that
    // same exit window) so it overlaps the tail of the grid's exit
    // instead of waiting for it to fully finish, without changing how
    // long the hold lasts or how fast the grid itself moves once exiting.
    const gridExitSpan = Math.max(gridExitEnd - gridHoldEnd, 1e-6);
    const ribbonEnterStart = gridHoldEnd + gridExitSpan * (1 - ribbonEnterFrac);
    const ribbonRange = Math.max(1 - ribbonEnterStart, 1e-6);

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: () => `+=${effectiveScrollLength * window.innerHeight}`,
      scrub: 1,
      pin: triggerEl,
      anticipatePin: 1,

      onUpdate: (self) => {
        liveProgressRef.current = self.progress;

        const ribbonProgress = clamp01(
          (self.progress - ribbonEnterStart) / ribbonRange,
        );
        shiftRef.current = gsap.utils.interpolate(
          shiftStart,
          shiftEnd,
          ribbonProgress,
        );
        setScrollProgress(self.progress);

        // The cards' own settle/unsettle animation is driven entirely by
        // this — deliberately the plain, reversible formula regardless of
        // scroll direction, so the cards stay visually fixed in place
        // while scrolling back up, instead of replaying their entrance
        // flutter in reverse. Held at exactly 1 (fully settled, no
        // motion at all) through gridHoldEnd, then eases down to 0 over
        // the exit window from there to gridExitEnd.
        const grid =
          self.progress <= gridHoldEnd
            ? 1
            : clamp01((gridExitEnd - self.progress) / gridExitSpan);
        setGridProgress(grid);
        onGridProgressChange?.(grid);
      },

      // Fires exactly when the pin engages/releases (self.isActive flips)
      // — see `onPinnedChange` above for why this, rather than a
      // visibility heuristic, is what the tabs rail needs.
      onToggle: (self) => {
        onPinnedChange?.(self.isActive);
      },
    });

    // `end` is defined in terms of window.innerHeight, so any event that
    // changes it (a real resize, or a browser zoom — which changes
    // innerHeight too) rescales the pin's total scroll distance. Without
    // correction, the same scrollY then lands at a different fraction of
    // that distance, snapping the whole reveal (cards/ribbon/tabs) to a
    // different stage even though the user never scrolled.
    //
    // GSAP's own automatic resize handling isn't enough to prevent this:
    // its resize listener only *schedules* a refresh ~200ms out, and once
    // that fires it recomputes `self.progress` against the already-changed
    // scrollY, silently overwriting `liveProgressRef` with the jumped
    // value before our own (debounced) correction ever gets to read it.
    // Snapshotting `liveProgressRef` synchronously on the very first
    // resize event — before any delayed callback, ours or GSAP's, has run
    // — sidesteps that race entirely.
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let progressSnapshot: number | null = null;

    const handleWindowResize = () => {
      if (progressSnapshot === null) {
        progressSnapshot = liveProgressRef.current;
      }
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const snapshot = progressSnapshot;
        progressSnapshot = null;

        const { innerWidth, innerHeight } = window;
        if (innerWidth === lastWidth && innerHeight === lastHeight) return;
        lastWidth = innerWidth;
        lastHeight = innerHeight;

        // Lenis's own max-scroll ("limit") is recalculated on a debounce
        // independent of GSAP's, so force it fresh before scrolling.
        lenisRef.current?.resize();
        ScrollTrigger.refresh();
        const target = st.start + (snapshot ?? 0) * (st.end - st.start);
        lenisRef.current?.scrollTo(target, { immediate: true });
      }, 260);
    };
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
      clearTimeout(resizeTimer);
      st.kill();
    };
  }, [
    templates.length,
    edgePadding,
    scrollPerCard,
    scrollLength,
    pinTargetRef,
    gridExitEnd,
    gridHoldEnd,
    ribbonEnterFrac,
    angleStep,
    onGridProgressChange,
  ]);

  return (
    <section
      ref={localSectionRef}
      className="relative w-full"
      style={{ zIndex: 1 , height: "110vh"}}
    >
      <SlideText
        ref={designRef}
        direction="right"
        progress={scrollProgress}
        className="top-[25%]"
      >
        <h2 className="text-[130px] font-medium uppercase text-[#434343] tracking-tighter">
          {RightWord}
        </h2>
      </SlideText>

      <SlideText
        ref={templatesRef}
        direction="left"
        progress={scrollProgress}
        className="top-[49%]"
      >
        <h2 className="text-[130px] font-medium uppercase text-[#434343] tracking-tighter">
          {LeftWord}
        </h2>
      </SlideText>

      {tagline && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 text-center z-0 leading-3"
          style={{ opacity: 1 - gridProgress, transition: "opacity 0.3s ease" }}
        >
          <p className="text-[10px] font-medium uppercase  tracking-normal text-[#434343]">
            {tagline[0]}
            <br />
            {tagline[1]}
          </p>
        </div>
      )}
      {sectionDes && (
        <div
          className="absolute left-[12%] bottom-[15%] -translate-x-1/2 text-left z-0 leading-3.5"
          style={{ opacity: 1 - gridProgress, transition: "opacity 0.3s ease" }}
        >
          <p className="text-label font-normal tracking-normal text-[#434343]">
            {sectionDes[0]}
            <br />
            {sectionDes[1]}
            <br />
            {sectionDes[2]}
          </p>
        </div>
      )}
      {/*
        Only the lazy-loaded RibbonScene goes inside Suspense. It used to
        share this boundary with TemplateGridReveal (grid + category
        tabs): whenever RibbonScene re-suspended — which a resize/zoom can
        trigger, since it forces the Three.js canvas to re-measure —
        React's Suspense hides its *entire* subtree with an inline
        `display: none !important` while waiting to resolve again, not
        just the child that's actually suspending. That collateral-hid
        the tabs too, even though they have nothing to do with the 3D
        scene's own loading state — surfacing as the tabs randomly
        vanishing/never reappearing after a zoom. Keeping
        TemplateGridReveal as a sibling outside this boundary means it's
        never subject to RibbonScene's own suspend/resume churn.
      */}
      <Suspense fallback={null}>
        <div
          ref={canvasWrapperRef}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 1,
            transition: "none",
          }}
        >
          <RibbonScene
            templates={templates}
            cardWidth={cardWidth}
            radius={radius}
            bulge={bulge}
            angleStep={angleStep}
            waveAmplitude={effectiveWaveAmplitude}
            waveFrequency={waveFrequency}
            verticalStride={verticalStride}
            stageTiltDeg={stageTiltDeg}
            stagePitchDeg={stagePitchDeg}
            fov={fov}
            cameraDistance={cameraDistance}
            rawShiftRef={shiftRef}
            displayShiftRef={displayShiftRef}
            arcLengthLUT={arcLengthLUT}
          />
        </div>
      </Suspense>
      <TemplateGridReveal
        seeMore={seeMore}
        displayedCategory={displayedCategory}
        gridVisible={gridVisible}
        sectionRef={gridSectionRef}
        headerWrapRef={headerWrapRef}
        setCardRef={setCardRef}
        setHovered={setHovered}
      />
      <ReadySignal onReady={onReady} />
    </section>
  );
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

// `templates` is expected to be a stable reference from the caller (a
// static config array), and every other prop is a primitive. Memoizing
// means this component only re-renders when one of those actually
// changes — not just because its parent re-rendered for an unrelated
// reason (e.g. a sibling section's state changing).
export default memo(DesignInMotion3D);
