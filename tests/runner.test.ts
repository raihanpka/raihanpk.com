import { describe, it, expect } from 'bun:test'
import { createRunner, jump, step, type ObstacleSize } from '../src/lib/runner'

// the sizes the component passes in: the compact obstacle sprites, in world units
const SIZES: ObstacleSize[] = [
  { w: 16, h: 28 },
  { w: 28, h: 28 },
  { w: 26, h: 28 },
  { w: 22, h: 28 },
]

function simulate(seconds: number, seed: number, fps = 30, viewW = 120) {
  const r = createRunner(SIZES, seed)
  const dt = 1 / fps
  for (let i = 0; i < seconds * fps; i++) step(r, dt, viewW)
  return r
}

describe('auto-runner', () => {
  it('auto-jumps every obstacle over two minutes of play', () => {
    for (const seed of [1, 7, 42, 99, 123, 2026, 5, 8, 13, 21]) {
      expect(simulate(120, seed).crashes).toBe(0)
    }
  })

  it('is reproducible for a seed', () => {
    const a = simulate(20, 5)
    const b = simulate(20, 5)
    expect(a.distance).toBe(b.distance)
    expect(a.obstacles).toEqual(b.obstacles)
  })

  it('returns to the ground after a jump', () => {
    const r = createRunner(SIZES, 3)
    r.nextSpawn = 1e9
    jump(r)
    for (let i = 0; i < 120; i++) step(r, 1 / 30, 120)
    expect(r.y).toBe(0)
  })

  it('speeds up over time but stays within bounds', () => {
    const r = simulate(60, 11)
    expect(r.speed).toBeGreaterThan(60)
    expect(r.speed).toBeLessThanOrEqual(110)
  })
})
