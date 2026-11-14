# Tasks: Installable site (Android and iOS)

One task at a time, test first. Update the `Session state` block in `spec.md` after closing each one.

- [x] **T-PWA.01** `[A]` `tests/pwa-install.test.ts` written first.
  - **Covers**: REQ-PWA.01 … REQ-PWA.05
  - **Done when**: the file runs and fails before the manifest, icons and tags exist.
- [x] **T-PWA.02** `[A]` `public/manifest.webmanifest` and `public/icons/` rendered from the favicon disc.
  - **Covers**: REQ-PWA.01, REQ-PWA.02, REQ-PWA.03
  - **Done when**: the manifest and icon cases of the test pass.
- [x] **T-PWA.03** `[A]` Head tags in `index.html`.
  - **Covers**: REQ-PWA.04
  - **Done when**: the head cases of the test pass.
- [x] **T-PWA.04** `[A]` Build and installability check.
  - **Covers**: REQ-PWA.01 … REQ-PWA.05
  - **Done when**: `npm run check` passes, `dist/` holds the manifest and four icons, and Chrome reports no
    installability error.
- [ ] **T-PWA.05** `[H]` After the merge, check the live manifest and install on Android and iOS.
  - **Covers**: REQ-PWA.01 … REQ-PWA.04
  - **Done when**: the live manifest answers 200, and the owner installs the game on both phones with the disc
    uncropped and the label `Orbe Runner`.
  - **Needs from owner**: an Android phone and an iPhone.
