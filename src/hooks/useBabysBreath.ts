import { useEffect, type RefObject } from 'react'
import { bayer4 } from '@/lib/bayer'
import { compose, groundField } from '@/lib/babys-breath'

interface Options {
  /** Cell size in CSS px */
  cell?: number
  /** Redraw interval in ms while animating */
  frameInterval?: number
  /** Time in seconds used for the still frame, chosen so a petal or two is already in the air */
  still?: number
}

/**
 * Draws the dithered baby's breath band. A still frame is drawn first, then the wind
 * starts after the page has loaded and the browser is idle. It stops offscreen,
 * on hidden tabs, and for reduced motion.
 */
export function useBabysBreath(canvasRef: RefObject<HTMLCanvasElement | null>, { cell = 3, frameInterval = 40, still = 2.4 }: Options = {}) {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const startedAt = performance.now()
    let cols = 0
    let rows = 0
    let ground: Float32Array = new Float32Array(0)
    let color = ''
    let raf = 0
    let last = 0
    let disposed = false
    let onScreen = true
    let animating = false

    const readColor = () => {
      color = getComputedStyle(canvas).color
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      cols = Math.floor(rect.width / cell)
      rows = Math.floor(rect.height / cell)
      ground = groundField(cols, rows)
    }

    const draw = (t: number) => {
      if (disposed || cols === 0 || rows === 0) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = color
      const px = cell * dpr
      const dot = Math.max(1, px - dpr)
      const field = compose(cols, rows, t, ground)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (field[r * cols + c] > bayer4(c, r)) ctx.fillRect(c * px, r * px, dot, dot)
        }
      }
    }

    const time = (now: number) => still + (now - startedAt) / 1000

    const loop = (now: number) => {
      raf = 0
      if (disposed || !onScreen || document.hidden) return
      if (now - last >= frameInterval) {
        last = now
        draw(time(now))
      }
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (!animating || raf || !onScreen || document.hidden) return
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    readColor()
    resize()
    draw(still)
    canvas.style.removeProperty('opacity')

    const begin = () => {
      if (disposed || reduceMotion) return
      animating = true
      start()
    }
    const scheduleBegin = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (idle) idle(begin, { timeout: 1500 })
      else window.setTimeout(begin, 300)
    }
    if (document.readyState === 'complete') scheduleBegin()
    else window.addEventListener('load', scheduleBegin, { once: true })

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) start()
      else stop()
    })
    io.observe(canvas)

    const ro = new ResizeObserver(() => {
      resize()
      draw(animating ? time(performance.now()) : still)
    })
    ro.observe(canvas)

    const mo = new MutationObserver(() => {
      readColor()
      draw(animating ? time(performance.now()) : still)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      stop()
      io.disconnect()
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canvasRef, cell, frameInterval, still])
}
