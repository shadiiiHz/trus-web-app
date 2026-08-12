// 305×221, per design spec — the ratio a card's preview keeps at any width
// now that it fills its grid column instead of using these as literal px.
const CARD_ASPECT_RATIO = 305 / 221;

export interface TemplateGalleryCardProps {
  image: string;
  link: string;
  name: string;
  style: "Light" | "Dark";
  layoutLabel: string;
  categoryLabel: string;
}

/** Single result card in the templates gallery grid — fills its grid column, radius 8px, per design spec. */
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
