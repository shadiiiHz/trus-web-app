const CARD_WIDTH = 305;
const CARD_HEIGHT = 221;

export interface TemplateGalleryCardProps {
  image: string;
  link: string;
  name: string;
  style: "Light" | "Dark";
  layoutLabel: string;
  categoryLabel: string;
}

/** Single result card in the templates gallery grid — fixed 305×221 preview, radius 8px, per design spec. */
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
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      style={{ width: CARD_WIDTH }}
    >
      <div
        className="overflow-hidden bg-gallery-canvas"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 8 }}
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
        />
      </div>

      <div className="mt-1 flex items-center justify-between gap-2 font-body text-gallery-muted">
        <span className="text-body-sm font-semibold">{categoryLabel}</span>
        <span className="text-label font-normal">{layoutLabel}</span>
      </div>
    </a>
  );
}
