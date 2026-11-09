/**
 * Auto-runner for the About card. The character runs on a line and jumps by itself; obstacles come in
 * from the right at random. Everything is in world units (one sprite pixel each), so the canvas can
 * resize without touching the run. A tap or a key also jumps.
 */

export const PLAYER_X = 8 // world units from the left edge of the view
const HITBOX_W = 16 // world units of the body that can hit an obstacle (the sprite is 24 wide)
const HITBOX_H = 32 // world units of the body and head that can hit an obstacle (the sprite is 36 tall)
const GRAVITY = 200 // world units per second squared
const JUMP_V = 170 // world units per second, at take-off
const SPEED_MIN = 40
const SPEED_MAX = 80
const SPEED_UP = 1.5 // world units per second gained per second of play
const JUMP_AHEAD = 0.3 // seconds before an obstacle at which the auto-jump fires

/** The size of one obstacle sprite, in world units. */
export interface ObstacleSize {
  w: number
  h: number
}

export interface Obstacle extends ObstacleSize {
  x: number // left edge, in world units
  kind: number // index into the obstacle list the run was made with
}

export interface Runner {
  time: number
  speed: number
  y: number // height above the ground
  vy: number
  distance: number // world units travelled
  obstacles: Obstacle[]
  sizes: ObstacleSize[]
  nextSpawn: number // world x of the next obstacle
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

/** A new run. `sizes` is the list of obstacle sprites to draw from. */
export function createRunner(sizes: ObstacleSize[], seed = 7): Runner {
  return {
    time: 0,
    speed: SPEED_MIN,
    y: 0,
    vy: 0,
    distance: 0,
    obstacles: [],
    sizes,
    nextSpawn: 60,
    crashes: 0,
    rng: random(seed),
  }
}

export function jump(r: Runner): void {
  if (r.y === 0) r.vy = JUMP_V
}

/** Advance the run by `dt` seconds. `viewW` is how many world units the view shows, to place obstacles off screen. */
export function step(r: Runner, dt: number, viewW: number): void {
  r.time += dt
  r.speed = Math.min(SPEED_MAX, SPEED_MIN + SPEED_UP * r.time)
  const move = r.speed * dt
  r.distance += move

  for (const o of r.obstacles) o.x -= move
  r.obstacles = r.obstacles.filter((o) => o.x + o.w > -4)
  r.nextSpawn -= move
  while (r.nextSpawn < viewW + 4) {
    const kind = Math.floor(r.rng() * r.sizes.length)
    const { w, h } = r.sizes[kind]
    r.obstacles.push({ x: r.nextSpawn, kind, w, h })
    // random gaps, long enough that the character lands before the next one is in reach
    r.nextSpawn += 110 + r.rng() * 50 + r.speed * 1.3
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

  // auto-jump: take off when the next obstacle is about JUMP_AHEAD seconds away
  const next = r.obstacles.find((o) => o.x + o.w > PLAYER_X)
  if (next && r.y === 0 && next.x - (PLAYER_X + HITBOX_W) <= r.speed * JUMP_AHEAD) jump(r)

  // a hit restarts the run from the left; the distance keeps counting
  for (const o of r.obstacles) {
    const overlapX = o.x < PLAYER_X + HITBOX_W && o.x + o.w > PLAYER_X
    if (overlapX && r.y < Math.min(o.h, HITBOX_H)) {
      r.crashes += 1
      r.y = 0
      r.vy = 0
      r.obstacles = []
      r.nextSpawn = viewW + 20
      break
    }
  }
}
