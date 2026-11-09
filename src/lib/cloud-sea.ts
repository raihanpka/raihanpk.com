/*
 * Cloud sea: ported to TypeScript from bas3line/ascii (src/pieces/cloud-sea.ts).
 *
 * MIT License
 * Copyright (c) 2026 bas3line (https://github.com/bas3line)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Changes from the source: the frame is written to typed arrays instead of ASCII
 * text, and the colour is reduced to a luminance so the site can tint it with
 * its own theme tokens.
 *
 * The scene: sunset from high up, above a sea of cloud that rolls away to the
 * horizon. Each cell is shaded on a square grid, then drawn as a halftone: the
 * dot size is the brightness, ordered-dithered with a Bayer matrix.
 */

export const COLS = 200
export const ROWS = 100

/** Dot size per halftone step, as a share of one cell. Step 0 draws nothing. */
export const DOT_SIZE = [0, 0.3, 0.56, 0.8] as const

/** Per-cell output of one frame. `steps` picks the dot size, `lum` its brightness. */
export interface CloudSeaFrame {
  steps: Uint8Array
  lum: Float32Array
}

export function createCloudSeaFrame(): CloudSeaFrame {
  return { steps: new Uint8Array(COLS * ROWS), lum: new Float32Array(COLS * ROWS) }
}

const W = COLS
const H = ROWS
const HZ = 40 // the horizon
const SUN_X = 150
const SUN_Y = HZ + 1.5
const SR = 10 // the sun's radius
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.47)

const SKY = 0
const SEA = 1

function hash(x: number, y: number): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

// Value noise, wrapping every `period` lattice cells in x when period > 0.
function noise(x: number, y: number, period: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  let x0 = xi
  let x1 = xi + 1
  if (period) {
    x0 = ((xi % period) + period) % period
    x1 = (x0 + 1) % period
  }
  const a = hash(x0, yi)
  const b = hash(x1, yi)
  const c = hash(x0, yi + 1)
  const d = hash(x1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function fbm(x: number, y: number, octaves: number, period: number): number {
  let s = 0
  let n = 0
  let amp = 0.5
  let f = 1
  for (let i = 0; i < octaves; i++) {
    s += amp * noise(x * f, y * f, period * f)
    n += amp
    amp *= 0.5
    f *= 2
  }
  return s / n
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a))
  return k * k * (3 - 2 * k)
}
const mix = (a: number, b: number, k: number) => a + (b - a) * k

// Piecewise gradients as [stop, r, g, b].
type Stops = number[][]
function ramp(stops: Stops, v: number, out: number[]): void {
  let i = 1
  while (i < stops.length - 1 && v > stops[i][0]) i++
  const a = stops[i - 1]
  const b = stops[i]
  const k = clamp((v - a[0]) / (b[0] - a[0]))
  out[0] = mix(a[1], b[1], k)
  out[1] = mix(a[2], b[2], k)
  out[2] = mix(a[3], b[3], k)
}

// the sky, top to horizon: charcoal, a grey, a warm grey
const SKY_STOPS: Stops = [
  [0, 0.035, 0.035, 0.04],
  [0.4, 0.075, 0.075, 0.08],
  [0.72, 0.16, 0.155, 0.16],
  [0.9, 0.2, 0.185, 0.18],
  [1, 0.25, 0.2, 0.18],
]
// the sea, by how much light it catches
const SEA_STOPS: Stops = [
  [0, 0.06, 0.06, 0.065],
  [0.2, 0.13, 0.125, 0.13],
  [0.38, 0.3, 0.2, 0.15],
  [0.55, 0.62, 0.3, 0.1],
  [0.7, 0.953, 0.502, 0.125],
  [0.84, 0.98, 0.682, 0.251],
  [0.94, 1.0, 0.84, 0.55],
  [1, 1.0, 0.94, 0.8],
]

// The cloud sea's rows, far to near, by how far below the horizon each sits.
const DY: number[] = []
for (let d = 0.7; d < 120; d *= 1.1) DY.push(d)
const NL = DY.length
const WB = 1.7 // billow width: one unit of the height profile spans dy / WB columns
const PU = 50
const RES = 16
const US = PU * RES // the profile wraps every PU units

/**
 * Build a renderer. Heavy tables are built once here; each call of the
 * returned function writes one frame at time `t` (seconds) into `out`.
 */
export function createCloudSea(): (t: number, out: CloudSeaFrame) => void {
  const N = W * H
  const g = [0, 0, 0]
  const SEAT = new Float32Array(256 * 3)
  for (let i = 0; i < 256; i++) {
    ramp(SEA_STOPS, i / 255, g)
    SEAT[i * 3] = g[0]
    SEAT[i * 3 + 1] = g[1]
    SEAT[i * 3 + 2] = g[2]
  }

  // --- the clear sky, built once ------------------------------------------
  const sky = new Float32Array(N * 3)
  for (let r = 0; r < H; r++) {
    for (let x = 0; x < W; x++) {
      const y = r + 0.5
      const dx = x + 0.5 - SUN_X
      const v = Math.min(1, y / HZ)
      const near = Math.exp(-Math.abs(dx) / 60)
      ramp(SKY_STOPS, Math.pow(v, 1.15 - 0.2 * near), g)
      // long thin bands of high haze, so no stretch of sky is one flat tone
      const haze = 0.9 + 0.2 * fbm(x * 0.025, y * 0.14, 3, 0)
      // the band at the horizon burns hottest toward the sun
      const hot = Math.pow(smooth(0.6, 1, v), 1.6) * (0.08 + 0.92 * near)
      const k = (r * W + x) * 3
      sky[k] = (g[0] + 0.75 * hot) * haze
      sky[k + 1] = (g[1] + 0.33 * hot) * haze
      sky[k + 2] = (g[2] * (1 - 0.3 * hot) + 0.03 * hot) * haze
      // thin streaks of high cirrus, their undersides lit by the sun
      const ci =
        smooth(0.6, 0.78, fbm(x * 0.011 + y * 0.02, y * 0.42, 4, 0)) * smooth(4, 14, y) * smooth(34, 20, y)
      const lit = ci * 0.5 * near
      sky[k] = mix(sky[k], 0.95, lit)
      sky[k + 1] = mix(sky[k + 1], 0.5, lit)
      sky[k + 2] = mix(sky[k + 2], 0.18, lit)
    }
  }

  // --- the cloud sea's height profiles, built once -------------------------
  const HT = new Float32Array(NL * US)
  const SL = new Float32Array(NL * US)
  const prof = (j: number, u: number) => {
    const n = fbm(u * 0.9, j * 4.7, 4, PU * 0.9)
    return 0.05 + 0.36 * Math.pow(smooth(0.28, 0.74, n), 0.85)
  }
  for (let j = 0; j < NL; j++) {
    for (let i = 0; i < US; i++) {
      const u = i / RES
      HT[j * US + i] = prof(j, u)
      SL[j * US + i] = (prof(j, u + 0.05) - prof(j, u - 0.05)) * 10
    }
  }

  // per frame: what each cell shows, and where on its billow it sits
  const mat = new Uint8Array(N)
  const lay = new Uint8Array(N)
  const sv = new Float32Array(N)
  const sl = new Float32Array(N)
  const uu = new Float32Array(N)
  const dtop = new Float32Array(N)
  const FR = new Float32Array(N)
  const FG = new Float32Array(N)
  const FB = new Float32Array(N)

  return (t, out) => {
    const drift = t * 0.12
    const pulse = Math.sin((t / 4) * Math.PI * 2)
    mat.fill(SKY)

    // Resolve each column front to back, billow rows from the nearest out.
    for (let x = 0; x < W; x++) {
      const xc = x + 0.5
      let ub = H
      for (let j = NL - 1; j >= 0 && ub > 0; j--) {
        const dy = DY[j]
        const base = HZ + dy
        const u = ((xc - 100) / dy) * WB + drift + j * 13.7
        let su = u * RES
        su = ((su % US) + US) % US
        const i0 = su | 0
        const f = su - i0
        const i1 = (i0 + 1) % US
        const o = j * US
        const ht = HT[o + i0] + (HT[o + i1] - HT[o + i0]) * f
        const h = ht * dy
        const top = base - h
        const r0 = Math.max(0, Math.ceil(top - 0.5))
        if (r0 >= ub) continue
        const slope = SL[o + i0] + (SL[o + i1] - SL[o + i0]) * f
        for (let r = r0; r < ub; r++) {
          const k = r * W + x
          mat[k] = SEA
          lay[k] = j
          sv[k] = (base - r - 0.5) / h
          sl[k] = slope
          uu[k] = u
          dtop[k] = r + 0.5 - top
        }
        ub = r0
      }
    }

    // --- shade every cell -------------------------------------------------
    const sr = SR + 0.35 * pulse
    const glowK = 1 + 0.12 * pulse
    for (let r = 0; r < H; r++) {
      const y = r + 0.5
      for (let x = 0; x < W; x++) {
        const k = r * W + x
        const m = mat[k]
        const dx = x + 0.5 - SUN_X
        const dsy = y - SUN_Y
        const ds = Math.sqrt(dx * dx + dsy * dsy * 2.2)
        const near = Math.exp(-Math.abs(dx) / 55)
        let cr = 0
        let cg = 0
        let cb = 0
        if (m === SKY) {
          const s = k * 3
          cr = sky[s]
          cg = sky[s + 1]
          cb = sky[s + 2]
          // the sun's glow, breathing
          const glow = (Math.exp(-ds / 30) * 0.3 + Math.exp(-ds / 11) * 0.35) * glowK
          cr += glow
          cg += glow * 0.55
          cb += glow * 0.18
          const dd = Math.sqrt(dx * dx + dsy * dsy)
          if (dd < sr + 0.6) {
            // the disc, hot at the core and deeper at the rim
            const e = dd / sr
            const a = smooth(sr + 0.45, sr - 0.45, dd)
            cr = mix(cr, 1.0, a)
            cg = mix(cg, 0.94 - 0.3 * e * e * e, a)
            cb = mix(cb, 0.78 - 0.5 * e * e, a)
          }
          // the first stars, high up where the sky has gone to charcoal
          if (r < 16 && hash(x, r * 5 + 3) > 0.992) {
            const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + hash(r, x) * 1.6) + hash(x, r) * 6.28)
            const st = tw * smooth(16, 2, r) * 0.7
            cr = Math.max(cr, st * 0.95)
            cg = Math.max(cg, st * 0.92)
            cb = Math.max(cb, st * 0.86)
          }
        } else {
          const j = lay[k]
          const dy = DY[j]
          const s = sv[k]
          const u = uu[k]
          // The sun is ahead of us, so each billow is backlit: a burning rim
          // along its top, its face toward us in shade, deeper further down.
          const dt = dtop[k]
          const rim = Math.exp(-dt / (0.7 + 0.06 * dy))
          const face = clamp(s)
          // the flank turned toward the sun catches more of it
          const side = clamp(0.5 - sl[k] * (dx < 0 ? -1 : 1) * 0.9)
          const close = smooth(3, 14, dy)
          const tex = (noise(u * 3.2, s * 2.5 + j * 5.3, 0) - 0.5) * 0.18 * close
          // light running over the tops
          const sh = noise(u * 2.2 - t * 0.35, j * 1.7 + t * 0.25, 0)
          const shimmer = smooth(0.55, 0.85, sh) * rim * (0.1 + 0.45 * near)
          const az = 0.25 + 0.9 * near
          let b = (0.07 + 0.17 * face + 0.22 * (side - 0.5) * face + tex) * az + rim * (0.22 + 0.55 * near) + shimmer
          b -= 0.2 * smooth(0, -0.6, s)
          b = clamp(b * (0.9 + 0.12 * smooth(30, 4, dy)))
          const ci = ((b * 255) | 0) * 3
          cr = SEAT[ci]
          cg = SEAT[ci + 1]
          cb = SEAT[ci + 2]
          // away from the sun the shade between the rims goes to dusk grey
          const cool = (1 - near) * (1 - rim) * 0.7
          cr = mix(cr, 0.07 * az, cool)
          cg = mix(cg, 0.068 * az, cool)
          cb = mix(cb, 0.072 * az, cool)
          // far rows melt into the glow at the horizon
          const haze = Math.exp(-dy / 5) * 0.85
          const hg = (Math.exp(-ds / 26) * 0.5 + 0.5 * near) * glowK
          cr = mix(cr, 0.17 + 0.83 * hg, haze)
          cg = mix(cg, 0.16 + 0.48 * hg, haze)
          cb = mix(cb, 0.17, haze)
          // the sun's bloom over the cloud tops around it
          const bloom = Math.exp(-ds / 13) * 0.5 * glowK * (0.4 + rim)
          cr += bloom
          cg += bloom * 0.62
          cb += bloom * 0.25
        }
        FR[k] = cr
        FG[k] = cg
        FB[k] = cb
      }
    }

    // --- a few birds crossing ----------------------------------------------
    for (let i = 0; i < 3; i++) {
      const bx = Math.floor(((t * (4.5 + i * 0.4) + i * 11 + 30) % (W + 40)) - 20)
      const by = Math.round(16 + i * 2.6 + 0.8 * Math.sin(t * 0.9 + i * 2))
      const up = Math.sin(t * 7 + i * 1.9) > 0
      // a body and two wings, raised or swept down
      const cells = up
        ? [[0, 0], [-1, -1], [1, -1], [-2, -1], [2, -1]]
        : [[0, 0], [-1, 0], [1, 0], [-2, 1], [2, 1]]
      for (const [ox, oy] of cells) {
        const x = bx + ox
        const r = by + oy
        if (x < 0 || x >= W || r < 0 || r >= H) continue
        const k = r * W + x
        if (mat[k] !== SKY) continue
        FR[k] = 0.3
        FG[k] = 0.18
        FB[k] = 0.12
      }
    }

    // --- halftone: dot size from brightness, ordered dither ----------------
    for (let r = 0; r < H; r++) {
      // the bottom rows thin out into the ground
      const fade = smooth(H + 4, H - 6, r + 0.5)
      for (let x = 0; x < W; x++) {
        const k = r * W + x
        const m = mat[k]
        const cr = FR[k]
        const cg = FG[k]
        const cb = FB[k]
        const floor = m === SKY ? 0.04 : 0.06
        const fadeK = m === SEA ? fade : 1
        const peak = Math.max(cr, cg, cb, 1e-4)
        const level = clamp(floor + (1 - floor) * Math.pow(peak, 0.85) * 0.95) * fadeK
        const step = Math.max(0, Math.min(3, Math.round(level * 3 + BAYER[(r & 3) * 4 + (x & 3)])))
        out.steps[k] = step
        out.lum[k] = clamp(0.3 * cr + 0.59 * cg + 0.11 * cb)
      }
    }
  }
}
