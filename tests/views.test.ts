import { describe, expect, it } from 'bun:test'
import { formatViews } from '@/lib/views'

describe('formatViews', () => {
  it('shows the count with a plural label', () => {
    expect(formatViews(302, false)).toBe('302 views')
    expect(formatViews(0, false)).toBe('0 views')
  })
  it('shows a dash instead of 0 when the count could not be loaded', () => {
    expect(formatViews(null, true)).toBe('– views')
  })
  it('keeps a known count even if a later refresh failed', () => {
    expect(formatViews(302, true)).toBe('302 views')
  })
})
