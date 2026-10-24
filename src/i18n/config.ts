/**
 * i18n configuration — single source of truth for locales.
 *
 * Routing model: default language (English) lives at the site root,
 * every other language lives under `/<locale>/` (e.g. `/zh-hant/`, `/zh-hans/`).
 * Locale ids below must match the folder names under `src/pages/`
 * and the `i18n.locales` array in `astro.config.mjs`.
 *
 * Chinese is split by script (Hant / Hans), not by region: the content is
 * Traditional for Taiwan/HK readers and Simplified for mainland readers.
 */

export const locales = ['en', 'zh-hant', 'zh-hans'] as const;

export type Lang = (typeof locales)[number];

export const defaultLang: Lang = 'en';

export interface LangMeta {
  /** Full name, written in the language itself. */
  label: string;
  /** Compact chip label used by the switcher. */
  short: string;
  /** Value for the `<html lang>` attribute (BCP-47). */
  htmlLang: string;
  /** Value for `<link rel="alternate" hreflang>` / the `hreflang` attribute. */
  hreflang: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Locale passed to `Intl` / `toLocaleDateString`. */
  dateLocale: string;
  dir: 'ltr' | 'rtl';
}

export const langMeta: Record<Lang, LangMeta> = {
  en: {
    label: 'English',
    short: 'EN',
    htmlLang: 'en',
    hreflang: 'en',
    ogLocale: 'en_US',
    dateLocale: 'en-US',
    dir: 'ltr',
  },
  'zh-hant': {
    label: '繁體中文',
    short: '繁',
    htmlLang: 'zh-Hant',
    hreflang: 'zh-Hant',
    ogLocale: 'zh_TW',
    dateLocale: 'zh-TW',
    dir: 'ltr',
  },
  'zh-hans': {
    label: '简体中文',
    short: '简',
    htmlLang: 'zh-Hans',
    hreflang: 'zh-Hans',
    ogLocale: 'zh_CN',
    dateLocale: 'zh-CN',
    dir: 'ltr',
  },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function otherLangs(lang: Lang): Lang[] {
  return locales.filter((locale) => locale !== lang);
}
