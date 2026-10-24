import { defaultLang, isLang, langMeta, locales, type Lang } from './config';

/**
 * Strip any locale prefix from a pathname: `/zh-hant/articles` -> `/articles`.
 * Returns `/` for the site root.
 */
export function stripLang(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isLang(segments[0])) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

/** Locale of the current request, derived from the URL prefix. */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return isLang(first) ? first : defaultLang;
}

/**
 * Build a href for a locale-less path, e.g.
 *   localeHref('zh-hant', '/articles') -> '/zh-hant/articles'
 *   localeHref('en', '/articles')      -> '/articles'
 */
export function localeHref(lang: Lang, path = '/'): string {
  const clean = stripLang(path);
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** Switch the current pathname to another locale. */
export function switchHref(pathname: string, target: Lang): string {
  return localeHref(target, stripLang(pathname));
}

export function tagHref(lang: Lang, tag: string): string {
  return localeHref(lang, `/tags/${encodeURIComponent(tag)}`);
}

export function postHref(lang: Lang, slug: string): string {
  return localeHref(lang, `/blog/${slug}`);
}

/** Locale-aware date formatting. */
export function formatDate(
  date: Date | string,
  lang: Lang,
  style: 'long' | 'short' = 'long'
): string {
  const value = date instanceof Date ? date : new Date(date);
  const options: Intl.DateTimeFormatOptions =
    style === 'long'
      ? { year: 'numeric', month: 'long', day: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
  return value.toLocaleDateString(langMeta[lang].dateLocale, options);
}

/** `"12 min read"` -> 12 (falls back to 5 when the frontmatter has no number). */
export function readMinutes(readTime?: string): number {
  const match = readTime?.match(/\d+/);
  return match ? Number(match[0]) : 5;
}

export { locales, defaultLang, langMeta };
export type { Lang };
