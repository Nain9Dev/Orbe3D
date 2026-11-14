# Implementation plan: Installable site (Android and iOS)

Status: Draft

## Modules

- **Manifest**: `public/manifest.webmanifest`. Covers REQ-PWA.01, REQ-PWA.02.
- **Icons**: `public/icons/{icon-192,icon-512,icon-maskable-512,apple-touch-icon}.png`, rendered from the favicon
  disc. Covers REQ-PWA.03.
- **Head tags**: `index.html`, right after the `theme-color` meta. Covers REQ-PWA.04.
- **Contract test**: `tests/pwa-install.test.ts`, run by the existing `npm test`. Covers REQ-PWA.01 to .05.

No data model change and no diagram: the feature adds no flow or entity.

## Publishing

Vite copies `public/` to the root of `dist/` and leaves the root-relative links as written; the Pages workflow
(`.github/workflows/deploy.yml`) uploads `./dist`. No workflow change.

## Key decisions

- **Decision**: relative paths (`./`) for `id`, `start_url`, `scope` and every link.
  - **Discarded alternative**: root-absolute paths.
  - **Rationale**: `vite.config.ts` sets `base: './'` and the page already uses relative asset paths.
- **Decision**: icons on a `#030514` tile.
  - **Discarded alternative**: transparent disc.
  - **Rationale**: a bare cyan disc on a transparent background is invisible on some launchers.

## Icon command

The mark is the URL-decoded SVG of the `<link rel="icon">` in `index.html` (a cyan disc, `#05d9e8`, radius 12
in a 32 px box), saved as `mark.svg` outside the repository:

```
node make-install-icons.mjs --source mark.svg --out public/icons --bg "#030514" --any-bg "#030514" --maskable-scale 0.9 --apple-scale 1
```

The disc covers 36% of the maskable tile, inside the 40% safe radius.

## Test strategy

Static, in the repository's vitest setup: manifest members and exact names, icon files at the declared size
(PNG header), head tags, no service worker. Opacity of the Apple and maskable icons is checked outside the
suite by the pixel-decoding install verifier.
