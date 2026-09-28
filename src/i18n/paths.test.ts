import { describe, expect, it } from 'vitest';
import { counterpartPath, homePath, langFromPath } from './paths';

describe('langFromPath', () => {
  it.each([
    ['/', 'en'],
    ['/writing/x/', 'en'],
    ['/de', 'de'],
    ['/de/', 'de'],
    ['/de/writing/x/', 'de'],
    ['/design/', 'en'],
    ['/deutsch', 'en'],
  ])('%s -> %s', (path, lang) => expect(langFromPath(path)).toBe(lang));
});

describe('counterpartPath', () => {
  it.each([
    ['/', 'de', '/de/'],
    ['/writing/x/', 'de', '/de/writing/x/'],
    ['/de/', 'en', '/'],
    ['/de', 'en', '/'],
    ['/de/writing/x/', 'en', '/writing/x/'],
    ['/', 'en', '/'],
    ['/de/', 'de', '/de/'],
  ] as const)('%s to %s -> %s', (path, target, out) => expect(counterpartPath(path, target)).toBe(out));
});

it('homePath', () => {
  expect(homePath('en')).toBe('/');
  expect(homePath('de')).toBe('/de/');
});
