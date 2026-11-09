import { useEffect, useRef, useState } from 'react'
import { PLAYER_X, createRunner, jump, step, type ObstacleSize } from '@/lib/runner'

const BASE = '/static/sprites'
// the character frames, cut from the avatar sheet by grid cell (row, column):
// r1c1 faces the viewer, r4c2 and r4c4 are the run, r5c2 has the arms out
const FRAMES = { front: 'r1c1.png', runA: 'r4c2.png', runB: 'r4c4.png', jump: 'r5c2.png' } as const
const GROUND = 0.9 // the ground line, as a share of the band height
const FRAME_MS = 1000 / 30
const MAX_OBSTACLE_W = 44 // the compact obstacles only, so each one can be cleared
const TALK_MS = 3500 // how long a tap keeps the runner facing the viewer and the bubbles open
const LEAVE_MS = 1200 // how long the bubbles stay open after the pointer leaves

interface ObstacleFile extends ObstacleSize {
  file: string
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

interface Props {
  bubbles: string[]
}

/**
 * The About runner. The character and the obstacles are static sprites cut from the sprite sheets
 * (scripts/slice-sprites.ts). It runs and jumps by itself and obstacles come in at random. A tap, click or
 * hover turns it to face the viewer for a moment: the run pauses, the speech frames open, and then it turns
 * back and carries on. It pauses off screen and shows one still frame under reduced motion.
 */
export default function PekaRunner({ bubbles }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [talking, setTalking] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let disposed = false
    let dpr = 1
    let w = 0
    let h = 0
    let s = 3 // screen px per world unit (one sprite pixel)
    let running = false
    let animT = 0
    let last = -Infinity
    let rafId = 0
    let timer = 0
    let io: IntersectionObserver | null = null
    let runner: ReturnType<typeof createRunner> | null = null
    let obstacleImgs: HTMLImageElement[] = []
    let frameImgs: Record<keyof typeof FRAMES, HTMLImageElement> | null = null
    // talk state: a tap sets `until`, hovering keeps `hover` on, and `open` mirrors what the React side shows
    const talk = { until: 0, hover: false, open: false }

    const isTalking = (now: number) => talk.hover || now < talk.until
    const setOpen = (open: boolean) => {
      if (talk.open === open) return
      talk.open = open
      setTalking(open)
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // the character is 36 sprite pixels tall and takes about 80% of the band
      s = Math.max(2, Math.min(5, Math.floor((h * 0.8) / 36)))
      draw(talk.open)
    }

    const draw = (facing: boolean) => {
      if (!runner || !frameImgs) return
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

      // obstacles, from their sprites
      ctx.globalAlpha = 1
      for (const o of runner.obstacles) {
        const img = obstacleImgs[o.kind]
        if (!img) continue
        ctx.drawImage(img, o.x * s, groundY - o.h * s, o.w * s, o.h * s)
      }

      // the character: facing the viewer while talking, otherwise running
      const frame = facing || reduceMotion
        ? frameImgs.front
        : runner.y > 0
          ? frameImgs.jump
          : Math.floor(animT * 8) % 2
            ? frameImgs.runB
            : frameImgs.runA
      const dx = PLAYER_X * s
      const dh = frame.naturalHeight * s
      const dy = groundY - runner.y * s - dh
      ctx.drawImage(frame, dx, dy, frame.naturalWidth * s, dh)
    }

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop)
      if (!running || !runner) return
      if (now - last < FRAME_MS - 4) return
      const dt = last === -Infinity ? 1 / 30 : Math.min(0.1, (now - last) / 1000)
      last = now
      const talking = isTalking(now)
      setOpen(talking)
      // while talking the world stands still: the run pauses and the obstacles wait
      if (!talking) {
        animT += dt
        step(runner, dt, w / s)
      }
      draw(talking)
    }

    const start = async () => {
      const index: ObstacleFile[] = await fetch(`${BASE}/obstacles/index.json`).then((r) => r.json())
      const compact = index.filter((o) => o.w <= MAX_OBSTACLE_W)
      const [imgs, frames] = await Promise.all([
        Promise.all(compact.map((o) => loadImage(`${BASE}/obstacles/${o.file}`))),
        Promise.all(Object.entries(FRAMES).map(async ([k, f]) => [k, await loadImage(`${BASE}/peka/${f}`)] as const)),
      ])
      if (disposed) return
      obstacleImgs = imgs
      frameImgs = Object.fromEntries(frames) as Record<keyof typeof FRAMES, HTMLImageElement>
      runner = createRunner(compact, Math.floor(Math.random() * 1e9) + 1)
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
    start().catch(() => {})

    // a tap starts a talk; under reduced motion there is no loop, so the open state is set directly
    const onDown = () => {
      if (!runner) return
      talk.until = performance.now() + TALK_MS
      if (reduceMotion) {
        setOpen(true)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => setOpen(false), TALK_MS)
      } else {
        jump(runner)
      }
    }
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') talk.hover = true
    }
    const onLeave = () => {
      talk.hover = false
      talk.until = performance.now() + LEAVE_MS
    }
    const onResize = () => resize()
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(timer)
      io?.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={ref}
        aria-hidden="true"
        className="pointer-events-auto absolute inset-x-0 bottom-0 h-[45%] w-full text-foreground"
      />
      <div className="pointer-events-none absolute inset-x-5 bottom-[45%] top-28 flex flex-col items-start justify-end gap-4 sm:inset-x-6">
        {bubbles.map((text, i) => (
          <p
            key={text}
            data-open={talking}
            style={{ transitionDelay: talking ? `${i * 120}ms` : '0ms' }}
            className={`pixel-frame max-w-72 px-4 py-3 text-sm leading-snug opacity-0 transition duration-200 ease-out data-[open=true]:opacity-100 ${i % 2 ? 'ml-10' : ''} ${talking ? '' : 'translate-y-2'}`}
          >
            {text}
          </p>
        ))}
      </div>
    </>
  )
}
