import { DEFAULT_LOCALE, type Locale } from '../config';

/**
 * The localised slug map (DECISIONS.md §5).
 *
 * Every static page has a stable, locale-independent *page key* and one slug per
 * locale. The page key is what the rest of the codebase refers to; the slug is only
 * ever used to build a URL.
 *
 * This exists so the language switcher can answer "what is the counterpart of the
 * page I'm on, in the other locale?" — which is impossible with localised slugs
 * unless the mapping is written down somewhere.
 *
 * A slug of '' means the locale root ('/' for de, '/en' for en).
 *
 * When you add a page: add it here FIRST, then create the matching files in
 * src/pages/ and src/content/pages/. The build will fail if content is missing.
 */
export const ROUTES = {
  home: { de: '', en: '' },
  leistungen: { de: 'leistungen', en: 'services' },
  projekte: { de: 'projekte', en: 'projects' },
  'ueber-uns': { de: 'ueber-uns', en: 'about-us' },
  kontakt: { de: 'kontakt', en: 'contact' },
  blog: { de: 'blog', en: 'blog' },
  impressum: { de: 'impressum', en: 'imprint' },
  datenschutz: { de: 'datenschutz', en: 'privacy' },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof ROUTES;

/** Collection page keys whose detail pages nest beneath them. */
export const COLLECTION_PARENTS = {
  blog: 'blog',
  projekte: 'projekte',
} as const satisfies Record<string, PageKey>;

/**
 * Build the path for a static page in a given locale.
 * No trailing slash, ever (DECISIONS.md §6).
 */
export function localizedPath(key: PageKey, locale: Locale): string {
  const slug = ROUTES[key][locale];
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  if (!slug) return prefix || '/';
  return `${prefix}/${slug}`;
}

/**
 * Build the path for an entry inside a collection (a blog post, a project).
 * `slug` is already the locale-specific slug for that entry.
 */
export function localizedEntryPath(
  parent: keyof typeof COLLECTION_PARENTS,
  slug: string,
  locale: Locale,
): string {
  return `${localizedPath(COLLECTION_PARENTS[parent], locale)}/${slug}`;
}
