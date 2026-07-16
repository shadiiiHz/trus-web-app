import { motion } from 'framer-motion'
import { DURATION_SM, EASE_IN_OUT } from '@/motion/variants'

export type ButtonVariant = 'primary' | 'ghost' | 'outline-accent' | 'gradient'

export interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

const base =
  'inline-flex items-center justify-center gap-2 px-6 py-3 text-[16px] font-medium font-body cursor-pointer transition-all focus-visible:outline-none select-none'

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
  'aria-label': ariaLabel,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className}`

  // Merge gradient background with any caller-supplied styles
  const computedStyle: React.CSSProperties | undefined =
    variant === 'gradient'
      ? { ...gradientBg, ...style }
      : style

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap:   { scale: 0.97 },
    transition: { duration: DURATION_SM, ease: EASE_IN_OUT },
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        style={computedStyle}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      type={type}
      className={classes}
      style={computedStyle}
      onClick={onClick}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.button>
  )
}

export default Button
