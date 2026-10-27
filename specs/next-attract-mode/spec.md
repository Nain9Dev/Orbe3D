# Spec next — Attract mode

| Field | Value |
| :--- | :--- |
| Status | Implemented |
| Extends | Spec 025 (Resonancia) |
| Owner approval | Pending |
| Number | Assigned by the merge train (`next` until then) |

## 1. Motivation

The first screen of the game is a static title panel over an empty sky. The portfolio
audit of 2026-10-27 found that a visitor arriving from the catalogue at
`https://www.naindev.com/` sees no gameplay at all unless they click JUGAR: the canvas
behind the panel holds dust and a gradient, because no Ciclo is built until `game:start`.

A demo has to show value in its first screen. The smallest change that does so is an
**attract mode**: Ciclo 1 is built at page load and Lúmen runs its route on its own behind
the title, until the player presses JUGAR. Nothing about the run itself changes: the
start interaction, the controls, the scoring and the Ciclo the player gets are exactly
what they were.

## 2. Functional requirements (EARS)

Numbered `REQ-AM.xx` until the merge train assigns the spec number.

- **REQ-AM.01** When the page loads and no run is in progress, the system shall build
  Ciclo 1 behind the title panel, so the first screen shows the track and its Sombras.
- **REQ-AM.02** While the title panel is shown and the attract run is active, Lúmen shall
  follow the Ciclo 1 route on its own, jumping its gaps, and shall return to the origin
  when the route ends or when it falls into the Vacío.
- **REQ-AM.03** While the attract run is active, the system shall not collect Fragmentos,
  take damage, build Resonancia or change the score: `collected`, `score`, `combo` and
  `integrity` keep their initial values, and the Sombras stay idle.
- **REQ-AM.04** If the user agent reports `prefers-reduced-motion: reduce`, then the
  attract run shall not drive Lúmen; the built track is shown still.
- **REQ-AM.05** While the document is hidden, the attract run shall not advance, and it
  shall resume when the document becomes visible again.
- **REQ-AM.06** When the player activates JUGAR, the system shall start the run exactly as
  before: `game:start` with the pending Ciclo, a fresh level, status `playing`, and the
  attract run ends. Keyboard, mouse and touch input shall have no effect on Lúmen while
  the attract run is active.
- **REQ-AM.07** While the attract run is active, the overlay shall let the scene read
  through behind the panel without reducing the legibility of the panel itself.

## 3. Edge cases

- **Fall into the Vacío during the attract run.** The run restarts from the origin with
  no toast, no vignette and no Resonancia change; the ordinary `fall()` rule only applies
  while `playing`.
- **A Sombra on the route.** Sombras are idle during the attract run; if one stands in
  the way the body contact pushes it aside, as in play. No special handling.
- **No `matchMedia`** (old embeds, jsdom). Treated as full motion, as the musical clock
  already does.
- **Settings or Registro panel open.** The attract run continues: the overlay is still on
  screen and the start interaction is unchanged.
- **Game over or Ciclo cleared.** The attract run never starts from those states: it
  starts only from `menu`, once, at page load. After a run ends, the summary panel keeps
  the finished Ciclo behind it as today.
- **Pause.** Not reachable from the attract run: Escape only pauses while `playing`.

## 4. Out of scope

- Collecting Fragmentos or fighting Sombras during the attract run.
- Attract mode after a run (returning to an autopilot from the game-over panel).
- Recording or replaying a human run instead of the autopilot.
- Refreshing the portfolio capture `public/assets/images/demos/orbe-runner-3d.webp` in
  `nain9dev.github.io`: a separate task, after this one lands.

## 5. Acceptance criteria

- The first screen moves within a second of load: the track is visible and Lúmen runs it.
- `npm run check` (typecheck, tests, build) passes.
- With `prefers-reduced-motion: reduce` emulated, Lúmen stands still on the built track.
- With the tab hidden, Lúmen does not advance; it resumes when the tab is shown.
- JUGAR starts Ciclo 1 (or the pending Ciclo) with `score`, `collected` and `combo` at 0
  and `integrity` at 3, as before.
- Desktop and phone (375 px) captures, before and after, in `docs/captures/next-attract-mode/`
  and attached to the PR.

## 6. Session handoff

- Last updated: 2026-10-27, attract-mode session (worktree `D:/wt/orbe-runner-3d-feat-attract-mode`, branch `feat/attract-mode`).
- Done: T-AM.01 … T-AM.06 implemented and verified; `npm run check` green; browser verification at 1280 px, 375 px and with reduced motion.
- Next: owner review and merge; the merge train assigns the spec number and renames `REQ-AM.xx`; then refresh the portfolio capture (separate task).
- Blocked: nothing.
