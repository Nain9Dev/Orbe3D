# Analyze checklist: Attract mode

Completed before implementation starts. Any unchecked item blocks the Implement phase.

## Spec quality

- [x] Every requirement follows an EARS pattern and is testable as written.
- [x] Edge cases and error handling are specified, not implied.
- [x] Out-of-scope section exists and bounds the iteration.
- [x] No open question in `docs/11-open-questions.md` blocks a requirement of this feature.

## Consistency

- [x] Every requirement (REQ-AM.xx) is covered by at least one module in `plan.md`.
- [x] Every task in `tasks.md` maps to at least one requirement; no orphan tasks.
- [x] Data model changes in `plan.md` match `docs/21-data-model.md` (updated in the same change).
- [x] Nothing contradicts the constitution (`AGENTS.md`) or an `Approved` ADR.

## Readiness

- [x] External dependencies are listed in `docs/41-blockers.md` with owner labels (none for this feature).
- [x] Test strategy names the test type for each module.
- [x] Each task has a verifiable `Done when:` line.

## Findings

| # | Finding | Resolution | Status |
| :--- | :--- | :--- | :--- |
| 1 | `level:built` fires inside `buildLevel`, before the autopilot can switch the status, so a listener cannot tell an attract build from a real one by `status`. | `world.state.attract` is set before `buildLevel`; the autopilot accepts only the blueprint that carries it, and the HUD, registered later in `src/main.ts`, never sees the attract build. | Resolved |
| 2 | `game.ts` restarts a fallen player at its checkpoint with a toast and a vignette, which would show through the overlay. | The player's `body:fell` is skipped while `status === 'attract'`; the autopilot restarts at the origin. | Resolved |
