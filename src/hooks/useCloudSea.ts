import { useEffect, type RefObject } from 'react'
import { COLS, ROWS, DOT_SIZE, createCloudSea, createCloudSeaFrame, type CloudSeaFrame } from '@/lib/cloud-sea'

/** Buffer pixels per scene cell. The dots are drawn here, then scaled up to the viewport. */
const SCALE = 6
/** 30 fps: the frame is computed in about 1 ms, so the cap is the only cost to limit. */
const FRAME_MS = 1000 / 30
/**
 * The dots take the theme's foreground token, so they match the text in both themes.
 * The token is stored as "h s% l%" (see global.css), so it is parsed from there.
 */
function readInk(): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim()
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
    let inkRgb = readInk()
    const paint = () => {
      const [ir, ig, ib] = inkRgb
      const ink = ir | (ig << 8) | (ib << 16)
      pixels.fill(0)

      for (let cy = 0; cy < ROWS; cy++) {
        for (let cx = 0; cx < COLS; cx++) {
          const k = cy * COLS + cx
          const step = frame.steps[k]
          if (step === 0) continue
          const radius = (DOT_SIZE[step] * SCALE) / 2
          const cxp = (cx + 0.5) * SCALE
          const cyp = (cy + 0.5) * SCALE
          const alphaK = 0.15 + 0.85 * frame.lum[k]
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
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(buffer, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh)

      if (!revealed) {
        revealed = true
        canvas.style.removeProperty('opacity')
      }
    }

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (now - last < FRAME_MS) return
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
      inkRgb = readInk()
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
