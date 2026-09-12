import type { Locale } from '../config';

/**
 * Chrome only — navigation, footer, buttons, form labels, aria text.
 *
 * DECISIONS.md §3: page prose does NOT go here. Marketing copy lives in
 * src/content/pages/<page>/<locale>.mdx, where it can be edited as prose rather
 * than as a flattened key/value tree.
 *
 * Rule of thumb: if a translator would need to see the page to translate it, it
 * belongs in the content collection, not in this file.
 */
export const UI = {
  de: {
    'nav.home': 'Home',
    'nav.leistungen': 'Leistungen',
    'nav.projekte': 'Projekte',
    'nav.ueberUns': 'Über uns',
    'nav.kontakt': 'Kontakt',
    'nav.blog': 'Blog',
    'nav.impressum': 'Impressum',
    'nav.datenschutz': 'Datenschutz',

    'nav.menu.open': 'Menü öffnen',
    'nav.menu.close': 'Menü schließen',
    'nav.skipToContent': 'Zum Inhalt springen',

    'lang.switchTo': 'Switch to English',
    'lang.label': 'Sprache',

    'blog.title': 'Blog',
    'blog.readMore': 'Weiterlesen',
    'blog.publishedOn': 'Veröffentlicht am',
    'blog.by': 'von',
    'blog.empty': 'Noch keine Beiträge vorhanden.',
    'blog.search': 'Beiträge durchsuchen',

    'projekte.title': 'Projekte',
    'projekte.client': 'Kunde',
    'projekte.year': 'Jahr',
    'projekte.services': 'Leistungen',
    'projekte.viewProject': 'Projekt ansehen',

    'team.title': 'Unser Team',

    'form.name': 'Name',
    'form.email': 'E-Mail',
    'form.company': 'Unternehmen',
    'form.message': 'Nachricht',
    'form.submit': 'Nachricht senden',
    'form.sending': 'Wird gesendet …',
    'form.success': 'Vielen Dank! Wir melden uns in Kürze bei Ihnen.',
    'form.error': 'Da ist etwas schiefgelaufen. Bitte versuchen Sie es erneut.',
    'form.required': 'Pflichtfeld',
    'form.privacyConsent':
      'Ich habe die Datenschutzerklärung gelesen und stimme der Verarbeitung meiner Daten zu.',

    'footer.rights': 'Alle Rechte vorbehalten.',

    '404.title': 'Seite nicht gefunden',
    '404.body': 'Diese Seite existiert nicht (mehr).',
    '404.home': 'Zur Startseite',
  },

  en: {
    'nav.home': 'Home',
    'nav.leistungen': 'Services',
    'nav.projekte': 'Projects',
    'nav.ueberUns': 'About us',
    'nav.kontakt': 'Contact',
    'nav.blog': 'Blog',
    'nav.impressum': 'Imprint',
    'nav.datenschutz': 'Privacy',

    'nav.menu.open': 'Open menu',
    'nav.menu.close': 'Close menu',
    'nav.skipToContent': 'Skip to content',

    'lang.switchTo': 'Auf Deutsch wechseln',
    'lang.label': 'Language',

    'blog.title': 'Blog',
    'blog.readMore': 'Read more',
    'blog.publishedOn': 'Published on',
    'blog.by': 'by',
    'blog.empty': 'No posts yet.',
    'blog.search': 'Search posts',

    'projekte.title': 'Projects',
    'projekte.client': 'Client',
    'projekte.year': 'Year',
    'projekte.services': 'Services',
    'projekte.viewProject': 'View project',

    'team.title': 'Our team',

    'form.name': 'Name',
    'form.email': 'Email',
    'form.company': 'Company',
    'form.message': 'Message',
    'form.submit': 'Send message',
    'form.sending': 'Sending …',
    'form.success': 'Thank you! We will get back to you shortly.',
    'form.error': 'Something went wrong. Please try again.',
    'form.required': 'Required',
    'form.privacyConsent':
      'I have read the privacy policy and consent to the processing of my data.',

    'footer.rights': 'All rights reserved.',

    '404.title': 'Page not found',
    '404.body': 'This page does not exist (any more).',
    '404.home': 'Go to homepage',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof UI)['de'];

/**
 * Returns a translation function for a locale.
 *
 * Typed against the German dictionary, so a key that exists in one locale but not
 * the other is a compile-time error rather than a missing string in production.
 */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return UI[locale][key];
  };
}
