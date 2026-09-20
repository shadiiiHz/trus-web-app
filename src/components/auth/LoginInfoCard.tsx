import Graphic from "/auth/T_shape.svg";
export interface LoginInfoCardProps {
  tagline: string;
  cta: string;
  office: string;
  phone: string;
  email: string;
  officeLabel: string;
  phoneLabel: string;
  emailLabel: string;
  /** Card height in px — pages with a taller form (e.g. register) pass a bigger value. Defaults to the login page's 594px. */
  height?: number;
}

/**
 * Left-side panel on the login page. Built from scratch (not the shared
 * ContactInfoCard) so this page's card can stay static — no scroll-lit
 * border, no background video — while matching the same look.
 *
 * Border is a 1px linear gradient stroke per Figma spec: from the
 * top-right corner (black, alpha 1) through a near-transparent midpoint
 * (alpha 0.05) to the bottom-left corner (black, alpha 0.5). Implemented
 * with the mask-composite "gradient border" trick so the gradient only
 * paints the 1px ring, not the whole card background.
 */
export function LoginInfoCard({
  tagline,
  cta,
  office,
  phone,
  email,
  officeLabel,
  phoneLabel,
  emailLabel,
  height = 594,
}: LoginInfoCardProps) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <div
      className="relative flex h-full flex-col rounded-2xl bg-[#FAFAFB] p-7"
      style={{ minHeight: `${height}px`, height: `${height}px` }}
    >
      {/* Gradient border ring — Figma spec: linear gradient, top-right
          corner to bottom-left corner, stops rgba(0,0,0,1) → rgba(0,0,0,0.05)
          → rgba(0,0,0,0.5) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          padding: "1px",
          background:
            "linear-gradient(30deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.6) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <p className="text-[22px] leading-none text-[#707075]">{tagline}</p>

      <a
        href={telHref}
        className="group mt-5 inline-flex items-center gap-2.5 self-start"
      >
        <span className="font-hero text-body font-bold text-[#070606]">
          {cta}
        </span>
      </a>

      {/*
        Intentionally left blank — the user drops their own graphic in here.
        Positioned absolutely so it can be nudged freely; adjust
        top/left/right/bottom/transform below to place it.
      */}
      <img
        src={Graphic}
        alt=""
        className="pointer-events-none absolute max-h-[60%] max-w-[80%] object-contain"
        style={{
          mixBlendMode: "difference",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="flex flex-1 flex-col justify-end gap-5">
        <div>
          <p className="mb-1.5 text-[14px] leading-none text-[#707075]">
            {officeLabel}
          </p>
          <p className="text-[14px] leading-tight text-[#070606]">{office}</p>
        </div>
        <div>
          <p className="mb-1 text-[14px] leading-[19px] text-[#707075]">
            {phoneLabel}
          </p>
          <p className="text-[14px] leading-[19px] text-[#070606]">{phone}</p>
        </div>
        <div>
          <p className="mb-1.5 text-[14px] leading-none text-[#707075]">
            {emailLabel}
          </p>
          <p className="text-[14px] leading-[19px] text-[#070606]">{email}</p>
        </div>
      </div>
    </div>
  );
}

export default LoginInfoCard;
