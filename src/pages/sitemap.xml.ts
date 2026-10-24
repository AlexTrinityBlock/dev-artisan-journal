import type { APIRoute } from 'astro';
import { defaultLang, langMeta, locales, type Lang } from '../i18n/config';
import { entrySlug, getPosts } from '../i18n/posts';
import { localeHref } from '../i18n/utils';

/**
 * Multilingual sitemap: one <url> per locale, each carrying the full
 * hreflang alternate set so search engines can cluster the translations.
 */
export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://blog.alextrinitywolf.com');

  // locale-less path -> locales that actually publish it
  const paths = new Map<string, Set<Lang>>();
  const add = (path: string, lang: Lang) => {
    if (!paths.has(path)) paths.set(path, new Set<Lang>());
    paths.get(path)!.add(lang);
  };

  const lastmod = new Map<string, string>();

  for (const lang of locales) {
    add('/', lang);
    add('/articles', lang);
    add('/tags', lang);

    const posts = await getPosts(lang);
    for (const post of posts) {
      const path = `/blog/${entrySlug(post.id)}`;
      add(path, lang);
      const stamp = new Date(post.data.updatedDate ?? post.data.pubDate)
        .toISOString()
        .slice(0, 10);
      lastmod.set(path, stamp);
    }

    const tags = new Set<string>();
    for (const post of posts) {
      post.data.tags.forEach((tag) => tags.add(tag));
      tags.add(post.data.category);
    }
    for (const tag of tags) add(`/tags/${encodeURIComponent(tag)}`, lang);
  }

  const absolute = (lang: Lang, path: string) =>
    new URL(localeHref(lang, path), origin).href;

  const urls = [...paths.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([path, langs]) => {
      const alternates = [...langs]
        .sort((a, b) => locales.indexOf(a) - locales.indexOf(b))
        .map(
          (lang) =>
            `<xhtml:link rel="alternate" hreflang="${langMeta[lang].hreflang}" href="${absolute(lang, path)}"/>`
        )
        .join('');
      const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${absolute(defaultLang, path)}"/>`;
      const mod = lastmod.get(path);

      return [...langs].map(
        (lang) =>
          `<url><loc>${absolute(lang, path)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}${alternates}${xDefault}</url>`
      );
    })
    .join('\n  ');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${urls}
</urlset>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
