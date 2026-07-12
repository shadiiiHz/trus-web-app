import {
  lazy,
  memo,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { buildArcLengthLUT } from "./ribbonMath";
import SlideText from "./SlideText";
import TemplateGridReveal from "./TemplateGridReveal";
import type { DesignTemplate } from "./types";
import { SeeMoreLink } from "./SeeMore";

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
  RightWord?: string;
  LeftWord?: string;
  /** Two-line tagline shown centered between the two slide texts. */
  tagline?: string[];
  sectionDes: string[];
  seeMore?: {
    label: string;
    href: string;
  };
  /** Where (0-1 of total scroll) the ribbon-exit / grid-enter sequence starts. */
  gridRevealStart?: number;
  /**
   * Fraction of the [gridRevealStart, 1] tail dedicated to the ribbon fading
   * out completely BEFORE the grid starts entering (and vice-versa on
   * reverse scroll). 0.35 = ribbon uses the first 35% of that tail to fully
   * disappear, then the grid uses the remaining 65% to fully appear.
   */
  ribbonExitFrac?: number;
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
  stageTiltDeg = -14,
  stagePitchDeg = 5,
  edgePadding = 3.5,
  scrollPerCard = 0.3,
  scrollLength = 7.5,
  fov = 35,
  cameraDistance = 10,
  pinTargetRef,
  RightWord,
  LeftWord,
  tagline,
  sectionDes,
  seeMore,
  gridRevealStart = 0.8,
  ribbonExitFrac = 0,
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [gridProgress, setGridProgress] = useState(0);

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

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
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

    const tailRange = 1 - gridRevealStart;
    const ribbonExitEnd = gridRevealStart + tailRange * ribbonExitFrac;

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: () => `+=${effectiveScrollLength * window.innerHeight}`,
      scrub: 1,
      pin: triggerEl,
      anticipatePin: 1,

      onUpdate: (self) => {
        shiftRef.current = gsap.utils.interpolate(
          shiftStart,
          shiftEnd,
          self.progress,
        );
        setScrollProgress(self.progress);

        const grid = clamp01(
          (self.progress - ribbonExitEnd) / (1 - ribbonExitEnd),
        );
        setGridProgress(grid);
      },
    });

    return () => {
      st.kill();
    };
  }, [
    templates.length,
    edgePadding,
    scrollPerCard,
    scrollLength,
    pinTargetRef,
    gridRevealStart,
    ribbonExitFrac,
    angleStep,
  ]);

  return (
    <section
      ref={localSectionRef}
      className="relative h-screen w-full"
      style={{ zIndex: 1 }}
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
          className="absolute left-[10%] bottom-[10%] -translate-x-1/2 text-left z-0 leading-3.5"
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
     {seeMore && <SeeMoreLink label={seeMore.label} href={seeMore.href} />}
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
        <TemplateGridReveal progress={gridProgress} />
        <ReadySignal onReady={onReady} />
      </Suspense>
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
