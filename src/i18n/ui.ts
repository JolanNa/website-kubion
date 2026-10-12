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
    'nav.primary': 'Hauptnavigation',
    'nav.primaryMobile': 'Hauptnavigation (mobil)',
    'nav.card.kicker': 'Kontakt',
    'nav.card.text': 'Sie haben ein Projekt im Kopf? Schreiben Sie uns.',
    'nav.card.cta': 'Kontakt aufnehmen',
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
    'blog.author': 'Über den Autor',
    'blog.summary': 'Kurz gefasst',
    'blog.cta.kicker': 'Kontakt',
    'blog.cta.heading': 'Ein ähnliches Thema bei Ihnen?',
    'blog.cta.text': 'Schreiben Sie uns – wir schauen gemeinsam, was sich daraus machen lässt.',
    'blog.cta.primary': 'Kontakt aufnehmen',
    'blog.cta.secondary': 'Weitere Beiträge',

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
    'nav.primary': 'Main navigation',
    'nav.primaryMobile': 'Main navigation (mobile)',
    'nav.card.kicker': 'Contact',
    'nav.card.text': 'Got a project in mind? Drop us a line.',
    'nav.card.cta': 'Get in touch',
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
    'blog.author': 'About the author',
    'blog.summary': 'In short',
    'blog.cta.kicker': 'Contact',
    'blog.cta.heading': 'Facing something similar?',
    'blog.cta.text': 'Drop us a line – we will work out together what can be done.',
    'blog.cta.primary': 'Get in touch',
    'blog.cta.secondary': 'More posts',

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

/**
 * The Leistungen mega-menu.
 *
 * Navigation chrome rather than page prose, so it lives here alongside the other
 * nav strings rather than in a content collection (DECISIONS.md §3). If these
 * grow into real marketing copy, move them into src/content/pages/leistungen.
 */
export const MEGA_MENU = {
  de: {
    heading: 'Was wir bauen',
    overviewHeading: 'Überblick',
    overviewBody:
      'Wir entwickeln KI-Systeme entlang bestehender Prozesse — von der Bewertung der Use Cases bis zum Betrieb in der Produktion.',
    overviewCta: 'Alle Leistungen',
    items: [
      { title: 'KI-Discovery', description: 'Use Cases bewerten und priorisieren' },
      { title: 'Prototyp', description: 'An echten Daten getestet' },
      { title: 'Prozessautomatisierung', description: 'Agenten in bestehende Systeme' },
      { title: 'Betrieb & Wartung', description: 'Monitoring, SLAs, Weiterentwicklung' },
    ],
  },
  en: {
    heading: 'What we build',
    overviewHeading: 'Overview',
    overviewBody:
      'We build AI systems around the processes you already run — from evaluating use cases through to running them in production.',
    overviewCta: 'All services',
    items: [
      { title: 'AI discovery', description: 'Evaluating and prioritising use cases' },
      { title: 'Prototype', description: 'Tested against real data' },
      { title: 'Process automation', description: 'Agents inside existing systems' },
      { title: 'Operations & maintenance', description: 'Monitoring, SLAs, ongoing work' },
    ],
  },
} as const satisfies Record<Locale, unknown>;
