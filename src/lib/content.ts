import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../config';
import { isPageKey, localizedEntryPath, localizedPath, type PageKey } from '../i18n/routes';

const isProd = import.meta.env.PROD;

/** Drafts are visible in dev, hidden in production builds. */
function published<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  return isProd ? entries.filter((e) => !e.data.draft) : entries;
}

/* ------------------------------------------------------------------ *
 * Static pages (repo, Tier 1)
 * ------------------------------------------------------------------ */

/**
 * Loads a static page's content for a locale.
 *
 * Throws when the translation is missing. That is deliberate: DECISIONS.md §5 says
 * static pages must exist in every locale, so a missing file should break the build
 * loudly rather than silently rendering an empty page.
 */
export async function loadPage(key: PageKey, locale: Locale) {
  const entry = await getEntry('pages', `${key}/${locale}`);
  if (!entry) {
    throw new Error(
      `Missing page content: src/content/pages/${key}/${locale}.mdx\n` +
        `Static pages must exist in all locales (DECISIONS.md §5).`,
    );
  }
  return entry;
}

export type PageSection = CollectionEntry<'pages'>['data']['sections'][string];

/**
 * Reads one section of a page by id.
 *
 * Throws when it is missing, for the same reason loadPage does: a page that
 * silently drops a section is harder to notice than a failed build.
 */
export function pageSection(entry: CollectionEntry<'pages'>, id: string): PageSection {
  const section = entry.data.sections[id];
  if (!section) {
    throw new Error(`Missing section "${id}" in src/content/pages/${entry.id}.mdx.`);
  }
  return section;
}

/**
 * Resolves a frontmatter CTA to a URL.
 *
 * `page` holds a page key, so the localised slug resolves automatically; an
 * unknown key throws rather than shipping a dead link. `href` is the escape
 * hatch for external links and anchors.
 */
export function ctaHref(
  cta: { page?: string; href?: string; anchor?: string },
  locale: Locale,
  context: string,
): string {
  const hash = cta.anchor ? `#${cta.anchor}` : '';
  if (cta.page) {
    if (!isPageKey(cta.page)) {
      throw new Error(
        `Unknown page key "${cta.page}" in ${context}.\n` +
          `Valid keys are defined in src/i18n/routes.ts.`,
      );
    }
    return `${localizedPath(cta.page, locale)}${hash}`;
  }
  return cta.href ?? (hash || '#');
}

/* ------------------------------------------------------------------ *
 * Blog (CMS, Tier 2)
 * ------------------------------------------------------------------ */

/** Every published post in a locale, newest first. */
export async function getPosts(locale: Locale) {
  const posts = await getCollection('blog', (e) => e.id.startsWith(`${locale}/`));
  return published(posts).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

/** The URL slug for a post — explicit frontmatter slug wins over the filename. */
export function postSlug(entry: CollectionEntry<'blog'>): string {
  return entry.data.urlSlug ?? entry.id.split('/').slice(1).join('/');
}

export function postPath(entry: CollectionEntry<'blog'>, locale: Locale): string {
  return localizedEntryPath('blog', postSlug(entry), locale);
}

/* ------------------------------------------------------------------ *
 * Projekte (repo, Tier 1)
 * ------------------------------------------------------------------ */

export async function getProjekte(locale: Locale) {
  const projects = await getCollection('projekte', (e) => e.id.endsWith(`/${locale}`));
  return published(projects).sort((a, b) => a.data.order - b.data.order);
}

export function projektSlug(entry: CollectionEntry<'projekte'>): string {
  return entry.data.urlSlug ?? entry.id.split('/')[0];
}

export function projektPath(entry: CollectionEntry<'projekte'>, locale: Locale): string {
  return localizedEntryPath('projekte', projektSlug(entry), locale);
}

/* ------------------------------------------------------------------ *
 * Stellenanzeigen (repo, Tier 1)
 * ------------------------------------------------------------------ */

/** Every published role in a locale, featured ones first. */
export async function getJobs(locale: Locale) {
  const jobs = await getCollection('jobs', (e) => e.id.endsWith(`/${locale}`));
  return published(jobs).sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.order - b.data.order,
  );
}

export function jobSlug(entry: CollectionEntry<'jobs'>): string {
  return entry.data.urlSlug ?? entry.id.split('/')[0];
}

export function jobPath(entry: CollectionEntry<'jobs'>, locale: Locale): string {
  return localizedEntryPath('karriere', jobSlug(entry), locale);
}

/* ------------------------------------------------------------------ *
 * Team (CMS, Tier 2)
 * ------------------------------------------------------------------ */

export async function getTeam(locale: Locale) {
  const members = await getCollection('team', (e) => e.id.startsWith(`${locale}/`));
  return published(members).sort((a, b) => a.data.order - b.data.order);
}

/** The team member a post's `author` field points at, in the post's locale. */
export async function getAuthor(key: string | undefined, locale: Locale) {
  if (!key) return undefined;
  const team = await getTeam(locale);
  return team.find((member) => member.data.translationKey === key);
}

/* ------------------------------------------------------------------ *
 * hreflang alternates
 * ------------------------------------------------------------------ */

export type Alternate = { locale: Locale; path: string };

/** Alternates for a static page — always complete, since all locales must exist. */
export function pageAlternates(key: PageKey): Alternate[] {
  return LOCALES.map((locale) => ({ locale, path: localizedPath(key, locale) }));
}

/**
 * Alternates for a blog post.
 *
 * Posts may exist in only one locale (DECISIONS.md §5), so this resolves the
 * counterpart through `translationKey` and returns only the locales that actually
 * have a version. Emitting hreflang for a URL that 404s is an SEO error, so the
 * omission matters.
 */
export async function postAlternates(
  entry: CollectionEntry<'blog'>,
): Promise<Alternate[]> {
  const siblings = await getCollection(
    'blog',
    (e) => e.data.translationKey === entry.data.translationKey,
  );

  return published(siblings).flatMap((sibling) => {
    const locale = sibling.id.split('/')[0] as Locale;
    if (!LOCALES.includes(locale)) return [];
    return [{ locale, path: postPath(sibling, locale) }];
  });
}

/** Alternates for a project — always complete, like static pages. */
export async function projektAlternates(
  entry: CollectionEntry<'projekte'>,
): Promise<Alternate[]> {
  const folder = entry.id.split('/')[0];
  const siblings = await getCollection('projekte', (e) => e.id.startsWith(`${folder}/`));

  return published(siblings).flatMap((sibling) => {
    const locale = sibling.id.split('/')[1] as Locale;
    if (!LOCALES.includes(locale)) return [];
    return [{ locale, path: projektPath(sibling, locale) }];
  });
}

/** Alternates for a role — like projects, every locale should have one. */
export async function jobAlternates(entry: CollectionEntry<'jobs'>): Promise<Alternate[]> {
  const folder = entry.id.split('/')[0];
  const siblings = await getCollection('jobs', (e) => e.id.startsWith(`${folder}/`));

  return published(siblings).flatMap((sibling) => {
    const locale = sibling.id.split('/')[1] as Locale;
    if (!LOCALES.includes(locale)) return [];
    return [{ locale, path: jobPath(sibling, locale) }];
  });
}

export { DEFAULT_LOCALE };
