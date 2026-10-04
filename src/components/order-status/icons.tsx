import { useId } from "react";

export function SuccessIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="#F5F3FF" />
      <path d="M32 18L21 29L16 24" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmailNoticeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M20.1668 6.41714L11.9244 11.6664C11.6447 11.8288 11.327 11.9144 11.0036 11.9144C10.6801 11.9144 10.3624 11.8288 10.0827 11.6664L1.83203 6.41714M3.66551 3.66742H18.3334C19.346 3.66742 20.1668 4.48815 20.1668 5.50057V16.4995C20.1668 17.5119 19.346 18.3326 18.3334 18.3326H3.66551C2.65291 18.3326 1.83203 17.5119 1.83203 16.4995V5.50057C1.83203 4.48815 2.65291 3.66742 3.66551 3.66742Z"
        stroke="#5B2BB9"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OrderReceivedIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#F4F0FC" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F4F0FC" />
      <path d="M21.3336 12L14.001 19.3328L10.668 15.9997" stroke="#5B2BB9" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function CreatingServiceIcon() {
  const clipId = useId();
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" fill="#F4F0FC" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="15.5" stroke="#F4F0FC" />
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M15.9992 9.33282V11.9997M18.7996 13.2001L20.7331 11.2666M19.9996 16H22.6664M18.7996 18.8004L20.7331 20.7339M15.9992 20.0003V22.6672M11.2658 20.7339L13.1993 18.8004M9.33203 16H11.9989M11.2658 11.2666L13.1993 13.2001"
          stroke="#5B2BB9"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="16" height="16" fill="white" transform="translate(8 8)" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function AccessDetailsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="16" fill="#F4F0FC" />
      <path
        d="M22.6664 12.667L16.672 16.4846C16.4685 16.6027 16.2375 16.6649 16.0022 16.6649C15.767 16.6649 15.5359 16.6027 15.3325 16.4846L9.33203 12.667M10.6655 10.6672H21.333C22.0694 10.6672 22.6664 11.2641 22.6664 12.0004V19.9996C22.6664 20.7359 22.0694 21.3328 21.333 21.3328H10.6655C9.92903 21.3328 9.33203 20.7359 9.33203 19.9996V12.0004C9.33203 11.2641 9.92903 10.6672 10.6655 10.6672Z"
        stroke="#5B2BB9"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
