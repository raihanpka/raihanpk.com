// Usage: bun scripts/make-runner-sprite.ts <profile.png> <out.png>
// Builds the About runner's static sprite sheet from the profile photo: the head is the photo sampled to a
// 14x14 grid and toned to a few colours; the body is drawn from rectangles, with four frames (idle, run A,
// run B, jump). Each frame is 24x32 pixels, laid out side by side. An outline is added last.
import { inflateSync, deflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'

const [src, out] = process.argv.slice(2)
if (!src || !out) throw new Error('usage: bun scripts/make-runner-sprite.ts <profile.png> <out.png>')

// ---- PNG decode (8-bit RGBA or RGB, non-interlaced) -------------------------------------------
function readPng(buf: Buffer): { w: number; h: number; rgba: Uint8Array } {
  let p = 8
  let w = 0
  let h = 0
  let colorType = 0
  const idat: Buffer[] = []
  while (p < buf.length) {
    const len = buf.readUInt32BE(p)
    const type = buf.toString('ascii', p + 4, p + 8)
    const data = buf.subarray(p + 8, p + 8 + len)
    if (type === 'IHDR') {
      w = data.readUInt32BE(0)
      h = data.readUInt32BE(4)
      colorType = data[9]
    } else if (type === 'IDAT') idat.push(data)
    p += 12 + len
  }
  const bpp = colorType === 6 ? 4 : 3
  const raw = inflateSync(Buffer.concat(idat))
  const stride = w * bpp
  const pix = new Uint8Array(w * h * bpp)
  let prev = new Uint8Array(stride)
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)]
    const line = new Uint8Array(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? line[x - bpp] : 0
      const b = prev[x]
      const c = x >= bpp ? prev[x - bpp] : 0
      let v = line[x]
      if (f === 1) v += a
      else if (f === 2) v += b
      else if (f === 3) v += (a + b) >> 1
      else if (f === 4) {
        const pa = Math.abs(b - c)
        const pb = Math.abs(a - c)
        const pc = Math.abs(a + b - 2 * c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      line[x] = v & 255
    }
    pix.set(line, y * stride)
    prev = line
  }
  const rgba = new Uint8Array(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = pix[i * bpp]
    rgba[i * 4 + 1] = pix[i * bpp + 1]
    rgba[i * 4 + 2] = pix[i * bpp + 2]
    rgba[i * 4 + 3] = bpp === 4 ? pix[i * bpp + 3] : 255
  }
  return { w, h, rgba }
}

// ---- PNG encode (RGBA) ------------------------------------------------------------------------
const CRC = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(b: Buffer): number {
  let c = 0xffffffff
  for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
function writePng(w: number, h: number, rgba: Uint8Array): Buffer {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0
    Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---- the sprite -------------------------------------------------------------------------------
const FW = 24
const FH = 32
const HEAD = 14 // head grid, cells
const HEAD_X = 5
const HEAD_Y = 1
const BODY_TOP = 15

const INK = [0x15, 0x15, 0x1b, 255]
const PALETTE: Record<number, number[]> = {
  1: INK,
  2: [0xc8, 0xa8, 0x8a, 255], // skin shade
  3: [0xf3, 0xdc, 0xc4, 255], // skin light
  4: [0xf4, 0xf4, 0xf1, 255], // shirt
  5: [0xc9, 0xc9, 0xc4, 255], // shirt shade
  6: [0x3b, 0x42, 0x52, 255], // trousers
}

type Rect = [x: number, y: number, w: number, h: number, colour: number]

// body shapes, per frame; y values are sprite rows
const TORSO: Rect[] = [
  [7, 15, 10, 8, 4],
  [7, 22, 10, 1, 5],
  [4, 16, 3, 6, 4],
  [17, 16, 3, 6, 4],
  [4, 22, 3, 2, 3],
  [17, 22, 3, 2, 3],
]
const FRAMES: Record<'idle' | 'runA' | 'runB' | 'jump', Rect[]> = {
  idle: [
    ...TORSO,
    [8, 23, 4, 6, 6], [12, 23, 4, 6, 6],
    [7, 29, 5, 2, 1], [12, 29, 5, 2, 1],
  ],
  runA: [
    ...TORSO,
    [6, 23, 4, 5, 6], [13, 23, 4, 3, 6],
    [5, 28, 5, 2, 1], [14, 26, 5, 2, 1],
  ],
  runB: [
    ...TORSO,
    [8, 23, 4, 3, 6], [13, 23, 4, 5, 6],
    [7, 26, 5, 2, 1], [13, 28, 5, 2, 1],
  ],
  jump: [
    [7, 15, 10, 8, 4],
    [7, 22, 10, 1, 5],
    [3, 11, 3, 6, 4],
    [18, 11, 3, 6, 4],
    [3, 10, 3, 1, 3],
    [18, 10, 3, 1, 3],
    [6, 23, 4, 5, 6], [14, 23, 4, 5, 6],
    [4, 28, 5, 2, 1], [15, 28, 5, 2, 1],
  ],
}

// the head: the photo's face, sampled to a grid, toned to four values, cut to an oval
const img = readPng(readFileSync(src))
const crop = { x0: 30, y0: 17, size: 36 }
const lums: number[] = []
for (let r = 0; r < HEAD; r++) {
  for (let c = 0; c < HEAD; c++) {
    const x0 = crop.x0 + Math.floor((c * crop.size) / HEAD)
    const x1 = crop.x0 + Math.floor(((c + 1) * crop.size) / HEAD)
    const y0 = crop.y0 + Math.floor((r * crop.size) / HEAD)
    const y1 = crop.y0 + Math.floor(((r + 1) * crop.size) / HEAD)
    let sum = 0
    let n = 0
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * img.w + x) * 4
        sum += (img.rgba[i] + img.rgba[i + 1] + img.rgba[i + 2]) / (3 * 255)
        n += 1
      }
    }
    lums.push(sum / n)
  }
}
// stretch the contrast of the face, then tone it
const lo = Math.min(...lums)
const hi = Math.max(...lums)
const headTone = lums.map((l) => (l - lo) / Math.max(0.001, hi - lo))

const names = ['idle', 'runA', 'runB', 'jump'] as const
const frameGrids: Uint8Array[][] = names.map((name) => {
  const g = Array.from({ length: FH }, () => new Uint8Array(FW))
  for (const [x, y, w, h, colour] of FRAMES[name]) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) g[yy][xx] = colour
  }
  // head, with an oval mask so the corners stay open
  for (let r = 0; r < HEAD; r++) {
    for (let c = 0; c < HEAD; c++) {
      const dx = (c + 0.5 - HEAD / 2) / (HEAD / 2)
      const dy = (r + 0.5 - HEAD / 2) / (HEAD / 2)
      if (dx * dx + dy * dy > 1) continue
      const t = headTone[r * HEAD + c]
      const tone = t < 0.2 ? 1 : t < 0.5 ? 2 : 3
      g[HEAD_Y + r][HEAD_X + c] = tone
    }
  }
  // glasses: two lenses on the eye row, joined by a bridge
  const eye = HEAD_Y + 6
  for (const x of [HEAD_X + 2, HEAD_X + 3, HEAD_X + 4, HEAD_X + 7, HEAD_X + 8, HEAD_X + 9]) g[eye][x] = 1
  g[eye + 1][HEAD_X + 2] = 1
  g[eye + 1][HEAD_X + 4] = 1
  g[eye + 1][HEAD_X + 7] = 1
  g[eye + 1][HEAD_X + 9] = 1
  // outline: any empty pixel next to a filled one becomes ink
  const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < FW && y < FH && g[y][x] !== 0
  const out = g.map((row) => row.slice())
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      if (g[y][x] !== 0) continue
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) out[y][x] = 1
    }
  }
  return out
})

const SW = FW * names.length
const rgba = new Uint8Array(SW * FH * 4)
frameGrids.forEach((g, f) => {
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const v = g[y][x]
      if (!v) continue
      const colour = PALETTE[v]
      const o = (y * SW + f * FW + x) * 4
      rgba[o] = colour[0]
      rgba[o + 1] = colour[1]
      rgba[o + 2] = colour[2]
      rgba[o + 3] = colour[3]
    }
  }
})
writeFileSync(out, writePng(SW, FH, rgba))
console.log(`wrote ${out} (${SW}x${FH}, frames: ${names.join(', ')})`)
