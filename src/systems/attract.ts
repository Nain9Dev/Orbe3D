import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { buildLevel } from '../game/level.js';
import type { PathNode } from '../game/chunks.js';

/**
 * Attract mode: the autopilot that runs behind the title.
 *
 * The first screen used to be a panel over an empty sky, because no Ciclo
 * exists until `game:start`. This system builds Ciclo 1 at page load and
 * drives Lúmen along the composer's own critical route, so a visitor sees the
 * game being played before they decide to play it.
 *
 * Three rules keep it honest:
 *
 *  - **It is a status, not a flag.** `status === 'attract'` leaves every system
 *    that gates on `'playing'` inert — player input, Sombras, triggers, powerups,
 *    damage, audio — so nothing is collected, scored or lost while it runs.
 *  - **The body is an ordinary body.** The autopilot only writes a velocity and
 *    the occasional jump; grounding, bounce pads and crumbling platforms are the
 *    physics system's business, exactly as in play.
 *  - **It stops when the user asks it to.** `prefers-reduced-motion` keeps the
 *    track on screen but still; a hidden tab holds the run until it is shown.
 */

/** Reduced-motion and visibility, injectable so the suite can flip them. */
export interface AttractEnv {
  reducedMotion(): boolean;
  hidden(): boolean;
  /** Calls `onChange` whenever either answer may have changed. Returns the unsubscribe. */
  subscribe(onChange: () => void): () => void;
}

/** Distance ahead of the body, in units, where the ground probe looks. */
const LOOKAHEAD = 1.6;
/** A route node counts as reached inside this horizontal distance. */
const NODE_RADIUS = 1.4;
/** Further than this from the target node, the route index is re-synchronised. */
const RESYNC_DISTANCE = 20;
/** A node this much above the feet is a step the autopilot jumps for. */
const STEP_UP = 0.3;
/** Horizontal distance from which a step up is anticipated with a jump. */
const STEP_REACH = 5;
/** The probe accepts ground up to this far below the feet: a drop, not a gap. */
const DROP_TOLERANCE = 3.5;

const direction = new THREE.Vector3();
const probe = new THREE.Vector3();

export function attractSystem({ env = browserEnv() }: { env?: AttractEnv } = {}) {
  let path: PathNode[] = [];
  let index = 0;
  let held = false;
  let unsubscribe: (() => void) | null = null;

  const refresh = () => { held = env.reducedMotion() || env.hidden(); };

  return {
    name: 'attract',

    init(world) {
      world.events.on('level:built', ({ blueprint }) => {
        if (!world.state.attract) return;
        path = blueprint?.path ?? [];
        index = 1;
      });

      // The real run takes over. Clearing the flag *before* the game system's
      // own handler builds the level is what keeps the Ciclo card and the rest
      // of the start sequence exactly as they were.
      world.events.on('game:start', () => {
        world.state.attract = false;
        path = [];
      });

      // A fall during the attract run is a loop, not a setback: no toast, no
      // vignette, no Resonancia to lose. `game.ts` leaves it to this system.
      world.events.on('body:fell', (entity) => {
        if (world.state.status === 'attract' && entity?.player) restart(world, entity);
      });

      unsubscribe = env.subscribe(refresh);
      refresh();

      if (world.state.status !== 'menu') return;
      world.state.attract = true;
      buildLevel(world, 1);
      world.state.status = 'attract';
    },

    update(world, dt) {
      if (world.state.status !== 'attract') return;
      const e = world.first('player', 'body', 'transform');
      if (!e) return;

      const { body, transform } = e;

      if (held || path.length < 2) {
        hold(world, e);
        return;
      }

      const pos = transform.position;
      if (horizontal(pos, path[index]) > RESYNC_DISTANCE) index = nearestAhead(pos);

      while (horizontal(pos, path[index]) < NODE_RADIUS) {
        index += 1;
        if (index >= path.length) {
          restart(world, e);
          return;
        }
      }

      const target = path[index];
      direction.set(target.x - pos.x, 0, target.z - pos.z).normalize();

      // Same exponential approach the player controller uses, so the autopilot
      // accelerates and corners like a hand on the keys would.
      const friction = body.friction ?? 12;
      const accel = body.grounded ? friction : friction * CONFIG.player.airControl;
      const k = 1 - Math.exp(-accel * dt);
      body.velocity.x += (direction.x * CONFIG.player.speed - body.velocity.x) * k;
      body.velocity.z += (direction.z * CONFIG.player.speed - body.velocity.z) * k;
      body.damped = true;
      transform.yaw = Math.atan2(direction.x, direction.z);

      if (body.grounded && needsJump(world, e, target)) {
        body.velocity.y = CONFIG.player.jump;
        body.grounded = false;
        body.contact = false;
        body.groundTimer = Infinity;
        world.events.emit('player:jump', e);
      }

      publish(world, e);
    },

    dispose() {
      unsubscribe?.();
      unsubscribe = null;
    },
  };

  /* ------------------------------------------------------------------------ */

  function restart(world, e) {
    const origin = path[0];
    if (origin) {
      e.transform.position.set(origin.x, origin.y + 1.4, origin.z);
    } else if (e.player?.spawn) {
      e.transform.position.copy(e.player.spawn);
    }
    e.body.velocity.set(0, 0, 0);
    e.body.noGravity = false;
    index = 1;
    publish(world, e);
  }

  function nearestAhead(pos) {
    let best = 1;
    let bestDist = Infinity;
    for (let i = 1; i < path.length; i++) {
      const d = horizontal(pos, path[i]);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }
}

/* -------------------------------------------------------------------------- */

/** Zero horizontal motion without touching anything else the physics owns. */
function hold(world, e) {
  e.body.velocity.x = 0;
  e.body.velocity.z = 0;
  e.body.damped = true;
  publish(world, e);
}

function needsJump(world, e, target: PathNode) {
  const pos = e.transform.position;
  const feet = pos.y - e.body.radius;

  // A node above the feet is a platform to climb onto: jump early enough to
  // land on it rather than run into its side.
  if (target.y - feet > STEP_UP && horizontal(pos, target) < STEP_REACH) return true;

  probe.copy(pos).addScaledVector(direction, LOOKAHEAD);
  return !groundUnder(world, probe, feet);
}

/** Is there a solid top under `point`, no higher than the feet and not a sheer drop? */
function groundUnder(world, point: THREE.Vector3, feet: number) {
  for (const s of world.query('solid', 'transform')) {
    if (s.crumbling?.state === 'gone') continue;
    const c = s.transform.position;
    const size = s.solid.size;
    if (Math.abs(point.x - c.x) > size.x / 2 || Math.abs(point.z - c.z) > size.z / 2) continue;
    const top = c.y + size.y / 2;
    if (top <= feet + STEP_UP && top >= feet - DROP_TOLERANCE) return true;
  }
  return false;
}

function horizontal(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

/** What the models and the trail read; the same fields the player controller publishes. */
function publish(world, e) {
  world.state.playerSpeed = Math.hypot(e.body.velocity.x, e.body.velocity.z);
  world.state.dashing = false;
  world.state.dashRatio = 1;
}

/** The real browser: `matchMedia` for motion, `visibilityState` for the tab. */
function browserEnv(): AttractEnv {
  const query = typeof matchMedia === 'function'
    ? matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  return {
    reducedMotion: () => query?.matches ?? false,
    hidden: () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
    subscribe(onChange) {
      query?.addEventListener?.('change', onChange);
      document.addEventListener('visibilitychange', onChange);
      return () => {
        query?.removeEventListener?.('change', onChange);
        document.removeEventListener('visibilitychange', onChange);
      };
    },
  };
}
