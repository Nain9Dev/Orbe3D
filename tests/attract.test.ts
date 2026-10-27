import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../src/core/world.js';
import { attractSystem } from '../src/systems/attract.js';
import type { AttractEnv } from '../src/systems/attract.js';
import { physicsSystem } from '../src/systems/physics.js';
import { gameSystem } from '../src/systems/game.js';
import { CONFIG } from '../src/config.js';

// jsdom has no 2D canvas; the model factories reach for one to build their
// procedural textures.
HTMLCanvasElement.prototype.getContext = () => ({
  createRadialGradient: () => ({ addColorStop: () => {} }),
  createLinearGradient: () => ({ addColorStop: () => {} }),
  createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
  putImageData: () => {},
  fillStyle: '',
  fillRect: () => {},
}) as any;

/**
 * A controllable stand-in for `matchMedia` and `document.visibilityState`, so
 * the suite can flip reduced motion and tab visibility without a browser.
 */
function fakeEnv(initial: { reduced?: boolean; hidden?: boolean } = {}) {
  let reduced = initial.reduced ?? false;
  let hidden = initial.hidden ?? false;
  const listeners = new Set<() => void>();
  const env: AttractEnv = {
    reducedMotion: () => reduced,
    hidden: () => hidden,
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
  };
  return {
    env,
    setReduced(v: boolean) { reduced = v; listeners.forEach((fn) => fn()); },
    setHidden(v: boolean) { hidden = v; listeners.forEach((fn) => fn()); },
  };
}

const STEP = 1 / 60;

function run(world: World, seconds: number) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i++) world.update(STEP);
}

function horizontal(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function snapshot(world: World) {
  const { collected, score, combo, integrity } = world.state;
  return { collected, score, combo, integrity };
}

describe('Attract mode — the autopilot behind the title', () => {
  let world: World;
  let fake: ReturnType<typeof fakeEnv>;
  const toasts: string[] = [];

  function mount(initial: { reduced?: boolean; hidden?: boolean } = {}) {
    world = new World();
    fake = fakeEnv(initial);
    toasts.length = 0;
    Object.assign(world.state, {
      status: 'menu',
      level: 1,
      collected: 0,
      score: 0,
      totalOrbs: 0,
      integrity: CONFIG.player.lives,
      maxIntegrity: CONFIG.player.lives,
      combo: 0,
      comboWindow: 0,
      dashRatio: 1,
      shield: false,
      critical: false,
      timeScale: 1,
    });
    world.events.on('ui:toast', ({ text }) => toasts.push(text));
    // Registration order mirrors `src/main.ts`: the autopilot runs before physics.
    world.addSystem(attractSystem({ env: fake.env }));
    world.addSystem(physicsSystem());
    world.addSystem(gameSystem());
  }

  beforeEach(() => mount());

  it('builds Ciclo 1 from the menu and switches to attract — REQ-AM.01', () => {
    expect(world.state.status).toBe('attract');
    expect(world.state.level).toBe(1);
    expect(world.first('player')).not.toBeNull();
    expect(world.find('solid', 'transform').length).toBeGreaterThan(0);
    expect(world.state.totalOrbs).toBeGreaterThan(0);
  });

  it('leaves the menu alone when a run is already in progress — REQ-AM.01', () => {
    const busy = new World();
    Object.assign(busy.state, { status: 'playing', level: 3 });
    busy.addSystem(attractSystem({ env: fakeEnv().env }));
    expect(busy.state.status).toBe('playing');
    expect(busy.first('player')).toBeNull();
  });

  it('moves Lúmen along the route on its own — REQ-AM.02', () => {
    const player = world.first('player')!;
    const origin = player.transform.position.clone();

    run(world, 3);

    expect(horizontal(player.transform.position, origin)).toBeGreaterThan(8);
    expect(player.transform.position.y).toBeGreaterThan(CONFIG.world.voidY);
    // The route leaves the starting plaza towards negative z.
    expect(player.transform.position.z).toBeLessThan(origin.z - 5);
    expect(world.state.playerSpeed).toBeGreaterThan(CONFIG.player.speed * 0.5);
  });

  it('completes the Ciclo 1 route and loops back without falling — REQ-AM.02', () => {
    const player = world.first('player')!;
    let exit: { z: number } | null = null;
    let falls = 0;
    world.events.on('body:fell', () => { falls += 1; });

    // The blueprint is deterministic, so the exit is where the composer says.
    const freshWorld = new World();
    freshWorld.events.on('level:built', ({ blueprint }) => { exit = blueprint.exit; });
    Object.assign(freshWorld.state, { status: 'menu' });
    freshWorld.addSystem(attractSystem({ env: fakeEnv().env }));
    expect(exit).not.toBeNull();

    let reachedExit = false;
    let laps = 0;
    let lastZ = player.transform.position.z;
    for (let i = 0; i < 60 * 30; i++) {
      world.update(STEP);
      const z = player.transform.position.z;
      if (z < exit!.z + 3) reachedExit = true;
      if (z > lastZ + 30) laps += 1;   // teleported back to the origin
      lastZ = z;
    }

    expect(reachedExit).toBe(true);
    expect(laps).toBeGreaterThanOrEqual(1);
    expect(falls).toBe(0);
  });

  it('restarts at the origin when it falls, without the void toast — REQ-AM.02', () => {
    const player = world.first('player')!;
    const origin = player.transform.position.clone();
    run(world, 1);

    // Throw it into the Vacío by hand.
    player.transform.position.set(0, CONFIG.world.voidY - 5, -40);
    player.body.velocity.set(0, -20, 0);
    run(world, 0.5);

    expect(horizontal(player.transform.position, origin)).toBeLessThan(12);
    expect(player.transform.position.y).toBeGreaterThan(CONFIG.world.voidY);
    expect(toasts).toEqual([]);
    expect(world.state.combo).toBe(0);
    expect(world.state.status).toBe('attract');
  });

  it('never touches the score, the Fragmentos, the Resonancia or the Núcleo — REQ-AM.03', () => {
    const before = snapshot(world);
    run(world, 8);
    expect(snapshot(world)).toEqual(before);
    expect(before).toEqual({ collected: 0, score: 0, combo: 0, integrity: CONFIG.player.lives });
    expect(world.state.status).toBe('attract');
  });

  it('holds still under prefers-reduced-motion — REQ-AM.04', () => {
    mount({ reduced: true });
    const player = world.first('player')!;
    const origin = player.transform.position.clone();

    run(world, 3);

    expect(world.state.status).toBe('attract');
    expect(horizontal(player.transform.position, origin)).toBeLessThan(0.5);
    expect(world.state.playerSpeed ?? 0).toBe(0);
  });

  it('holds while the document is hidden and resumes when visible — REQ-AM.05', () => {
    const player = world.first('player')!;
    run(world, 1);
    const atHide = player.transform.position.clone();

    fake.setHidden(true);
    run(world, 2);
    expect(horizontal(player.transform.position, atHide)).toBeLessThan(0.5);

    fake.setHidden(false);
    run(world, 2);
    expect(horizontal(player.transform.position, atHide)).toBeGreaterThan(5);
  });

  it('hands over to game:start untouched — REQ-AM.06', () => {
    run(world, 2);
    const attractPlayer = world.first('player')!;

    world.events.emit('game:start', { level: 1 });

    expect(world.state.status).toBe('playing');
    expect(world.state.attract).toBe(false);
    expect(snapshot(world)).toEqual({ collected: 0, score: 0, combo: 0, integrity: CONFIG.player.lives });

    // A fresh level: the attract body is gone and the new one is not driven.
    const player = world.first('player')!;
    expect(player).not.toBe(attractPlayer);
    const spawn = player.transform.position.clone();
    run(world, 1);
    expect(horizontal(player.transform.position, spawn)).toBeLessThan(0.5);
  });
});
