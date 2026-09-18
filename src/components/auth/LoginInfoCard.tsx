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
}

/**
 * Left-side panel on the login page. Built from scratch (not the shared
 * ContactInfoCard) so this page's card can stay static — no scroll-lit
 * border, no background video — while matching the same look.
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
}: LoginInfoCardProps) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <div
      className="relative flex h-full flex-col rounded-2xl border border-[#E4E1EE] bg-[#FAFAFB] p-7"
      style={{ minHeight: "594px" }}
    >
      <p className="text-[22px] leading-none text-[#707075]">{tagline}</p>

      <a
        href={telHref}
        className="group mt-5 inline-flex items-center gap-2.5 self-start"
      >
        <span className="font-hero text-[16px] font-bold text-[#070606]">
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
