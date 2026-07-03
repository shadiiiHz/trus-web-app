import { useEffect, useRef, useState } from 'react'

interface LoaderGateOptions {
  /**
   * External readiness signal — the loader stays visible until this is `true`.
   * For the TRUS hero this is the hero video reaching `canplaythrough`, so the
   * video is actually buffered and playing (not a frozen first frame) by the
   * time the loader fades out.
   */
  ready: boolean
  /** Minimum visible time (ms) so the intro animation reads as intentional. */
  minDuration?: number
  /**
   * Hard safety cap (ms). The loader is dismissed even if `ready` never
   * arrives — a stalled network or a video error must never leave it stuck.
   */
  maxDuration?: number
}

/**
 * Decides when the preloader should disappear.
 *
 * Unlike a `window.load` / fixed-timeout approach, this waits for an explicit
 * readiness signal, enforces a minimum on-screen time, and guarantees a hard
 * fallback so the loader can never hang forever.
 */
export function useLoaderGate({
  ready,
  minDuration = 2000,
  maxDuration = 12000,
}: LoaderGateOptions): boolean {
  const [done, setDone] = useState(false)
  const startRef = useRef(performance.now())

  // Safety net: never let the loader stick if the asset stalls or errors.
  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), maxDuration)
    return () => window.clearTimeout(timer)
  }, [maxDuration])

  // Primary path: dismiss once ready, but not before the minimum display time.
  useEffect(() => {
    if (!ready) return
    const remaining = Math.max(0, minDuration - (performance.now() - startRef.current))
    const timer = window.setTimeout(() => setDone(true), remaining)
    return () => window.clearTimeout(timer)
  }, [ready, minDuration])

  return done
}
