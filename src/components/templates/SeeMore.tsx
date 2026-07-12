export function SeeMoreLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      className="group absolute text-label text-[#434343] flex items-center justify-center gap-2 right-0 bottom-[10%] -translate-x-1/2 text-left z-50 leading-3.5 uppercase underline decoration-[#434343] underline-offset-6 decoration-0"
      style={{ zIndex: 2 }}
    >
      <span className="inline-flex">
        {label}
      </span>
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1"
        aria-hidden="true"
      >
        <path
          d="M1 8H15M15 8L9 2M15 8L9 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}