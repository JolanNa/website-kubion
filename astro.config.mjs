// @ts-check
import { defineConfig } from 'astro/config';
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
      redirectToDefaultLocale: false,
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

  image: {
    // DECISIONS.md §11 — build-time optimisation, modern formats.
    responsiveStyles: true,
  },
});
