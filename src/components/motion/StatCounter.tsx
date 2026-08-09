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
  /** Full expanded number the tween animates through (e.g. 5000 for "5K+"). */
  target: number;
  decimals: number;
  groupSep: string;
  decimalSep: string;
  suffix: string;
  /** 1000 for a "K" source suffix, 1e6 for "M", else 1. */
  magnitudeDivisor: number;
  /** "K" / "M" echoed back onto the display, or "" when there is none. */
  magnitudeLabel: string;
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
    return {
      target: 0,
      decimals: 0,
      groupSep: ",",
      decimalSep: ".",
      suffix: raw,
      magnitudeDivisor: 1,
      magnitudeLabel: "",
    };
  }
  const [, numPart, suffix] = match;
  const trimmed = numPart.trim();

  const lastSepIdx = Math.max(trimmed.lastIndexOf(","), trimmed.lastIndexOf("."));
  if (lastSepIdx === -1) {
    return applyMagnitudeSuffix(parseFloat(trimmed) || 0, 0, suffix, ",", ".");
  }

  const sepChar = trimmed[lastSepIdx];
  const afterSep = trimmed.slice(lastSepIdx + 1);
  const isDecimal = afterSep.length > 0 && afterSep.length <= 2;

  const decimalSep = isDecimal ? sepChar : sepChar === "." ? "," : ".";
  const groupSep = isDecimal ? (sepChar === "." ? "," : ".") : sepChar;

  const integerStr = (isDecimal ? trimmed.slice(0, lastSepIdx) : trimmed).split(groupSep).join("");
  const decimals = isDecimal ? afterSep.length : 0;
  const rawTarget = parseFloat(decimals > 0 ? `${integerStr}.${afterSep}` : integerStr) || 0;

  return applyMagnitudeSuffix(rawTarget, decimals, suffix, groupSep, decimalSep);
}

/**
 * A leading K/M letter on the suffix (e.g. "5K+", "1.2M+") is a magnitude
 * shorthand, not literal display text. Expand it into the real target
 * (5000, 1200000, ...) so the tween animates through the full number
 * rather than just 0 → 5 — but keep the K/M label for display, with at
 * least one decimal of resolution so the compact readout still visibly
 * counts up instead of jumping in whole-K steps.
 */
function applyMagnitudeSuffix(
  rawTarget: number,
  decimals: number,
  suffix: string,
  groupSep: string,
  decimalSep: string,
): ParsedStat {
  const magnitudeMatch = suffix.match(/^([kKmM])(.*)$/);
  if (!magnitudeMatch) {
    return { target: rawTarget, decimals, groupSep, decimalSep, suffix, magnitudeDivisor: 1, magnitudeLabel: "" };
  }
  const magnitudeLabel = magnitudeMatch[1].toUpperCase();
  const magnitudeDivisor = magnitudeLabel === "K" ? 1_000 : 1_000_000;
  return {
    target: rawTarget * magnitudeDivisor,
    decimals: Math.max(decimals, 1),
    groupSep,
    decimalSep,
    suffix: magnitudeMatch[2],
    magnitudeDivisor,
    magnitudeLabel,
  };
}

function formatStat(
  n: number,
  { decimals, groupSep, decimalSep, magnitudeDivisor, magnitudeLabel }: ParsedStat,
): string {
  const compact = n / magnitudeDivisor;
  const [intPart, decPart] = compact.toFixed(decimals).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSep);
  // Drop a trailing ".0"/".00" (e.g. "5.0K" → "5K") but keep genuine
  // fractions (e.g. "4.9K") so the finished value matches the source text.
  const hasFraction = decPart !== undefined && /[1-9]/.test(decPart);
  const withDecimal = hasFraction ? `${grouped}${decimalSep}${decPart}` : grouped;
  return `${withDecimal}${magnitudeLabel}`;
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
