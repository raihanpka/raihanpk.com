/*
 * City and clouds: the background behind the About page. A night city on a 200 by 100 dot grid, its
 * windows flicker on and off slowly, and clouds drift across the sky above it. Monochrome: every cell is a
 * lum value (0 to 1) and a halftone step, the page tokens give the colour.
 *
 * The city layout and the window flicker follow the skyline piece of bas3line/ascii (MIT, see NOTICE),
 * without the moon, stars and water; the clouds are value noise.
 */

export const COLS = 200
export const ROWS = 100

const BASE = 84 // the street line: towers stand on it, the sky is above
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47)

/** Per-cell output of one frame: the dot size step, the brightness, and how warm it is (always 0 here). */
export interface SkylineFrame {
  steps: Uint8Array
  lum: Float32Array
  warm: Float32Array
}

export function createSkylineFrame(): SkylineFrame {
  return {
    steps: new Uint8Array(COLS * ROWS),
    lum: new Float32Array(COLS * ROWS),
    warm: new Float32Array(COLS * ROWS),
  }
}

// near towers: left column, width, height in rows, rooftop feature
const TOWERS: [number, number, number, string?][] = [
  [4, 10, 22],
  [16, 8, 30],
  [26, 12, 18],
  [40, 9, 34],
  [51, 14, 44],
  [67, 8, 26],
  [77, 11, 38, 'spire'],
  [90, 9, 20],
  [101, 13, 50, 'mast'],
  [116, 8, 28],
  [126, 10, 36],
  [138, 12, 22, 'crown'],
  [152, 9, 42],
  [163, 14, 30],
  [179, 8, 24],
  [189, 11, 34],
]
// far towers in haze: left column, width, height
const FAR: [number, number, number][] = [
  [0, 12, 16],
  [22, 10, 20],
  [60, 12, 14],
  [96, 10, 18],
  [144, 11, 16],
  [176, 12, 20],
]

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
const hash2 = (a: number, b: number) => hash(a * 57.3 + b * 113.9)
const smooth = (a: number, b: number, v: number) => {
  const k = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return k * k * (3 - 2 * k)
}
const valueNoise = (x: number, y: number) => {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const cloudAt = (x: number, y: number, t: number) => {
  const drift = t * 1.2
  const n = 0.6 * valueNoise((x + drift) * 0.045, y * 0.12) + 0.4 * valueNoise((x + drift * 1.4) * 0.11, y * 0.25 + 3)
  return smooth(0.5, 0.68, n)
}

/** Builds the static city once, then returns a renderer that writes one frame at time t (seconds). */
export function createSkyline(): (t: number, out: SkylineFrame) => void {
  // the lum of each city cell: 0 for sky, a haze for far towers, a solid for near towers with an outline
  const city = new Float32Array(COLS * ROWS)
  const panes: { c: number; r: number; id: number; far: boolean }[] = []
  const set = (c: number, r: number, v: number) => {
    if (c >= 0 && c < COLS && r >= 0 && r < ROWS) city[r * COLS + c] = v
  }
  for (const [x, w, h] of FAR) {
    for (let r = BASE - h; r < BASE; r++) for (let c = x; c < x + w; c++) set(c, r, 0.16)
  }
  TOWERS.forEach(([x, w, h, top], n) => {
    const t = BASE - h
    for (let r = t; r < BASE; r++) {
      for (let c = x; c < x + w; c++) {
        const edge = c === x || c === x + w - 1 || r === t
        set(c, r, edge ? 0.78 : 0.3)
      }
    }
    for (let r = t + 2; r < BASE - 1; r += 3) {
      for (let c = x + 2; c < x + w - 2; c += 3) panes.push({ c, r, id: n * 1000 + r * 50 + c, far: false })
    }
    if (top === 'mast') {
      const mx = x + (w >> 1)
      for (let r = t - 4; r < t; r++) set(mx, r, 0.8)
      set(mx, t - 5, 0.95)
    }
    if (top === 'spire') {
      const mx = x + (w >> 1)
      for (let k = 0; k < 6; k++) {
        set(mx - k, t - 1 - k, 0.7)
        set(mx + k, t - 1 - k, 0.7)
      }
    }
    if (top === 'crown') {
      for (let c = x + 2; c < x + w - 2; c++) set(c, t - 2, 0.7)
    }
  })
  // windows: the lit ones glow, the rest are dark panes
  const WIN_ON = 0.95
  const WIN_OFF = 0.12

  return (t, out) => {
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = i % COLS
      const r = (i - c) / COLS
      let v = 0
      if (r < BASE) {
        // the sky: drifting clouds, dim so they read as texture
        const sky = cloudAt(c, r, t) * 0.4
        v = Math.max(sky, city[i])
      } else {
        v = city[i]
      }
      out.lum[i] = v
      out.warm[i] = 0
    }
    // windows flicker: each pane changes on its own slow rhythm
    for (const p of panes) {
      const period = 1.2 + hash(p.id) * 2.4
      const on = hash2(p.id, Math.floor(t / period)) < 0.42
      const i = p.r * COLS + p.c
      if (p.r < BASE) out.lum[i] = on ? WIN_ON : WIN_OFF
    }
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = i % COLS
      const r = (i - c) / COLS
      const level = out.lum[i]
      const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(r & 3) * 4 + (c & 3)])))
      out.steps[i] = level > 0.04 ? step : 0
    }
  }
}
