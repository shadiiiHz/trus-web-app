interface RevealGridCardProps {
  image: string;
  name: string;
  cardRef: (el: HTMLDivElement | null) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/** Single card in the TemplateGridReveal grid — purely presentational, all motion is applied imperatively via `cardRef` by useCardRevealAnimation. */
export default function RevealGridCard({
  image,
  name,
  cardRef,
  onHoverStart,
  onHoverEnd,
}: RevealGridCardProps) {
  return (
    <div
      ref={cardRef}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className="group relative overflow-hidden aspect-210/120 rounded-2xl bg-[#111] shadow-xl will-change-transform"
      style={{ transformStyle: "preserve-3d" }}
    >
      <img
        loading="lazy"
        decoding="async"
        src={image}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
