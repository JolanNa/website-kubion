import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE_NAME } from '../../config';
import { getPosts, postPath } from '../../lib/content';

// One feed per locale (DECISIONS.md §13).
export const GET: APIRoute = async (context) => {
  const locale = 'en' as const;
  const posts = await getPosts(locale);

  return rss({
    title: `${SITE_NAME} Blog`,
    description: `News from ${SITE_NAME}`,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: postPath(post, locale),
    })),
    customData: `<language>${locale}</language>`,
  });
};
