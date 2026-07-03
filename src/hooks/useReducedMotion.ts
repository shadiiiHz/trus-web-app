import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/**
 * Returns true when the user has requested reduced motion via
 * the `prefers-reduced-motion` media query.
 *
 * All animated components must check this and pass `duration: 0` when true.
 */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false
}
