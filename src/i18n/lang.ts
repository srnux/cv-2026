export type Lang = 'en' | 'de';

export const LANGS: readonly Lang[] = ['en', 'de'];

/** The value of <html lang>. English is British English throughout. */
export const HTML_LANG: Record<Lang, string> = { en: 'en-GB', de: 'de-DE' };
