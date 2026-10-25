import { describe, it, expect } from 'bun:test'
import { compose, groundField, plantGeometry, petalAt, PETAL_COUNT, SPRIGS } from '../src/lib/babys-breath'

const COLS = 140
const ROWS = 44

describe('plantGeometry', () => {
  it('grows branching sprigs: many segments, many tips, and fine tip clusters', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    expect(g.segs.length).toBeGreaterThan(SPRIGS.length * 30)
    expect(g.tips.length).toBeGreaterThan(SPRIGS.length * 12)
    expect(g.flowers.length).toBeGreaterThan(g.tips.length * 2)
  })

  it('branches in two or three, from one stem per sprig', () => {
    const g = plantGeometry(COLS, ROWS, 0)
    const roots = g.segs.filter((s) => s.depth === 0)
    expect(roots.length).toBe(SPRIGS.length)
    const d1 = g.segs.filter((s) => s.depth === 1).length
    expect(d1).toBe(SPRIGS.length * 3)
    const d2 = g.segs.filter((s) => s.depth === 2).length
    expect(d2).toBe(d1 * 2)
  })

  it('stays in the lower part of the band, so the top stays empty', () => {
    for (const t of [0, 1.3, 4.7, 9]) {
      const g = plantGeometry(COLS, ROWS, t)
      const topmost = Math.min(...g.segs.map((s) => Math.min(s.y0, s.y1)))
      expect(topmost).toBeGreaterThan(ROWS * 0.08)
    }
  })

  it('leans the way the wind blows: tips sit to the right of their bases on average', () => {
    let lean = 0
    let n = 0
    for (let t = 0; t < 20; t += 0.7) {
      const g = plantGeometry(COLS, ROWS, t)
      for (const tip of g.tips) {
        lean += tip.x - tip.baseX
        n++
      }
    }
    expect(lean / n).toBeGreaterThan(0.5)
  })

  it('sways over time, but never far', () => {
    const a = plantGeometry(COLS, ROWS, 0)
    const b = plantGeometry(COLS, ROWS, 1.6)
    expect(a.tips.length).toBe(b.tips.length)
    let moved = 0
    let maxMove = 0
    a.tips.forEach((tip, i) => {
      const d = Math.hypot(tip.x - b.tips[i].x, tip.y - b.tips[i].y)
      if (d > 0.3) moved++
      maxMove = Math.max(maxMove, d)
    })
    expect(moved).toBeGreaterThan(a.tips.length * 0.5)
    expect(maxMove).toBeLessThan(ROWS * 0.6)
  })

  it('is deterministic', () => {
    expect(plantGeometry(COLS, ROWS, 3.3)).toEqual(plantGeometry(COLS, ROWS, 3.3))
  })
})

describe('petalAt', () => {
  it('drifts left to right', () => {
    expect(petalAt(2, 1.4, COLS, ROWS).x).toBeGreaterThan(petalAt(2, 1.0, COLS, ROWS).x)
  })
  it('stays on screen while visible', () => {
    for (let i = 0; i < PETAL_COUNT; i++) {
      for (let t = 0; t < 40; t += 0.41) {
        const p = petalAt(i, t, COLS, ROWS)
        expect(p.alpha).toBeGreaterThanOrEqual(0)
        expect(p.alpha).toBeLessThanOrEqual(1)
        if (p.alpha > 0.05) {
          expect(p.x).toBeGreaterThanOrEqual(-2)
          expect(p.x).toBeLessThanOrEqual(COLS + 4)
          expect(p.y).toBeGreaterThan(-2)
          expect(p.y).toBeLessThan(ROWS + 2)
        }
      }
    }
  })
})

describe('compose', () => {
  const ground = groundField(COLS, ROWS)
  it('returns one value per cell, between 0 and 1', () => {
    for (const t of [0, 2.2, 8]) {
      const f = compose(COLS, ROWS, t, ground)
      expect(f.length).toBe(COLS * ROWS)
      for (const v of f) {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(1)
      }
    }
  })
  it('draws solid flowers and keeps the top rows empty', () => {
    const f = compose(COLS, ROWS, 1, ground)
    let solid = 0
    for (const v of f) if (v > 0.9) solid++
    expect(solid).toBeGreaterThan(80)
    let top = 0
    for (let c = 0; c < COLS; c++) top = Math.max(top, f[c])
    expect(top).toBeLessThan(0.2)
  })
  it('does not change the ground between frames, only the plants', () => {
    const a = compose(COLS, ROWS, 0, ground)
    const b = compose(COLS, ROWS, 2, ground)
    let groundDiff = 0
    for (let c = 0; c < COLS; c++) groundDiff += Math.abs(a[(ROWS - 1) * COLS + c] - b[(ROWS - 1) * COLS + c])
    expect(groundDiff).toBeLessThan(COLS * 0.25)
    let changed = 0
    for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.3) changed++
    expect(changed).toBeGreaterThan(60)
  })
})
