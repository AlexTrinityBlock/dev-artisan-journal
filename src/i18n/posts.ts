import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './config';

export type BlogPost = CollectionEntry<'blog'>;

// The glob loader slugifies ids (dots are dropped), so the locale suffix
// arrives as `indexzh-hant` rather than `index.zh-hant`. Accept both forms.
const LANG_SUFFIX = /\.?(zh-hant|zh-hans)$/;

/**
 * Locale of a content entry, derived from the filename suffix:
 *   `2026/08-...-ratio/index`         -> en
 *   `2026/08-...-ratio/indexzh-hant`  -> zh-hant
 */
export function entryLang(id: string): Lang {
  const match = id.match(LANG_SUFFIX);
  return match ? (match[1] as Lang) : 'en';
}

/**
 * Locale-neutral slug used in URLs:
 *   `2026/08-...-ratio/indexzh-hant` -> `2026/08-...-ratio`
 */
export function entrySlug(id: string): string {
  return id
    .replace(LANG_SUFFIX, '')
    .replace(/\/index$/, '')
    .replace(/\.[^/.]+$/, '');
}

export async function getPosts(lang: Lang): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => entryLang(post.id) === lang)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Sibling translation of the same article, when one exists. */
export async function getTranslation(
  post: BlogPost,
  target: Lang
): Promise<BlogPost | undefined> {
  const slug = entrySlug(post.id);
  const posts = await getCollection('blog');
  return posts.find(
    (candidate) => entryLang(candidate.id) === target && entrySlug(candidate.id) === slug
  );
}

/** Every locale that actually has a version of this article. */
export async function availableLangs(post: BlogPost): Promise<Lang[]> {
  const slug = entrySlug(post.id);
  const posts = await getCollection('blog');
  const langs = new Set<Lang>();
  for (const candidate of posts) {
    if (entrySlug(candidate.id) === slug) langs.add(entryLang(candidate.id));
  }
  return [...langs];
}

/** `getStaticPaths()` payload for a localized blog route. */
export async function buildPostPaths(lang: Lang) {
  const posts = await getPosts(lang);
  return posts.map((post, index) => ({
    params: { slug: entrySlug(post.id) },
    props: {
      post,
      prevPost: index < posts.length - 1 ? posts[index + 1] : null,
      nextPost: index > 0 ? posts[index - 1] : null,
    },
  }));
}
