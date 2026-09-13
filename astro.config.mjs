// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Keep in sync with SITE_URL in src/config.ts.
// (Not imported, so that the Astro config stays dependency-free at load time.)
const SITE_URL = process.env.SITE_URL ?? 'https://www.kubion.de';

// See DECISIONS.md §5 (i18n) and §6 (URL format).
export default defineConfig({
  site: SITE_URL,
  output: 'static',

  // DECISIONS.md §6 — clean URLs, no trailing slash, no index.html.
  // `format: 'file'` emits `leistungen.html` rather than `leistungen/index.html`.
  // Bunny needs an Edge Scripting middleware to map /leistungen -> leistungen.html;
  // see edge/rewrite-html.js.
  build: { format: 'file' },
  trailingSlash: 'never',

  // DECISIONS.md §5 — German is primary and unprefixed, English lives under /en.
  // Slugs are localised per page, so the actual routes are defined explicitly in
  // src/pages/** and mapped in src/i18n/routes.ts. Astro's i18n config here only
  // handles locale detection and default-locale behaviour.
  i18n: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    routing: {
      prefixDefaultLocale: false,
      // Note: `redirectToDefaultLocale` is deliberately absent. Since Astro 6 it
      // may only be set when `prefixDefaultLocale: true`, and it would be a no-op
      // here anyway — German already lives at the root.
    },
  },

  integrations: [
    mdx(),
    sitemap({
      // Per-locale sitemaps with correct hreflang pairs.
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE', en: 'en' },
      },
      filter: (page) => !page.includes('/admin'),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  /*
   * Fonts (DECISIONS.md §15) — handled by Astro's Fonts API rather than by
   * importing Fontsource CSS directly, for three reasons:
   *
   *  1. It generates a metric-matched fallback @font-face (size-adjust,
   *     ascent/descent overrides) so the fallback occupies the same space as
   *     Geist. That is what removes the reflow when the real font arrives.
   *  2. It emits <link rel="preload"> with the hashed build filename, which we
   *     could not write by hand.
   *  3. It downloads nothing at runtime — files are served from our own origin,
   *     keeping the cookie-free rule intact (DECISIONS.md §9).
   *
   * The `local` provider points straight at the latin woff2 inside the
   * installed @fontsource-variable packages, so the build needs no network
   * access and exactly one file ships per family.
   *
   * Referencing the file rather than the package's index.css is deliberate: the
   * npm/Fontsource entry pulls in all five subsets (cyrillic, cyrillic-ext,
   * vietnamese, latin-ext, latin) and does not tag them, so `preload` cannot be
   * filtered and all eleven files end up preloaded. German umlauts and ß live in
   * U+0000–00FF, so latin alone covers this site.
   */
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-geist-sans',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2'],
          },
        ],
      },
      fallbacks: ['Inter', 'Arial', 'system-ui', 'sans-serif'],
    },
    {
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'],
          },
        ],
      },
      fallbacks: ['JetBrains Mono', 'Consolas', 'ui-monospace', 'monospace'],
    },
  ],

  image: {
    // DECISIONS.md §11 — build-time optimisation, modern formats.
    responsiveStyles: true,
  },
});
