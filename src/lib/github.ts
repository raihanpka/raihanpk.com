/**
 * GitHub contribution data for the home graph. Loaded at build time, never in the browser.
 * With a token it asks the GraphQL API. Without one, or if that fails, it reads the public
 * contributions page, which lists the same days. If both fail the graph shows an empty state.
 */

export interface Day {
  date: string
  count: number
}
/** One week, Sunday first. `null` pads days that fall outside the data. */
export type Week = (Day | null)[]
export interface Contributions {
  weeks: Week[]
  total: number
  source: 'graphql' | 'html' | 'none'
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]

/** Reads cells and their tool-tips from github.com/users/<name>/contributions. */
export function parseContributionsHtml(html: string): Day[] {
  const counts = new Map<string, number>()
  for (const m of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const target = attr(m[1], 'for')
    const text = m[2].trim()
    const n = text.match(/^(No|\d[\d,]*)\s+contributions?\b/)
    if (target && n) counts.set(target, n[1] === 'No' ? 0 : Number(n[1].replace(/,/g, '')))
  }
  const days: Day[] = []
  for (const m of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = attr(m[1], 'data-date')
    const id = attr(m[1], 'id')
    if (date && id && counts.has(id)) days.push({ date, count: counts.get(id) ?? 0 })
  }
  return days.sort((a, b) => a.date.localeCompare(b.date))
}

/** Flattens the GraphQL calendar. Returns [] for errors or a missing user. */
export function parseGraphQL(json: unknown): Day[] {
  const weeks = (json as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[] } } } | null } })
    ?.data?.user?.contributionsCollection?.contributionCalendar?.weeks
  if (!Array.isArray(weeks)) return []
  return weeks.flatMap((w) => (w.contributionDays ?? []).map((d) => ({ date: d.date, count: d.contributionCount })))
}

/** Groups days into weeks that start on Sunday. The first week is padded at the front. */
export function shapeWeeks(days: Day[]): Week[] {
  const weeks: Week[] = []
  let current: Week = Array(7).fill(null)
  let filled = false
  for (const day of [...days].sort((a, b) => a.date.localeCompare(b.date))) {
    const weekday = new Date(`${day.date}T00:00:00Z`).getUTCDay()
    if (weekday === 0 && filled) {
      weeks.push(current)
      current = Array(7).fill(null)
      filled = false
    }
    current[weekday] = day
    filled = true
  }
  if (filled) weeks.push(current)
  return weeks
}

/** Color level 0 to 4. 0 means no contributions at all. */
export function levelFor(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (max <= 0) return 4
  const r = count / max
  if (r >= 0.75) return 4
  if (r >= 0.5) return 3
  if (r >= 0.25) return 2
  return 1
}

/** How many weeks fit in `width` px. Never fewer than a quarter (13 weeks), never more than a year. */
export function visibleWeeks(width: number, cell: number, gap: number, min = 13, max = 53): number {
  return Math.max(min, Math.min(max, Math.floor((width + gap) / (cell + gap))))
}

interface LoadOptions {
  user: string
  token?: string
  fetchImpl?: typeof fetch
}

const QUERY = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`

const result = (days: Day[], source: Contributions['source']): Contributions => ({
  weeks: shapeWeeks(days),
  total: days.reduce((sum, d) => sum + d.count, 0),
  source,
})

export async function loadContributions({ user, token, fetchImpl = fetch }: LoadOptions): Promise<Contributions> {
  if (token) {
    try {
      const res = await fetchImpl('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: QUERY, variables: { login: user } }),
      })
      if (res.ok) {
        const days = parseGraphQL(await res.json())
        if (days.length) return result(days, 'graphql')
      }
    } catch {
      // Fall through to the public page.
    }
  }
  try {
    const res = await fetchImpl(`https://github.com/users/${user}/contributions`)
    if (res.ok) {
      const days = parseContributionsHtml(await res.text())
      if (days.length) return result(days, 'html')
    }
  } catch {
    // Fall through to the empty result.
  }
  return { weeks: [], total: 0, source: 'none' }
}
