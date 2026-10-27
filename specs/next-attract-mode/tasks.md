# Tasks next — Attract mode

Ordered by dependency. Test first, one task at a time.

- [x] **T-AM.01** `[A]` `tests/attract.test.ts`: the six automated cases from
      [plan.md](plan.md) §4, written before the system exists.
  - **Covers**: REQ-AM.01 … REQ-AM.06
  - **Done when**: the file runs and fails on a missing `src/systems/attract.ts`.

- [x] **T-AM.02** `[A]` `src/systems/attract.ts`: build Ciclo 1 from `menu`, drive the
      body along `blueprint.path`, jump on the ground probe, restart at the origin, hold
      under reduced motion and while hidden, end on `game:start`. Register it in
      `src/main.ts`.
  - **Covers**: REQ-AM.01, REQ-AM.02, REQ-AM.04, REQ-AM.05, REQ-AM.06
  - **Done when**: `tests/attract.test.ts` passes.

- [x] **T-AM.03** `[A]` `src/systems/game.ts`: the player's `body:fell` is left to the
      autopilot while `status === 'attract'`.
  - **Covers**: REQ-AM.02, REQ-AM.03
  - **Done when**: the fall test shows no toast and `combo` unchanged.

- [x] **T-AM.04** `[A]` `src/systems/hud.ts`, `src/ui/menu.ts`, `src/style.css`: no Ciclo
      card for the attract build; `#overlay.attract` lets the scene through.
  - **Covers**: REQ-AM.07
  - **Done when**: the browser capture shows the track and Lúmen behind a legible panel.

- [x] **T-AM.05** `[A]` Browser verification at 1280 px and 375 px, with reduced motion
      emulated, and with the tab hidden; before and after captures saved for the PR.
  - **Covers**: REQ-AM.04, REQ-AM.05, REQ-AM.07
  - **Done when**: the captures exist and the console shows no errors.

- [x] **T-AM.06** `[A]` Documentation: `docs/10-requirements.md`, `20-architecture.md`,
      `21-data-model.md`, `40-tasks.md`, `50-traceability.md`, `90-changelog.md`.
  - **Covers**: —
  - **Done when**: every REQ-AM row has a test or a manual verification recorded.

## Session handoff

- Last updated: 2026-10-27, attract-mode session.
- Done: all six tasks. `npm run check` green. Browser verification done.
- Verified: see `docs/50-traceability.md`.
- Next: owner review; merge train renumbers the spec and the requirements.
- Blocked: nothing.
