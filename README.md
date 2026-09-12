# Kubion — Marketing Website

Static marketing site built with Astro, content managed through Sveltia CMS,
deployed to Bunny.net.

**Read [DECISIONS.md](DECISIONS.md) first.** It records what was chosen, what was
rejected, and why. [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md) covers what must happen
before go-live — most importantly the 301 redirect map from the existing website.

## Getting started

```bash
pnpm install
pnpm dev
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server at http://localhost:4321 |
| `pnpm build` | Production build into `dist/` + Pagefind search index |
| `pnpm preview` | Serve the built site locally |
| `pnpm check` | Type check, including content schemas |
| `pnpm run deploy` | Upload `dist/` to Bunny Storage and purge the CDN cache |

## How content works

Content lives in **two tiers** (DECISIONS.md §3). This is the central idea of the
project; everything else follows from it.

### Tier 1 — in the repo, edited by developers

```
src/content/pages/<pageKey>/<locale>.mdx     Static marketing pages
src/content/projekte/<slug>/<locale>.mdx     Project case studies
```

Frontmatter holds the structured bits (hero, CTA); the MDX body holds prose.
Chrome strings — nav, footer, buttons, form labels — live in `src/i18n/ui.ts`.
Page prose never goes in `ui.ts`.

### Tier 2 — in the CMS, edited by marketing

```
src/content/blog/<locale>/<slug>.mdx         Blog posts
src/content/team/<locale>/<slug>.mdx         Team members
```

Sveltia CMS writes these files straight into the repo. There is no database and no
external service — the repo *is* the content store.

## Adding a new static page

1. Add the page key and its per-locale slugs to `src/i18n/routes.ts`.
2. Create `src/content/pages/<pageKey>/de.mdx` **and** `en.mdx`.
   Both are mandatory — the build fails if a locale is missing (DECISIONS.md §5).
3. Create the route files: `src/pages/<german-slug>.astro` and
   `src/pages/en/<english-slug>.astro`, each delegating to `<StaticPage />`.
4. Add it to the `NAV` array in `src/components/Header.astro` if it belongs in the nav.

Routes are written out explicitly rather than generated, because slugs are localised
and can't be derived from the page key.

## Gotchas worth knowing

These each cost time to rediscover.

**Page keys must be lowercase.** Astro's glob loader lowercases entry IDs, so a
camelCase directory (`ueberUns/`) silently fails to resolve. Use kebab-case.

**Never name a frontmatter field `slug`.** It's reserved — Astro's glob loader uses
it to override the entry ID, which erases the locale from the ID and makes every
dynamic route generate zero pages. The localised slug field is called `urlSlug`.

**`Astro.url.pathname` includes `.html` at build time**, because we build with
`format: 'file'`. Anything constructing a public URL must strip it — see the
canonical URL handling in `src/layouts/BaseLayout.astro`.

**Initialise client-side JS on `astro:page-load`, not `DOMContentLoaded`.** With View
Transitions enabled, `DOMContentLoaded` fires only on the first load, so animations
and event handlers silently die after the first navigation (DECISIONS.md §12).

**Never link Google Fonts or add third-party embeds.** The site is deliberately
cookie-free so it needs no consent banner; one embed undoes that (DECISIONS.md §9).
Self-host fonts via Fontsource.

**`sharp` is a direct dependency** and must stay one. Under pnpm's strict linking it
isn't reachable as a transitive dependency of Astro, and image optimisation fails at
build time.

## Setup still required

The scaffold builds and runs, but these need real credentials before anything
deploys. Search the repo for `TODO` to find them.

- **`public/admin/config.yml`** — set the real GitHub `repo`, and deploy
  [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to Cloudflare for
  `base_url`.
- **GitHub Actions** — set the repository variables and secrets listed in
  `.env.example` (`BUNNY_*`, `PREVIEW_*`).
- **`edge/rewrite-html.js`** — deploy to a throwaway Bunny pull zone and verify it
  works **before** building more pages. Clean URLs depend entirely on it, and the
  SDK surface is unverified. See DECISIONS.md "Open items".
- **Contact form** — not built yet. See DECISIONS.md §7 for the design.
- **Legal pages** — `impressum` and `datenschutz` are placeholders full of `TODO`.

## Project layout

```
src/
  config.ts              Site URL, locales
  content.config.ts      Collection schemas
  i18n/
    routes.ts            The localised slug map — start here for routing
    ui.ts                Chrome strings only
  lib/
    content.ts           Content loading, hreflang alternates
    images.ts            Resolves CMS image paths to optimised assets
  layouts/BaseLayout.astro   <head>, SEO, hreflang, structured data
  components/            Shared page shells
  pages/                 Explicit routes, one thin file per page per locale
edge/                    Bunny Edge Scripts
scripts/                 Deployment
```
