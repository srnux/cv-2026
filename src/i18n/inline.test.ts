import { describe, expect, it, vi } from 'vitest';
import { languageScript, storeOnClick } from './inline';

/**
 * The script ships inline and unbundled, so it is tested as the string it is:
 * evaluated with fake location, localStorage, navigator and document objects.
 */
type FakeEl = {
  tag: string;
  attrs: Record<string, string>;
  style: { cssText: string };
  children: FakeEl[];
  textContent: string;
  href: string;
  type: string;
  id: string;
  onclick: null | (() => void);
  removed: boolean;
  setAttribute(k: string, v: string): void;
  appendChild(c: FakeEl): void;
  remove(): void;
};

const makeEl = (tag: string): FakeEl => ({
  tag,
  attrs: {},
  style: { cssText: '' },
  children: [],
  textContent: '',
  href: '',
  type: '',
  id: '',
  onclick: null,
  removed: false,
  setAttribute(k, v) {
    this.attrs[k] = v;
  },
  appendChild(c) {
    this.children.push(c);
  },
  remove() {
    this.removed = true;
  },
});

type Env = {
  path: string;
  hash?: string;
  stored?: string;
  languages?: string[];
  storageThrows?: boolean;
  readyState?: string;
};

function fakeStorage(env: Env, store: Map<string, string>) {
  return {
    getItem: (k: string) => {
      if (env.storageThrows) throw new Error('blocked');
      return store.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (env.storageThrows) throw new Error('blocked');
      store.set(k, v);
    },
  };
}

function run(env: Env) {
  const replace = vi.fn();
  const appended: FakeEl[] = [];
  const listeners: Record<string, () => void> = {};
  const store = new Map<string, string>(env.stored ? [['lang', env.stored]] : []);
  const location = { pathname: env.path, search: '', hash: env.hash ?? '', replace };
  const document = {
    readyState: env.readyState ?? 'complete',
    addEventListener: (event: string, f: () => void) => {
      listeners[event] = f;
    },
    createElement: makeEl,
    body: { appendChild: (el: FakeEl) => appended.push(el) },
  };
  new Function('location', 'localStorage', 'navigator', 'document', languageScript)(
    location,
    fakeStorage(env, store),
    { languages: env.languages ?? [] },
    document,
  );
  const bar = appended[0];
  const find = (tag: string) => bar?.children.find(c => c.tag === tag);
  return { replace, appended, store, listeners, bar, link: find('a'), stay: find('button') };
}

describe('stored choice redirect', () => {
  it('sends a stored de visitor from / to /de/', () => {
    const r = run({ path: '/', stored: 'de' });
    expect(r.replace).toHaveBeenCalledWith('/de/');
    expect(r.appended).toHaveLength(0);
  });
  it('keeps the article and the hash', () => {
    const r = run({ path: '/writing/x/', hash: '#intro', stored: 'de' });
    expect(r.replace).toHaveBeenCalledWith('/de/writing/x/#intro');
  });
  it('does nothing on German pages', () => {
    for (const path of ['/de/', '/de', '/de/writing/x/']) {
      const r = run({ path, stored: 'de', languages: ['de'] });
      expect(r.replace).not.toHaveBeenCalled();
      expect(r.appended).toHaveLength(0);
    }
  });
  it('never offers again after a stored en', () => {
    const r = run({ path: '/', stored: 'en', languages: ['de'] });
    expect(r.replace).not.toHaveBeenCalled();
    expect(r.appended).toHaveLength(0);
  });
});

describe('offer bar', () => {
  it('appears for a German browser with no stored choice', () => {
    const r = run({ path: '/', languages: ['de-AT', 'en'] });
    expect(r.replace).not.toHaveBeenCalled();
    expect(r.appended).toHaveLength(1);
    expect(r.bar.attrs.lang).toBe('de');
    expect(r.link?.href).toBe('/de/');
    expect(r.link?.textContent).toBe('Auf Deutsch lesen');
  });
  it('does not appear for a non-German browser', () => {
    expect(run({ path: '/', languages: ['en-GB'] }).appended).toHaveLength(0);
    expect(run({ path: '/', languages: [] }).appended).toHaveLength(0);
  });
  it('waits for the DOM when the script runs in the head', () => {
    const r = run({ path: '/', languages: ['de'], readyState: 'loading' });
    expect(r.appended).toHaveLength(0);
    r.listeners.DOMContentLoaded();
    expect(r.appended).toHaveLength(1);
  });
  it('stores de when the German link is clicked', () => {
    const r = run({ path: '/writing/x/', languages: ['de'] });
    expect(r.link?.href).toBe('/de/writing/x/');
    r.link?.onclick?.();
    expect(r.store.get('lang')).toBe('de');
  });
  it('stores en and closes when English is clicked', () => {
    const r = run({ path: '/', languages: ['de'] });
    r.stay?.onclick?.();
    expect(r.store.get('lang')).toBe('en');
    expect(r.bar.removed).toBe(true);
  });
  it('still offers, and never throws, when storage is blocked', () => {
    const r = run({ path: '/', languages: ['de'], storageThrows: true });
    expect(r.appended).toHaveLength(1);
    expect(() => r.link?.onclick?.()).not.toThrow();
    expect(() => r.stay?.onclick?.()).not.toThrow();
  });
});

describe('storeOnClick', () => {
  it('stores the language', () => {
    const store = new Map<string, string>();
    new Function('localStorage', storeOnClick('de'))(fakeStorage({ path: '/' }, store));
    expect(store.get('lang')).toBe('de');
  });
  it('does not throw when storage is blocked', () => {
    const storage = fakeStorage({ path: '/', storageThrows: true }, new Map());
    expect(() => new Function('localStorage', storeOnClick('en'))(storage)).not.toThrow();
  });
});
