import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StatCounterProps {
  /** Pre-formatted stat string, e.g. "250+", "4.9+", "1,000+". */
  value: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
}

interface ParsedStat {
  target: number;
  decimals: number;
  groupSep: string;
  decimalSep: string;
  suffix: string;
}

/**
 * Splits a formatted stat string into its numeric core and trailing suffix
 * (e.g. "+"). Distinguishes a decimal separator from a thousands separator
 * by group length: a 1-2 digit tail after the separator is a decimal
 * ("4.9"/"4,9"), a 3-digit tail is a thousands group ("1,000"/"1.000").
 */
function parseStat(raw: string): ParsedStat {
  const match = raw.match(/^([\d.,\s]+)(.*)$/);
  if (!match) {
    return { target: 0, decimals: 0, groupSep: ",", decimalSep: ".", suffix: raw };
  }
  const [, numPart, suffix] = match;
  const trimmed = numPart.trim();

  const lastSepIdx = Math.max(trimmed.lastIndexOf(","), trimmed.lastIndexOf("."));
  if (lastSepIdx === -1) {
    return { target: parseFloat(trimmed) || 0, decimals: 0, groupSep: ",", decimalSep: ".", suffix };
  }

  const sepChar = trimmed[lastSepIdx];
  const afterSep = trimmed.slice(lastSepIdx + 1);
  const isDecimal = afterSep.length > 0 && afterSep.length <= 2;

  const decimalSep = isDecimal ? sepChar : sepChar === "." ? "," : ".";
  const groupSep = isDecimal ? (sepChar === "." ? "," : ".") : sepChar;

  const integerStr = (isDecimal ? trimmed.slice(0, lastSepIdx) : trimmed).split(groupSep).join("");
  const decimals = isDecimal ? afterSep.length : 0;
  const target = parseFloat(decimals > 0 ? `${integerStr}.${afterSep}` : integerStr) || 0;

  return { target, decimals, groupSep, decimalSep, suffix };
}

function formatStat(n: number, { decimals, groupSep, decimalSep }: ParsedStat): string {
  const [intPart, decPart] = n.toFixed(decimals).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  return decimals > 0 ? `${grouped}${decimalSep}${decPart}` : grouped;
}

/** Counts up from 0 to the stat's numeric value once it scrolls into view. */
export function StatCounter({ value, className, style, duration = 1.6 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const shouldReduce = useReducedMotion();
  const parsed = parseStat(value);

  const [display, setDisplay] = useState(() => formatStat(0, parsed));

  useEffect(() => {
    if (!isInView || shouldReduce) return;

    const controls = animate(0, parsed.target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(formatStat(v, parsed)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, shouldReduce, parsed.target]);

  // Reduced motion skips the tween entirely — render the final value directly.
  const shown = isInView && shouldReduce ? formatStat(parsed.target, parsed) : display;

  return (
    <span ref={ref} className={className} style={style}>
      {shown}
      {parsed.suffix}
    </span>
  );
}

export default StatCounter;
