// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// REQ-PWA.01 to REQ-PWA.04: the site installs on Android Chrome and iOS Safari.
// Vite copies `public/` to the root of `dist/`, which the Pages workflow publishes.
const read = (relative: string): Buffer =>
  readFileSync(new URL(`../${relative}`, import.meta.url));
const text = (relative: string): string => read(relative).toString('utf8');

const html = text('index.html');
const SHORT_NAME = 'Orbe Runner';

interface Icon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}
interface Manifest {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: string;
  dir: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  prefer_related_applications?: unknown;
  icons: Icon[];
}

const manifestExists = existsSync(new URL('../public/manifest.webmanifest', import.meta.url));
const manifest = (manifestExists ? JSON.parse(text('public/manifest.webmanifest')) : {}) as Manifest;

function metaContent(name: string): string[] {
  const pattern = new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"\\s*/?>`, 'g');
  return [...html.matchAll(pattern)].map((m) => m[1] ?? '');
}

function linkHref(rel: string): string[] {
  const pattern = new RegExp(`<link\\s+rel="${rel}"\\s+href="([^"]*)"\\s*/?>`, 'g');
  return [...html.matchAll(pattern)].map((m) => m[1] ?? '');
}

/** Width and height from the IHDR chunk of a PNG. */
function pngHeader(relative: string): { width: number; height: number } {
  const bytes = read(relative);
  expect(bytes.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('Web app manifest — REQ-PWA.01, REQ-PWA.02', () => {
  it('declares the installable members with the approved names', () => {
    expect(manifest.name).toBe('Orbe Runner 3D');
    expect(manifest.short_name).toBe(SHORT_NAME);
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.id).toBe(manifest.start_url);
    expect(manifest.lang).toBe('es');
    expect(manifest.dir).toBe('ltr');
    expect(manifest).not.toHaveProperty('prefer_related_applications');
  });

  it('reuses the page description and colours', () => {
    expect(manifest.description).toBe(metaContent('description')[0]);
    expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/);
    expect(manifest.theme_color).toBe(metaContent('theme-color')[0]);
    expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('declares PNG icons that exist at the declared size, one purpose each', () => {
    const wanted = [
      ['./icons/icon-192.png', '192x192', 'any'],
      ['./icons/icon-512.png', '512x512', 'any'],
      ['./icons/icon-maskable-512.png', '512x512', 'maskable'],
    ];
    expect(manifest.icons.map((i) => [i.src, i.sizes, i.purpose])).toEqual(wanted);
    for (const icon of manifest.icons) {
      expect(icon.type).toBe('image/png');
      const { width, height } = pngHeader(`public/${icon.src.replace('./', '')}`);
      expect(`${width}x${height}`).toBe(icon.sizes);
    }
  });

  it('ships a 180 px Apple touch icon', () => {
    // Opacity is not checkable from the header alone: `verify-install` decodes the pixels.
    const apple = pngHeader('public/icons/apple-touch-icon.png');
    expect([apple.width, apple.height]).toEqual([180, 180]);
  });
});

describe('Document head — REQ-PWA.03', () => {
  it('links the manifest and the Apple touch icon', () => {
    expect(linkHref('manifest')).toEqual(['./manifest.webmanifest']);
    expect(linkHref('apple-touch-icon')).toEqual(['./icons/apple-touch-icon.png']);
  });

  it('carries the standalone and iOS tags', () => {
    expect(metaContent('mobile-web-app-capable')).toEqual(['yes']);
    expect(metaContent('apple-mobile-web-app-capable')).toEqual(['yes']);
    expect(metaContent('apple-mobile-web-app-title')).toEqual([SHORT_NAME]);
    expect(metaContent('apple-mobile-web-app-status-bar-style')).toEqual(['black']);
    expect(metaContent('theme-color')).toHaveLength(1);
  });
});

describe('Installable only — REQ-PWA.04', () => {
  it('registers no service worker', () => {
    expect(html).not.toMatch(/serviceWorker/);
    expect(existsSync(new URL('../public/sw.js', import.meta.url))).toBe(false);
  });
});
