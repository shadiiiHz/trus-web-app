import { lazy, Suspense, useEffect, useState } from "react";
import { siteConfig } from "@/config/site.config";
import "@/styles/ServiceTreeLabel.css";

// Lazy-loaded: the artwork is a ~260KB Figma-exported SVG (dozens of
// <filter> blocks for the glow effects), so keeping it out of the main
// bundle and off the critical render path noticeably helps first load.
const TrusAiIllustration = lazy(() => import("./TrusAiIllustration"));

/**
 * Circuit-tree diagram for the Services page hero.
 *
 * The artwork itself (`/public/services/tree.svg`) is the exact graphic
 * supplied for this page — it's rendered as-is, not redrawn. This
 * component adds real clickable anchors (`#node-id`) at 9 of its branch
 * tips, labeled with the matching service name. The sections they'll
 * eventually scroll to don't exist yet, so clicks are inert until those
 * are built.
 *
 * Each node's label pill has an animated light travelling continuously
 * around its border (`.service-label-light` / `-glow` in globals.css).
 * The traveling-light animation *along the branch itself* (through
 * NODE_LAYOUT / branchLoopPath) is still not wired up — that geometry is
 * left in place so it's cheap to re-enable later.
 *
 * Node coordinates are pure layout (tied to this specific image's pixel
 * grid), not site text — only the translated `label` per id comes from
 * siteConfig (`servicesPage.hero.nodes`).
 */

type Side = "top" | "bottom" | "left" | "right" | "center";

interface Point {
  x: number;
  y: number;
}

interface NodeLayout {
  id: string;
  x: number;
  y: number;
  side: Side;
  /** Interior waypoint(s) the branch's real line passes through, traced
   *  against a high-resolution render of the artwork (not guessed) — most
   *  branches need one, the more S-curved ones need two. */
  mids: Point[];
}

// Native canvas of the supplied artwork — every coordinate below was
// measured directly against a render of that file at this exact size.
const VB_W = 932;
const VB_H = 640;
// The artwork's real SVG viewBox is 922x847 (see TrusAiIllustration), which
// isn't the same aspect ratio as this 932x640 frame — so the browser
// letterboxes it (uniform scale + horizontal offset) to fit, exactly like
// object-fit: contain. The branch-tip coordinates above were traced against
// an actual rendered screenshot, so they already include that letterbox and
// don't need adjusting. CENTER_X/CENTER_Y/CARD_HALF below weren't measured
// that way, though — they're the center card's own SVG rect (x=407.25
// y=248.8 w=174 h=170, see TrusAiIllustration) run through the same
// letterbox transform, so the anchor lines up with the visible card at
// every size instead of drifting off it as the tree shrinks:
//   scale = VB_H / 847 (height is always the constraining dimension, since
//     932/640 > 922/847)
//   offsetX = (VB_W - 922 * scale) / 2
const LETTERBOX_SCALE = VB_H / 847;
const LETTERBOX_OFFSET_X = (VB_W - 922 * LETTERBOX_SCALE) / 2;
const CENTER_X = LETTERBOX_OFFSET_X + 494.25 * LETTERBOX_SCALE;
const CENTER_Y = 333.8 * LETTERBOX_SCALE;
const CARD_HALF = 86 * LETTERBOX_SCALE;

// Thirteen service labels. `x`/`y` is each pill's center in this frame,
// mapped from the Figma frame (same artwork, so positions are relative to
// the center card).
const NODE_LAYOUT: NodeLayout[] = [
  { id: "seo", x: 388.3, y: 9.3, side: "center", mids: [] },
  { id: "growth-intelligence", x: 510.2, y: 41.8, side: "center", mids: [] },
  { id: "email-marketing", x: 265, y: 60.3, side: "center", mids: [] },
  { id: "social-media", x: 396.9, y: 100.1, side: "center", mids: [] },
  { id: "multilingual", x: 733.6, y: 57.7, side: "center", mids: [] },
  { id: "web-design", x: 624.9, y: 117.3, side: "center", mids: [] },
  { id: "youtube", x: 270.3, y: 204, side: "center", mids: [] },
  { id: "brand-identity", x: 673.3, y: 204, side: "center", mids: [] },
  { id: "auto-post", x: 778, y: 233, side: "center", mids: [] },
  { id: "telegram", x: 266.3, y: 342, side: "center", mids: [] },
  { id: "instagram", x: 298.8, y: 405, side: "center", mids: [] },
  { id: "x-content", x: 779, y: 361, side: "center", mids: [] },
  { id: "linkedin", x: 617.6, y: 460, side: "center", mids: [] },
];

/** Clamped, uniform Catmull-Rom through `pts`, as cubic-bezier segments (one per consecutive pair). */
function catmullRomSegments(
  pts: Point[],
): Array<{ c1: Point; c2: Point; p: Point }> {
  const segs: Array<{ c1: Point; c2: Point; p: Point }> = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    segs.push({
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p: p2,
    });
  }
  return segs;
}

const segsToPath = (segs: Array<{ c1: Point; c2: Point; p: Point }>) =>
  segs
    .map(
      (s) =>
        `C ${s.c1.x.toFixed(1)} ${s.c1.y.toFixed(1)} ${s.c2.x.toFixed(1)} ${s.c2.y.toFixed(1)} ${s.p.x.toFixed(1)} ${s.p.y.toFixed(1)}`,
    )
    .join(" ");

// The card is a rounded square, not a circle — a circular approximation
// undershoots/overshoots badly near the diagonals, which is exactly where
// most branches leave it. CARD_CORNER is the corner radius read off the
// artwork (screenshot px / 0.4767 ≈ vb units, same measurement as the
// branch waypoints below).
const CARD_CORNER = 20;

/** Point where a ray from the card's center at `angle` exits its rounded-square edge. */
function cardEdgePoint(angle: number, inset = 1): Point {
  const s = CARD_HALF - inset;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const flatT = Math.min(s / Math.abs(ux || 1e-6), s / Math.abs(uy || 1e-6));
  const flatX = ux * flatT;
  const flatY = uy * flatT;

  // Flat-edge hit (not in a rounded-corner zone) — use it directly.
  if (
    Math.abs(flatX) <= s - CARD_CORNER + 0.01 ||
    Math.abs(flatY) <= s - CARD_CORNER + 0.01
  ) {
    return { x: CENTER_X + flatX, y: CENTER_Y + flatY };
  }

  // Otherwise the ray exits through a rounded corner — intersect with that
  // corner's circle (radius CARD_CORNER, centered inset from the corner).
  const cx = Math.sign(ux) * (s - CARD_CORNER);
  const cy = Math.sign(uy) * (s - CARD_CORNER);
  const b = ux * cx + uy * cy;
  const c = cx * cx + cy * cy - CARD_CORNER * CARD_CORNER;
  const t = b + Math.sqrt(Math.max(0, b * b - c));
  return { x: CENTER_X + ux * t, y: CENTER_Y + uy * t };
}

/**
 * Builds the full traveling-light path for one branch: a short glide along
 * the card's border, then out along the branch's real curve (through its
 * traced waypoint) to the tip, then back the exact same way, then back
 * along the border arc to the start — a closed loop, so the light both
 * "rides the line" precisely and visibly circles part of the box each
 * cycle instead of jump-resetting.
 */
function branchLoopPath(node: NodeLayout) {
  const angle = Math.atan2(node.y - CENTER_Y, node.x - CENTER_X);
  const arcStart = cardEdgePoint(angle - 0.32);
  const branchStart = cardEdgePoint(angle);
  const tip: Point = { x: node.x, y: node.y };
  const points = [arcStart, branchStart, ...node.mids, tip];

  const out = segsToPath(catmullRomSegments(points));
  const back = segsToPath(catmullRomSegments([...points].reverse()));

  const d = `M ${arcStart.x.toFixed(1)} ${arcStart.y.toFixed(1)} ${out} ${back}`;
  return { d, labelAnchor: branchStart };
}

// Mobile layout — label centers as a percent of the artwork's own 922×847 box.
const MOBILE_VB_W = 922;
const MOBILE_VB_H = 847;
const MOBILE_LABELS: ReadonlyArray<{ id: string; x: number; y: number }> = [
  { id: "seo", x: 36.4, y: -0.2 },
  { id: "growth-intelligence", x: 59.3, y: 5.7 },
  { id: "email-marketing", x: 22, y: 7 },
  { id: "social-media", x: 49.7, y: 16.6 },
  { id: "multilingual", x: 76, y: 24.5 },
  { id: "web-design", x: 88.5, y: 9.2 },
  { id: "youtube", x: 23.6, y: 23 },
  { id: "brand-identity", x: 87.5, y: 37 },
  { id: "auto-post", x: 80.5, y: 52.4 },
  { id: "telegram", x: 22, y: 49.4 },
  { id: "instagram", x: 31, y: 64.9 },
  { id: "x-content", x: 82.9, y: 65.8 },
  { id: "linkedin", x: 73.9, y: 72.9 },
];

const pct = (x: number, y: number) => ({
  left: `${(x / VB_W) * 100}%`,
  top: `${(y / VB_H) * 100}%`,
});

const sideTransform: Record<Side, string> = {
  top: "translate(-50%, calc(-100% - 2px))",
  bottom: "translate(-50%, 2px)",
  left: "translate(calc(-100% - 2px), -50%)",
  right: "translate(2px, -50%)",
  center: "translate(-50%, -50%)",
};

export function ServiceGrowthTree() {
  const nodes = siteConfig.servicesPage.hero.nodes as ReadonlyArray<{
    id: string;
    label: string;
  }>;
  const nodesById = new Map(nodes.map((n) => [n.id, n]));

  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const branches = NODE_LAYOUT.map((layout) => ({
    layout,
    label: nodesById.get(layout.id)?.label ?? layout.id,
    ...branchLoopPath(layout),
  }));

  const handleAnchorClick = (targetId: string) => (e: React.MouseEvent) => {
    if (document.getElementById(targetId)) {
      e.preventDefault();
      // ServicesListSection owns the actual scroll — it opens the row
      // first (which changes its height as the thumbnail animates in)
      // and only then scrolls, once that layout has settled.
      window.dispatchEvent(
        new CustomEvent("trus:activate-service", { detail: targetId }),
      );
    }
  };

  if (!isDesktop) {
    // Mobile / tablet — the artwork at its native 922×847 aspect, with the
    // label pills pinned to hand-placed spots (percent of the artwork box,
    // read off the Figma mobile frame). Instagram Autopilot has no spot in
    // that design, so it's omitted here; it stays reachable in the list.
    return (
      <div className="-mx-5 overflow-hidden">
        {/* Mobile frame: 350×400. The artwork is a touch wider than the frame
            (slightly cropped) so the labels keep a gutter on both sides; the
            pills scale with it. */}
        <div className="relative mx-auto overflow-hidden" style={{ width: 350, height: 400 }}>
        {/* Artwork layer: zoomed past the frame (branches get cropped, as in
            Figma) around the same card-center point the labels are laid out on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{ left: -56.5, top: 4.1, width: 432, height: 397 }}
        >
          <Suspense fallback={null}>
            <TrusAiIllustration
              className="absolute inset-0 h-full w-full"
              style={{ objectFit: "contain" }}
            />
          </Suspense>
        </div>
        <div
          className="absolute select-none"
          style={{
            left: "calc(50% - 62.2%)",
            top: "50%",
            width: "116%",
            transform: "translateY(-50%)",
            aspectRatio: `${MOBILE_VB_W} / ${MOBILE_VB_H}`,
            containerType: "inline-size",
          }}
          aria-label="TruS growth services map"
        >
          {MOBILE_LABELS.map((m) => (
            <a
              key={m.id}
              href={`#${m.id}`}
              onClick={handleAnchorClick(m.id)}
              className="service-label absolute whitespace-nowrap rounded-md bg-white font-body font-semibold text-gallery-text shadow-sm"
              style={{
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: "2.2cqw",
                lineHeight: 1.3,
                padding: "0.4em 0.65em",
                borderRadius: "6px",
              }}
            >
              <div aria-hidden="true" className="service-label-border">
                <span className="service-label-sweep" />
                <span className="service-label-border-mask" />
              </div>
              <span className="relative z-10">
                {nodesById.get(m.id)?.label ?? m.id}
              </span>
            </a>
          ))}
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="relative ml-auto w-full select-none"
        style={{ maxWidth: VB_W, aspectRatio: `${VB_W} / ${VB_H}`, containerType: "inline-size" }}
        aria-label="TruS growth services map"
      >
        <Suspense fallback={null}>
          <TrusAiIllustration
            className="absolute inset-0 h-full w-full"
            style={{ objectFit: "contain" }}
          />
        </Suspense>

        {branches.map((b) => (
            <a
              key={b.layout.id}
              href={`#${b.layout.id}`}
              onClick={handleAnchorClick(b.layout.id)}
              className="service-label hover:text-brand-accent absolute whitespace-nowrap rounded-[10.19px] bg-white font-body font-semibold text-gallery-text shadow-sm"
              style={{
                ...pct(b.layout.x, b.layout.y),
                transform: sideTransform[b.layout.side],
                fontSize: "1.2876cqw",
                padding: "0.333em 0.583em",
                borderRadius: "8px",
              }}
            >
              <div aria-hidden="true" className="service-label-border">
                <span className="service-label-sweep" />
                <span className="service-label-border-mask" />
              </div>

              <span className="relative z-10">{b.label}</span>
            </a>
          ))}
      </div>

    </div>
  );
}

export default ServiceGrowthTree;
