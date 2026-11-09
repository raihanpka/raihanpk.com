import { useEffect, useRef } from 'react'
import { CACTI, CACTUS_UNIT, PLAYER_X, createRunner, jump, step } from '@/lib/runner'

const SHEET = '/static/runner/peka-sheet.png'
// the sheet is four 24x32 frames side by side: idle, run A, run B, jump
const FRAME_W = 24
const FRAME_H = 32
const FRAME = { idle: 0, runA: 1, runB: 2, jump: 3 } as const
const GROUND = 0.9 // the ground line, as a share of the band height
const FRAME_MS = 1000 / 30

/**
 * The About runner. The character is a static sprite sheet built from the profile photo
 * (scripts/make-runner-sprite.ts). It runs and jumps by itself, cacti come in at random, and a tap or
 * click jumps too. It pauses off screen and shows one still frame under reduced motion.
 */
export default function PekaRunner() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // a new run on every visit
    const runner = createRunner(Math.floor(Math.random() * 1e9) + 1)
    const sheet = new Image()
    let loaded = false
    let dpr = 1
    let w = 0
    let h = 0
    let s = 3 // screen px per world unit (one sprite pixel)
    let running = false
    let animT = 0
    let last = -Infinity
    let rafId = 0
    let io: IntersectionObserver | null = null

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // the figure is 32 sprite pixels tall and takes about 80% of the band
      s = Math.max(2, Math.min(6, Math.floor((h * 0.8) / FRAME_H)))
      draw()
    }

    const draw = () => {
      if (!loaded) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = getComputedStyle(canvas).color

      const groundY = h * GROUND
      // ground: a dashed line with a few pebbles, scrolling with the run
      ctx.globalAlpha = 0.4
      const dash = s * 9
      const offset = (runner.distance * s) % dash
      for (let x = -offset; x < w; x += dash) ctx.fillRect(x, groundY + s * 2, s * 5, s)
      ctx.globalAlpha = 0.25
      for (let x = -offset + dash * 0.5; x < w; x += dash * 2.3) ctx.fillRect(x, groundY + s * 4, s * 2, s)

      // cacti, drawn from their pixel shapes
      ctx.globalAlpha = 0.75
      for (const c of runner.cacti) {
        const rows = CACTI[c.shape]
        const x0 = c.x * s
        const y0 = groundY - c.h * s
        rows.forEach((row, r) => {
          for (let i = 0; i < row.length; i++) {
            if (row[i] === '#') ctx.fillRect(x0 + i * CACTUS_UNIT * s, y0 + r * CACTUS_UNIT * s, CACTUS_UNIT * s, CACTUS_UNIT * s)
          }
        })
      }

      // the character, from the sheet
      ctx.globalAlpha = 1
      const frame = runner.y > 0 ? FRAME.jump : reduceMotion ? FRAME.idle : Math.floor(animT * 8) % 2 ? FRAME.runB : FRAME.runA
      const dx = PLAYER_X * s
      const dy = groundY - runner.y * s - FRAME_H * s
      ctx.drawImage(sheet, frame * FRAME_W, 0, FRAME_W, FRAME_H, dx, dy, FRAME_W * s, FRAME_H * s)
    }

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (!running) return
      if (now - last < FRAME_MS - 4) return
      const dt = last === -Infinity ? 1 / 30 : Math.min(0.1, (now - last) / 1000)
      last = now
      animT += dt
      step(runner, dt, w / s)
      draw()
    }

    sheet.onload = () => {
      loaded = true
      resize()
      if (!reduceMotion) {
        io = new IntersectionObserver(([entry]) => {
          running = entry.isIntersecting
          if (running) last = -Infinity
        })
        io.observe(canvas)
        rafId = requestAnimationFrame(loop)
      }
    }
    sheet.src = SHEET

    const onTap = () => jump(runner)
    const onResize = () => resize()
    canvas.addEventListener('pointerdown', onTap)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      io?.disconnect()
      canvas.removeEventListener('pointerdown', onTap)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-auto absolute inset-x-0 bottom-0 h-[45%] w-full text-foreground" />
}
