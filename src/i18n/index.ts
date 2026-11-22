import en from '../locales/en.json';
import de from '../locales/de.json';
import ua from '../locales/ua.json';

export const locales = ['en', 'de', 'ua'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';
// `html` is the real language tag for lang= and hreflang= (Ukrainian is `uk`); the site shows and uses `ua`.
export const langLabels: Record<Lang, { short: string; native: string; og: string; html: string }> = {
  en: { short: 'EN', native: 'English', og: 'en_US', html: 'en' },
  de: { short: 'DE', native: 'Deutsch', og: 'de_DE', html: 'de' },
  ua: { short: 'UA', native: 'Українська', og: 'uk_UA', html: 'uk' },
};
export const htmlLang = (l: Lang) => langLabels[l].html;

const dict: Record<Lang, any> = { en, de, ua };

export function isLang(x: string | undefined): x is Lang {
  return !!x && (locales as readonly string[]).includes(x);
}

function dig(obj: any, key: string): unknown {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Translate with graceful fallback: requested language -> English -> the key itself. */
export function t(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let v = dig(dict[lang], key);
  if (typeof v !== 'string') v = dig(dict[defaultLang], key);
  let s = typeof v === 'string' ? v : key;
  if (vars) for (const [k, val] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(val));
  return s;
}

/** Build a localized URL: localePath('de', 'about') -> /de/about/ */
export function localePath(lang: Lang, path = ''): string {
  const p = path.replace(/^\/+|\/+$/g, '');
  return `/${lang}/${p ? p + '/' : ''}`;
}

/** Same page in another language (all routes exist in all languages). */
export function switchPath(pathname: string, to: Lang): string {
  const rest = pathname.replace(/^\/(en|de|ua)(?=\/|$)/, '');
  return `/${to}${rest || '/'}`;
}

/** Merge per-language content over English so missing fields fall back gracefully. */
export function pick<T extends Record<string, any>>(byLang: Record<string, T | undefined>, lang: Lang): T & { usedFallback: boolean } {
  const base = byLang[defaultLang] as T;
  const over = (byLang[lang] ?? {}) as Partial<T>;
  const merged: any = { ...base };
  for (const [k, v] of Object.entries(over)) {
    if (v !== undefined && !(Array.isArray(v) && v.length === 0)) merged[k] = v;
  }
  merged.usedFallback = lang !== defaultLang && !byLang[lang];
  return merged;
}
