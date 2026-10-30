/** Alpha profile of the purple haze behind dark service sections, sampled from the Figma frames: `[alpha, % of the box]`. */
type Stops = readonly (readonly [number, number])[];

const fade = (stops: Stops) => stops.map(([alpha, at]) => `rgba(0,0,0,${alpha}) ${at}%`).join(", ");

/** Flat core, soft edges: the same across the full section width for every haze. */
const HAZE_X: Stops = [[0, 0], [0.17, 7], [0.44, 14], [0.78, 21], [0.95, 28], [1, 35], [1, 65], [0.95, 72], [0.78, 79], [0.44, 86], [0.17, 93], [0, 100]];

/** `mask-image` for a haze box that fades by `y` vertically and by `HAZE_X` horizontally (use with `maskComposite: "intersect"`). */
export const hazeMask = (y: Stops) => `linear-gradient(to bottom, ${fade(y)}), linear-gradient(to right, ${fade(HAZE_X)})`;

export const HAZE_STYLE = {
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;
