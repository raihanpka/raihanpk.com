import { describe, it, expect } from 'bun:test'
import { COLS, ROWS, createCloudSea, createCloudSeaFrame } from '../src/lib/cloud-sea'

describe('cloud sea frame', () => {
  it('writes one step and one luminance per cell', () => {
    const render = createCloudSea()
    const frame = createCloudSeaFrame()
    render(1.5, frame)
    expect(frame.steps.length).toBe(COLS * ROWS)
    expect(frame.lum.length).toBe(COLS * ROWS)
  })

  it('keeps steps in 0..3 and luminance in 0..1', () => {
    const render = createCloudSea()
    const frame = createCloudSeaFrame()
    render(3, frame)
    for (let k = 0; k < frame.steps.length; k++) {
      expect(frame.steps[k]).toBeGreaterThanOrEqual(0)
      expect(frame.steps[k]).toBeLessThanOrEqual(3)
      expect(frame.lum[k]).toBeGreaterThanOrEqual(0)
      expect(frame.lum[k]).toBeLessThanOrEqual(1)
    }
  })

  it('is deterministic for the same time', () => {
    const render = createCloudSea()
    const a = createCloudSeaFrame()
    const b = createCloudSeaFrame()
    render(7.25, a)
    render(7.25, b)
    expect(a.steps).toEqual(b.steps)
    expect(a.lum).toEqual(b.lum)
  })

  it('draws something: not every cell is empty', () => {
    const render = createCloudSea()
    const frame = createCloudSeaFrame()
    render(2, frame)
    const lit = frame.steps.filter((s) => s > 0).length
    expect(lit).toBeGreaterThan(COLS * ROWS * 0.2)
  })
})
