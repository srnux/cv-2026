import type { Lang } from './lang';

/**
 * The visitor's explicit language choice. Written only when they click a
 * language option, never on detection alone, and every access is guarded:
 * private windows and blocked site data throw on localStorage, and that must
 * only mean the choice is not remembered.
 */
export const STORAGE_KEY = 'lang';

const browserStorage = (): Storage | null => window.localStorage;

export function readStoredLang(get: () => Storage | null = browserStorage): Lang | null {
  try {
    const value = get()?.getItem(STORAGE_KEY);
    return value === 'en' || value === 'de' ? value : null;
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang, get: () => Storage | null = browserStorage): void {
  try {
    get()?.setItem(STORAGE_KEY, lang);
  } catch {
    // Blocked storage only means the choice is not remembered.
  }
}

export const prefersGerman = (languages: readonly string[]): boolean =>
  languages.some(l => /^de(-|$)/i.test(l));
