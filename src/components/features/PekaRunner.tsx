import { useEffect, useRef, useState } from 'react'
import { PLAYER_X, createRunner, jump, step, type ObstacleSize } from '@/lib/runner'
import { BASE as CITY_ROWS, COLS as CITY_COLS, createSkyline, createSkylineFrame } from '@/lib/skyline'

const BASE = '/static/sprites'
// the character frames, cut from the avatar sheet by grid cell (row, column). Every frame except the
// front one faces right, so the run only ever faces one way: r1c1 faces the viewer, r4c3 and r4c4 are the
// run cycle, r4c5 is the jump with one arm up.
const FRAMES = { front: 'r1c1.png', runA: 'r4c3.png', runB: 'r4c4.png', jump: 'r4c5.png' } as const
const GROUND = 0.92 // the ground line, as a share of the card height
const BAND = 0.45 // the share of the card the run uses for the figure's size
const FRAME_MS = 1000 / 30
const MAX_OBSTACLE_W = 44 // the compact obstacles only, so each one can be cleared
const TALK_MS = 2000 // how long a tap or a hover keeps the runner facing the viewer; then it turns back by itself

interface ObstacleFile extends ObstacleSize {
  file: string
}

/**
 * The sprite's own colours, put through a grayscale filter: the luma of each pixel becomes its grey, so the
 * shading and the full tonal range survive. Alpha is kept, so the silhouette stays as drawn.
 */
const tint = (img: HTMLImageElement): HTMLCanvasElement => {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const x = c.getContext('2d')
  if (!x) return c
  x.drawImage(img, 0, 0)
  const data = x.getImageData(0, 0, c.width, c.height)
  const px = data.data
  for (let i = 0; i < px.length; i += 4) {
    const lum = Math.round(px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11)
    px[i] = lum
    px[i + 1] = lum
    px[i + 2] = lum
  }
  x.putImageData(data, 0, 0)
  return c
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

interface Props {
  label: string
  nickname: string
  bubbles: string[]
}

/**
 * The About runner. The character and the obstacles are static sprites cut from the sprite sheets
 * (scripts/slice-sprites.ts). It runs and jumps by itself and obstacles come in at random. A tap or click
 * turns it to face the viewer for a moment: the run pauses, the speech frames open, and then it turns back
 * and carries on. It pauses off screen and shows one still frame under reduced motion.
 */
export default function PekaRunner({ label, nickname, bubbles }: Props) {
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
    let obstacleImgs: HTMLCanvasElement[] = []
    let frameImgs: Record<keyof typeof FRAMES, HTMLCanvasElement> | null = null
    // the raw sprite images, kept so they can be greyed again if the sprites ever change
    let rawObstacles: HTMLImageElement[] = []
    let rawFrames: Record<keyof typeof FRAMES, HTMLImageElement> | null = null
    const retint = () => {
      obstacleImgs = rawObstacles.map((img) => tint(img))
      if (rawFrames) {
        frameImgs = Object.fromEntries(Object.entries(rawFrames).map(([k, img]) => [k, tint(img)])) as Record<keyof typeof FRAMES, HTMLCanvasElement>
      }
    }
    // the city and clouds behind the run: a static skyline, repainted twice a second so the windows flicker
    const sky = createSkyline()
    const skyFrame = createSkylineFrame()
    let skyCanvas: HTMLCanvasElement | null = null
    let skyAt = -1
    // talk state: a tap sets `until`, and `open` mirrors what the React side shows
    const talk = { until: 0, open: false }

    const isTalking = (now: number) => now < talk.until
    const setOpen = (open: boolean) => {
      if (talk.open === open) return
      talk.open = open
      setTalking(open)
    }

    const resize = () => {
      skyAt = -1
      const rect = canvas.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      // the character is 36 sprite pixels tall and takes about 80% of the run band at the bottom
      s = Math.max(2, Math.min(5, Math.floor((h * BAND * 0.8) / 36)))
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

      drawWorld(groundY)

      // obstacles, from their sprites
      ctx.globalAlpha = 1
      for (const o of runner.obstacles) {
        const img = obstacleImgs[o.kind]
        if (!img) continue
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
      const dh = frame.height * s
      const dy = groundY - runner.y * s - dh
      ctx.drawImage(frame, dx, dy, frame.width * s, dh)
    }

    // paint the skyline into its own canvas, sized to the sky band above the ground
    const paintSky = (t: number, groundY: number) => {
      if (!skyCanvas) skyCanvas = document.createElement('canvas')
      skyCanvas.width = Math.max(1, Math.round(w * dpr))
      skyCanvas.height = Math.max(1, Math.round(groundY * dpr))
      const sctx = skyCanvas.getContext('2d')
      if (!sctx) return
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sctx.clearRect(0, 0, w, groundY)
      sctx.fillStyle = getComputedStyle(canvas).color
      sky(t, skyFrame)
      const cw = w / CITY_COLS
      const ch = groundY / CITY_ROWS
      for (let r = 0; r < CITY_ROWS; r++) {
        for (let c = 0; c < CITY_COLS; c++) {
          const k = r * CITY_COLS + c
          const step = skyFrame.steps[k]
          if (step === 0) continue
          const size = [0, 0.3, 0.56, 0.8][step]
          const lum = skyFrame.lum[k]
          sctx.globalAlpha = 0.25 + 0.75 * lum
          const x = c * cw + (cw * (1 - size)) / 2
          const y = r * ch + (ch * (1 - size)) / 2
          sctx.fillRect(x, y, cw * size, ch * size)
        }
      }
      sctx.globalAlpha = 1
    }

    const drawWorld = (groundY: number) => {
      if (!runner) return
      if (skyAt < 0 || animT - skyAt >= 0.5) {
        paintSky(animT, groundY)
        skyAt = animT
      }
      if (skyCanvas) ctx.drawImage(skyCanvas, 0, 0, w, groundY)
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
      rawObstacles = imgs
      rawFrames = Object.fromEntries(frames) as Record<keyof typeof FRAMES, HTMLImageElement>
      retint()
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
    const startTalk = () => {
      talk.until = performance.now() + TALK_MS
      if (reduceMotion) {
        setOpen(true)
        window.clearTimeout(timer)
        timer = window.setTimeout(() => setOpen(false), TALK_MS)
      }
    }
    const onDown = () => {
      if (!runner) return
      startTalk()
      if (!reduceMotion) jump(runner)
    }
    // a mouse hover turns it round for the same two seconds, then it turns back even if the mouse is still there
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') startTalk()
    }
    const onResize = () => resize()
    // the theme can flip while the page is open: repaint with the current text colour
    const themeObserver = new MutationObserver(() => {
      retint()
      draw(talk.open)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerenter', onEnter)
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.clearTimeout(timer)
      io?.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerenter', onEnter)
      window.removeEventListener('resize', onResize)
      themeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-[5] backdrop-blur-sm transition-opacity duration-200 ${talking ? 'opacity-100' : 'opacity-0'}`}
      />
      <canvas
        ref={ref}
        aria-hidden="true"
        className="pointer-events-auto absolute inset-0 z-10 h-full w-full text-foreground"
      />
      {/* the nickname and the bubbles share the right side: the nickname shows at rest, the bubbles replace it while the runner talks.
          They sit under the canvas, so the runner stays visible when it jumps up into their area. */}
      <div
        className={`pointer-events-none absolute right-5 top-5 flex flex-col items-end gap-1 text-right transition duration-200 ease-out ${talking ? 'opacity-0' : 'opacity-100'}`}
      >
        <p className="text-base font-semibold tracking-wide text-muted-foreground">{label}</p>
        <p className="font-title text-2xl text-foreground sm:text-3xl">{nickname}</p>
      </div>
      <div className="pointer-events-none absolute bottom-[38%] left-6 z-20 flex max-w-44 flex-col items-start gap-2">
        {bubbles.map((text, i) => (
          <p
            key={text}
            data-open={talking}
            style={{ transitionDelay: talking ? `${i * 120}ms` : '0ms' }}
            className={`pixel-frame px-3 py-2 text-xs leading-snug opacity-0 transition duration-200 ease-out data-[open=true]:opacity-100 ${i % 2 ? 'ml-4' : ''} ${i < bubbles.length - 1 ? 'after:hidden' : ''} ${talking ? '' : 'translate-y-1'}`}
          >
            {text}
          </p>
        ))}
      </div>
    </>
  )
}
