import { AnimatePresence, motion } from 'framer-motion'
import { DURATION_SM, EASE_IN_OUT } from '@/motion/variants'
import { ButtonSpinner } from './ButtonSpinner'

export type ButtonVariant = 'primary' | 'ghost' | 'outline-accent' | 'gradient'

export interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
  disabled?: boolean
  /** Replaces the label with a centred spinner and blocks clicks until cleared. */
  loading?: boolean
  'aria-label'?: string
}

const base =
  'relative inline-flex items-center justify-center gap-2 px-6 py-3 text-[16px] font-medium font-body cursor-pointer transition-all focus-visible:outline-none select-none'

const variants: Record<ButtonVariant, string> = {
  'primary':
    'rounded-[8px] bg-brand-accent text-white hover:bg-brand-accent-light',
  'ghost':
    'rounded-[8px] bg-transparent text-brand-white border border-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.05)]',
  'outline-accent':
    'rounded-full bg-transparent text-brand-accent border border-brand-accent hover:bg-[rgba(135,93,217,0.1)]',
  'gradient':
    'rounded-[8px] text-white hover:opacity-90',
}

const gradientBg: React.CSSProperties = {
  background: 'linear-gradient(90deg, #875DD9 0%, #5328A8 100%)',
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  type = 'button',
  className = '',
  style,
  disabled = false,
  loading = false,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${loading ? 'btn-loading' : ''} ${className}`
  const isDisabled = disabled || loading

  // Merge gradient background with any caller-supplied styles
  const computedStyle: React.CSSProperties | undefined =
    variant === 'gradient'
      ? { ...gradientBg, ...style }
      : style

  const motionProps = isDisabled
    ? {}
    : {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { duration: DURATION_SM, ease: EASE_IN_OUT },
      }

  // While loading the label fades out but keeps its space (so the button
  // doesn't resize), and the spinner fades in centred on top of it. The label
  // stays in the accessibility tree; `aria-busy` tells assistive tech it's busy.
  const content = (
    <>
      <motion.span
        className="inline-flex items-center justify-center gap-2"
        animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.92 : 1 }}
        transition={{ duration: DURATION_SM, ease: EASE_IN_OUT }}
      >
        {children}
      </motion.span>
      <AnimatePresence initial={false}>
        {loading && (
          <motion.span
            key="spinner"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: DURATION_SM, ease: EASE_IN_OUT }}
          >
            <ButtonSpinner size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </>
  )

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        style={computedStyle}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        {...motionProps}
      >
        {content}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      className={classes}
      style={computedStyle}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      {...motionProps}
    >
      {content}
    </motion.button>
  )
}

export default Button
