/**
 * Auto-runner for the About card. The character runs on a line and jumps by itself; obstacles come in
 * from the right at random. Everything is in world units (one sprite pixel each), so the canvas can
 * resize without touching the run. A tap or a key also jumps.
 */

export const PLAYER_X = 8 // world units from the left edge of the view
const HITBOX_W = 10 // world units of the body that can hit an obstacle (the sprite is 24 wide)
const HITBOX_H = 32 // world units of the body and head that can hit an obstacle (the sprite is 36 tall)
const JUMP_H = 48 // peak height of a jump, world units: about 1.3 sprite heights, enough to clear a 28 high obstacle
const JUMP_T = 1.2 // seconds in the air, a natural arc at this speed
const GRAVITY = (8 * JUMP_H) / (JUMP_T * JUMP_T) // from h = g T^2 / 8, world units per second squared
const JUMP_V = (GRAVITY * JUMP_T) / 2 // take-off speed, from T = 2 v / g
const SPEED_MIN = 75
const SPEED_MAX = 120
const SPEED_UP = 1.0 // world units per second gained per second of play
const MIN_GAP_S = 1.4 // seconds of clear room between two obstacles at least: landing and the next take-off fit in it
const JUMP_AHEAD = 0.28 // seconds before an obstacle at which the auto-jump fires, so the rise clears it

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
  deck: number[] // kinds still to come up in this round of the deck
  lastKind: number
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
    deck: [],
    lastKind: -1,
  }
}

export function jump(r: Runner): void {
  if (r.y === 0) r.vy = JUMP_V
}

/**
 * Pick the next obstacle kind from a shuffled deck: every kind comes up once before any repeats, and the
 * same kind never comes up twice in a row.
 */
function drawKind(r: Runner): number {
  if (r.deck.length === 0) {
    r.deck = r.sizes.map((_, i) => i)
    for (let i = r.deck.length - 1; i > 0; i--) {
      const j = Math.floor(r.rng() * (i + 1))
      ;[r.deck[i], r.deck[j]] = [r.deck[j], r.deck[i]]
    }
    // do not start a fresh deck with the kind that just ended
    if (r.deck.length > 1 && r.deck[r.deck.length - 1] === r.lastKind) {
      ;[r.deck[0], r.deck[r.deck.length - 1]] = [r.deck[r.deck.length - 1], r.deck[0]]
    }
  }
  const kind = r.deck.pop() as number
  r.lastKind = kind
  return kind
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
    const kind = drawKind(r)
    const { w, h } = r.sizes[kind]
    r.obstacles.push({ x: r.nextSpawn, kind, w, h })
    // the clear room after this obstacle is at least MIN_GAP_S at this speed; a random extra spreads the rhythm
    const u = r.rng()
    const extra = u < 0.35 ? 0 : u < 0.85 ? r.rng() * 0.6 * r.speed : r.rng() * 2 * r.speed
    r.nextSpawn += w + r.speed * MIN_GAP_S + extra
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
