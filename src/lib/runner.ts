/**
 * Auto-runner for the About card: a pixel character runs on a line, and cacti come in from the right.
 * Everything here is in grid cells, so the canvas can resize without touching the game state.
 * The character auto-jumps; a tap or a key also jumps.
 */

export const PLAYER_X = 4 // cells from the left edge of the view
const HITBOX_W = 12 // cells of the body that can hit a cactus
const HITBOX_H = 22 // cells of the body and head that can hit a cactus
const GRAVITY = 170 // cells per second squared
const JUMP_V = 84 // cells per second, at take-off
const SPEED_MIN = 26
const SPEED_MAX = 44
const SPEED_UP = 0.6 // cells per second gained per second of play
const JUMP_AHEAD = 0.2 // seconds before a cactus at which the auto-jump fires

export interface Cactus {
  x: number // left edge, in cells, in world space
  w: number
  h: number
}

export interface Runner {
  time: number
  speed: number
  y: number // height above the ground, in cells
  vy: number
  distance: number // cells travelled
  cacti: Cactus[]
  nextSpawn: number // world x of the next cactus
  crashes: number
  rng: () => number
}

/** Small seeded generator, so the same seed plays the same run. */
function random(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function createRunner(seed = 7): Runner {
  return {
    time: 0,
    speed: SPEED_MIN,
    y: 0,
    vy: 0,
    distance: 0,
    cacti: [],
    nextSpawn: 60,
    crashes: 0,
    rng: random(seed),
  }
}

export function jump(r: Runner): void {
  if (r.y === 0) r.vy = JUMP_V
}

/** Advance the run by `dt` seconds. `viewW` is how many cells the view shows, to place new cacti off screen. */
export function step(r: Runner, dt: number, viewW: number): void {
  r.time += dt
  r.speed = Math.min(SPEED_MAX, SPEED_MIN + SPEED_UP * r.time)
  const move = r.speed * dt
  r.distance += move

  for (const c of r.cacti) c.x -= move
  r.cacti = r.cacti.filter((c) => c.x + c.w > -4)
  r.nextSpawn -= move
  while (r.nextSpawn < viewW + 4) {
    const w = 3 + Math.floor(r.rng() * 2)
    const h = 5 + Math.floor(r.rng() * 4)
    r.cacti.push({ x: r.nextSpawn, w, h })
    const gap = 30 + r.rng() * 26 + r.speed * 0.4
    r.nextSpawn += gap
  }

  // physics
  if (r.y > 0 || r.vy > 0) {
    r.vy -= GRAVITY * dt
    r.y += r.vy * dt
    if (r.y <= 0) {
      r.y = 0
      r.vy = 0
    }
  }

  // auto-jump: take off when the next cactus is about JUMP_AHEAD seconds away
  const next = r.cacti.find((c) => c.x + c.w > PLAYER_X)
  if (next && r.y === 0 && next.x - (PLAYER_X + HITBOX_W) <= r.speed * JUMP_AHEAD) jump(r)

  // a hit resets the run's position; the score (distance) keeps counting from there
  for (const c of r.cacti) {
    const overlapX = c.x < PLAYER_X + HITBOX_W && c.x + c.w > PLAYER_X
    if (overlapX && r.y < Math.min(c.h, HITBOX_H)) {
      r.crashes += 1
      r.y = 0
      r.vy = 0
      r.cacti = []
      r.nextSpawn = viewW + 20
      break
    }
  }
}

/**
 * Turn the RGBA pixels of the profile ink into a head mask, one cell per sample.
 * A cell is ink where the drawing is dark and opaque.
 */
export function headMask(rgba: Uint8ClampedArray, w: number, h: number, cols: number, rows: number): boolean[][] {
  const out: boolean[][] = []
  for (let row = 0; row < rows; row++) {
    const line: boolean[] = []
    for (let col = 0; col < cols; col++) {
      // average the block of source pixels that falls in this cell
      const x0 = Math.floor((col * w) / cols)
      const x1 = Math.max(x0 + 1, Math.floor(((col + 1) * w) / cols))
      const y0 = Math.floor((row * h) / rows)
      const y1 = Math.max(y0 + 1, Math.floor(((row + 1) * h) / rows))
      let ink = 0
      let n = 0
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * w + x) * 4
          const a = rgba[i + 3] / 255
          const lum = (rgba[i] + rgba[i + 1] + rgba[i + 2]) / (3 * 255)
          ink += a * (1 - lum)
          n += 1
        }
      }
      line.push(ink / n > 0.3)
    }
    out.push(line)
  }
  return out
}

// The body under the head, two frames. '#' is ink. The legs swap between frames for the run.
export const BODY_RUN_A = [
  '  ########  ',
  ' ##########  ',
  '############ ',
  '  ##    ##  ',
  '  ##    ##  ',
  ' ##      ## ',
]
export const BODY_RUN_B = [
  '  ########  ',
  ' ##########  ',
  '############ ',
  '  ##    ##  ',
  '   ##  ##   ',
  '   #    #   ',
]
export const BODY_JUMP = [
  '  ########  ',
  ' ##########  ',
  '############ ',
  ' ##      ## ',
  '##        ##',
  '#          #',
]
