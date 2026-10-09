/** Props shape lucide-react icons accept — matched here so custom SVGs are drop-in compatible. */
export interface IconProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: React.CSSProperties;
}

/** Custom "all" icon (grid: top bar + two lower panels), not available in lucide-react. */
export function AllIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M2.93103 1.5H21.069C21.5834 1.5 22 1.91664 22 2.43103V5.91377C22 6.42815 21.5834 6.8448 21.069 6.8448H2.93103C2.41665 6.8448 2 6.42815 2 5.91377V2.43103C2 1.91664 2.41665 1.5 2.93103 1.5Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M2.96212 9.77593H6.93453C7.1898 9.77593 7.43419 9.87757 7.61497 10.0576C7.79497 10.2384 7.89661 10.4827 7.89661 10.738V21.5379C7.89661 21.7932 7.79497 22.0376 7.61497 22.2184C7.43418 22.3984 7.1898 22.5 6.93453 22.5H2.96212C2.70685 22.5 2.46246 22.3984 2.28168 22.2184C2.10168 22.0376 2.00004 21.7932 2.00004 21.5379V10.738C2.00004 10.2065 2.43065 9.77593 2.96212 9.77593Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M12.1621 9.77593H20.9759C21.5415 9.77593 22 10.2344 22 10.8V21.4758C22 22.0414 21.5415 22.5 20.9759 22.5H12.1621C11.5965 22.5 11.138 22.0414 11.138 21.4758V10.8C11.138 10.2345 11.5965 9.77593 12.1621 9.77593Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

/** Custom restaurant icon (fork + knife), not available in lucide-react. */
export function RestaurantIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M3 1.99927V8.99983C3 10.0999 3.9 11 5 11H9C9.53043 11 10.0391 10.7893 10.4142 10.4142C10.7893 10.0391 11 9.5303 11 8.99983V1.99927M7 1.99927V22.0009M21 15.0003V1.99927C19.6739 1.99927 18.4021 2.52609 17.4645 3.46385C16.5268 4.40161 16 5.67348 16 6.99967V13.0001C16 14.1002 16.9 15.0003 18 15.0003H21ZM21 15.0003V22.0009"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Custom clinic icon (house + plus), not available in lucide-react. */
export function ClinicIcon({ size = 24, strokeWidth = 2, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        d="M3.18579 9.15746C3.06333 9.42137 2.99993 9.70882 3 9.99975V18.9997C3 19.5302 3.21071 20.0389 3.58579 20.414C3.96086 20.789 4.46957 20.9997 5 20.9997H19C19.5304 20.9997 20.0391 20.789 20.4142 20.414C20.7893 20.0389 21 19.5302 21 18.9997V9.99975C21.0001 9.70882 20.9367 9.42137 20.8142 9.15746C20.6918 8.89356 20.5132 8.65954 20.291 8.47175L13.291 2.47175C12.93 2.16666 12.4726 1.99927 12 1.99927C11.5274 1.99927 11.07 2.16666 10.709 2.47175L3.709 8.47175C3.4868 8.65954 3.30824 8.89356 3.18579 9.15746Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path d="M9 12H15M12 9V15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

/** Custom lawyers icon (balance scales), filled glyph — `strokeWidth` is ignored. */
export function LawyersIcon({ size = 24, color = "#111827", style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.5773 13.0062H16.7069L19.1449 6.52819L21.5773 13.0062ZM19.1449 16.6122C17.8816 16.6122 16.8067 15.7581 16.4687 14.5919H21.8156C21.4776 15.7581 20.4082 16.6122 19.1449 16.6122ZM4.85511 16.6122C3.59179 16.6122 2.52242 15.7581 2.17888 14.5919H7.53132C7.1878 15.7581 6.11841 16.6122 4.85511 16.6122ZM4.85511 6.52706L7.28753 13.0062H2.42267L4.85511 6.52706ZM4.12373 4.01125L0.549893 13.5174C0.516638 13.6047 0.5 13.6998 0.5 13.7988C0.5 16.2234 2.45039 18.1973 4.85511 18.1973C7.25982 18.1973 9.2102 16.2234 9.2102 13.7988C9.2102 13.6998 9.19358 13.6047 9.16034 13.5174L5.99098 5.08569H11.216V18.9149H9.18802C8.75033 18.9149 8.40124 19.2695 8.40124 19.7074C8.40124 20.1454 8.75033 20.5 9.18802 20.5H14.812C15.2442 20.5 15.5988 20.1454 15.5988 19.7074C15.5988 19.2695 15.2442 18.9149 14.812 18.9149H12.784V5.08569H18.0035L14.8397 13.5174C14.8064 13.6047 14.7843 13.6998 14.7843 13.7988C14.7843 16.2234 16.7402 18.1973 19.1449 18.1973C21.5441 18.1973 23.5 16.2234 23.5 13.7988C23.5 13.6998 23.4834 13.6047 23.4501 13.5174L19.8763 4.01125C19.7599 3.70305 19.4718 3.5 19.1449 3.5H4.85511C4.52821 3.5 4.23452 3.70305 4.12373 4.01125Z"
        fill={color}
      />
    </svg>
  );
}
