# Launch Checklist

Things that must be done **before** the new site goes live. Architecture decisions live in
`DECISIONS.md`.

---

## 🔴 Critical — irreversible if missed

### 301 redirect map from the existing website

**There is an existing Kubion website.** Its accumulated search ranking is tied to its current
URLs. If the new site goes live without redirects, that ranking is lost and cannot be
recovered afterwards — you would be starting from zero in Google.

This is cheap to do now and impossible to undo later. **Do not launch without it.**

Steps:

- [ ] Record the existing domain and confirm whether the domain itself stays the same
      → existing domain: `TODO — fill in`
- [ ] Export a complete list of live URLs on the existing site. Sources, in order of
      completeness:
  - [ ] Google Search Console → Pages report (shows what Google actually has indexed)
  - [ ] The existing site's `sitemap.xml`
  - [ ] A crawl (Screaming Frog free tier covers 500 URLs)
  - [ ] Server access logs, if available, to catch URLs nothing links to any more
- [ ] Pull the top-traffic and top-ranking pages from Search Console — these matter most and
      must be mapped by hand, not guessed
- [ ] Build the old-URL → new-URL mapping table. Every old URL maps to the closest
      equivalent new page; map to the homepage only as a last resort (Google treats
      mass-redirect-to-homepage as a soft 404)
- [ ] Note which old URLs have **inbound links from other websites** (Search Console → Links).
      These carry the most SEO value and must not break
- [ ] Implement the redirects as **301 (permanent)**, not 302, via Bunny edge rules
- [ ] Test every redirect against the real list after deploy, before DNS cutover

### Analytics & Search Console continuity

- [ ] Verify the new site in Google Search Console before cutover
- [ ] Submit the new per-locale sitemaps
- [ ] If the domain changes, file a Change of Address in Search Console
- [ ] Confirm Umami is recording before launch, not after

---

## Legal (DE)

- [ ] Impressum complete per §5 DDG and reachable within two clicks from every page
- [ ] Datenschutzerklärung accurately reflects the tooling actually in use — Umami, the form
      handler, the email provider (Brevo/Mailjet), Bunny as CDN/hosting
- [ ] AVV / data processing agreements in place with Bunny and the email provider
- [ ] Contact form carries a privacy notice and its consent checkbox
- [ ] Verify the cookie-free rule actually holds in production (`DECISIONS.md` §9) — check
      DevTools → Application → Cookies on every page; if it holds, no consent banner is needed

## Technical

- [ ] **Remove `src/components/DevScrollFiller.astro`** and its use in
      `src/pages/index.astro` and `src/pages/en/index.astro`. It is placeholder copy and
      hatched boxes that exist only so the homepage scrolls during development.
- [ ] `hreflang` DE/EN pairs plus `x-default` correct on every page
- [ ] Clean URLs verified live: `/leistungen` resolves, `/leistungen/` 301s to it, and
      `/leistungen.html` 301s to it too (`DECISIONS.md` §6) — otherwise duplicate content
- [ ] Canonical tags point at the no-trailing-slash form everywhere
- [ ] Both per-locale sitemaps generated and referenced in `robots.txt`
- [ ] `robots.txt` does **not** block the live site (the classic staging-config launch bug)
- [ ] Preview pull zone is `noindex` — never let the staging site get indexed
- [ ] Localised 404 pages, wired up in the Bunny pull zone
- [ ] SSL active, HTTP → HTTPS redirect, and www / non-www canonicalised to one of the two
- [ ] SPF and DKIM configured for the form's sending domain, and a real test submission
      arrives and does not land in spam
- [ ] Contact form spam protection verified live (Altcha + honeypot + rate limit)
- [ ] OG images render correctly — test with real shares on LinkedIn and WhatsApp
- [ ] Lighthouse passes the agreed budget on the production build
- [ ] `prefers-reduced-motion` genuinely disables the animations

## CMS handover

- [ ] Editors invited to the repo and each has completed first GitHub sign-in via Sveltia
- [ ] Sveltia OAuth worker deployed to Cloudflare and working
- [ ] Draft → PR → preview deploy workflow demonstrated end to end with an editor
- [ ] Max image upload dimension configured and verified
- [ ] Short written handover for editors: how to write a post, how to add a team member, how
      translations work
