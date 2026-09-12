/** Canonical site URL. Keep in sync with SITE_URL in astro.config.mjs. */
export const SITE_URL = import.meta.env.SITE_URL ?? 'https://www.kubion.de';

export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'de';

/** Full BCP-47 tags, used for <html lang> and hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en',
};

export const SITE_NAME = 'Kubion';
