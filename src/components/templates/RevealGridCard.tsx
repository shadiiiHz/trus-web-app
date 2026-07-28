interface RevealGridCardProps {
  image: string;
  /** Live site to open in a new tab on click. Empty/undefined = not clickable. */
  link?: string;
  cardRef: (el: HTMLDivElement | null) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/** Single card in the TemplateGridReveal grid — purely presentational, all motion is applied imperatively via `cardRef` by useCardRevealAnimation. */
export default function RevealGridCard({
  image,
  link,
  cardRef,
  onHoverStart,
  onHoverEnd,
}: RevealGridCardProps) {
  return (
    <div
      ref={cardRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={
        link ? () => window.open(link, "_blank", "noopener,noreferrer") : undefined
      }
      className="group relative overflow-hidden w-full h-full rounded-2xl bg-[#111] shadow-xl will-change-transform"
      style={{ transformStyle: "preserve-3d", cursor: link ? "pointer" : undefined }}
    >
      <img
        loading="lazy"
        decoding="async"
        src={image}
        alt="Template preview"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
