import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site.config";

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
 * The traveling-light animation along each branch is temporarily removed
 * (per request) — the traced branch geometry (NODE_LAYOUT, branchLoopPath,
 * etc.) is left in place so it's cheap to re-enable later; only the SVG
 * overlay that rendered/animated it is gone.
 *
 * Node coordinates are pure layout (tied to this specific image's pixel
 * grid), not site text — only the translated `label` per id comes from
 * siteConfig (`servicesPage.hero.nodes`).
 */

type Side = "top" | "bottom" | "left" | "right";

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

const TREE_SRC = "/services/tree.svg";

// Native canvas of the supplied artwork — every coordinate below was
// measured directly against a render of that file at this exact size.
const VB_W = 932;
const VB_H = 817;
const CENTER_X = 510;
const CENTER_Y = 408;
const CARD_HALF = 85;

// Nine branch tips + one interior waypoint each, both traced against a
// 2.5x-scaled render of the actual artwork (screenshot px / 0.4767 ≈ vb
// units) so the curve hugs the real drawn line instead of approximating it.
const NODE_LAYOUT: NodeLayout[] = [
  { id: "website-design", x: 523, y: 140, side: "top", mids: [{ x: 525, y: 230 }] },
  {
    id: "landing-page-builder",
    x: 350,
    y: 140,
    side: "left",
    mids: [
      { x: 377, y: 305 },
      { x: 334, y: 229 },
    ],
  },
  {
    id: "instagram-autopilot",
    x: 270,
    y: 268,
    side: "left",
    mids: [
      { x: 377, y: 334 },
      { x: 310, y: 291 },
    ],
  },
  { id: "lead-finder", x: 625, y: 230, side: "right", mids: [{ x: 593, y: 288 }] },
  { id: "smart-newsletter", x: 800, y: 380, side: "right", mids: [{ x: 691, y: 379 }] },
  { id: "followup", x: 160, y: 530, side: "left", mids: [{ x: 238, y: 520 }] },
  { id: "content-studio", x: 800, y: 555, side: "right", mids: [{ x: 739, y: 510 }] },
  { id: "linkedin-autopilot", x: 253, y: 620, side: "left", mids: [{ x: 310, y: 548 }] },
  { id: "lead-generation", x: 690, y: 664, side: "bottom", mids: [{ x: 634, y: 596 }] },
];

/** Clamped, uniform Catmull-Rom through `pts`, as cubic-bezier segments (one per consecutive pair). */
function catmullRomSegments(pts: Point[]): Array<{ c1: Point; c2: Point; p: Point }> {
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
    .map((s) => `C ${s.c1.x.toFixed(1)} ${s.c1.y.toFixed(1)} ${s.c2.x.toFixed(1)} ${s.c2.y.toFixed(1)} ${s.p.x.toFixed(1)} ${s.p.y.toFixed(1)}`)
    .join(" ");

// ServicesListSection's row ids don't perfectly mirror the tree's branch
// ids — it drops "followup" in favor of a closing "growth-ai" entry. Map
// branch ids with no matching row onto the row they should open instead.
const ANCHOR_TARGET_OVERRIDES: Record<string, string> = {
  followup: "growth-ai",
};

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
  if (Math.abs(flatX) <= s - CARD_CORNER + 0.01 || Math.abs(flatY) <= s - CARD_CORNER + 0.01) {
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

const pct = (x: number, y: number) => ({ left: `${(x / VB_W) * 100}%`, top: `${(y / VB_H) * 100}%` });

const sideTransform: Record<Side, string> = {
  top: "translate(-50%, calc(-100% - 2px))",
  bottom: "translate(-50%, 2px)",
  left: "translate(calc(-100% - 2px), -50%)",
  right: "translate(2px, -50%)",
};

export function ServiceGrowthTree() {
  const nodes = siteConfig.servicesPage.hero.nodes as ReadonlyArray<{ id: string; label: string }>;
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

  const handleAnchorClick = (id: string) => (e: React.MouseEvent) => {
    // The services list below has no "FollowUp" row (it swaps that slot
    // for a closing "Growth AI" entry) — route that one branch to Growth
    // AI instead of doing nothing.
    const targetId = ANCHOR_TARGET_OVERRIDES[id] ?? id;
    if (document.getElementById(targetId)) {
      e.preventDefault();
      // ServicesListSection owns the actual scroll — it opens the row
      // first (which changes its height as the thumbnail animates in)
      // and only then scrolls, once that layout has settled.
      window.dispatchEvent(new CustomEvent("trus:activate-service", { detail: targetId }));
    }
  };

  return (
    <div className="w-full">
      <div
        className="relative ml-auto w-full select-none"
        style={{ maxWidth: VB_W, aspectRatio: `${VB_W} / ${VB_H}` }}
        aria-label="TruS growth services map"
      >
        <img
          src={TREE_SRC}
          alt="TruS Growth AI — connected services"
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "contain" }}
          draggable={false}
        />

        {isDesktop &&
          branches.map((b) => (
            <a
              key={b.layout.id}
              href={`#${ANCHOR_TARGET_OVERRIDES[b.layout.id] ?? b.layout.id}`}
              onClick={handleAnchorClick(b.layout.id)}
              className="absolute whitespace-nowrap rounded-[10.19px] border-[1.02px] bg-white font-body font-semibold text-gallery-text shadow-sm transition-colors duration-200 border-[#C098F2] hover:text-brand-accent hover:shadow-md"
              style={{
                ...pct(b.layout.x, b.layout.y),
                transform: sideTransform[b.layout.side],
                fontSize: "14.26px",
                padding: "5px 8px",
              }}
            >
              {b.label}
            </a>
          ))}
      </div>

      {/* Mobile/tablet fallback — the radial pill overlay above only fits
          comfortably at desktop widths; below that, list the same 9
          anchors as a plain wrapping row so nothing spills off-screen. */}
      {!isDesktop && (
        <div className="mt-6 flex flex-wrap justify-center gap-2.5 px-2">
          {branches.map((b) => (
            <a
              key={b.layout.id}
              href={`#${ANCHOR_TARGET_OVERRIDES[b.layout.id] ?? b.layout.id}`}
              onClick={handleAnchorClick(b.layout.id)}
              className="whitespace-nowrap rounded-[10.19px] border bg-white px-3.5 py-2 font-body text-body-sm font-medium text-gallery-text shadow-sm transition-colors duration-200 hover:border-brand-accent hover:text-brand-accent"
              style={{ borderColor: "rgba(135,93,217,0.35)" }}
            >
              {b.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceGrowthTree;
