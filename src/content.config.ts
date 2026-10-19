import { defineCollection } from 'astro:content';
// Zod comes from 'astro/zod', not 'astro:content' — the latter is deprecated and
// is removed in Astro 8.
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * A call to action.
 *
 * Prefer `page` — it holds a key from src/i18n/routes.ts, so the URL resolves to
 * the right localised slug automatically. `href` is the escape hatch for external
 * links and anchors.
 */
const link = {
  page: z.string().optional(),
  href: z.string().optional(),
  /** Fragment appended to the resolved URL, without the `#`. */
  anchor: z.string().optional(),
};

const cta = z.object({ label: z.string(), ...link });

/**
 * A page section: a heading block plus an optional list of cards, steps or rows.
 *
 * Deliberately generic — the page component decides how a section is laid out,
 * the frontmatter only carries its copy. `draft` puts a visible "Entwurf" tag on
 * the section while its copy is not final (LAUNCH-CHECKLIST.md).
 */
const section = z.object({
  kicker: z.string().optional(),
  heading: z.string(),
  text: z.string().optional(),
  draft: z.boolean().default(false),
  /**
   * How src/components/PageSections.astro lays the section out. Pages with a
   * bespoke component (home, Karriere, Kontakt) read sections by id instead and
   * leave this unset.
   */
  layout: z
    .enum(['rows', 'cards', 'carousel', 'steps', 'split', 'layers', 'spectrum', 'projects', 'cta'])
    .optional(),
  /** Describes the image that belongs here; rendered as a labelled placeholder. */
  imageNote: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string(),
        text: z.string().optional(),
        imageNote: z.string().optional(),
        /** Small mono label: a category, a location, a contact value. */
        meta: z.string().optional(),
        points: z.array(z.string()).default([]),
        /** Photo for the `carousel` layout: a path under src/assets/uploads/. */
        image: z.string().optional(),
        imageAlt: z.string().optional(),
        ...link,
      }),
    )
    .default([]),
  primaryCta: cta.optional(),
  secondaryCta: cta.optional(),
});

/** Fields every page/post shares for <head> and social cards. */
const seo = {
  title: z.string(),
  description: z.string(),
  /** Overrides the auto-generated OG image when set. */
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
};

/**
 * Tier 1 — static marketing pages, edited in the repo (DECISIONS.md §3).
 *
 * Layout: src/content/pages/<pageKey>/<locale>.mdx
 * The <pageKey> must match a key in src/i18n/routes.ts.
 *
 * Frontmatter carries the structured bits (hero, CTA, cards); the MDX body carries
 * prose. Every page key must exist in EVERY locale — a missing file is a build error,
 * which is the intended policy for static pages.
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/pages' }),
  schema: z.object({
    ...seo,
    hero: z
      .object({
        headline: z.string(),
        subline: z.string().optional(),
        /** Small uppercase label above the headline. */
        eyebrow: z.string().optional(),
        /** Footnote under the hero, e.g. the location line. */
        note: z.string().optional(),
        /** Longer intro paragraph next to the headline (Über-uns hero). */
        body: z.string().optional(),
        primaryCta: cta.optional(),
        secondaryCta: cta.optional(),
        textLink: cta.optional(),
        /** Legacy single-CTA fields, still used by the plainer page template. */
        ctaLabel: z.string().optional(),
        ctaHref: z.string().optional(),
        image: z.string().optional(),
      })
      .optional(),
    /** Keyed by section id; each page component reads the ids it renders. */
    sections: z.record(z.string(), section).default({}),
    /** Sections of the Über-uns page (src/components/AboutPage.astro). */
    about: z
      .object({
        /** A large one-sentence statement right below the hero, left-aligned. */
        statement: z.object({
          draft: z.boolean().default(false),
          text: z.string(),
        }),
        /** The founding story, set next to the team photo. */
        story: z.object({
          draft: z.boolean().default(false),
          kicker: z.string().optional(),
          heading: z.string(),
          body: z.array(z.string()),
          /** A path under src/assets/uploads/. */
          image: z.string(),
          imageAlt: z.string(),
        }),
        /** A large one-sentence statement after the story, right-aligned. */
        location: z.object({
          draft: z.boolean().default(false),
          text: z.string(),
        }),
        /** Photos that run past as an endless strip; paths under src/assets/uploads/. */
        gallery: z.object({
          label: z.string(),
          items: z.array(z.object({ image: z.string(), alt: z.string() })),
        }),
        /** Key figures, counted up one after another as they scroll in. */
        stats: z.object({
          draft: z.boolean().default(false),
          kicker: z.string().optional(),
          items: z.array(
            z.object({
              value: z.number().int().nonnegative(),
              /** Appended to the number, e.g. "+". */
              suffix: z.string().default(''),
              label: z.string(),
            }),
          ),
        }),
        /** Logos of partners and supporters, as one image, at the very end. */
        partners: z.object({
          heading: z.string(),
          image: z.string(),
          imageAlt: z.string(),
        }),
        team: z.object({
          draft: z.boolean().default(false),
          kicker: z.string(),
          heading: z.string(),
          text: z.string().optional(),
        }),
        collaboration: z.object({
          draft: z.boolean().default(false),
          kicker: z.string(),
          heading: z.string(),
          text: z.string().optional(),
          steps: z.array(z.object({ title: z.string(), text: z.string() })),
        }),
        cta: z.object({
          draft: z.boolean().default(false),
          kicker: z.string().optional(),
          heading: z.string(),
          text: z.string().optional(),
          primaryCta: cta,
          secondaryCta: cta.optional(),
        }),
      })
      .optional(),
  }),
});

/**
 * Projekte — deliberately in the repo, not the CMS (DECISIONS.md §3).
 * Each project is visually bespoke and composes custom MDX components.
 *
 * Layout: src/content/projekte/<slug>/<locale>.mdx
 */
const projekte = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/projekte' }),
  schema: z.object({
    ...seo,
    /**
     * Localised URL slug. Falls back to the folder name when omitted.
     * NOT named `slug`: that key is reserved by Astro's glob loader, which uses it
     * to override the entry id — which would erase the locale from the id.
     */
    urlSlug: z.string().optional(),
    client: z.string(),
    year: z.number().int(),
    services: z.array(z.string()).default([]),
    heroImage: z.string(),
    heroImageAlt: z.string(),
    gallery: z
      .array(z.object({ src: z.string(), alt: z.string() }))
      .default([]),
    featured: z.boolean().default(false),
    /** Lower sorts first on the index page. */
    order: z.number().default(999),
    draft: z.boolean().default(false),
  }),
});

/**
 * Tier 2 — CMS-managed collections (DECISIONS.md §3, §4).
 *
 * Note the id shape differs from the repo collections above: Sveltia's
 * `multiple_folders` i18n structure writes <locale>/<slug>.mdx, so the locale comes
 * FIRST here and LAST in the repo-managed collections. That is a consequence of the
 * CMS's on-disk layout, not a style choice — don't "fix" it without also changing
 * the Sveltia config in public/admin/config.yml.
 *
 * Unlike static pages, a blog post may exist in one locale only (DECISIONS.md §5).
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: z.object({
    ...seo,
    /** Localised URL slug. See the note on urlSlug in the projekte collection. */
    urlSlug: z.string().optional(),
    /**
     * Shared across locales; links the DE and EN version of the same post so the
     * language switcher can find the counterpart. Sveltia keeps this in sync.
     */
    translationKey: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /**
     * The `translationKey` of a team member; the post shows that person's card.
     * A value that matches nobody is printed as a plain name.
     */
    author: z.string().optional(),
    /** A few sentences shown in a box ahead of the article body. */
    summary: z.string().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/team' }),
  schema: z.object({
    translationKey: z.string(),
    name: z.string(),
    role: z.string(),
    photo: z.string().optional(),
    email: z.email().optional(),
    linkedin: z.url().optional(),
    order: z.number().default(999),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages, projekte, blog, team };
