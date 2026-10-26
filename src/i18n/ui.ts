import type { Locale } from '../config';
import type { PageKey } from './routes';

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
    'nav.karriere': 'Karriere',
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
    'jobs.featured': 'Aktuell gesucht',
    'jobs.view': 'Stelle ansehen',
    'jobs.apply': 'Jetzt bewerben',
    'jobs.back': 'Alle Stellen',
    'jobs.glance': 'Auf einen Blick',
    'jobs.more': 'Weitere Stellen',
    'jobs.applyTo': 'Bewerbung an',
    'jobs.subject': 'Bewerbung',

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

    'draft.label': 'Entwurf',
    'draft.hint': 'Dieser Abschnitt ist ein Entwurf – Text und Inhalt sind noch nicht final.',
    'common.more': 'Mehr erfahren',
    'carousel.prev': 'Zurück',
    'carousel.next': 'Weiter',
    'placeholder.image': 'Bild',
    'placeholder.logo': 'Logo',

    'footer.rights': 'Alle Rechte vorbehalten.',
    'footer.cta': 'Kontakt aufnehmen',
    'footer.projects': 'Unsere Projekte',
    'footer.company': 'Unternehmen',
    'footer.contact': 'Kontakt',
    'footer.social': 'Social Media',
    'footer.info': 'Info',
    'footer.legal': 'Rechtliches',

    '404.title': 'Seite nicht gefunden',
    '404.body': 'Diese Seite existiert nicht (mehr).',
    '404.home': 'Zur Startseite',
  },

  en: {
    'nav.home': 'Home',
    'nav.leistungen': 'Services',
    'nav.projekte': 'Projects',
    'nav.ueberUns': 'About us',
    'nav.karriere': 'Careers',
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
    'jobs.featured': 'Now hiring',
    'jobs.view': 'View role',
    'jobs.apply': 'Apply now',
    'jobs.back': 'All roles',
    'jobs.glance': 'At a glance',
    'jobs.more': 'More roles',
    'jobs.applyTo': 'Send your application to',
    'jobs.subject': 'Application',

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

    'draft.label': 'Draft',
    'draft.hint': 'This section is a draft – copy and content are not final yet.',
    'common.more': 'Learn more',
    'carousel.prev': 'Previous',
    'carousel.next': 'Next',
    'placeholder.image': 'Image',
    'placeholder.logo': 'Logo',

    'footer.rights': 'All rights reserved.',
    'footer.cta': 'Get in touch',
    'footer.projects': 'Our projects',
    'footer.company': 'Company',
    'footer.contact': 'Contact',
    'footer.social': 'Social media',
    'footer.info': 'Info',
    'footer.legal': 'Legal',

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
 * The mega-menus — one panel per nav item that opens one.
 *
 * Navigation chrome rather than page prose, so it lives here alongside the other
 * nav strings rather than in a content collection (DECISIONS.md §3). If these
 * grow into real marketing copy, move them into src/content/pages/.
 *
 * `page` is a page key, so every link resolves to the right localised slug.
 */
export type MegaId = 'leistungen' | 'about';

export interface MegaPanel {
  heading: string;
  /** `anchor` points at a section of the page, e.g. the industries on Leistungen. */
  items: { title: string; description: string; page: PageKey; anchor?: string }[];
  overviewHeading: string;
  overviewBody: string;
  overviewCta: string;
  overviewPage: PageKey;
}

export const MEGA_MENU = {
  de: {
    leistungen: {
      heading: 'Unsere Expertise',
      overviewHeading: 'Überblick',
      overviewBody:
        'Wir lösen Probleme in der Produktion mit Kameras, Daten und KI — von der ersten Analyse bis zum laufenden Betrieb.',
      overviewCta: 'Alle Leistungen',
      overviewPage: 'leistungen',
      items: [
        {
          title: 'Computer Vision',
          description: 'Vision-Systeme von der Kamera bis zum Dashboard',
          page: 'computer-vision',
        },
        {
          title: 'Prozessoptimierung',
          description: 'Produktionsprozesse mit Daten verbessern',
          page: 'prozessoptimierung',
        },
        {
          title: 'Individuelle Datenprojekte',
          description: 'Für Probleme, die in kein Raster passen',
          page: 'datenprojekte',
        },
        {
          title: 'Branchen',
          description: 'Ein breites Spektrum an Anwendungsmöglichkeiten',
          page: 'leistungen',
          anchor: 'branchen',
        },
      ],
    },
    about: {
      heading: 'Wer wir sind',
      overviewHeading: 'Standort',
      overviewBody:
        'Wir entwickeln aus Osnabrück und Berlin — nah an den Unternehmen, für die wir bauen.',
      overviewCta: 'Team kennenlernen',
      overviewPage: 'ueber-uns',
      items: [
        { title: 'Über uns', description: 'Team, Standort und Zusammenarbeit', page: 'ueber-uns' },
        { title: 'Karriere', description: 'Mit uns an KI-Systemen arbeiten', page: 'karriere' },
        { title: 'Blog', description: 'Einblicke aus Projekten und Praxis', page: 'blog' },
      ],
    },
  },
  en: {
    leistungen: {
      heading: 'Our expertise',
      overviewHeading: 'Overview',
      overviewBody:
        'We solve problems in production with cameras, data and AI — from the first analysis through to day-to-day operation.',
      overviewCta: 'All services',
      overviewPage: 'leistungen',
      items: [
        {
          title: 'Computer vision',
          description: 'Vision systems from camera to dashboard',
          page: 'computer-vision',
        },
        {
          title: 'Process optimisation',
          description: 'Improving production processes with data',
          page: 'prozessoptimierung',
        },
        {
          title: 'Custom data projects',
          description: 'For problems that fit no template',
          page: 'datenprojekte',
        },
        {
          title: 'Industries',
          description: 'A broad range of applications',
          page: 'leistungen',
          anchor: 'industries',
        },
      ],
    },
    about: {
      heading: 'Who we are',
      overviewHeading: 'Location',
      overviewBody:
        'We build from Osnabrück and Berlin — close to the companies we work for.',
      overviewCta: 'Meet the team',
      overviewPage: 'ueber-uns',
      items: [
        { title: 'About us', description: 'Team, location and how we work', page: 'ueber-uns' },
        { title: 'Careers', description: 'Work on AI systems with us', page: 'karriere' },
        { title: 'Blog', description: 'Notes from projects and practice', page: 'blog' },
      ],
    },
  },
} as const satisfies Record<Locale, Record<MegaId, MegaPanel>>;
