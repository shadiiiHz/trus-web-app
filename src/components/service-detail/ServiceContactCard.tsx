import Graphic from "/auth/T_shape.svg";

interface ServiceContactCardProps {
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
 * Service-page contact info card (Figma): 414×484 on desktop (rows pinned to the
 * bottom), 350×302 stacked on mobile. Same gradient hairline border and
 * blended "T" graphic as the auth pages' card.
 */
export function ServiceContactCard({
  tagline,
  cta,
  office,
  phone,
  email,
  officeLabel,
  phoneLabel,
  emailLabel,
}: ServiceContactCardProps) {
  const telHref = `tel:${phone.replace(/\s+/g, "")}`;

  return (
    <div
      className="relative flex flex-col gap-5 rounded-2xl p-6 lg:h-[484px] lg:w-[414px] lg:shrink-0 lg:justify-between lg:gap-[103px]"
      style={{ background: "rgba(255, 255, 255, 0.2)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          padding: "1px",
          background: "linear-gradient(30deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.6) 100%)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <div className="z-0 flex flex-col gap-5">
        <p className="font-body text-[22px] leading-[27px] text-[#707075]">{tagline}</p>
        <a href={telHref} className="flex h-6 items-center gap-2 self-start">
          <span className="font-body text-[16px] font-bold leading-[19px] text-[#070606]">{cta}</span>
          <span className="flex size-6 items-center justify-center rounded-full border border-[#070606]">
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none" aria-hidden>
              <path d="M0.5 4.6H10M6.5 1L10 4.6L6.5 8.2" stroke="#070606" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>

      <img
        src={Graphic}
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] max-h-[60%] max-w-[80%] -translate-x-1/2 -translate-y-1/2 object-contain"
        style={{ mixBlendMode: "difference" }}
      />

      <div className="z-[1] flex flex-col gap-5 font-body text-[14px]">
        <div className="flex flex-col gap-[5px]">
          <p className="leading-[17px] text-[#707075]">{officeLabel}</p>
          <p className="leading-[19px] text-[#070606]">{office}</p>
        </div>
        <div className="flex flex-col gap-[3px]">
          <p className="leading-[17px] text-[#707075]">{phoneLabel}</p>
          <p className="leading-[19px] text-[#070606]">{phone}</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="leading-[17px] text-[#707075]">{emailLabel}</p>
          <p className="leading-[19px] text-[#070606]">{email}</p>
        </div>
      </div>
    </div>
  );
}

export default ServiceContactCard;
