import en from './locales/en.json';
import ar from './locales/ar.json';

export type Locale = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi' | 'tr' | 'ru';

const supported = new Set<Locale>(['en', 'fr', 'es', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'ru']);
const catalogs: Record<'en' | 'ar', Record<string, string>> = { en, ar };

export function normalizeLocale(value: string | undefined): Locale {
  const candidate = value?.toLowerCase().split('-')[0] as Locale | undefined;
  return candidate && supported.has(candidate) ? candidate : 'en';
}

export function localeFromAcceptLanguage(value: string | undefined): Locale {
  const candidates = (value ?? '').split(',').map((part) => ({
    locale: normalizeLocale(part.trim().split(';')[0]),
    quality: Number(part.match(/q=([0-9.]+)/)?.[1] ?? '1'),
  })).sort((a, b) => b.quality - a.quality);
  return candidates[0]?.quality > 0 ? candidates[0].locale : 'en';
}

export function message(key: string, locale: Locale): string {
  const catalog = catalogs[locale === 'ar' ? 'ar' : 'en'];
  return catalog[key] ?? catalogs.en[key] ?? catalogs.en['validation.badRequest'];
}
