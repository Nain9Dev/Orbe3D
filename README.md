# Orbe Runner 3D

[![English](https://img.shields.io/badge/Language-English-blue?style=flat-square)](README.md)
[![Español](https://img.shields.io/badge/Idioma-Espa%C3%B1ol-emerald?style=flat-square)](README.es.md)
[![Play Online](https://img.shields.io/badge/Demo-orbe.naindev.com-0284c7?style=flat-square)](https://orbe.naindev.com)
[![CI](https://github.com/Nain9Dev/orbe-runner-3d/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nain9Dev/orbe-runner-3d/actions/workflows/deploy.yml)
[![Ecosystem Status](https://img.shields.io/badge/status-100%25%20operational-success)](https://status.naindev.com)
[![Engineering Handbook](https://img.shields.io/badge/paved%20road-Pure%20Math%20ECS-blue)](https://github.com/Nain9Dev/engineering-handbook)
[![Cost](https://img.shields.io/badge/cost-0.00_%E2%82%AC-22c55e)](https://github.com/Nain9Dev/engineering-handbook/blob/main/governance/zero-cost-philosophy.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-informational)](LICENSE)

**Play online: https://orbe.naindev.com**

A zero-engine 3D arcade runner written from scratch in TypeScript. You are **Lúmen**, the final spark of light across a universe swallowed by the Void. Traverse **Cycles**, recover **Star Shards**, evade **Shadows**, and survive with a three-layer Core.

Levels are procedurally composed from curated geometric chunks, backed by a formal mathematical guarantee that **every traversal jump is physically reachable**.

- **Zero Game Engine:** Custom physics, collision detection, enemy state machines, procedural level composer, HUD, and synthesizer. Only Three.js is used for WebGL rasterization.
- **Zero Static Assets:** 3D meshes, materials, music, and sound effects are synthesized in real-time at runtime. 0 MB of downloaded textures or audio clips.
- **Zero Backend:** Static assets deployed to CDN via GitHub Pages. One click to play directly in browser.
- **Zero Incremental Cost:** $0.00 infrastructure cost, fully open source under the MIT license.

![preview](preview.png)

---

## Controls

| Key | Action |
| :--- | :--- |
| `W A S D` / Arrows | Movement relative to camera orientation |
| `Space` | Jump (variable height by hold duration) |
| `Shift` | **Dash**: Phase through space, gain temporary invulnerability, and shatter fragile enemies |
| Mouse | Orbit camera |
| `Esc` | Pause / Settings menu |

Mobile: On-screen left analog joystick, right camera swipe zone, dedicated Jump and Dash touch buttons.

---

## Development & Verification

Requires Node 18+.

```bash
git clone https://github.com/Nain9Dev/orbe-runner-3d.git
cd orbe-runner-3d
npm install
npm run dev
```

| Command | Description |
| :--- | :--- |
| `npm run dev` | Development server with hot module reload (`http://127.0.0.1:5310`) |
| `npm run typecheck` | Strict TypeScript compiler check (`tsc --noEmit`) |
| `npm test` | Vitest test suite running 201 unit and integration tests |
| `npm run build` | Compiles production distribution bundle to `dist/` |
| `npm run check` | Unified quality gate: `typecheck` + `test` + `build` |
| `npm run preview` | Production build preview server (`http://127.0.0.1:5311`) |

**Core Stack:** Strict TypeScript · Vite · Three.js · Web Audio API · Vanilla DOM HUD. Pinned in [`AGENTS.md`](AGENTS.md).

---

## Architectural Topology

Lightweight 200-line **ECS** (Entity–Component–System) organized into 4 decoupled layers:

```
src/
├── main.ts               # World bootstrap, system registration, and game loop
├── config.ts             # Central tunable parameters and kinematics constants
├── core/                 # Engine agnostic primitives (zero domain knowledge)
│   ├── world.ts          #   ECS: entity registry, queries, archetype storage
│   ├── engine.ts         #   Fixed timestep loop (1/60s physics) + variable render step
│   ├── events.ts         #   Strongly-typed event bus
│   └── input.ts          #   Keyboard, pointer, and touch input polling state
├── domain/               # Pure mathematics without framework dependencies
│   ├── jump-arc.ts       #   Kinematic jump trajectory solver → reachability verification
│   └── integrity.ts      #   Core health and shield invariants
├── game/                 # Content definitions
│   ├── chunks.ts         #   Geometric level chunk library
│   ├── composer.ts       #   Procedural level composer (Cycle → verifiable blueprint)
│   ├── level.ts          #   Blueprint → entity instantiator
│   ├── prefabs.ts        #   Entity archetypes and prefabs
│   └── models.ts         #   Procedural geometry generators
├── systems/              # Execution logic
│   ├── player.ts         #   Player input intent → velocity vectors
│   ├── physics.ts        #   Velocity → position + AABB / sphere collision resolution
│   ├── enemy.ts          #   Archetype state machines
│   ├── triggers.ts       #   Spatial triggers → game events
│   ├── game.ts           #   Core gameplay rules: Shards, Core state, Cycle completion
│   ├── camera.ts, render.ts, audio.ts, particles.ts, avatar.ts, powerups.ts
│   └── hud.ts            #   DOM HUD bridge
└── ui/                   # Vanilla DOM presentation layer
    ├── health.ts         #   Core integrity status
    ├── widgets.ts        #   Dash, resonance, and progression indicators
    └── menu.ts           #   Pause menu, settings, and lore log
```

---

## License

MIT — see [`LICENSE`](LICENSE). Powered by [Three.js](https://threejs.org) (MIT).
