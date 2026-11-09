import { describe, it, expect } from 'bun:test'
import { createRunner, jump, step } from '../src/lib/runner'

function simulate(seconds: number, seed: number, fps = 30, viewW = 90) {
  const r = createRunner(seed)
  const dt = 1 / fps
  for (let i = 0; i < seconds * fps; i++) step(r, dt, viewW)
  return r
}

describe('auto-runner', () => {
  it('auto-jumps every cactus over two minutes of play', () => {
    for (const seed of [1, 7, 42, 99, 123, 2026]) {
      expect(simulate(120, seed).crashes).toBe(0)
    }
  })

  it('is reproducible for a seed', () => {
    const a = simulate(20, 5)
    const b = simulate(20, 5)
    expect(a.distance).toBe(b.distance)
    expect(a.cacti).toEqual(b.cacti)
  })

  it('returns to the ground after a jump', () => {
    const r = createRunner(3)
    r.cacti = []
    r.nextSpawn = 1e9
    jump(r)
    for (let i = 0; i < 90; i++) step(r, 1 / 30, 90)
    expect(r.y).toBe(0)
  })

  it('speeds up over time but stays within bounds', () => {
    const r = simulate(60, 11)
    expect(r.speed).toBeGreaterThan(40)
    expect(r.speed).toBeLessThanOrEqual(80)
  })
})

