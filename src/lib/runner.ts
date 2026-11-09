/**
 * Auto-runner for the About card. The character runs on a line and jumps by itself; cacti come in
 * from the right at random. Everything is in grid cells, so the canvas can resize without touching
 * the run. A tap or a key also jumps.
 */

export const PLAYER_X = 8 // world units from the left edge of the view
const HITBOX_W = 14 // world units of the body that can hit a cactus (the sprite is 24 wide)
const HITBOX_H = 28 // world units of the body and head that can hit a cactus (the sprite is 32 tall)
/** Each cactus pixel is this many world units, so cacti read at the same scale as the sprite. */
export const CACTUS_UNIT = 2
const GRAVITY = 240 // world units per second squared
const JUMP_V = 120 // world units per second, at take-off
const SPEED_MIN = 40
const SPEED_MAX = 80
const SPEED_UP = 1.5 // world units per second gained per second of play
const JUMP_AHEAD = 0.25 // seconds before a cactus at which the auto-jump fires

/** Cactus shapes, top row first. '#' is ink. */
export const CACTI: string[][] = [
  ['  #  ', '# # #', '# # #', '#####', '  #  ', '  #  ', '  #  '],
  ['  ##', ' ###', '## #', '# #', '###', '  #'],
  ['#  #', '## #', '## #', '#####', '  ###', '  #  ', '  #  ', '  #  '],
]

export interface Cactus {
  x: number // left edge, in cells, in world space
  shape: number // index into CACTI
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

/** Small seeded generator. The same seed plays the same run; pass Math.random for a new run each visit. */
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

export function cactusSize(shape: number): { w: number; h: number } {
  const rows = CACTI[shape]
  return { w: Math.max(...rows.map((r) => r.length)) * CACTUS_UNIT, h: rows.length * CACTUS_UNIT }
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
    const shape = Math.floor(r.rng() * CACTI.length)
    const { w, h } = cactusSize(shape)
    r.cacti.push({ x: r.nextSpawn, shape, w, h })
    // random gaps, longer when the run is fast, so the player always gets room to jump
    r.nextSpawn += 90 + r.rng() * 40 + r.speed * 1.0
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

  // a hit restarts the run from the left; the distance keeps counting
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

