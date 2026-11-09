// Usage: bun scripts/slice-sprites.ts <sheet.rgb> <width> <height> <outDir> [--exclude x,y,w,h ...] [--min N]
// Cuts a sprite sheet into one PNG per sprite. Input is raw RGB (ffmpeg -f rawvideo -pix_fmt rgb24).
// The sheet's checkerboard is treated as background: any light grey or white pixel that can be reached
// from the image edge through other light grey or white pixels. Everything else is a sprite pixel, so
// white shirts and bright parts stay inside their outline. Sprites are the 8-connected groups of sprite
// pixels, saved with transparency outside the group. Pass --exclude to skip printed text in the sheet.
// Pass --fit H to scale every sprite to H pixels tall (area average, hard alpha), for in-game sizes.
// Pass --grid C to name the files by grid cell (r<row>c<col>, C sprites per row) instead of 01, 02, ...
// Light pixels that sit inside a sprite's outline (a grey panel, a white shirt) are kept: only light pixels
// that reach the edge of the sprite's box are cleared.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const args = process.argv.slice(2)
const [file, ws, hs, outDir] = args
if (!file || !ws || !hs || !outDir) throw new Error('usage: bun scripts/slice-sprites.ts <sheet.rgb> <w> <h> <outDir> [--exclude x,y,w,h] [--min N]')
const W = Number(ws)
const H = Number(hs)
const excludes: number[][] = []
let minSize = 60
let fit = 0
let gridCols = 0
for (let i = 4; i < args.length; i++) {
  if (args[i] === '--exclude') excludes.push(args[++i].split(',').map(Number))
  if (args[i] === '--min') minSize = Number(args[++i])
  if (args[i] === '--fit') fit = Number(args[++i])
  if (args[i] === '--grid') gridCols = Number(args[++i])
}

const rgb = new Uint8Array(await Bun.file(file).arrayBuffer())
const N = W * H
const lum = new Uint8Array(N)
const light = new Uint8Array(N) // 1 = light grey or white (checker candidate)
for (let i = 0; i < N; i++) {
  const r = rgb[i * 3]
  const g = rgb[i * 3 + 1]
  const b = rgb[i * 3 + 2]
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  lum[i] = (r * 77 + g * 150 + b * 29) >> 8
  light[i] = mx - mn <= 36 && lum[i] >= 150 ? 1 : 0
}

// flood the background from the edges through light pixels
const bg = new Uint8Array(N)
const queue = new Int32Array(N)
let qh = 0
let qt = 0
const push = (i: number) => {
  if (light[i] && !bg[i]) {
    bg[i] = 1
    queue[qt++] = i
  }
}
for (let x = 0; x < W; x++) {
  push(x)
  push((H - 1) * W + x)
}
for (let y = 0; y < H; y++) {
  push(y * W)
  push(y * W + W - 1)
}
while (qh < qt) {
  const i = queue[qh++]
  const x = i % W
  if (x > 0) push(i - 1)
  if (x < W - 1) push(i + 1)
  if (i >= W) push(i - W)
  if (i < N - W) push(i + W)
}

// 8-connected groups of sprite pixels
const label = new Int32Array(N).fill(-1)
const groups: { pixels: number[]; x0: number; y0: number; x1: number; y1: number }[] = []
for (let s = 0; s < N; s++) {
  if (bg[s] || label[s] >= 0) continue
  const id = groups.length
  const g = { pixels: [] as number[], x0: W, y0: H, x1: 0, y1: 0 }
  const q: number[] = [s]
  label[s] = id
  while (q.length) {
    const i = q.pop()!
    g.pixels.push(i)
    const x = i % W
    const y = (i - x) / W
    g.x0 = Math.min(g.x0, x)
    g.x1 = Math.max(g.x1, x)
    g.y0 = Math.min(g.y0, y)
    g.y1 = Math.max(g.y1, y)
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
        const j = ny * W + nx
        if (bg[j] || label[j] >= 0) continue
        label[j] = id
        q.push(j)
      }
    }
  }
  groups.push(g)
}

const hits = (g: { x0: number; y0: number; x1: number; y1: number }, r: number[]) =>
  g.x0 < r[0] + r[2] && g.x1 >= r[0] && g.y0 < r[1] + r[3] && g.y1 >= r[1]
const kept = groups
  .filter((g) => g.pixels.length >= minSize)
  .filter((g) => !excludes.some((r) => hits(g, r)))
  .sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0)

// PNG encode (RGBA)
const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (b: Buffer) => {
  let c = 0xffffffff
  for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}
const writePng = (w: number, h: number, rgba: Uint8Array) => {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const raw = Buffer.alloc((w * 4 + 1) * h)
  for (let y = 0; y < h; y++) Buffer.from(rgba.buffer, y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1)
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

// area average to `th` pixels tall, colour weighted by alpha, alpha hard at half coverage
function downscale(src: Uint8Array, sw: number, sh: number, th: number) {
  const k = th / sh
  const w = Math.max(1, Math.round(sw * k))
  const h = th
  const out = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    const y0 = (y * sh) / h
    const y1 = ((y + 1) * sh) / h
    for (let x = 0; x < w; x++) {
      const x0 = (x * sw) / w
      const x1 = ((x + 1) * sw) / w
      let r = 0, gg = 0, b = 0, a = 0, n = 0
      for (let yy = Math.floor(y0); yy < Math.ceil(y1) && yy < sh; yy++) {
        for (let xx = Math.floor(x0); xx < Math.ceil(x1) && xx < sw; xx++) {
          const o = (yy * sw + xx) * 4
          n++
          if (src[o + 3]) { a++; r += src[o]; gg += src[o + 1]; b += src[o + 2] }
        }
      }
      const o = (y * w + x) * 4
      if (n && a * 2 >= n) {
        out[o] = Math.round(r / a)
        out[o + 1] = Math.round(gg / a)
        out[o + 2] = Math.round(b / a)
        out[o + 3] = 255
      }
    }
  }
  return { w, h, rgba: out }
}

mkdirSync(outDir, { recursive: true })
const index: { file: string; x: number; y: number; w: number; h: number }[] = []
kept.forEach((g, n) => {
  const sw = g.x1 - g.x0 + 1
  const sh = g.y1 - g.y0 + 1
  // colours for the whole box; alpha 255 only for this group's own pixels
  const src = new Uint8Array(sw * sh * 4)
  const boxIdx = new Int32Array(sw * sh)
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const i = (y + g.y0) * W + (x + g.x0)
      const o = (y * sw + x) * 4
      boxIdx[y * sw + x] = i
      src[o] = rgb[i * 3]
      src[o + 1] = rgb[i * 3 + 1]
      src[o + 2] = rgb[i * 3 + 2]
    }
  }
  for (const i of g.pixels) {
    const x = i % W
    const y = (i - x) / W
    src[((y - g.y0) * sw + (x - g.x0)) * 4 + 3] = 255
  }
  // clear only the background that reaches the box edge; enclosed light pixels stay opaque
  const reach = new Uint8Array(sw * sh)
  const rq: number[] = []
  const edge = (i: number) => {
    if (src[i * 4 + 3] === 0 && !reach[i]) {
      reach[i] = 1
      rq.push(i)
    }
  }
  for (let x = 0; x < sw; x++) {
    edge(x)
    edge((sh - 1) * sw + x)
  }
  for (let y = 0; y < sh; y++) {
    edge(y * sw)
    edge(y * sw + sw - 1)
  }
  for (let qi = 0; qi < rq.length; qi++) {
    const i = rq[qi]
    const x = i % sw
    if (x > 0) edge(i - 1)
    if (x < sw - 1) edge(i + 1)
    if (i >= sw) edge(i - sw)
    if (i < sw * (sh - 1)) edge(i + sw)
  }
  // enclosed light pixels are part of the sprite (a panel, a shirt), so they stay opaque
  for (let i = 0; i < sw * sh; i++) if (!reach[i] && light[boxIdx[i]]) src[i * 4 + 3] = 255
  const { w, h, rgba } = fit ? downscale(src, sw, sh, fit) : { w: sw, h: sh, rgba: src }
  const name = gridCols ? `r${Math.floor(n / gridCols) + 1}c${(n % gridCols) + 1}.png` : `${String(n + 1).padStart(2, '0')}.png`
  writeFileSync(`${outDir}/${name}`, writePng(w, h, rgba))
  index.push({ file: name, x: g.x0, y: g.y0, w, h })
})
writeFileSync(`${outDir}/index.json`, JSON.stringify(index, null, 2) + '\n')
console.log(`${kept.length} sprites (of ${groups.length} groups) -> ${outDir}`)
for (const e of index) console.log(`${e.file}  ${e.w}x${e.h} at ${e.x},${e.y}`)
