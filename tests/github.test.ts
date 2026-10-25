import { describe, it, expect } from 'bun:test'
import { levelFor, loadContributions, parseContributionsHtml, parseGraphQL, shapeWeeks, visibleWeeks, type Day } from '../src/lib/github'

// Same structure as github.com/users/<name>/contributions: cells ordered by weekday row, then week.
const cell = (row: number, col: number, date: string, tip: string) =>
  `<td tabindex="0" data-date="${date}" id="contribution-day-component-${row}-${col}" data-level="0" role="gridcell" class="ContributionCalendar-day"></td>` +
  `<tool-tip for="contribution-day-component-${row}-${col}" class="sr-only">${tip}</tool-tip>`

const HTML = [
  cell(0, 0, '2025-10-26', 'No contributions on October 26th.'),
  cell(0, 1, '2025-11-02', 'No contributions on November 2nd.'),
  cell(1, 0, '2025-10-27', '1 contribution on October 27th.'),
  cell(1, 1, '2025-11-03', '57 contributions on November 3rd.'),
].join('\n')

describe('parseContributionsHtml', () => {
  it('reads date and count for every cell, sorted by date', () => {
    const days = parseContributionsHtml(HTML)
    expect(days.map((d) => d.date)).toEqual(['2025-10-26', '2025-10-27', '2025-11-02', '2025-11-03'])
    expect(days.map((d) => d.count)).toEqual([0, 1, 0, 57])
  })
  it('returns nothing for unrelated html', () => {
    expect(parseContributionsHtml('<html><body>login</body></html>')).toEqual([])
  })
})

describe('parseGraphQL', () => {
  it('flattens the calendar weeks', () => {
    const json = {
      data: { user: { contributionsCollection: { contributionCalendar: { weeks: [
        { contributionDays: [{ date: '2025-10-26', contributionCount: 3 }, { date: '2025-10-27', contributionCount: 0 }] },
        { contributionDays: [{ date: '2025-11-02', contributionCount: 9 }] },
      ] } } } },
    }
    expect(parseGraphQL(json)).toEqual([
      { date: '2025-10-26', count: 3 },
      { date: '2025-10-27', count: 0 },
      { date: '2025-11-02', count: 9 },
    ])
  })
  it('returns nothing on errors or a missing user', () => {
    expect(parseGraphQL({ errors: [{ message: 'bad credentials' }] })).toEqual([])
    expect(parseGraphQL({ data: { user: null } })).toEqual([])
  })
})

describe('shapeWeeks', () => {
  const days: Day[] = [
    { date: '2025-10-29', count: 1 }, // Wednesday
    { date: '2025-10-30', count: 2 },
    { date: '2025-11-02', count: 4 }, // Sunday, starts a new week
    { date: '2025-11-03', count: 5 },
  ]
  it('groups by week starting on Sunday and pads the first week', () => {
    const weeks = shapeWeeks(days)
    expect(weeks.length).toBe(2)
    expect(weeks[0].length).toBe(7)
    expect(weeks[0][0]).toBeNull()
    expect(weeks[0][3]?.date).toBe('2025-10-29')
    expect(weeks[1][0]?.date).toBe('2025-11-02')
    expect(weeks[1][1]?.count).toBe(5)
  })
})

describe('levelFor', () => {
  it('is 0 only for no contributions and never above 4', () => {
    expect(levelFor(0, 20)).toBe(0)
    expect(levelFor(1, 20)).toBe(1)
    expect(levelFor(20, 20)).toBe(4)
    expect(levelFor(500, 20)).toBe(4)
  })
  it('handles a quiet year without dividing by zero', () => {
    expect(levelFor(0, 0)).toBe(0)
    expect(levelFor(1, 0)).toBe(4)
  })
})

describe('visibleWeeks', () => {
  it('fits as many weeks as the width allows, within 13 and 53', () => {
    expect(visibleWeeks(300, 10, 3)).toBe(23) // (300 + 3) / 13
    expect(visibleWeeks(100, 10, 3)).toBe(13) // never fewer than a quarter
    expect(visibleWeeks(5000, 10, 3)).toBe(53)
  })
})

describe('loadContributions', () => {
  const ok = (body: string, json = false) => async () => ({ ok: true, status: 200, text: async () => body, json: async () => JSON.parse(body) }) as Response
  it('uses GraphQL when a token is given', async () => {
    const body = JSON.stringify({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: [{ date: '2025-10-26', contributionCount: 2 }] }] } } } } })
    const r = await loadContributions({ user: 'x', token: 't', fetchImpl: ok(body, true) as never })
    expect(r.source).toBe('graphql')
    expect(r.total).toBe(2)
  })
  it('falls back to the public page without a token', async () => {
    const r = await loadContributions({ user: 'x', fetchImpl: ok(HTML) as never })
    expect(r.source).toBe('html')
    expect(r.total).toBe(58)
  })
  it('falls back to the public page when GraphQL fails', async () => {
    let calls = 0
    const r = await loadContributions({
      user: 'x',
      token: 't',
      fetchImpl: (async () => {
        calls++
        if (calls === 1) throw new Error('network')
        return { ok: true, status: 200, text: async () => HTML } as Response
      }) as never,
    })
    expect(r.source).toBe('html')
  })
  it('returns an empty result and never throws when everything fails', async () => {
    const r = await loadContributions({ user: 'x', fetchImpl: (async () => { throw new Error('down') }) as never })
    expect(r).toEqual({ weeks: [], total: 0, source: 'none' })
  })
})
