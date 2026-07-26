/**
 * Terminal rendering helpers shared by the query commands (list/show/cat), kept
 * out of index.ts so the width and footer rules stay independently testable.
 */

const ELLIPSIS = '…'

/** Terminal columns a character occupies: CJK and fullwidth forms take two. */
function charWidth(codePoint: number): number {
  const wide =
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6)
  return wide ? 2 : 1
}

export function displayWidth(text: string): number {
  let width = 0
  for (const char of text) width += charWidth(char.codePointAt(0) ?? 0)
  return width
}

/**
 * Truncates to a column budget, appending an ellipsis. Measured in terminal
 * columns rather than code points so a CJK description cannot overflow the
 * line it was laid out against.
 */
export function fitToWidth(text: string, budget: number): string {
  if (budget <= 1) return text
  if (displayWidth(text) <= budget) return text

  const limit = budget - 1 // room for the ellipsis
  let width = 0
  let out = ''
  for (const char of text) {
    const next = width + charWidth(char.codePointAt(0) ?? 0)
    if (next > limit) break
    out += char
    width = next
  }
  return out + ELLIPSIS
}

/** Usable width for the current terminal, with a fallback for non-TTY pipes. */
export function terminalWidth(columns?: number): number {
  const raw = columns ?? process.stdout.columns
  return typeof raw === 'number' && raw > 0 ? raw : 100
}

/**
 * A trailing affordance listing where to go next. Written for an agent reading
 * the transcript: every entry is a runnable command with `<name>`-style
 * placeholders to substitute, so the next call needs no guessing.
 */
export function renderFooter(opts: { stats?: string; commands: FooterCommand[] }): string {
  if (opts.commands.length === 0) return ''
  const lines = ['', '---']
  if (opts.stats !== undefined) lines.push(opts.stats)
  const cmdWidth = Math.max(0, ...opts.commands.map((c) => (typeof c === 'string' ? 0 : displayWidth(c.command))))
  for (const entry of opts.commands) {
    if (typeof entry === 'string') {
      lines.push(`  ${entry}`)
      continue
    }
    const pad = ' '.repeat(Math.max(1, cmdWidth - displayWidth(entry.command) + 1))
    lines.push(`  ${entry.command}${pad}${entry.hint}`)
  }
  return lines.join('\n')
}

/** A footer entry: a pre-formatted line, or a command aligned against its hint. */
export type FooterCommand = string | { command: string; hint: string }
