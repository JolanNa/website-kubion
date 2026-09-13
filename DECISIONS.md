# Architecture Decisions — Kubion Marketing Website

Living document. Decisions made before implementation started (2026-09-12).

---

## 1. Site type: static

Astro, static output (`output: 'static'`). No server runtime, no login, no user accounts.
The only dynamic piece is the contact form (see §7).

## 2. Framework: Astro 7

Chosen for static-first output, Content Collections (schema-validated content with a single
API regardless of where the content came from), and built-in i18n routing.

Scaffolded on Astro 5, upgraded to 7 immediately — starting a greenfield project two majors
behind is a cost that only grows. The upgrade required three changes, all in
`src/content.config.ts`: `z` now comes from `astro/zod` rather than `astro:content`, zod v4
moved `.email()`/`.url()` to top-level validators, and `i18n.routing.redirectToDefaultLocale`
may no longer be set alongside `prefixDefaultLocale: false`.

**Requires Node 22.12 or newer** (Astro 6 dropped Node 18 and 20).

**"Zero JS by default" is about framework runtime, not our own code.** Custom animation
JavaScript ships and runs normally. We do not need component-framework islands (React/Vue)
for animation work.

## 3. Content lives in two tiers

This is the core architectural decision.

### Tier 1 — in the repo (developer-edited)

Static marketing pages, as Astro Content Collections with one file per locale:

```
src/content/pages/home/{de,en}.mdx
src/content/projekte/<slug>/{de,en}.mdx
```

Frontmatter holds structured fields (hero headline, CTA label, feature cards); MDX body holds
prose. A small `src/i18n/{de,en}.ts` dictionary holds *chrome only* — nav labels, footer,
button text, form labels. Page prose is never flattened into key/value JSON.

Includes: Home, Leistungen, Projekte (index + detail pages), Über Uns, Kontakt, Blog (index
page only — the posts themselves come from the CMS), Impressum, Datenschutz.

**Projekte are deliberately in the repo, not the CMS.** Each project is visually bespoke and
uses custom MDX components; a CMS schema would constrain the layout. Accepted trade-off:
adding a project requires a developer, and each needs both a DE and an EN file.

**Impressum and Datenschutz are deliberately in the repo, not the CMS.** They are legal text;
changes should go through review and leave a git diff as audit trail.

### Tier 2 — in the CMS (marketing-edited)

- Blog articles — **live from launch**, not a later phase
- Team members

### Page inventory at launch

| DE | EN | Source |
|---|---|---|
| `/` | `/en` | repo |
| `/leistungen` | `/en/services` | repo |
| `/projekte` | `/en/projects` | repo |
| `/projekte/<slug>` | `/en/projects/<slug>` | repo (MDX per project) |
| `/ueber-uns` | `/en/about-us` | repo |
| `/kontakt` | `/en/contact` | repo |
| `/blog` | `/en/blog` | repo (index) + CMS (posts) |
| `/blog/<slug>` | `/en/blog/<slug>` | CMS |
| `/impressum` | `/en/imprint` | repo |
| `/datenschutz` | `/en/privacy` | repo |

Blog post slugs are localised per post (a post's DE and EN versions may have different slugs),
resolved through the same slug-map mechanism as the static pages (§5).

## 4. CMS: Sveltia CMS

Git-based, MIT-licensed, free, no hosting. Admin UI mounted at `/admin`; content is written as
MDX committed to this repo.

Chosen over:
- **Storyblok / Contentful** — hosted SaaS, recurring cost.
- **Decap CMS** — same model, dated UI, weaker i18n.
- **Keystatic** — similar, but i18n is more manual.
- **Directus** — BSL-licensed (not truly open source), needs a server + database.
- **Payload** — MIT and excellent, but needs a server + database. Fallback option if the
  GitHub-account requirement below turns out to be a blocker for editors.

Why Sveltia specifically: **i18n is a first-class feature with side-by-side DE/EN editing**,
which directly solves our "how do we maintain two languages" problem. Good media library,
usable by non-technical editors.

**Setup requirements:**
- Each editor needs a GitHub account with access to this repo (one-time; after first sign-in
  they never see GitHub again).
- Needs a GitHub OAuth client — deploy Sveltia's auth worker to Cloudflare (free tier).
- Configure a max upload dimension so repo images don't bloat over time (see §11).

**Draft workflow:** Sveltia's editorial workflow saves drafts to a branch, opening a PR.
Combined with per-PR preview deploys (§8), editors see their post on a real URL before it
goes live. Considered required, not optional — a git-based CMS without preview feels blind
to non-technical editors.

## 5. Internationalisation

- Locales: **DE (primary) and EN**.
- `defaultLocale: 'de'`, `prefixDefaultLocale: false` → `/leistungen` and `/en/services`.
- **Localised slugs**, for SEO value in both markets. Requires an explicit per-page slug map
  so the language switcher can resolve a page's counterpart in the other locale.
- Missing-translation policy: **static pages must exist in all locales** (build fails
  otherwise). **Blog posts may exist in one locale only** — a DE-only post simply does not
  appear in the EN blog index or the EN sitemap.
- Team members are locale-independent except for bio/role fields.
- `hreflang` pairs plus `x-default` on every page.

## 6. URL / build format — no trailing slash

**Decided: clean URLs with no trailing slash and no `index.html`.** `/leistungen`, not
`/leistungen/` and not `/leistungen/index.html`.

Astro config:

```js
build:  { format: 'file' },   // emits leistungen.html, not leistungen/index.html
trailingSlash: 'never',
```

Bunny Storage serves exact paths and will not resolve `/leistungen` to `leistungen.html` on
its own. Bridging that is a **Bunny Edge Scripting middleware on the pull zone** that rewrites
the request path: if the path has no file extension, append `.html`. We are already using Edge
Scripting for the contact form (§7), so this adds no new mechanism.

Plus a 301 redirect rule stripping any trailing slash (`/leistungen/` → `/leistungen`).
Without it both forms resolve and Google sees duplicate content.

Note: Bunny's plain Edge Rules have no pattern-based path-rewrite action, which is why this
goes through Edge Scripting rather than a rule. Exact syntax to be confirmed against current
Bunny docs at implementation time.

## 7. Contact form

Bunny Edge Scripting endpoint → email. Kept at Bunny to avoid a second vendor.

- **No SMTP available** at the edge (no raw TCP sockets). Email goes out via an HTTP API —
  **Brevo** or **Mailjet**, both EU-based with free tiers. Not Resend/Postmark (US).
- **Spam protection: Altcha** — MIT, proof-of-work, self-hosted, no cookies, no third-party
  processor to declare in the Datenschutzerklärung. Plus a honeypot field and a
  submission-time trap.
  - Alternatives considered: Friendly Captcha (Munich, DSGVO-native, paid), Cloudflare
    Turnstile (free/unlimited, but a US processor).
- Rate-limit by IP in the edge script.
- CRM integration is possible later from the same script (`fetch()` to HubSpot/Pipedrive with
  the key in an env var). Not needed at launch.

## 8. Hosting & deploy

- **Bunny.net**: Storage zone for `dist/`, pull zone in front.
- **GitHub Actions**: build → upload to Bunny Storage → purge pull zone cache.
- **Second pull zone for previews**, deployed per pull request. Required for the CMS draft
  workflow (§4).
- SSL via Bunny. SPF/DKIM configured for the form's sending domain.

## 9. Privacy: stay cookie-free on purpose

**Project rule.** If nothing sets a non-essential cookie or calls a third-party server, we
need no consent banner — better conversion, less legal surface, no banner to build. Cheap to
decide now, painful to retrofit. Concretely:

- **Self-host fonts** via Fontsource. Never hotlink Google Fonts — transmits visitor IPs to
  the US; a Munich court awarded damages over exactly this in 2022.
- **No YouTube/Vimeo embeds** without a click-to-load placeholder.
- **No Google Maps embed** on Kontakt — static image plus a link out.
- Cookieless analytics only (§10).

This rule is violated easily and quietly by anyone adding "just one embed." Treat any new
third-party script as a decision requiring review.

## 10. Analytics: Umami

MIT-licensed, cookieless, no personal data stored → no consent banner. Cloud free tier at
launch; self-hostable later (needs only Postgres, unlike Plausible's ClickHouse).

GA4 explicitly rejected: repeatedly ruled non-compliant with the DSGVO by European DPAs, and
would force a cookie banner.

Bunny's built-in CDN statistics (bandwidth, cache hit rate, geography) come free with the
pull zone and complement Umami; they are not a substitute.

## 11. Images

- `astro:assets` for build-time optimisation; WebP/AVIF output.
- Max upload dimension enforced in the Sveltia config. With a git-based CMS, uploaded images
  enter the repo permanently — without a cap the repo reaches gigabytes within a few years.
- Bunny Optimizer optionally on top for on-the-fly resizing.

## 12. Animation

The site is animation-heavy by design; custom-built, not templated.

- **GSAP + ScrollTrigger** for complex scroll-driven work. Entire plugin suite (SplitText,
  MorphSVG, ScrollSmoother) is free since the Webflow acquisition. ~70 KB gzipped.
- **Motion** (vanilla successor to Framer Motion) where something lighter suffices.
- **Native CSS scroll-driven animations** (`animation-timeline: view()`) for simple cases —
  zero JS.
- Vanilla JS in `<script>` tags. **No React/Vue islands for animation** — simpler and faster.
- `prefers-reduced-motion` support built in from the start, not retrofitted. Accessibility
  requirement.

**Gotcha:** if Astro View Transitions / client-side routing is enabled, animations must
initialise on `astro:page-load`, not `DOMContentLoaded`, or they silently stop working after
the first navigation. Most common Astro animation bug.

## 13. Other stack choices

- **Tailwind v4** for styling.
- **Pagefind** for blog search — static index, zero infrastructure, multilingual support.
- **RSS** feed per locale.
- **SEO**: `@astrojs/sitemap` per locale, canonical URLs, JSON-LD structured data
  (Organization on home, Person for team, BlogPosting for articles), auto-generated OG images
  via `astro-og-canvas`.
- **Accessibility**: WCAG 2.1 AA. The EAA/BFSG most likely does not cover a pure marketing
  site, but AA is close to free when built in from the start and expensive to bolt on.

## 14. CI

Runs on every pull request, blocks merge on failure:

- `astro check` — type checking for `.astro` and TypeScript, including content schema
  mismatches.
- **Link checker** — crawls built output, fails on broken internal links.
- **Lighthouse CI** with a performance budget of **~200 KB JavaScript**. The budget is a
  deliberate number that admits GSAP while catching an accidental 300 KB dependency. It is
  explicitly *not* a "zero JS" budget — see §12.

## 15. Brand and design

Two sources, with clearly separated authority:

- **The Figma design governs layout, shape, spacing and radii.** If a design exists for a
  screen, build that screen as designed.
- **The brand guideline** (`kubion_Brandguideline_v7.pdf`, v1.0 August 2026) **governs colour
  and type.**

Do not use the guideline to override a design decision. Its radius, spacing and
button-hierarchy rules are written for print and are not applied to the website. If the two
appear to conflict on something that matters, **ask** rather than picking one.

All brand values are tokens in `src/styles/global.css`. No component hardcodes a hex value or
a font family.

- **Palette (§01)**: Marine `#0A265F`, Orange `#FF6A00`, Hellblau `#BACBED`, Nebel `#EDF0F6`,
  White. Derived tints `#54678F` / `#7989AB` / `#DADEE7`.
- **Typography (§03)**: Geist Sans for content, Geist Mono for kickers, labels and captions.
  Self-hosted, so no external requests (DECISIONS.md §9).

  Loaded through **Astro's Fonts API** (`fonts` in `astro.config.mjs` + `<Font>` in
  `BaseLayout.astro`), not by importing Fontsource CSS. That buys three things:

  1. **A metric-matched fallback** — Astro generates a `@font-face` over local Arial with
     `size-adjust: 104.8%` and ascent/descent overrides, so the fallback occupies the same
     space as Geist and swapping in the real font reflows nothing.
  2. **Preload links with the hashed build filename**, which cannot be written by hand.
  3. **Only the `latin` subset ships** — 56 KB total instead of 344 KB. The `local` provider
     points straight at the latin `.woff2` inside the installed Fontsource packages, so the
     build needs no network access.

  The Fontsource `npm` provider was tried first and rejected: it pulls all five subsets and
  does not tag them, so `<Font preload>` cannot be filtered and all eleven files get
  preloaded.

  `font-display` stays `swap`. If any flash of the fallback is unacceptable, `display:
  'optional'` removes it entirely — at the cost of visitors on slow connections never seeing
  Geist on that page load.
- **Markenkern (§05)**: square, 135° `#FF6A00 → #FF9A3D`, no radius, 24–32px on the web, used
  once per page as the marker left of the hero kicker.
- **Wordmark (§08)**: drawn, never typeset — rendered from the supplied SVG in
  `src/components/Logo.astro`. Its fill is `currentColor`, giving the two sanctioned
  colourways (white on Marine, Marine on light) and making the forbidden orange version
  impossible by accident. The component throws below the 90px minimum width.

### Contrast notes

Recomputing the guideline's contrast table reproduced its published ratios exactly
(14.4 / 8.8 / 5.0 / 2.9), which confirms the palette hexes are correct. Two values are worth
knowing before they get used somewhere new:

- **White on Orange is 2.87:1** and fails WCAG AA for text. Fine for the Markenkern and other
  non-text areas; not for a label. Marine on Orange is 5.03:1 and passes.
- **Marine 45% (`#7989AB`) on white is 3.51:1** and fails AA at body size, although §01
  assigns it to footers and captions. Prefer `#54678F` (5.65:1) for small text.

### Open

- The icon artwork (§09) has not been supplied; it is needed for the favicon.

---

## Open items

- Confirm the exact Bunny Edge Scripting rewrite syntax for §6 against current Bunny docs at
  implementation time. This is the one piece of the stack with no fallback if it doesn't work
  as expected — worth proving out early with a throwaway deploy before building on it.
- Design exists but is not yet handed over. Figma MCP connector is configured but not
  authorised — needs authorisation via claude.ai connector settings before it can be read.
- See `LAUNCH-CHECKLIST.md` for things that must happen *before go-live*, especially the
  301 redirect map.
