import type { ImageMetadata } from 'astro';

/**
 * Resolves image paths written by the CMS into Astro image assets.
 *
 * Sveltia stores uploads in src/assets/uploads and writes absolute paths like
 * "/src/assets/uploads/foo.jpg" into frontmatter. Astro's `image()` schema helper
 * can't resolve those (it expects paths relative to the content file), so we resolve
 * them ourselves against a build-time glob. This is the standard pattern for pairing
 * a git-based CMS with astro:assets.
 *
 * Images that go through here get optimised at build time and served as WebP/AVIF
 * (DECISIONS.md §11).
 */
const uploads = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/uploads/**/*.{jpeg,jpg,png,gif,webp,avif,svg}',
  { eager: true },
);

export function resolveImage(path: string | undefined): ImageMetadata | undefined {
  if (!path) return undefined;
  const normalised = path.startsWith('/') ? path : `/${path}`;
  return uploads[normalised]?.default;
}

/**
 * Throwing variant, for images the page can't render without.
 * Fails the build rather than shipping a broken <img>.
 */
export function requireImage(path: string, context: string): ImageMetadata {
  const image = resolveImage(path);
  if (!image) {
    throw new Error(
      `Image not found: "${path}" (referenced by ${context}).\n` +
        `Expected a file under src/assets/uploads/. ` +
        `If this came from the CMS, check that the upload was committed.`,
    );
  }
  return image;
}
