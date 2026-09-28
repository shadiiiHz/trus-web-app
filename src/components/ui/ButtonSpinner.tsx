export interface ButtonSpinnerProps {
  /** Diameter in px. */
  size?: number
  className?: string
}

/**
 * Compact spinner for buttons in a loading state: a faint track ring with a
 * bright arc that rotates while its length breathes in and out. Uses
 * `currentColor`, so it follows the button's text colour on any variant.
 */
export function ButtonSpinner({ size = 18, className = '' }: ButtonSpinnerProps) {
  return (
    <svg
      className={`btn-spinner ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="btn-spinner-track" cx="12" cy="12" r="9.5" />
      <circle className="btn-spinner-arc" cx="12" cy="12" r="9.5" pathLength={100} />
    </svg>
  )
}

export default ButtonSpinner
