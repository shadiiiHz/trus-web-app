// 305×221, per design spec — that ratio (≈1.38:1) is preserved via aspect-ratio
// below, but the card itself is fluid width so it can fill its grid column
// (see TemplateGallery, whose 3 columns now stretch to the container's full
// width so the rightmost card's right edge lines up with the Navbar's Login
// button above it).
const CARD_ASPECT_RATIO = 305 / 221;

export interface TemplateGalleryCardProps {
  image: string;
  link: string;
  name: string;
  style: "Light" | "Dark";
  layoutLabel: string;
  categoryLabel: string;
}

/** Single result card in the templates gallery grid — fluid width, 305:221 aspect ratio, radius 8px. */
export default function TemplateGalleryCard({
  image,
  link,
  name,
  style,
  layoutLabel,
  categoryLabel,
}: TemplateGalleryCardProps) {
  const isDark = style === "Dark";

  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block">
      <div
        className="overflow-hidden bg-gallery-canvas"
        style={{ aspectRatio: CARD_ASPECT_RATIO, borderRadius: 8 }}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-hero text-body font-semibold text-gallery-ink">
          {name}
        </span>
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            isDark ? "bg-gallery-ink" : "bg-white"
          }`}
          style={isDark ? undefined : { border: "0.5px solid rgba(0, 0, 0, 1)" }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 font-body text-gallery-muted">
        <span className="text-body-sm font-semibold">{categoryLabel}</span>
        <span className="text-label font-normal">{layoutLabel}</span>
      </div>
    </a>
  );
}
