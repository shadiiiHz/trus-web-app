// Shared tuning knobs, role maps and easing helpers for TemplateGridReveal.
// Centralized here so every value that affects the reveal's feel lives in
// one place instead of being scattered across the hooks that consume it.

export type CardRole = "corner" | "middle";

// Roles for a 2-row x 3-col (6 card) grid:
//   0(corner) 1(middle) 2(corner)
//   3(corner) 4(middle) 5(corner)
export const ROLE_MAP: CardRole[] = [
  "corner", // 0 top-left
  "middle", // 1 top-middle
  "corner", // 2 top-right
  "corner", // 3 bottom-left
  "middle", // 4 bottom-middle
  "corner", // 5 bottom-right
];

export const CORNER_DIR: Record<number, { x: 1 | -1; y: 1 | -1 }> = {
  0: { x: -1, y: -1 }, // top-left
  2: { x: 1, y: -1 }, // top-right
  3: { x: -1, y: 1 }, // bottom-left
  5: { x: 1, y: 1 }, // bottom-right
};

// Top-middle (1) drops in from above. Bottom-middle (4) is not listed
// here, so it falls through to the "from below" default in
// getFromVars — which is what we want for a card sitting in the
// bottom row.
export const MIDDLE_FROM_ABOVE = new Set<number>([1]);

// No more left/right "middle-row" cards now that the grid is 2 rows
// instead of 3 — every "middle" card comes from directly above/below,
// never from the side. Kept as an empty map (rather than deleting the
// mechanism) in case a future layout reintroduces side-entry cards.
export const MIDDLE_SIDE: Record<number, 1 | -1> = {};

// ---------------------------------------------------------------------
// TUNING KNOBS
// ---------------------------------------------------------------------

// Smaller => each card's own transition takes up MORE of `progress`
// (span = 1 - STAGGER_WINDOW), which reads as slower / heavier.
// Bigger  => cards are more spread apart from each other, but each one
// individually settles faster.
export const STAGGER_WINDOW = 0.1; // was 0.18 — cards now take ~0.9 of progress to settle

// Softer, more "weighted" curve: slow start, slow finish.
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Flutter (the wind-blown wobble while a card is still settling). Bigger
// amplitude/frequency + a second harmonic layered on top makes it read
// like paper/cloth catching a breeze instead of a mechanical jitter.
export const FLUTTER_ROT_Y = 26;
export const FLUTTER_ROT_X = 16;
export const FLUTTER_ROT_Z = 9;
export const FLUTTER_SKEW_X = 7;
export const FLUTTER_SKEW_Y = 4.5;
export const FLUTTER_POS_X = 20;
export const FLUTTER_POS_Y = 13;
export const FLUTTER_SCALE_WOBBLE = 0.07; // was 0.03 baked inline below
export const FLUTTER_SPEED = 0.6; // was 0.4 — livelier, more visible wind speed
export const UNSETTLE_POWER = 1.15; // was 2.2 — flutter stays visible longer as the card settles
// Weight of the second, higher-frequency harmonic relative to the main
// wave (0 = pure single sine, 1 = equally strong second wave).
export const HARMONIC_MIX = 0.45;

// Tabs bar: fades in on its own, later and slower schedule than the cards.
// It only starts appearing once the cards are mostly done settling.
export const TABS_FADE_START = 0.72; // was 0.55
export const TABS_FADE_END = 0.85; // was 0.95

// Hover reaction: how much a card scales up when hovered, and how quickly
// that reaction eases in and out (0-1 per frame, higher = snappier).
export const HOVER_SCALE_BOOST = 0.04;
export const HOVER_EASE_SPEED = 0.12;

// How the grid fades/scales out and back in when the user switches
// category tabs. Duration is in ms and must match the CSS transition
// duration used on the grid wrapper in TemplateGridReveal.
export const CATEGORY_SWITCH_DURATION = 260;

// Safety cap: if a category's images take unusually long to load (slow
// network, huge file), don't leave the grid hidden forever — reveal it
// anyway after this many ms even if preloading hasn't resolved yet.
export const PRELOAD_TIMEOUT_MS = 2500;

// How much lag/inertia the incoming `progress` prop gets before driving
// any animation. Lower = heavier/laggier and smoother, higher = snappier
// and closer to a 1:1 scroll response.
export const PROGRESS_SMOOTHING_RATE = 8;

export const POINTER_ENABLE_PROGRESS = 0.85;

export const WIND_SEED = [0.13, 0.71, 0.42, 0.95, 0.24, 0.63, 0.08, 0.86, 0.37];
