import type { FastifyRequest } from 'fastify';
import en from './locales/en.json';
import ar from './locales/ar.json';

export type Locale = 'en' | 'fr' | 'es' | 'de' | 'pt' | 'it' | 'ja' | 'ko' | 'zh' | 'ar' | 'hi' | 'tr' | 'ru';

const supported = new Set<Locale>(['en', 'fr', 'es', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'ru']);
const catalogs: Record<'en' | 'ar', Record<string, string>> = { en, ar };

export function localeFromRequest(request: FastifyRequest): Locale {
  const header = request.headers['accept-language'];
  const value = Array.isArray(header) ? header[0] : header;
  const candidate = value?.toLowerCase().split(',')[0]?.split('-')[0] as Locale | undefined;
  return candidate && supported.has(candidate) ? candidate : 'en';
}

export function message(key: string, locale: Locale): string {
  const catalog = catalogs[locale === 'ar' ? 'ar' : 'en'];
  return catalog[key] ?? catalogs.en[key] ?? key;
}
