/**
 * Shared text-parsing utilities.
 * Used by any section that renders [accent] headline syntax.
 */

/**
 * Parses a headline string by splitting on [bracket] tokens.
 * Returns an array of segments with `accent: true` for bracketed text.
 *
 * Example: "at [TruS]" → [{ text: "at ", accent: false }, { text: "TruS", accent: true }]
 */
export function parseHeadline(line: string): Array<{ text: string; accent: boolean }> {
  const parts: Array<{ text: string; accent: boolean }> = []
  const re = /\[([^\]]+)\]/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(line)) !== null) {
    if (match.index > last) parts.push({ text: line.slice(last, match.index), accent: false })
    parts.push({ text: match[1], accent: true })
    last = match.index + match[0].length
  }

  if (last < line.length) parts.push({ text: line.slice(last), accent: false })
  return parts
}
