# Specification: Installable site (Android and iOS)

Status: Implemented, not merged

## Objective

A visitor on a phone can install `https://orbe.naindev.com/` from the browser and open it like an app: its own
icon and name on the home screen and a window with no browser bar. Android Chrome and iOS Safari are the targets.

The shared contract, the verified browser criteria and the approved names live in the portfolio spec
`specs/next-pwa-install/spec.md` of the `nain9dev.github.io` repository (verified 2026-11-13); this spec does
not repeat them. Names approved by the owner on 2026-11-13: `short_name` `Orbe Runner`, `name`
`Orbe Runner 3D`.

Numbered `REQ-PWA.xx` until the merge train assigns the spec number.

## Functional requirements (EARS)

- **REQ-PWA.01**: The site shall publish `manifest.webmanifest` at its root, declaring `id`, `start_url` and
  `scope` as `./`, `display` as `standalone`, `name` as `Orbe Runner 3D`, `short_name` as `Orbe Runner`, `lang`
  as `es`, `dir` as `ltr`, and no `prefer_related_applications`.
- **REQ-PWA.02**: The manifest shall reuse the page meta description verbatim and declare `theme_color` equal to
  the page `theme-color` meta (`#030514`) and `background_color` as `#030514`, both literal `#rrggbb`.
- **REQ-PWA.03**: The manifest shall declare three PNG icons that exist at the declared size, one purpose each:
  192 px and 512 px `any`, and 512 px `maskable` (opaque, mark inside the centred circle of radius 40% of the
  width); `icons/apple-touch-icon.png` shall be 180 px and opaque.
- **REQ-PWA.04**: When the page is served, `index.html` shall link the manifest and the Apple touch icon and
  carry `mobile-web-app-capable` and `apple-mobile-web-app-capable` set to `yes`,
  `apple-mobile-web-app-title` equal to `Orbe Runner`, and `apple-mobile-web-app-status-bar-style` set to
  `black` (the page is dark).
- **REQ-PWA.05**: The site shall register no service worker and ship no cache or offline page.

## Edge cases and error handling

- The manifest and `icons/` live in `public/`, which Vite copies unchanged to the root of `dist/`; the Pages
  workflow publishes `./dist`. The repository has no Content-Security-Policy and no SPA fallback.
- The mark is the bare cyan disc of the inline SVG favicon; the `any` icons and the maskable and Apple icons sit
  on the page background `#030514` so the disc does not vanish on a light launcher.
- The committed `dist/` is stale build output (see `docs/60-runbook.md`); it is not touched. CI rebuilds it.
- Offline: an installed window without network shows the browser's own offline screen.

## Out of scope

- A service worker, offline pages or any cache (owner decision of 2026-11-13).
- An in-page install button, screenshots for the richer Android dialog, a store package.

## Acceptance criteria

- `npm run check` passes with `tests/pwa-install.test.ts` in the list.
- Chrome reports no installability error for the built `dist/` (`Page.getInstallabilityErrors`).
- After the deploy, the live manifest answers 200 and the owner installs the game on Android and on an iPhone:
  the disc shows uncropped and the label reads `Orbe Runner`.

## Session state

<!-- Session handoff: keep current. What is done, what is verified, what is next, what is blocked. -->
- Last updated: 2026-11-14, session pwa-install-orbe
- Done: T-PWA.01 to T-PWA.04.
- Verified: `npm run typecheck`, `npm test` (14 files, 226 tests) and `npm run build` pass; Chrome reports no
  installability error on the built `dist/`.
- Next: T-PWA.05 after the merge.
- Blocked: nothing. T-PWA.05 needs the owner's phones.
