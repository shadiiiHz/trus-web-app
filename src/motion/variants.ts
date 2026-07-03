/** Shared Framer Motion variant objects and timing constants. */

// Easing

export const EASE_PREMIUM    = [0.16, 1, 0.3, 1]       as const
export const EASE_OUT_EXPO   = [0.19, 1, 0.22, 1]      as const
export const EASE_IN_OUT     = [0.4, 0, 0.2, 1]        as const
export const EASE_OUT_QUAD   = [0.25, 0.46, 0.45, 0.94] as const

// Duration

export const DURATION_XS  = 0.15
export const DURATION_SM  = 0.25
export const DURATION_MD  = 0.5
export const DURATION_LG  = 0.75
export const DURATION_XL  = 1.0
export const DURATION_2XL = 1.2

// Stagger

export const STAGGER_TIGHT = 0.05
export const STAGGER_STD   = 0.08
export const STAGGER_LOOSE = 0.12
export const STAGGER_HERO  = 0.15

// Variants

export const fadeInUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION_LG, ease: EASE_PREMIUM } },
}

export const fadeInDown = {
  hidden:  { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION_LG, ease: EASE_PREMIUM } },
}

export const fadeInLeft = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION_LG, ease: EASE_PREMIUM } },
}

export const fadeInRight = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION_LG, ease: EASE_PREMIUM } },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION_MD, ease: EASE_IN_OUT } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: DURATION_MD, ease: EASE_PREMIUM } },
}

export const clipRevealLeft = {
  hidden:  { clipPath: 'inset(0 100% 0 0)' },
  visible: { clipPath: 'inset(0 0% 0 0)', transition: { duration: DURATION_XL, ease: EASE_PREMIUM } },
}

/** Returns a stagger container variant. */
export function staggerContainer(stagger = STAGGER_STD, delayChildren = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}
