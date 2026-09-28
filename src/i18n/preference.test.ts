import { describe, expect, it } from 'vitest';
import { prefersGerman, readStoredLang, storeLang } from './preference';

const memory = (): Storage => {
  const m = new Map<string, string>();
  return {
    getItem: k => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: k => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    get length() {
      return m.size;
    },
  };
};

const throwing = (): Storage => {
  throw new Error('SecurityError');
};

describe('prefersGerman', () => {
  it.each([
    [['de'], true],
    [['de-AT'], true],
    [['DE-ch'], true],
    [['en-GB', 'de'], true],
    [['en-GB'], false],
    [[], false],
    [['dex'], false],
  ])('%j -> %s', (languages, expected) => expect(prefersGerman(languages)).toBe(expected));
});

describe('stored choice', () => {
  it('round-trips', () => {
    const s = memory();
    storeLang('de', () => s);
    expect(readStoredLang(() => s)).toBe('de');
  });
  it('ignores unknown values', () => {
    const s = memory();
    s.setItem('lang', 'fr');
    expect(readStoredLang(() => s)).toBeNull();
  });
  it('is null without storage', () => expect(readStoredLang(() => null)).toBeNull());
  it('swallows throwing storage', () => {
    expect(readStoredLang(throwing)).toBeNull();
    expect(() => storeLang('en', throwing)).not.toThrow();
  });
});
