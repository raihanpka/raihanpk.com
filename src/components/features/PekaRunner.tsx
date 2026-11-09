import { useEffect, useRef } from 'react'
import { BODY_JUMP, BODY_RUN_A, BODY_RUN_B, PLAYER_X, createRunner, headMask, jump, step } from '@/lib/runner'

const SRC = '/static/profile/avatar-ink.png'
const HEAD_COLS = 22
const HEAD_ROWS = 25
const BODY_ROWS = 6
const BODY_COLS = 14
const GROUND = 0.9 // the ground line, as a share of the height
const FRAME_MS = 1000 / 30

/**
 * A runner built from the profile drawing: the head is the drawing sampled to pixels, the body is
 * a small pixel body with two run frames and a jump frame. Runs by itself, tap or click to jump.
 * Pauses off screen, and shows one still frame under reduced motion.
 */
export default function PekaRunner() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const runner = createRunner(7)
    let head: boolean[][] | null = null
    let dpr = 1
    let w = 0
    let h = 0
    let cell = 3 // css px per pixel of the sprite
    let running = false
    let animT = 0
    let last = -Infinity
    let rafId = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // the sprite is head plus body, about 60% of the band it runs in
      cell = Math.max(2, (h * 0.6) / (HEAD_ROWS + BODY_ROWS))
      draw()
    }

    const draw = () => {
      if (!head) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const color = getComputedStyle(canvas).color
      ctx.fillStyle = color

      const groundY = h * GROUND
      // ground: a dashed line that scrolls with the run
      ctx.globalAlpha = 0.35
      const offset = (runner.distance * cell) % (cell * 8)
      for (let x = -offset; x < w; x += cell * 8) ctx.fillRect(x, groundY + cell * 2, cell * 4, cell)

      // cacti
      ctx.globalAlpha = 0.6
      for (const c of runner.cacti) ctx.fillRect(c.x * cell, groundY - c.h * cell, c.w * cell, c.h * cell)

      // the character
      ctx.globalAlpha = 1
      const spriteH = (HEAD_ROWS + BODY_ROWS) * cell
      const left = PLAYER_X * cell
      const top = groundY - runner.y * cell - spriteH
      for (let r = 0; r < HEAD_ROWS; r++) {
        for (let c = 0; c < HEAD_COLS; c++) {
          if (head[r][c]) ctx.fillRect(left + c * cell, top + r * cell, cell, cell)
        }
      }
      const frame = runner.y > 0 ? BODY_JUMP : Math.floor(animT * 8) % 2 ? BODY_RUN_B : BODY_RUN_A
      const bodyLeft = left + Math.floor((HEAD_COLS - BODY_COLS) / 2) * cell
      frame.forEach((line, r) => {
        for (let c = 0; c < line.length; c++) {
          if (line[c] === '#') ctx.fillRect(bodyLeft + c * cell, top + (HEAD_ROWS + r) * cell, cell, cell)
        }
      })
    }

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (!running) return
      if (now - last < FRAME_MS - 4) return
      const dt = last === -Infinity ? 1 / 30 : Math.min(0.1, (now - last) / 1000)
      last = now
      animT += dt
      step(runner, dt, w / cell)
      draw()
    }

    const img = new Image()
    img.onload = () => {
      const scratch = document.createElement('canvas')
      scratch.width = img.naturalWidth
      scratch.height = img.naturalHeight
      const sctx = scratch.getContext('2d')
      if (!sctx) return
      sctx.drawImage(img, 0, 0)
      const data = sctx.getImageData(0, 0, scratch.width, scratch.height).data
      head = headMask(data, scratch.width, scratch.height, HEAD_COLS, HEAD_ROWS)
      resize()
      if (!reduceMotion) {
        const io = new IntersectionObserver(([entry]) => {
          running = entry.isIntersecting
          if (running) last = -Infinity
        })
        io.observe(canvas)
        ioRef = io
        rafId = requestAnimationFrame(loop)
      }
    }
    let ioRef: IntersectionObserver | null = null
    img.src = SRC

    const onTap = () => jump(runner)
    const onResize = () => resize()
    canvas.addEventListener('pointerdown', onTap)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      ioRef?.disconnect()
      canvas.removeEventListener('pointerdown', onTap)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-auto absolute inset-x-0 bottom-0 h-2/5 w-full text-foreground" />
}
