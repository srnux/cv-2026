/**
 * Checks the built site in dist/. Run after `pnpm build`:
 *
 *   pnpm build && pnpm test:build
 *
 * These are the properties a crawler, an ATS parser or a share preview relies
 * on, so they are asserted on the real output rather than on the components.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const DIST = resolve(import.meta.dirname, '..', 'dist');
const SITE = 'https://luka-engels.de';

const read = (path: string): string => {
  const file = resolve(DIST, path);
  if (!existsSync(file)) throw new Error(`${path} not found in dist/; run pnpm build first`);
  return readFileSync(file, 'utf8');
};

const rootOf = (html: string): string => {
  const start = html.indexOf('<div id="root">');
  const end = html.indexOf('</body>');
  return html.slice(start, end);
};

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1;

describe('English home page', () => {
  const html = read('index.html');

  it('is British English with its own canonical and a German alternate', () => {
    expect(html).toContain('<html lang="en-GB">');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="de-DE" href="${SITE}/de/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${SITE}/">`);
    expect(html).toContain('<meta property="og:locale" content="en_GB">');
    expect(html).toContain('<meta property="og:locale:alternate" content="de_DE">');
    expect(html).toContain('<title>Luka Engels — Lead Software Engineer, Agentic AI &amp; LLM Platforms</title>');
  });

  it('is prerendered in English', () => {
    const root = rootOf(html);
    expect(root).toContain('Professional Experience');
    expect(root).not.toContain('Beruflicher Werdegang');
  });

  it('carries the language script once and no offer bar markup', () => {
    expect(count(html, 'Diese Seite gibt es auch auf Deutsch.')).toBe(1);
    expect(rootOf(html)).not.toContain('lang-offer');
  });
});

describe('German home page', () => {
  const html = read('de/index.html');

  it('is German with its own canonical and an English alternate', () => {
    expect(html).toContain('<html lang="de-DE">');
    expect(html).toContain(`<link rel="canonical" href="${SITE}/de/">`);
    expect(html).toContain(`<link rel="alternate" hreflang="en-GB" href="${SITE}/">`);
    expect(html).toContain('<meta property="og:locale" content="de_DE">');
    expect(html).toContain(`<meta property="og:url" content="${SITE}/de/">`);
    expect(html).toContain('<title>Luka Engels — Lead Software Engineer, Agentic AI &amp; LLM-Plattformen</title>');
    expect(html).toContain('"jobTitle": "Lead Software Engineer"');
    expect(html).toContain('Unbefristete Festanstellung in Deutschland mit vollständig ortsunabhängiger Arbeit');
  });

  it('is prerendered in German', () => {
    const root = rootOf(html);
    expect(root).toContain('Beruflicher Werdegang');
    expect(root).toContain('Deutsch und kroatisch');
    expect(root).not.toContain('Professional Experience');
  });

  it('has no English head left over', () => {
    expect(html).not.toContain('LLM Platforms</title>');
    expect(html).not.toContain('<meta property="og:locale" content="en_GB">');
    expect(html).toContain('<meta property="og:locale:alternate" content="en_GB">');
  });

  it('carries the language script once and no offer bar markup', () => {
    expect(count(html, 'Diese Seite gibt es auch auf Deutsch.')).toBe(1);
    expect(rootOf(html)).not.toContain('lang-offer');
  });
});

describe('localised links', () => {
  const en = rootOf(read('index.html'));
  const de = rootOf(read('de/index.html'));

  it('English page links the English CV, the English legal pages and the German page', () => {
    expect(en).toContain('href="/cv-luka-engels-en.html"');
    expect(en).not.toContain('href="/cv-luka-engels-de.html"');
    expect(en).toContain('href="/legal-notice.html"');
    expect(en).toContain('href="/privacy.html"');
    expect(en).toMatch(/<a href="\/de\/"[^>]*>DE<\/a>/);
  });

  it('German page links the German CV, the German legal pages and the English page', () => {
    expect(de).toContain('href="/cv-luka-engels-de.html"');
    expect(de).not.toContain('href="/cv-luka-engels-en.html"');
    expect(de).toContain('href="/impressum.html"');
    expect(de).toContain('href="/datenschutz.html"');
    expect(de).toMatch(/<a href="\/"[^>]*>EN<\/a>/);
  });

  it('marks the active language', () => {
    expect(en).toMatch(/<a href="\/"[^>]*aria-current="true"[^>]*>EN<\/a>/);
    expect(de).toMatch(/<a href="\/de\/"[^>]*aria-current="true"[^>]*>DE<\/a>/);
  });
});

describe('articles', () => {
  const listing = JSON.parse(readFileSync(resolve(import.meta.dirname, '..', 'src/content/articles.json'), 'utf8')) as Record<
    'en' | 'de',
    { slug: string; url: string; lang: string }[]
  >;

  it('lists every article in both languages', () => {
    expect(listing.de.map(a => a.slug)).toEqual(listing.en.map(a => a.slug));
  });

  // A visitor who chose German is redirected to /de + path; that must never 404.
  it.each(listing.en.map(a => a.slug))('%s has an English and a German page', slug => {
    const en = read(`writing/${slug}/index.html`);
    const de = read(`de/writing/${slug}/index.html`);
    expect(en).toContain('<html lang="en-GB">');
    expect(de).toContain('<html lang="de-DE">');
    expect(de).toContain('<a class="back" href="/de/#writing">');
    expect(de).toContain('Min. Lesezeit');
  });

  it.each(listing.de.filter(a => a.lang === 'en').map(a => a.slug))(
    '%s without translation: German chrome, English body, English canonical, no hreflang',
    slug => {
      const en = read(`writing/${slug}/index.html`);
      const de = read(`de/writing/${slug}/index.html`);
      expect(de).toContain('Diesen Artikel gibt es bisher nur auf Englisch.');
      expect(de).toContain('<article lang="en-GB">');
      expect(de).toContain(`<link rel="canonical" href="${SITE}/writing/${slug}/">`);
      expect(de).not.toContain('hreflang="de-DE" href');
      expect(en).not.toMatch(/<link rel="alternate" hreflang/);
    },
  );

  it('German home listing marks English-only articles', () => {
    const root = rootOf(read('de/index.html'));
    if (listing.de.some(a => a.lang === 'en')) expect(root).toContain('Artikel auf Englisch');
    expect(root).toContain('href="/de/writing/');
  });
});

describe('sitemap', () => {
  const xml = read('sitemap.xml');

  it('lists both home pages as alternates of each other', () => {
    expect(xml).toContain(`<loc>${SITE}/de/</loc>`);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="de-DE" href="${SITE}/de/"/>`);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  });

  it('lists the English legal pages', () => {
    expect(xml).toContain(`<loc>${SITE}/legal-notice.html</loc>`);
    expect(xml).toContain(`<loc>${SITE}/privacy.html</loc>`);
  });

  it('does not list German fallback article pages', () => {
    const listing = JSON.parse(readFileSync(resolve(import.meta.dirname, '..', 'src/content/articles.json'), 'utf8'));
    for (const a of listing.de.filter((x: { lang: string }) => x.lang === 'en')) {
      expect(xml).not.toContain(`<loc>${SITE}${a.url}</loc>`);
    }
  });
});

describe('legal pages', () => {
  it.each([
    ['impressum.html', 'legal-notice.html'],
    ['datenschutz.html', 'privacy.html'],
  ])('%s and %s exist in their language and link each other', (de, en) => {
    const dePage = read(de);
    const enPage = read(en);
    expect(dePage).toContain('<html lang="de-DE">');
    expect(enPage).toContain('<html lang="en-GB">');
    expect(dePage).toContain(`href="/${en}"`);
    expect(enPage).toContain(`href="/${de}"`);
  });
});
