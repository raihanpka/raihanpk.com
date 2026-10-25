/**
 * Baby's breath (gypsophila) as a density field, in grid cells.
 * The plant is a thin stem that forks into three, then into twos, four levels deep,
 * each fork ending in a few tiny flowers of five-petal flowers. That airy, repeatedly
 * forking panicle is what makes it read as baby's breath and not as any other flower.
 * Wind blows left to right: a slow gust wave travels across the sprigs, and every
 * branch leans a little to the right, more the higher it is.
 * Everything is pure. The canvas only compares density with a Bayer threshold.
 */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const frac = (v: number) => v - Math.floor(v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Where the sprigs stand (fraction of width) and how tall they grow (fraction of the band). */
export const SPRIGS = [
  { x: 0.12, h: 0.78 },
  { x: 0.36, h: 0.88 },
  { x: 0.6, h: 0.72 },
  { x: 0.84, h: 0.82 },
] as const

export const PETAL_COUNT = 8
const MAX_DEPTH = 4

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  return lerp(lerp(hash(xi, yi), hash(xi + 1, yi), sx), lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), sx), sy)
}

export interface Seg {
  x0: number
  y0: number
  x1: number
  y1: number
  depth: number
}
export interface Tip {
  x: number
  y: number
  baseX: number
}
export interface Flower {
  x: number
  y: number
  /** 1 is a small plus shape, 2 is a full blossom with a ring. */
  size: 1 | 2
}
export interface Geometry {
  segs: Seg[]
  tips: Tip[]
  flowers: Flower[]
}

/** Stems and flowers of every sprig at time t (seconds). */
export function plantGeometry(cols: number, rows: number, t: number): Geometry {
  const out: Geometry = { segs: [], tips: [], flowers: [] }

  SPRIGS.forEach((sprig, si) => {
    const baseX = sprig.x * cols
    let node = 0

    const grow = (x: number, y: number, angle: number, len: number, depth: number) => {
      const id = si * 1000 + node++
      // A gust wave travels left to right (phase falls with x), plus a slow overall breathing.
      const phase = t * 0.9 - x * 0.05 + si * 0.9
      const sway = (Math.sin(phase) * 0.1 + Math.sin(t * 0.37 + si) * 0.05 + 0.1) * (0.35 + depth * 0.4)
      const a = angle + sway
      const x1 = x + Math.cos(a) * len
      const y1 = y + Math.sin(a) * len
      out.segs.push({ x0: x, y0: y, x1, y1, depth })

      if (depth >= MAX_DEPTH) {
        out.tips.push({ x: x1, y: y1, baseX })
        for (let k = 0; k < 3; k++) {
          out.flowers.push({
            x: x1 + (hash(id, k + 0.1) - 0.5) * 6,
            y: y1 + (hash(id, k + 0.7) - 0.5) * 5,
            size: hash(id, k + 1.3) > 0.7 ? 2 : 1,
          })
        }
        return
      }

      if (depth === MAX_DEPTH - 1 && hash(id, 9.1) > 0.35) out.flowers.push({ x: x1, y: y1, size: 1 })

      const kids = depth === 0 ? 3 : 2
      for (let k = 0; k < kids; k++) {
        const spread = (k - (kids - 1) / 2) * (0.5 + hash(id, 2.2) * 0.3)
        grow(x1, y1, angle + spread, len * (0.7 + hash(id, 3.3 + k) * 0.08), depth + 1)
      }
    }

    grow(baseX, rows - 1, -Math.PI / 2, sprig.h * rows * 0.34, 0)
  })

  return out
}

export interface Petal {
  x: number
  y: number
  alpha: number
}

/** A loose petal blown from the left edge to the right, arcing as it goes. */
export function petalAt(i: number, t: number, cols: number, rows: number): Petal {
  const speed = 0.05 + (i % 5) * 0.013
  const p = frac(i * 0.37 + t * speed + 0.025 * Math.sin(t * 0.9 + i))
  const lift = 0.5 + (i % 3) * 0.3
  return {
    x: lerp(0, cols * 1.05, p),
    y: rows * (0.6 - 0.3 * Math.sin(p * Math.PI) * lift) + Math.sin(t * 1.7 + i * 2.1) * rows * 0.03,
    alpha: smoothstep(0, 0.08, p) * (1 - smoothstep(0.85, 1, p)),
  }
}

/** The dithered mound the plants grow from. It does not move, so compute it once per size. */
export function groundField(cols: number, rows: number): Float32Array {
  const f = new Float32Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    const base = smoothstep(0.62, 1, r / rows)
    if (base === 0) continue
    for (let c = 0; c < cols; c++) f[r * cols + c] = base * (0.25 + 0.35 * valueNoise(c * 0.35, r * 0.5))
  }
  return f
}

function plot(buf: Float32Array, cols: number, rows: number, x: number, y: number, v: number) {
  const xi = Math.round(x)
  const yi = Math.round(y)
  if (xi < 0 || xi >= cols || yi < 0 || yi >= rows) return
  const i = yi * cols + xi
  if (v > buf[i]) buf[i] = v
}

function line(buf: Float32Array, cols: number, rows: number, s: Seg) {
  // Main stems are solid. The finest twigs are drawn at half strength so dithering turns
  // them into broken hairlines, which is how baby's breath looks.
  const v = s.depth <= 2 ? 0.99 : s.depth === 3 ? 0.7 : 0.5
  const steps = Math.max(1, Math.ceil(Math.hypot(s.x1 - s.x0, s.y1 - s.y0) * 2))
  for (let k = 0; k <= steps; k++) {
    const u = k / steps
    const x = lerp(s.x0, s.x1, u)
    const y = lerp(s.y0, s.y1, u)
    plot(buf, cols, rows, x, y, v)
    if (s.depth === 0) plot(buf, cols, rows, x + 1, y, 0.9)
  }
}

function flower(buf: Float32Array, cols: number, rows: number, f: Flower) {
  // A small bud is one bright cell. A blossom is a plus of five cells, one per petal.
  plot(buf, cols, rows, f.x, f.y, 1)
  if (f.size === 2) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) plot(buf, cols, rows, f.x + dx, f.y + dy, 0.85)
  }
}

/** One frame: ground, then stems, then flowers, then loose petals. Values are 0..1 per cell. */
export function compose(cols: number, rows: number, t: number, ground?: Float32Array): Float32Array {
  const buf = ground ? Float32Array.from(ground) : groundField(cols, rows)
  const g = plantGeometry(cols, rows, t)
  for (const s of g.segs) line(buf, cols, rows, s)
  for (const f of g.flowers) flower(buf, cols, rows, f)
  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = petalAt(i, t, cols, rows)
    if (p.alpha < 0.05) continue
    plot(buf, cols, rows, p.x, p.y, p.alpha)
    plot(buf, cols, rows, p.x - 1, p.y, p.alpha * 0.6)
    plot(buf, cols, rows, p.x - 2, p.y, p.alpha * 0.3)
  }
  return buf
}
