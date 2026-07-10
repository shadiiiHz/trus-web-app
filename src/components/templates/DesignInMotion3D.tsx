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
  ribbonVisibilityPadding?: number;
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
  scrollPerCard = 0.55,
  scrollLength = 10,
  fov = 35,
  cameraDistance = 10,
  pinTargetRef,
  RightWord,
  LeftWord,
  ribbonVisibilityPadding = -30,
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

    const bufferPad = 12;

    const shiftStart = -edgePadding - bufferPad;
    const shiftEnd = total - 1 + edgePadding + bufferPad;

    shiftRef.current = shiftStart;
    displayShiftRef.current = shiftStart;

    const totalShiftRange = shiftEnd - shiftStart;
    const computedScrollLength = totalShiftRange * scrollPerCard;
    const effectiveScrollLength = scrollLength ?? computedScrollLength;

    const ribbonStartFrac = ribbonVisibilityPadding / totalShiftRange;
    const ribbonEndFrac = 1 - ribbonVisibilityPadding / totalShiftRange;

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

        const ribbonProgress = clamp01(
          (self.progress - ribbonStartFrac) / (ribbonEndFrac - ribbonStartFrac),
        );
        setScrollProgress(ribbonProgress);

        const grid = clamp01((self.progress - ribbonExitEnd) / (1 - ribbonExitEnd));
        setGridProgress(grid);
      },
    });

    return () => {
      st.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        className="top-[27%]"
      >
        <h2 className="text-[120px] font-bold uppercase text-[#AAAAAA]">
          {RightWord}
        </h2>
      </SlideText>

      <SlideText
        ref={templatesRef}
        direction="left"
        progress={scrollProgress}
        className="top-[50%]"
      >
        <h2 className="text-[120px] font-bold uppercase text-[#AAAAAA]">
          {LeftWord}
        </h2>
      </SlideText>

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
