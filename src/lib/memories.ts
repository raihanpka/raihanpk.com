/**
 * Core Memories data. The list is shown in the order it is written, so the file is the timeline.
 * Validation runs at build time, so a broken entry fails the build instead of the page.
 */

export interface Memory {
  /** Full photo. The page makes a small thumbnail from it at build time. */
  src: string
  caption: string
  /** Optional short time label, for example "2025". */
  when?: string
}

export function validateMemories(input: unknown): Memory[] {
  if (!Array.isArray(input)) throw new Error('memories must be a list')
  const seen = new Set<string>()
  return input.map((raw, i) => {
    const at = `memories[${i}]`
    const m = raw as Partial<Memory>
    if (typeof m.src !== 'string' || !/^https:\/\//.test(m.src)) throw new Error(`${at}.src must be an https url`)
    if (typeof m.caption !== 'string' || !m.caption.trim()) throw new Error(`${at}.caption is required`)
    if (m.caption.includes(':')) throw new Error(`${at}.caption must not contain a colon`)
    if (m.when !== undefined && (typeof m.when !== 'string' || !m.when.trim())) throw new Error(`${at}.when must not be empty`)
    if (seen.has(m.src)) throw new Error(`${at}.src is a duplicate`)
    seen.add(m.src)
    return { src: m.src, caption: m.caption.trim(), ...(m.when ? { when: m.when.trim() } : {}) }
  })
}
