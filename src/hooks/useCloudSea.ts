import { useEffect, type RefObject } from 'react'
import { COLS, ROWS, DOT_SIZE, createCloudSea, createCloudSeaFrame, type CloudSeaFrame } from '@/lib/cloud-sea'

/** Buffer pixels per scene cell. The dots are drawn here, then scaled up to the viewport. */
const SCALE = 6
/** The sun's place in the scene grid, from the cloud sea source (x 150 of 200, y 41.5 of 100). */
const SUN_COL = 150
const SUN_ROW = 41.5
/** 30 fps: the frame is computed in about 1 ms, so the cap is the only cost to limit. */
const FRAME_MS = 1000 / 30
/** Reads an HSL token ("h s% l%", see global.css) as an RGB triple. */
function tokenRgb(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const [h, s, l] = raw.split(/\s+/).map((v) => parseFloat(v))
  const sat = s / 100
  const lig = l / 100
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const [r1, g1, b1] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x]
  const m = lig - c / 2
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)]
}

/** Three tones from the tokens: muted for the far sky, foreground for the lit edges, sun for the warm cells. */
function readInks(): { muted: [number, number, number]; fg: [number, number, number]; sun: [number, number, number] } {
  return { muted: tokenRgb('--muted-foreground'), fg: tokenRgb('--foreground'), sun: tokenRgb('--sun') }
}

/**
 * Draws the cloud sea as halftone dots behind the page, at 30 fps.
 * Pauses when the tab is hidden (requestAnimationFrame stops), and draws one still frame under reduced motion.
 */
export function useCloudSea(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bw = COLS * SCALE
    const bh = ROWS * SCALE
    const buffer = document.createElement('canvas')
    buffer.width = bw
    buffer.height = bh
    const bctx = buffer.getContext('2d')
    if (!bctx) return
    const image = bctx.createImageData(bw, bh)
    // one Uint32 per pixel: a single write sets all four RGBA bytes (little-endian)
    const pixels = new Uint32Array(image.data.buffer)

    const render = createCloudSea()
    const frame: CloudSeaFrame = createCloudSeaFrame()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const startedAt = performance.now()

    let rafId = 0
    let last = -Infinity
    let revealed = false

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }

    // Rasterise the frame's dots into the buffer, then cover-fit it to the canvas.
    let inks = readInks()
    const paint = () => {
      pixels.fill(0)

      for (let cy = 0; cy < ROWS; cy++) {
        for (let cx = 0; cx < COLS; cx++) {
          const k = cy * COLS + cx
          const step = frame.steps[k]
          // dark sky stays empty: only the brighter cells and the sea draw a dot
          if (step === 0 || (frame.lum[k] < 0.12 && frame.warm[k] < 0.05)) continue
          const radius = (DOT_SIZE[step] * SCALE) / 2
          const cxp = (cx + 0.5) * SCALE
          const cyp = (cy + 0.5) * SCALE
          const lum = frame.lum[k]
          const warm = frame.warm[k]
          // tone: muted grey in the shade, foreground on the lit edges, then pushed toward the sun
          const tr = inks.muted[0] + (inks.fg[0] - inks.muted[0]) * lum
          const tg = inks.muted[1] + (inks.fg[1] - inks.muted[1]) * lum
          const tb = inks.muted[2] + (inks.fg[2] - inks.muted[2]) * lum
          const ir = Math.round(tr + (inks.sun[0] - tr) * warm)
          const ig = Math.round(tg + (inks.sun[1] - tg) * warm)
          const ib = Math.round(tb + (inks.sun[2] - tb) * warm)
          const ink = (ir | (ig << 8) | (ib << 16)) >>> 0
          const alphaK = 0.35 + 0.65 * lum
          const x0 = cx * SCALE
          const y0 = cy * SCALE
          for (let py = y0; py < y0 + SCALE; py++) {
            const dy = py + 0.5 - cyp
            for (let px = x0; px < x0 + SCALE; px++) {
              const dx = px + 0.5 - cxp
              const d = Math.sqrt(dx * dx + dy * dy)
              // a one pixel soft edge, so small dots stay round
              const cov = Math.min(1, Math.max(0, radius - d + 0.5))
              if (cov <= 0) continue
              pixels[py * bw + px] = (((Math.round(cov * alphaK * 255) << 24) | ink) >>> 0)
            }
          }
        }
      }

      bctx.putImageData(image, 0, 0)
      // cover: the scene keeps its 2:1 shape and is cropped to fill the viewport
      const scale = Math.max(canvas.width / bw, canvas.height / bh)
      const dw = bw * scale
      const dh = bh * scale
      const ox = (canvas.width - dw) / 2
      const oy = (canvas.height - dh) / 2
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // the sun as a soft glow, under the dots
      const sx = ox + (SUN_COL / COLS) * dw
      const sy = oy + (SUN_ROW / ROWS) * dh
      const r = dw * 0.3
      const [sr, sg, sb] = inks.sun
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r)
      glow.addColorStop(0, `rgba(${sr}, ${sg}, ${sb}, 0.9)`)
      glow.addColorStop(0.3, `rgba(${sr}, ${sg}, ${sb}, 0.4)`)
      glow.addColorStop(1, `rgba(${sr}, ${sg}, ${sb}, 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(sx - r, sy - r, r * 2, r * 2)

      ctx.drawImage(buffer, ox, oy, dw, dh)

      if (!revealed) {
        revealed = true
        canvas.style.removeProperty('opacity')
      }
    }

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      // 4 ms slack: a 60 Hz display steps by 16.7 ms, so a frame landing just early would otherwise be skipped
      if (now - last < FRAME_MS - 4) return
      last = now
      render((now - startedAt) / 1000, frame)
      paint()
    }

    resize()
    if (reduceMotion) {
      // one still frame at a fixed time, so it looks the same on every visit
      render(12, frame)
      paint()
    } else {
      rafId = requestAnimationFrame(loop)
    }

    // The viewport can resize, and the theme can flip, while a still frame is on screen.
    const still = () => {
      if (!reduceMotion) return
      render(12, frame)
      paint()
    }
    const onResize = () => {
      resize()
      still()
    }
    window.addEventListener('resize', onResize)
    const mo = new MutationObserver(() => {
      inks = readInks()
      still()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      mo.disconnect()
    }
  }, [canvasRef])
}
